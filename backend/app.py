"""
JAJAJAJADJSDH WHY DID IT DO THIS THATS NOT HOW RATELIMINTG WAS SUPPOSED TO WORK

The browser never receives Discord access or refresh tokens. It receives an
opaque HttpOnly session cookie, while encrypted OAuth tokens stay server-side.
SQLite is the development default; the data layer can later be replaced with
PostgreSQL without changing the OAuth routes.

- OAuth `state` is now bound to the browser via a short-lived HttpOnly
  cookie (not just the database), closing a login-CSRF hole where an
  attacker could ride along on a state/code pair they legitimately
  obtained for their own Discord account.
- PKCE (S256) is layered on top of the confidential-client flow as
  defense-in-depth against authorization-code interception.
- Simple in-memory rate limiting on /auth/discord/login,
  /auth/discord/callback, and globally.
- Strict security response headers (CSP, X-Frame-Options, HSTS, etc).
- Origin-header verification on all non-safe (state-changing) requests,
  as a second CSRF layer independent of SameSite.
- Sessions are bound to the User-Agent that created them; a cookie replayed
  from a different UA is treated as stolen and revoked.
- Token encryption now supports key rotation (MOCHA_TOKEN_ENCRYPTION_KEY
  may be a comma-separated list; first key encrypts, all are tried to
  decrypt) via MultiFernet.
- Nothing that could contain a secret (raw Discord API response bodies,
  full token payloads) is ever written to logs -- only status codes /
  field names.
- MOCHA_COOKIE_SECURE=false now hard-fails outside local dev instead of
  just warning; DISCORD_REDIRECT_URI and CORS origins must be https
  outside local dev.
"""

from __future__ import annotations

import base64
import hashlib
import json
import logging
import os
import secrets
import sqlite3
import threading
import time
from contextlib import asynccontextmanager
from pathlib import Path
from typing import Any
from urllib.parse import urlencode, urlparse

import httpx
from cryptography.fernet import Fernet, MultiFernet, InvalidToken
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, RedirectResponse


logger = logging.getLogger("mocha.auth")
logging.basicConfig(level=logging.INFO)

BASE_DIR = Path(__file__).resolve().parent
load_dotenv(BASE_DIR / ".env", override=True)

DISCORD_API = "https://discord.com/api"
DISCORD_AUTHORIZE = "https://discord.com/oauth2/authorize"

# NOTE: no hardcoded fallback client id anymore -- a missing/mismatched
# client id should fail loudly at startup, not silently authenticate
# against whatever app "1544448518310199427" happens to be.
DISCORD_CLIENT_ID = os.getenv("DISCORD_CLIENT_ID", "")
DISCORD_CLIENT_SECRET = os.getenv("DISCORD_CLIENT_SECRET", "")
DISCORD_REDIRECT_URI = os.getenv("DISCORD_REDIRECT_URI", "")
DISCORD_SCOPE = "identify guilds email guilds.join guilds.members.read"
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173").rstrip("/")
DATABASE_PATH = Path(os.getenv("MOCHA_DATABASE_PATH", str(BASE_DIR / "mocha.sqlite3")))
SESSION_DAYS = int(os.getenv("MOCHA_SESSION_DAYS", "30"))
COOKIE_SECURE = os.getenv("MOCHA_COOKIE_SECURE", "false").lower() == "true"
COOKIE_SAMESITE = os.getenv("MOCHA_COOKIE_SAMESITE", "lax").lower()
SESSION_COOKIE = "mocha_session"
OAUTH_TRANSACTION_COOKIE = "mocha_oauth_txn"

# Bind sessions to the User-Agent that created them. A cookie replayed with
# a different UA is far more likely to be a stolen/copied cookie than the
# same legitimate user, so we revoke rather than honor it.
BIND_SESSION_TO_UA = os.getenv("MOCHA_BIND_SESSION_TO_UA", "true").lower() == "true"

OAUTH_STATE_TTL_SECONDS = int(os.getenv("MOCHA_OAUTH_STATE_TTL_SECONDS", "600"))
PKCE_ENABLED = os.getenv("MOCHA_OAUTH_PKCE", "true").lower() == "true"

# How often (in seconds) expired oauth_states/sessions rows get swept,
# independent of the opportunistic cleanup that already runs on login.
CLEANUP_INTERVAL_SECONDS = int(os.getenv("MOCHA_CLEANUP_INTERVAL_SECONDS", "3600"))

RATE_LIMIT_LOGIN_MAX = int(os.getenv("MOCHA_RATE_LIMIT_LOGIN_MAX", "10"))
RATE_LIMIT_LOGIN_WINDOW = int(os.getenv("MOCHA_RATE_LIMIT_LOGIN_WINDOW_SECONDS", "300"))
RATE_LIMIT_CALLBACK_MAX = int(os.getenv("MOCHA_RATE_LIMIT_CALLBACK_MAX", "20"))
RATE_LIMIT_CALLBACK_WINDOW = int(os.getenv("MOCHA_RATE_LIMIT_CALLBACK_WINDOW_SECONDS", "300"))
RATE_LIMIT_GENERAL_MAX = int(os.getenv("MOCHA_RATE_LIMIT_GENERAL_MAX", "120"))
RATE_LIMIT_GENERAL_WINDOW = int(os.getenv("MOCHA_RATE_LIMIT_GENERAL_WINDOW_SECONDS", "60"))

raw_origins = os.getenv("CORS_ORIGINS", FRONTEND_URL)
CORS_ORIGINS = [origin.strip().rstrip("/") for origin in raw_origins.split(",") if origin.strip()]
if FRONTEND_URL not in CORS_ORIGINS:
    CORS_ORIGINS.append(FRONTEND_URL)


def _is_local_url(url: str) -> bool:
    return "localhost" in url or "127.0.0.1" in url


# --- Startup validation: fail loudly rather than silently run insecurely ---

for _origin in CORS_ORIGINS:
    _parsed = urlparse(_origin)
    if _parsed.scheme not in ("http", "https") or not _parsed.netloc:
        raise RuntimeError(f"CORS origin '{_origin}' must be a full http(s) origin.")
    if _parsed.scheme != "https" and not _is_local_url(_origin):
        raise RuntimeError(
            f"CORS origin '{_origin}' must use https:// outside of local development."
        )

if DISCORD_REDIRECT_URI:
    _redirect_parsed = urlparse(DISCORD_REDIRECT_URI)
    if _redirect_parsed.scheme != "https" and not _is_local_url(DISCORD_REDIRECT_URI):
        raise RuntimeError(
            "DISCORD_REDIRECT_URI must use https:// outside of local development."
        )

# Key rotation support: MOCHA_TOKEN_ENCRYPTION_KEY may be a comma-separated
# list of Fernet keys. The FIRST key is used to encrypt new values; ALL keys
# are tried when decrypting, so you can rotate by prepending a new key and
# only dropping the old one once every row has been re-encrypted.
raw_keys = os.getenv("MOCHA_TOKEN_ENCRYPTION_KEY", "")
_key_list = [k.strip().strip("'\" ") for k in raw_keys.split(",") if k.strip()]

if not _key_list:
    raise RuntimeError(
        "MOCHA_TOKEN_ENCRYPTION_KEY is required. Generate one with "
        "Fernet.generate_key() and put it in backend/.env. A comma-separated "
        "list is accepted for key rotation (newest key first)."
    )
try:
    TOKEN_CIPHER = MultiFernet([Fernet(k.encode()) for k in _key_list])
except Exception as exc:  # pragma: no cover - configuration failure
    raise RuntimeError("MOCHA_TOKEN_ENCRYPTION_KEY contains an invalid Fernet key.") from exc

# Fail fast on cookie configs that would silently ship an insecure session
# cookie. SameSite=None cookies MUST be Secure (browsers reject them
# otherwise, or worse, some older browsers accept them anyway over plain
# HTTP). Cross-origin deployments (frontend/backend on different hosts,
# which this app's CORS setup implies) generally need SameSite=None, so
# Secure has to be true whenever we're not purely local.
if COOKIE_SAMESITE == "none" and not COOKIE_SECURE:
    raise RuntimeError(
        "MOCHA_COOKIE_SAMESITE=none requires MOCHA_COOKIE_SECURE=true "
        "(browsers will drop or refuse insecure SameSite=None cookies)."
    )
if not COOKIE_SECURE and not _is_local_url(FRONTEND_URL):
    # Deliberately a hard failure, not a warning: shipping session cookies
    # over plain HTTP to a non-local frontend is a credential-theft bug
    # waiting to happen, and it's cheap to fix (set MOCHA_COOKIE_SECURE=true
    # behind TLS). Refusing to boot beats silently leaking sessions.
    raise RuntimeError(
        "MOCHA_COOKIE_SECURE=false is only permitted when FRONTEND_URL is "
        f"local (got {FRONTEND_URL!r}). Set MOCHA_COOKIE_SECURE=true for any "
        "non-local deployment."
    )


app = FastAPI(title="Mocha Auth API", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type"],
)


# --- Rate limiting -----------------------------------------------------
# Deliberately dependency-free (no Redis/slowapi) so this keeps working
# with nothing but the stdlib. Per-process only: fine for a single
# instance; behind multiple instances, front this with a shared store
# (Redis) or a rate limit at the reverse proxy / WAF layer instead.


class RateLimiter:
    def __init__(self, max_requests: int, window_seconds: int):
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        self._hits: dict[str, list[float]] = {}
        self._lock = threading.Lock()

    def allow(self, key: str) -> bool:
        now_ts = time.monotonic()
        cutoff = now_ts - self.window_seconds
        with self._lock:
            hits = self._hits.setdefault(key, [])
            while hits and hits[0] < cutoff:
                hits.pop(0)
            if len(hits) >= self.max_requests:
                return False
            hits.append(now_ts)
            return True


login_rate_limiter = RateLimiter(RATE_LIMIT_LOGIN_MAX, RATE_LIMIT_LOGIN_WINDOW)
callback_rate_limiter = RateLimiter(RATE_LIMIT_CALLBACK_MAX, RATE_LIMIT_CALLBACK_WINDOW)
general_rate_limiter = RateLimiter(RATE_LIMIT_GENERAL_MAX, RATE_LIMIT_GENERAL_WINDOW)


def client_ip(request: Request) -> str:
    # Not trusting X-Forwarded-For by default it's attacker-controllable
    # unless you know your proxy strips/overwrites it. If this sits behind
    # a trusted reverse proxy, terminate/rewrite that header there, or add
    # explicit trusted-proxy handling here.
    return request.client.host if request.client else "unknown"


SAFE_METHODS = {"GET", "HEAD", "OPTIONS"}


def _origin_root(value: str) -> str:
    parsed = urlparse(value)
    if not parsed.scheme or not parsed.netloc:
        return value.rstrip("/")
    return f"{parsed.scheme}://{parsed.netloc}"


@app.middleware("http")
async def rate_limit_guard(request: Request, call_next):
    if request.url.path != "/health" and not general_rate_limiter.allow(client_ip(request)):
        return JSONResponse({"error": "rate_limited"}, status_code=429)
    return await call_next(request)


@app.middleware("http")
async def csrf_origin_guard(request: Request, call_next):
    # Second, independent CSRF layer on top of SameSite cookies: any
    # state-changing request must claim an Origin/Referer we actually trust.
    if request.method not in SAFE_METHODS:
        origin = request.headers.get("origin") or request.headers.get("referer")
        if origin and _origin_root(origin) not in CORS_ORIGINS:
            return JSONResponse({"error": "cross_origin_request_rejected"}, status_code=403)
    return await call_next(request)


@app.middleware("http")
async def security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Referrer-Policy"] = "no-referrer"
    response.headers["Permissions-Policy"] = "geolocation=(), microphone=(), camera=()"
    response.headers["Content-Security-Policy"] = "default-src 'none'; frame-ancestors 'none'"
    response.headers["Cross-Origin-Opener-Policy"] = "same-origin"
    response.headers["Cross-Origin-Resource-Policy"] = "same-site"
    if COOKIE_SECURE:
        response.headers["Strict-Transport-Security"] = "max-age=63072000; includeSubDomains"
    return response


def now() -> int:
    return int(time.time())


def digest(value: str) -> str:
    return hashlib.sha256(value.encode("utf-8")).hexdigest()


def db_connection() -> sqlite3.Connection:
    DATABASE_PATH.parent.mkdir(parents=True, exist_ok=True)
    connection = sqlite3.connect(DATABASE_PATH)
    connection.row_factory = sqlite3.Row
    connection.execute("PRAGMA foreign_keys = ON")
    return connection


def init_database() -> None:
    with db_connection() as db:
        db.executescript(
            """
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                discord_id TEXT NOT NULL UNIQUE,
                username TEXT NOT NULL,
                global_name TEXT,
                email TEXT,
                avatar_hash TEXT,
                email_verified INTEGER NOT NULL DEFAULT 0,
                access_token TEXT,
                refresh_token TEXT,
                token_expires_at INTEGER,
                token_type TEXT,
                scope TEXT,
                guilds_json TEXT,
                created_at INTEGER NOT NULL,
                updated_at INTEGER NOT NULL
            );

            CREATE TABLE IF NOT EXISTS sessions (
                id_hash TEXT PRIMARY KEY,
                user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                ua_hash TEXT NOT NULL DEFAULT '',
                expires_at INTEGER NOT NULL,
                created_at INTEGER NOT NULL
            );

            CREATE TABLE IF NOT EXISTS oauth_states (
                state_hash TEXT PRIMARY KEY,
                expires_at INTEGER NOT NULL,
                created_at INTEGER NOT NULL
            );

            CREATE INDEX IF NOT EXISTS sessions_user_id_idx ON sessions(user_id);
            CREATE INDEX IF NOT EXISTS oauth_states_expires_at_idx ON oauth_states(expires_at);
            """
        )
        # Lightweight migration for databases created before ua_hash existed.
        # Rows backfilled with '' will simply never match a real UA hash,
        # which forces a one-time re-login for pre-upgrade sessions --
        # an acceptable and safe default rather than trusting old sessions
        # that were never bound to a device.
        existing_columns = {row["name"] for row in db.execute("PRAGMA table_info(sessions)")}
        if "ua_hash" not in existing_columns:
            db.execute("ALTER TABLE sessions ADD COLUMN ua_hash TEXT NOT NULL DEFAULT ''")

    try:
        os.chmod(DATABASE_PATH, 0o600)
    except OSError:
        logger.warning("Could not restrict file permissions on %s.", DATABASE_PATH)


def cleanup_expired_rows() -> None:
    """Sweep expired oauth_states and sessions rows.

    oauth_states were previously only cleaned up opportunistically inside
    discord_login, right before inserting a new row. A burst of hits to
    /auth/discord/login within the state TTL grew that table roughly
    linearly with request volume with no cap -- a cheap disk-filling DoS
    vector. Expired sessions had no cleanup path at all outside of the
    single row touched by get_current_user. This runs on startup and on a
    periodic background loop.
    """
    timestamp = now()
    with db_connection() as db:
        states_deleted = db.execute(
            "DELETE FROM oauth_states WHERE expires_at <= ?", (timestamp,)
        ).rowcount
        sessions_deleted = db.execute(
            "DELETE FROM sessions WHERE expires_at <= ?", (timestamp,)
        ).rowcount
    if states_deleted or sessions_deleted:
        logger.info(
            "Cleanup: removed %d expired oauth_states, %d expired sessions.",
            states_deleted,
            sessions_deleted,
        )


async def periodic_cleanup_loop() -> None:
    import asyncio

    while True:
        try:
            await asyncio.sleep(CLEANUP_INTERVAL_SECONDS)
            cleanup_expired_rows()
        except asyncio.CancelledError:
            break
        except Exception:  # pragma: no cover - best-effort background task
            logger.exception("Periodic cleanup failed.")


@asynccontextmanager
async def lifespan(app: FastAPI):
    import asyncio

    init_database()
    cleanup_expired_rows()
    task = asyncio.create_task(periodic_cleanup_loop())
    try:
        yield
    finally:
        task.cancel()


app.router.lifespan_context = lifespan


def encrypt(value: str | None) -> str | None:
    if not value:
        return None
    return TOKEN_CIPHER.encrypt(value.encode("utf-8")).decode("utf-8")


def decrypt(value: str | None) -> str | None:
    if not value:
        return None
    try:
        return TOKEN_CIPHER.decrypt(value.encode("utf-8")).decode("utf-8")
    except InvalidToken as exc:
        raise RuntimeError("Stored Discord token cannot be decrypted.") from exc


def avatar_url(discord_id: str, avatar_hash: str | None) -> str:
    if avatar_hash:
        extension = "gif" if avatar_hash.startswith("a_") else "png"
        return f"https://cdn.discordapp.com/avatars/{discord_id}/{avatar_hash}.{extension}?size=128"
    # Discord's default avatar index is stable and needs no extra API call.
    try:
        index = int(discord_id) % 5
    except (TypeError, ValueError):
        # discord_id should always be a numeric snowflake, but don't 500 the
        # whole response over a malformed/legacy value -- fall back to a
        # fixed default avatar instead.
        index = 0
    return f"https://cdn.discordapp.com/embed/avatars/{index}.png"


def public_user(row: sqlite3.Row) -> dict[str, Any]:
    return {
        "id": row["discord_id"],
        "username": row["username"],
        "global_name": row["global_name"],
        "email": row["email"],
        "avatar_url": avatar_url(row["discord_id"], row["avatar_hash"]),
        "email_verified": bool(row["email_verified"]),
    }


def get_current_user(request: Request) -> sqlite3.Row | None:
    session_id = request.cookies.get(SESSION_COOKIE)
    if not session_id:
        return None

    ua_hash = digest(request.headers.get("user-agent", ""))

    with db_connection() as db:
        row = db.execute(
            """
            SELECT users.*, sessions.ua_hash AS session_ua_hash
            FROM sessions
            JOIN users ON users.id = sessions.user_id
            WHERE sessions.id_hash = ? AND sessions.expires_at > ?
            """,
            (digest(session_id), now()),
        ).fetchone()

        if not row:
            db.execute("DELETE FROM sessions WHERE id_hash = ?", (digest(session_id),))
            return None

        if BIND_SESSION_TO_UA and not secrets.compare_digest(row["session_ua_hash"], ua_hash):
            # The session cookie is being replayed from a different
            # User-Agent than the one that created it -- most likely a
            # stolen cookie (exfiltrated via XSS, log leak, etc). Revoke it
            # rather than honoring it; the legitimate user just re-logs in.
            logger.warning("Session UA mismatch for user_id=%s; session revoked.", row["id"])
            db.execute("DELETE FROM sessions WHERE id_hash = ?", (digest(session_id),))
            return None

        return row


def require_configuration() -> None:
    missing = [
        name
        for name, value in (
            ("DISCORD_CLIENT_ID", DISCORD_CLIENT_ID),
            ("DISCORD_CLIENT_SECRET", DISCORD_CLIENT_SECRET),
            ("DISCORD_REDIRECT_URI", DISCORD_REDIRECT_URI),
        )
        if not value
    ]
    if missing:
        raise HTTPException(
            status_code=500,
            detail=f"Discord OAuth is not configured. Missing: {', '.join(missing)}.",
        )


def redirect_to_frontend() -> RedirectResponse:
    return RedirectResponse(f"{FRONTEND_URL}/#top", status_code=303)


def _pkce_pair() -> tuple[str, str]:
    verifier = secrets.token_urlsafe(64)[:128]
    challenge = base64.urlsafe_b64encode(hashlib.sha256(verifier.encode("ascii")).digest())
    return verifier, challenge.decode("ascii").rstrip("=")


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/auth/discord/login")
def discord_login(request: Request) -> RedirectResponse:
    require_configuration()
    if not login_rate_limiter.allow(client_ip(request)):
        raise HTTPException(status_code=429, detail="Too many login attempts. Try again shortly.")

    state = secrets.token_urlsafe(32)
    timestamp = now()
    with db_connection() as db:
        db.execute("DELETE FROM oauth_states WHERE expires_at <= ?", (timestamp,))
        db.execute(
            "INSERT INTO oauth_states (state_hash, expires_at, created_at) VALUES (?, ?, ?)",
            (digest(state), timestamp + OAUTH_STATE_TTL_SECONDS, timestamp),
        )

    query: dict[str, str] = {
        "client_id": DISCORD_CLIENT_ID,
        "response_type": "code",
        "redirect_uri": DISCORD_REDIRECT_URI,
        "scope": DISCORD_SCOPE,
        "state": state,
    }

    code_verifier = ""
    if PKCE_ENABLED:
        code_verifier, code_challenge = _pkce_pair()
        query["code_challenge"] = code_challenge
        query["code_challenge_method"] = "S256"

    response = RedirectResponse(f"{DISCORD_AUTHORIZE}?{urlencode(query)}", status_code=303)

    # The state (and PKCE verifier) live in a short-lived HttpOnly cookie
    # scoped to this browser -- never in the database. This is what makes
    # the callback able to verify "the browser completing this flow is the
    # same one that started it", which is the actual login-CSRF defense;
    # the database row alone only proves the state was issued by us, not
    # that it's being redeemed by the browser it was issued to.
    #
    # SameSite is forced to "lax" here regardless of the global cookie
    # setting: this cookie must survive the top-level cross-site GET
    # redirect back from discord.com, which SameSite=Strict would block.
    response.set_cookie(
        key=OAUTH_TRANSACTION_COOKIE,
        value=f"{state}.{code_verifier}",
        max_age=OAUTH_STATE_TTL_SECONDS,
        httponly=True,
        secure=COOKIE_SECURE,
        samesite="lax",
        path="/auth/discord/callback",
    )
    return response


@app.get("/auth/discord/callback")
async def discord_callback(
    request: Request, code: str | None = None, state: str | None = None, error: str | None = None
):
    if not callback_rate_limiter.allow(client_ip(request)):
        raise HTTPException(status_code=429, detail="Too many callback attempts. Try again shortly.")
    if error:
        return JSONResponse({"error": "discord_authorization_denied"}, status_code=400)
    if not code or not state:
        return JSONResponse({"error": "missing_oauth_parameters"}, status_code=400)
    require_configuration()

    transaction_cookie = request.cookies.get(OAUTH_TRANSACTION_COOKIE, "")
    cookie_state, _, code_verifier = transaction_cookie.partition(".")
    if not cookie_state or not secrets.compare_digest(cookie_state, state):
        # Either no transaction cookie at all, or it doesn't match the
        # state in the query string -- this request didn't originate from
        # the browser that started the flow. Reject regardless of what the
        # database says about the state's validity.
        return JSONResponse({"error": "oauth_state_mismatch"}, status_code=400)

    with db_connection() as db:
        state_row = db.execute(
            "SELECT state_hash, expires_at FROM oauth_states WHERE state_hash = ?",
            (digest(state),),
        ).fetchone()
        db.execute("DELETE FROM oauth_states WHERE state_hash = ?", (digest(state),))
    if not state_row or state_row["expires_at"] <= now():
        return JSONResponse({"error": "invalid_or_expired_oauth_state"}, status_code=400)

    token_payload = {
        "client_id": DISCORD_CLIENT_ID,
        "client_secret": DISCORD_CLIENT_SECRET,
        "grant_type": "authorization_code",
        "code": code,
        "redirect_uri": DISCORD_REDIRECT_URI,
    }
    if PKCE_ENABLED and code_verifier:
        token_payload["code_verifier"] = code_verifier

    async with httpx.AsyncClient(timeout=15) as client:
        token_response = await client.post(
            f"{DISCORD_API}/oauth2/token",
            data=token_payload,
            headers={"Content-Type": "application/x-www-form-urlencoded"},
        )
        if token_response.is_error:
            # Log only the status code -- never the response body. Even on
            # the token-exchange error path, echoing Discord's raw body
            # into logs (or back to the client) risks leaking internal
            # exchange details for no benefit.
            logger.error("Discord token exchange failed with status %s.", token_response.status_code)
            return JSONResponse({"error": "discord_token_exchange_failed"}, status_code=502)
        token_data = token_response.json()
        access_token = token_data.get("access_token")
        refresh_token = token_data.get("refresh_token")
        if not access_token:
            logger.error(
                "Discord token exchange returned no access_token (fields present: %s).",
                sorted(token_data.keys()),
            )
            return JSONResponse({"error": "discord_did_not_return_access_token"}, status_code=502)

        user_response = await client.get(
            f"{DISCORD_API}/users/@me",
            headers={"Authorization": f"Bearer {access_token}"},
        )
        if user_response.is_error:
            logger.error("Discord user lookup failed with status %s.", user_response.status_code)
            return JSONResponse({"error": "discord_user_lookup_failed"}, status_code=502)
        discord_user = user_response.json()

    timestamp = now()
    # Clamp expires_in to a sane range rather than trusting it blindly --
    # defensive coding against a malformed/unexpected upstream response
    # producing an absurdly long-lived (or negative) token lifetime.
    expires_in = max(60, min(int(token_data.get("expires_in", 604800)), 30 * 86400))
    expires_at = timestamp + expires_in
    discord_id = str(discord_user["id"])
    username = discord_user.get("username") or discord_id
    global_name = discord_user.get("global_name")
    email = discord_user.get("email")
    avatar_hash = discord_user.get("avatar")

    with db_connection() as db:
        existing = db.execute("SELECT id FROM users WHERE discord_id = ?", (discord_id,)).fetchone()
        values = (
            username,
            global_name,
            email,
            avatar_hash,
            1 if discord_user.get("verified") else 0,
            encrypt(access_token),
            encrypt(refresh_token),
            expires_at,
            token_data.get("token_type", "Bearer"),
            token_data.get("scope", DISCORD_SCOPE),
            timestamp,
        )
        if existing:
            user_id = existing["id"]
            db.execute(
                """
                UPDATE users SET username = ?, global_name = ?, email = ?, avatar_hash = ?,
                    email_verified = ?, access_token = ?, refresh_token = ?, token_expires_at = ?,
                    token_type = ?, scope = ?, updated_at = ? WHERE id = ?
                """,
                (*values, user_id),
            )
        else:
            cursor = db.execute(
                """
                INSERT INTO users (
                    discord_id, username, global_name, email, avatar_hash, email_verified,
                    access_token, refresh_token, token_expires_at, token_type, scope,
                    created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    discord_id,
                    username,
                    global_name,
                    email,
                    avatar_hash,
                    1 if discord_user.get("verified") else 0,
                    encrypt(access_token),
                    encrypt(refresh_token),
                    expires_at,
                    token_data.get("token_type", "Bearer"),
                    token_data.get("scope", DISCORD_SCOPE),
                    timestamp,
                    timestamp,
                ),
            )
            user_id = cursor.lastrowid

        session_id = secrets.token_urlsafe(48)
        ua_hash = digest(request.headers.get("user-agent", ""))
        db.execute(
            "INSERT INTO sessions (id_hash, user_id, ua_hash, expires_at, created_at) VALUES (?, ?, ?, ?, ?)",
            (digest(session_id), user_id, ua_hash, timestamp + SESSION_DAYS * 86400, timestamp),
        )
        # Single-active-session policy: a fresh login invalidates this
        # user's other sessions. Kept from the original design -- it caps
        # how many valid session cookies exist at once, which limits the
        # blast radius of any one leaked cookie. Drop this if you need
        # legitimate concurrent multi-device sessions.
        db.execute(
            "DELETE FROM sessions WHERE user_id = ? AND id_hash != ?",
            (user_id, digest(session_id)),
        )

    response = redirect_to_frontend()
    response.set_cookie(
        key=SESSION_COOKIE,
        value=session_id,
        max_age=SESSION_DAYS * 86400,
        httponly=True,
        secure=COOKIE_SECURE,
        samesite=COOKIE_SAMESITE,
        path="/",
    )
    response.delete_cookie(OAUTH_TRANSACTION_COOKIE, path="/auth/discord/callback")
    return response


@app.get("/auth/session")
def auth_session(request: Request) -> dict[str, Any]:
    user = get_current_user(request)
    if not user:
        return {"authenticated": False, "user": None}
    return {"authenticated": True, "user": public_user(user)}


@app.post("/auth/logout")
def logout(request: Request) -> JSONResponse:
    session_id = request.cookies.get(SESSION_COOKIE)
    response = JSONResponse({"authenticated": False})
    if session_id:
        with db_connection() as db:
            db.execute("DELETE FROM sessions WHERE id_hash = ?", (digest(session_id),))
    response.delete_cookie(SESSION_COOKIE, path="/")
    return response


async def valid_access_token(user: sqlite3.Row) -> str:
    access_token = decrypt(user["access_token"])
    if access_token and (user["token_expires_at"] or 0) > now() + 60:
        return access_token

    refresh_token = decrypt(user["refresh_token"])
    if not refresh_token:
        raise HTTPException(status_code=401, detail="Discord authorization has expired.")

    async with httpx.AsyncClient(timeout=15) as client:
        response = await client.post(
            f"{DISCORD_API}/oauth2/token",
            data={
                "client_id": DISCORD_CLIENT_ID,
                "client_secret": DISCORD_CLIENT_SECRET,
                "grant_type": "refresh_token",
                "refresh_token": refresh_token,
            },
            headers={"Content-Type": "application/x-www-form-urlencoded"},
        )
    if response.is_error:
        logger.error("Discord token refresh failed with status %s.", response.status_code)
        raise HTTPException(status_code=401, detail="Discord authorization needs to be renewed.")

    token_data = response.json()
    new_access = token_data.get("access_token")
    if not new_access:
        raise HTTPException(status_code=401, detail="Discord did not return a refreshed token.")
    new_refresh = token_data.get("refresh_token") or refresh_token
    expires_in = max(60, min(int(token_data.get("expires_in", 604800)), 30 * 86400))
    with db_connection() as db:
        db.execute(
            """
            UPDATE users SET access_token = ?, refresh_token = ?, token_expires_at = ?,
                token_type = ?, scope = ?, updated_at = ? WHERE id = ?
            """,
            (
                encrypt(new_access),
                encrypt(new_refresh),
                now() + expires_in,
                token_data.get("token_type", user["token_type"] or "Bearer"),
                token_data.get("scope", user["scope"] or DISCORD_SCOPE),
                now(),
                user["id"],
            ),
        )
    return new_access


@app.get("/api/me/guilds")
async def my_guilds(request: Request) -> dict[str, Any]:
    user = get_current_user(request)
    if not user:
        raise HTTPException(status_code=401, detail="Login required.")
    access_token = await valid_access_token(user)
    async with httpx.AsyncClient(timeout=15) as client:
        response = await client.get(
            f"{DISCORD_API}/users/@me/guilds",
            headers={"Authorization": f"Bearer {access_token}"},
        )
    if response.is_error:
        logger.error("Discord guilds lookup failed with status %s.", response.status_code)
        raise HTTPException(status_code=502, detail="Could not load Discord servers.")
    guilds = response.json()
    with db_connection() as db:
        db.execute("UPDATE users SET guilds_json = ?, updated_at = ? WHERE id = ?", (json.dumps(guilds), now(), user["id"]))
    return {"guilds": guilds}

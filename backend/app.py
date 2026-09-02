"""Small Discord OAuth backend for Mocha.

The browser never receives Discord access or refresh tokens. It receives an
opaque HttpOnly session cookie, while encrypted OAuth tokens stay server-side.
SQLite is the development default; the data layer can later be replaced with
PostgreSQL without changing the OAuth routes.
"""

from __future__ import annotations

import hashlib
import json
import logging
import os
import secrets
import sqlite3
import time
from contextlib import asynccontextmanager
from pathlib import Path
from typing import Any
from urllib.parse import urlencode

import httpx
from cryptography.fernet import Fernet, InvalidToken
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

# How often (in seconds) expired oauth_states/sessions rows get swept,
# independent of the opportunistic cleanup that already runs on login.
CLEANUP_INTERVAL_SECONDS = int(os.getenv("MOCHA_CLEANUP_INTERVAL_SECONDS", "3600"))

raw_origins = os.getenv("CORS_ORIGINS", FRONTEND_URL)
CORS_ORIGINS = [origin.strip().rstrip("/") for origin in raw_origins.split(",") if origin.strip()]
if FRONTEND_URL not in CORS_ORIGINS:
    CORS_ORIGINS.append(FRONTEND_URL)

raw_key = os.getenv("MOCHA_TOKEN_ENCRYPTION_KEY", "")
encryption_key = raw_key.strip("'\" ")

if not encryption_key:
    raise RuntimeError(
        "MOCHA_TOKEN_ENCRYPTION_KEY is required. Generate one with "
        "Fernet.generate_key() and put it in backend/.env."
    )
try:
    TOKEN_CIPHER = Fernet(encryption_key.encode())
except Exception as exc:  # pragma: no cover - configuration failure
    raise RuntimeError("MOCHA_TOKEN_ENCRYPTION_KEY is not a valid Fernet key.") from exc


def _is_local_url(url: str) -> bool:
    return "localhost" in url or "127.0.0.1" in url


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
    logger.warning(
        "MOCHA_COOKIE_SECURE is false while FRONTEND_URL (%s) does not look "
        "local. Session cookies will be sent over plain HTTP -- set "
        "MOCHA_COOKIE_SECURE=true for any non-local deployment.",
        FRONTEND_URL,
    )


app = FastAPI(title="Mocha Auth API", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type"],
)


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

    with db_connection() as db:
        row = db.execute(
            """
            SELECT users.*
            FROM sessions
            JOIN users ON users.id = sessions.user_id
            WHERE sessions.id_hash = ? AND sessions.expires_at > ?
            """,
            (digest(session_id), now()),
        ).fetchone()
        if not row:
            db.execute("DELETE FROM sessions WHERE id_hash = ?", (digest(session_id),))
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


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/auth/discord/login")
def discord_login() -> RedirectResponse:
    require_configuration()
    state = secrets.token_urlsafe(32)
    timestamp = now()
    with db_connection() as db:
        db.execute("DELETE FROM oauth_states WHERE expires_at <= ?", (timestamp,))
        db.execute(
            "INSERT INTO oauth_states (state_hash, expires_at, created_at) VALUES (?, ?, ?)",
            (digest(state), timestamp + 600, timestamp),
        )

    query = urlencode(
        {
            "client_id": DISCORD_CLIENT_ID,
            "response_type": "code",
            "redirect_uri": DISCORD_REDIRECT_URI,
            "scope": DISCORD_SCOPE,
            "state": state,
        }
    )
    return RedirectResponse(f"{DISCORD_AUTHORIZE}?{query}", status_code=303)


@app.get("/auth/discord/callback")
async def discord_callback(code: str | None = None, state: str | None = None, error: str | None = None):
    if error:
        return JSONResponse({"error": "discord_authorization_denied"}, status_code=400)
    if not code or not state:
        return JSONResponse({"error": "missing_oauth_parameters"}, status_code=400)
    require_configuration()

    with db_connection() as db:
        state_row = db.execute(
            "SELECT state_hash, expires_at FROM oauth_states WHERE state_hash = ?",
            (digest(state),),
        ).fetchone()
        db.execute("DELETE FROM oauth_states WHERE state_hash = ?", (digest(state),))
    if not state_row or state_row["expires_at"] <= now():
        return JSONResponse({"error": "invalid_or_expired_oauth_state"}, status_code=400)

    async with httpx.AsyncClient(timeout=15) as client:
        token_response = await client.post(
            f"{DISCORD_API}/oauth2/token",
            data={
                "client_id": DISCORD_CLIENT_ID,
                "client_secret": DISCORD_CLIENT_SECRET,
                "grant_type": "authorization_code",
                "code": code,
                "redirect_uri": DISCORD_REDIRECT_URI,
            },
            headers={"Content-Type": "application/x-www-form-urlencoded"},
        )
        if token_response.is_error:
            # Log the upstream error server-side only -- echoing Discord's
            # raw response body back to whoever hits this callback URL can
            # leak internal exchange details for no benefit to the client.
            logger.error("Discord token exchange failed: %s", token_response.text)
            return JSONResponse({"error": "discord_token_exchange_failed"}, status_code=502)
        token_data = token_response.json()
        access_token = token_data.get("access_token")
        refresh_token = token_data.get("refresh_token")
        if not access_token:
            logger.error("Discord token exchange returned no access_token: %s", token_data)
            return JSONResponse({"error": "discord_did_not_return_access_token"}, status_code=502)

        user_response = await client.get(
            f"{DISCORD_API}/users/@me",
            headers={"Authorization": f"Bearer {access_token}"},
        )
        if user_response.is_error:
            logger.error("Discord user lookup failed: %s", user_response.text)
            return JSONResponse({"error": "discord_user_lookup_failed"}, status_code=502)
        discord_user = user_response.json()

    timestamp = now()
    expires_at = timestamp + int(token_data.get("expires_in", 604800))
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
        db.execute(
            "INSERT INTO sessions (id_hash, user_id, expires_at, created_at) VALUES (?, ?, ?, ?)",
            (digest(session_id), user_id, timestamp + SESSION_DAYS * 86400, timestamp),
        )
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
        logger.error("Discord token refresh failed: %s", response.text)
        raise HTTPException(status_code=401, detail="Discord authorization needs to be renewed.")

    token_data = response.json()
    new_access = token_data.get("access_token")
    if not new_access:
        raise HTTPException(status_code=401, detail="Discord did not return a refreshed token.")
    new_refresh = token_data.get("refresh_token") or refresh_token
    with db_connection() as db:
        db.execute(
            """
            UPDATE users SET access_token = ?, refresh_token = ?, token_expires_at = ?,
                token_type = ?, scope = ?, updated_at = ? WHERE id = ?
            """,
            (
                encrypt(new_access),
                encrypt(new_refresh),
                now() + int(token_data.get("expires_in", 604800)),
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
        logger.error("Discord guilds lookup failed: %s", response.text)
        raise HTTPException(status_code=502, detail="Could not load Discord servers.")
    guilds = response.json()
    with db_connection() as db:
        db.execute("UPDATE users SET guilds_json = ?, updated_at = ? WHERE id = ?", (json.dumps(guilds), now(), user["id"]))
    return {"guilds": guilds}
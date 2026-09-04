/**
 * Shared Discord session state.
 *
 * The site used to fetch `/auth/session` independently from three different
 * components (homepage nav, hero, and — once it existed — the standalone page
 * nav). Each of those calls parsed the response with `res.json()` blindly, so
 * whenever the request did not reach the auth API (no dev proxy configured,
 * API not running, HTML error page, rate limit, …) the promise rejected, the
 * `catch` swallowed it and the UI silently rendered "not logged in".
 *
 * This module is the single source of truth:
 *  - one in-flight request shared by every subscriber on the page,
 *  - responses are validated (status + content-type + shape) before they are
 *    trusted, so a stray HTML body can never masquerade as a session,
 *  - `loading` is a real state, so the nav can render a skeleton instead of
 *    flashing the logged-out "Login" pill,
 *  - the auth flow itself is untouched: same endpoints, same HttpOnly cookie,
 *    same credentials: "include", nothing hardcoded.
 */

import { useCallback, useEffect, useState } from "react";

export type MochaUser = {
  id: string;
  username: string;
  global_name: string | null;
  email: string | null;
  avatar_url: string;
  email_verified: boolean;
};

export type SessionStatus = "loading" | "ready";

export type SessionState = {
  user: MochaUser | null;
  status: SessionStatus;
};

const SESSION_ENDPOINT = "/auth/session";
const LOGOUT_ENDPOINT = "/auth/logout";

/** Upper bound for the session read, so a hung API cannot freeze the nav. */
const SESSION_TIMEOUT_MS = 4000;

/**
 * Discord's default avatars are derived from the user id, which lets us keep a
 * working picture even if a stored avatar hash has gone stale. Mirrors the
 * fallback the auth API already applies server-side.
 */
export function defaultDiscordAvatar(id?: string | null): string {
  const numeric = Number(id);
  const index = Number.isFinite(numeric) ? Math.abs(Math.trunc(numeric)) % 5 : 0;
  return `https://cdn.discordapp.com/embed/avatars/${index}.png`;
}

let state: SessionState = { user: null, status: "loading" };
let inflight: Promise<MochaUser | null> | null = null;
const listeners = new Set<(next: SessionState) => void>();

function publish(next: SessionState) {
  state = next;
  listeners.forEach((listener) => listener(state));
}

function subscribe(listener: (next: SessionState) => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function normalizeUser(raw: unknown): MochaUser | null {
  if (!raw || typeof raw !== "object") return null;
  const value = raw as Record<string, unknown>;
  const username = typeof value.username === "string" ? value.username : "";
  if (!username) return null;

  const id = typeof value.id === "string" ? value.id : "";
  const avatar = typeof value.avatar_url === "string" && value.avatar_url ? value.avatar_url : defaultDiscordAvatar(id);

  return {
    id,
    username,
    global_name: typeof value.global_name === "string" ? value.global_name : null,
    email: typeof value.email === "string" ? value.email : null,
    avatar_url: avatar,
    email_verified: value.email_verified === true,
  };
}

/** `res.json()` throws on HTML; check first so a dev-server fallback page is ignored. */
async function readJson(res: Response): Promise<Record<string, unknown> | null> {
  const type = res.headers.get("content-type") ?? "";
  if (!type.includes("json")) return null;
  try {
    const data = (await res.json()) as unknown;
    return data && typeof data === "object" ? (data as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

/**
 * Reads the session from the auth API. Safe to call from several components:
 * concurrent callers share one request and one cache entry.
 */
export function loadSession(force = false): Promise<MochaUser | null> {
  if (!force && state.status === "ready") return Promise.resolve(state.user);
  if (inflight) return inflight;

  const request = (async () => {
    // Never leave the nav stuck in its loading state if the API hangs.
    const timeout = new Promise<null>((resolve) => {
      window.setTimeout(() => resolve(null), SESSION_TIMEOUT_MS);
    });

    try {
      const res = await Promise.race([
        fetch(SESSION_ENDPOINT, {
          credentials: "include",
          cache: "no-store",
          headers: { Accept: "application/json" },
        }),
        timeout,
      ]);
      if (!res || !res.ok) return null;
      const data = await readJson(res);
      if (!data || data.authenticated !== true) return null;
      return normalizeUser(data.user);
    } catch {
      // API unreachable / offline: render the logged-out state, never a fake user.
      return null;
    }
  })();

  inflight = request;

  return request
    .then((user) => {
      publish({ user, status: "ready" });
      return user;
    })
    .finally(() => {
      inflight = null;
    });
}

/** Ends the session server-side, then clears local state for every subscriber. */
export async function endSession(): Promise<void> {
  try {
    await fetch(LOGOUT_ENDPOINT, {
      method: "POST",
      credentials: "include",
      headers: { Accept: "application/json" },
    });
  } catch {
    // best-effort: local state is cleared either way.
  }
  publish({ user: null, status: "ready" });
}

export function useMochaSession() {
  const [session, setSession] = useState<SessionState>(state);

  useEffect(() => {
    const unsubscribe = subscribe(setSession);
    void loadSession();
    return unsubscribe;
  }, []);

  const logout = useCallback(() => endSession(), []);
  const refresh = useCallback(() => loadSession(true), []);

  const user = session.user;
  const displayName = user?.global_name || user?.username || "";

  return {
    user,
    status: session.status,
    displayName,
    isAuthenticated: Boolean(user),
    logout,
    refresh,
  };
}

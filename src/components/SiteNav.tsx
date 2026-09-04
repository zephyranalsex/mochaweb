import { useEffect, useRef, useState } from "react";
import { mochaPaperclip } from "../assets/mochaAssets";
import { DISCORD_INVITE_URL, STANDALONE_NAV, currentPath, isRouteActive } from "../lib/site";
import ProfileMenu, { ACCOUNT_LINKS_WITH_INVITE } from "./ProfileMenu";
import { defaultDiscordAvatar, useMochaSession } from "../lib/session";
import { Icon } from "./ui/Icon";

/**
 * Navigation for the standalone pages (premium, commands, docs, help, legal).
 *
 * Same visual language as the homepage pill nav — floating bar, hairline
 * gradient underline, sticker brand mark, mono micro-type — but route based
 * instead of anchor based, with a real active state and a mobile sheet.
 * The account area is the shared `ProfileMenu`, so the signed-in Discord
 * avatar shows up here exactly as it does on the homepage.
 */

function routeContext(path: string): string {
  if (path.startsWith("/docs")) {
    const sub = path.split("/")[2];
    return sub ? `docs / ${sub.replace(/-/g, " ")}` : "docs";
  }
  const segment = path.split("/")[1];
  return segment || "overview";
}

export default function SiteNav() {
  const path = currentPath();
  const { user, displayName, logout } = useMochaSession();
  const [scrolled, setScrolled] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  /* Same fallback chain ProfileMenu uses: stored avatar -> Discord's default. */
  const [sheetAvatar, setSheetAvatar] = useState<string | null>(null);
  const progressRef = useRef<HTMLElement | null>(null);
  const wrapRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const y = window.scrollY || 0;
        setScrolled(y > 16);
        const max = document.documentElement.scrollHeight - window.innerHeight;
        const p = max > 0 ? Math.min(y / max, 1) : 0;
        if (progressRef.current) progressRef.current.style.transform = `scaleX(${p})`;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    onScroll();
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  useEffect(() => {
    setSheetAvatar(user?.avatar_url ?? null);
  }, [user?.avatar_url, user?.id]);

  const onSheetAvatarError = () => {
    const fallback = user ? defaultDiscordAvatar(user.id) : null;
    if (fallback && sheetAvatar !== fallback) setSheetAvatar(fallback);
  };

  useEffect(() => {
    if (!sheetOpen) return;
    const onPointerDown = (event: PointerEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(event.target as Node)) setSheetOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSheetOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [sheetOpen]);

  return (
    <header className={`site-nav${scrolled ? " is-scrolled" : ""}`} ref={wrapRef}>
      <div className="site-nav-bar">
        <a className="site-nav-brand" href="/" aria-label="Mocha — home">
          <span className="site-nav-sticker">
            <img src={mochaPaperclip} alt="" />
          </span>
          <span className="site-nav-wordmark">mocha</span>
          <span className="site-nav-context" aria-hidden="true">
            <i>/</i>
            {routeContext(path)}
          </span>
        </a>

        <nav className="site-nav-links" aria-label="Standalone pages">
          {STANDALONE_NAV.map((route) => {
            const active = isRouteActive(route, path);
            return (
              <a
                key={route.href}
                className={`site-nav-link${active ? " is-active" : ""}`}
                href={route.href}
                aria-current={active ? "page" : undefined}
              >
                <span className="site-nav-link-label">{route.label}</span>
                <span className="site-nav-link-rule" aria-hidden="true" />
              </a>
            );
          })}
        </nav>

        <div className="site-nav-right">
          <a
            className="site-nav-invite"
            href={DISCORD_INVITE_URL}
            target="_blank"
            rel="noreferrer"
            aria-label="Invite Mocha to your server"
          >
            <Icon name="discord" filled />
            <span>Invite</span>
          </a>

          <ProfileMenu rich links={ACCOUNT_LINKS_WITH_INVITE} />

          <button
            type="button"
            className={`site-nav-burger${sheetOpen ? " is-open" : ""}`}
            onClick={() => setSheetOpen((open) => !open)}
            aria-expanded={sheetOpen}
            aria-controls="site-nav-sheet"
            aria-label={sheetOpen ? "Close menu" : "Open menu"}
          >
            <span aria-hidden="true">
              <i />
              <i />
              <i />
            </span>
          </button>
        </div>

        <span className="site-nav-progress" aria-hidden="true">
          <i ref={progressRef} />
        </span>
      </div>

      <div className={`site-nav-sheet${sheetOpen ? " is-open" : ""}`} id="site-nav-sheet">
        <div className="site-nav-sheet-links">
          <a className="site-nav-sheet-link" href="/" onClick={() => setSheetOpen(false)}>
            <span className="site-nav-sheet-index">00</span>
            Home
            <Icon name="arrow-up-right" />
          </a>
          {STANDALONE_NAV.map((route, index) => {
            const active = isRouteActive(route, path);
            return (
              <a
                key={route.href}
                className={`site-nav-sheet-link${active ? " is-active" : ""}`}
                href={route.href}
                onClick={() => setSheetOpen(false)}
                aria-current={active ? "page" : undefined}
              >
                <span className="site-nav-sheet-index">{String(index + 1).padStart(2, "0")}</span>
                {route.label}
                <Icon name="arrow-up-right" />
              </a>
            );
          })}
        </div>
        <div className="site-nav-sheet-foot">
          {user ? (
            <div className="site-nav-sheet-account">
              <img
                className="site-nav-sheet-avatar"
                src={sheetAvatar ?? user.avatar_url}
                alt=""
                onError={onSheetAvatarError}
              />
              <div>
                <span className="site-nav-sheet-name">{displayName}</span>
                <span className="site-nav-sheet-handle">@{user.username}</span>
              </div>
              <button
                type="button"
                className="site-nav-sheet-logout"
                onClick={() => {
                  setSheetOpen(false);
                  void logout();
                }}
              >
                <Icon name="logout" />
                Log out
              </button>
            </div>
          ) : (
            <a className="site-nav-sheet-login" href="/auth/discord/login" onClick={() => setSheetOpen(false)}>
              <Icon name="user" />
              Login with Discord
            </a>
          )}
          <a className="site-nav-sheet-invite" href={DISCORD_INVITE_URL} target="_blank" rel="noreferrer" onClick={() => setSheetOpen(false)}>
            <Icon name="discord" filled />
            Add Mocha to a server
          </a>
        </div>
      </div>
    </header>
  );
}

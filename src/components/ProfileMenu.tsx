import { useEffect, useRef, useState } from "react";
import { defaultDiscordAvatar, useMochaSession } from "../lib/session";
import { DISCORD_INVITE_URL, DISCORD_URL } from "../lib/site";
import { mochaFace } from "../assets/mochaAssets";
import { Icon } from "./ui/Icon";

/**
 * Account area of the navigation: either the Discord login pill or the signed-in
 * user's avatar + dropdown.
 *
 * Extracted from the homepage `Nav.tsx` so the standalone pages render the exact
 * same account treatment (same class names, same markup, same behaviour) instead
 * of a second, divergent implementation. Session data always comes from
 * `/auth/session` via `useMochaSession` — nothing is hardcoded or faked.
 */

type MenuLink = {
  href: string;
  label: string;
  icon: "grid" | "settings" | "discord" | "lifebuoy";
  external?: boolean;
};

const DEFAULT_LINKS: MenuLink[] = [
  { href: "/servers", label: "My servers", icon: "grid" },
  { href: "/settings", label: "Settings", icon: "settings" },
];

export const ACCOUNT_LINKS_WITH_INVITE: MenuLink[] = [
  { href: "/servers", label: "My servers", icon: "grid" },
  { href: DISCORD_INVITE_URL, label: "Invite Mocha", icon: "discord", external: true },
  { href: DISCORD_URL, label: "Support server", icon: "lifebuoy", external: true },
];

export default function ProfileMenu({
  links = DEFAULT_LINKS,
  rich = false,
}: {
  links?: MenuLink[];
  /**
   * `rich` adds the account header + caret used by the standalone page nav.
   * The homepage nav keeps its original, leaner markup (rich = false) so its
   * locked design is untouched.
   */
  rich?: boolean;
}) {
  const { user, status, displayName, logout } = useMochaSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const [avatarSrc, setAvatarSrc] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  /* keep the <img> source in sync with the session, with a two-step fallback:
     stale avatar hash -> Discord's default avatar -> the Mocha mark. */
  useEffect(() => {
    setAvatarSrc(user?.avatar_url ?? null);
  }, [user?.avatar_url, user?.id]);

  const onAvatarError = () => {
    const fallback = user ? defaultDiscordAvatar(user.id) : null;
    if (fallback && avatarSrc !== fallback) {
      setAvatarSrc(fallback);
      return;
    }
    setAvatarSrc(mochaFace);
  };

  useEffect(() => {
    if (!menuOpen) return;
    const onPointerDown = (event: PointerEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) setMenuOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [menuOpen]);

  const handleLogout = async () => {
    setMenuOpen(false);
    await logout();
  };

  /* Session still being read: hold the same footprint as the login pill so the
     nav never flashes "Login" for an already signed-in visitor. */
  if (!user && status === "loading") {
    return (
      <span className="login-link login-link--skeleton" aria-hidden="true">
        <span className="skeleton-bar" />
      </span>
    );
  }

  if (!user) {
    return (
      <a className="login-link" href="/auth/discord/login" aria-label="Login with Discord">
        <span className="login-text">Login</span>
        <svg className="login-arrow" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M7 17 17 7M9 7h8v8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </a>
    );
  }

  return (
    <div className="profile-menu" ref={menuRef}>
      <button
        type="button"
        className={`profile-trigger${menuOpen ? " is-open" : ""}`}
        onClick={() => setMenuOpen((open) => !open)}
        aria-haspopup="true"
        aria-expanded={menuOpen}
        aria-label={`Account menu for ${displayName}`}
      >
        <img className="profile-avatar" src={avatarSrc ?? user.avatar_url} alt="" onError={onAvatarError} />
        <span className="profile-name">{displayName}</span>
        {rich ? <Icon name="chevron-down" className="profile-caret" /> : null}
      </button>

      <div className={`profile-dropdown${menuOpen ? " is-open" : ""}${rich ? " profile-dropdown--rich" : ""}`} role="menu">
        {rich ? (
          <>
            <div className="profile-dropdown-head">
              <img className="profile-dropdown-avatar" src={avatarSrc ?? user.avatar_url} alt="" onError={onAvatarError} />
              <div className="profile-dropdown-id">
                <span className="profile-dropdown-name">{displayName}</span>
                <span className="profile-dropdown-handle">@{user.username}</span>
              </div>
            </div>
            <span className="profile-dropdown-divider" aria-hidden="true" />
          </>
        ) : null}

        {links.map((link) => (
          <a
            key={link.label}
            className="profile-dropdown-item"
            href={link.href}
            role="menuitem"
            onClick={() => setMenuOpen(false)}
            {...(link.external ? { target: "_blank", rel: "noreferrer" } : {})}
          >
            <Icon name={link.icon} />
            <span className="profile-dropdown-label">{link.label}</span>
            {link.external ? <Icon name="arrow-up-right" className="profile-dropdown-ext" /> : null}
          </a>
        ))}

        <span className="profile-dropdown-divider" aria-hidden="true" />
        <button type="button" className="profile-dropdown-item profile-dropdown-logout" role="menuitem" onClick={handleLogout}>
          <Icon name="logout" />
          Log out
        </button>
      </div>
    </div>
  );
}

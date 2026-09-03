import { useEffect, useRef, useState } from "react";
import { mochaPaperclip } from "../assets/mochaAssets";

const LINKS = [
  {
    id: "documentation",
    label: "Documentation",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M6 4.75A2.75 2.75 0 0 1 8.75 2H20v17.25A2.75 2.75 0 0 0 17.25 16.5H6A2.75 2.75 0 0 0 3.25 19.25V5.5A.75.75 0 0 1 4 4.75H6Z" stroke="currentColor" strokeWidth="1.6" />
        <path d="M6 4.75v11.75" stroke="currentColor" strokeWidth="1.6" />
      </svg>
    ),
  },
  {
    id: "commands",
    label: "Commands",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="m8 8-4 4 4 4M16 8l4 4-4 4M14 5l-4 14" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    id: "premium",
    label: "Premium",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="m12 3 2.2 4.46 4.92.72-3.56 3.47.84 4.9L12 14.26l-4.4 2.3.84-4.9-3.56-3.47 4.92-.72L12 3Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    id: "about",
    label: "About us",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="12" cy="12" r="8.75" stroke="currentColor" strokeWidth="1.6" />
        <path d="M12 10.5v5M12 7.5h.01" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    ),
  },
];

type MochaUser = {
  username: string;
  avatar_url: string;
  global_name?: string | null;
};

export default function Nav() {
  const [compact, setCompact] = useState(false);
  const [active, setActive] = useState("");
  const [user, setUser] = useState<MochaUser | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const lineRef = useRef<HTMLElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const y = window.scrollY || 0;
        setCompact(y > 80);
        const max = document.documentElement.scrollHeight - window.innerHeight;
        const p = max > 0 ? Math.min(y / max, 1) : 0;
        if (lineRef.current) lineRef.current.style.transform = `scaleX(${p})`;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  useEffect(() => {
    const sections = LINKS.map((l) => document.getElementById(l.id)).filter(
      (el): el is HTMLElement => Boolean(el)
    );
    if (!sections.length || !("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.id);
        });
      },
      { rootMargin: "-42% 0px -52% 0px" }
    );
    sections.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    fetch("/auth/session", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => setUser(d.authenticated ? d.user : null))
      .catch(() => setUser(null));
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const onPointerDown = (e: PointerEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
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
    try {
      await fetch("/auth/logout", { method: "POST", credentials: "include" });
    } catch {
      // best-effort -- clear local state regardless
    }
    setUser(null);
  };

  const displayName = user?.global_name || user?.username || "";

  return (
    <nav className={`mocha-nav${compact ? " compact" : ""}`} id="mochaNav" aria-label="Primary navigation">
      <a className="mocha-brand" href="#top" aria-label="Mocha home">
        <img className="nav-sticker" src={mochaPaperclip} alt="" />
        <span className="mocha-brand-text">mocha</span>
      </a>
      <div className="mocha-links">
        {LINKS.map((l) => (
          <a key={l.id} className={`mocha-link${active === l.id ? " is-active" : ""}`} href={`#${l.id}`} aria-label={l.label}>
            {l.icon}
            <span>{l.label}</span>
          </a>
        ))}
      </div>
      <div className="mocha-nav-right">
        {user ? (
          <div className="profile-menu" ref={menuRef}>
            <button
              type="button"
              className={`profile-trigger${menuOpen ? " is-open" : ""}`}
              onClick={() => setMenuOpen((v) => !v)}
              aria-haspopup="true"
              aria-expanded={menuOpen}
              aria-label={`Account menu for ${displayName}`}
            >
              <img className="profile-avatar" src={user.avatar_url} alt="" />
              <span className="profile-name">{displayName}</span>
            </button>
            <div className={`profile-dropdown${menuOpen ? " is-open" : ""}`} role="menu">
              <a className="profile-dropdown-item" href="/servers" role="menuitem" onClick={() => setMenuOpen(false)}>
                <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <rect x="3.25" y="3.25" width="7.5" height="7.5" rx="1.6" stroke="currentColor" strokeWidth="1.6" />
                  <rect x="13.25" y="3.25" width="7.5" height="7.5" rx="1.6" stroke="currentColor" strokeWidth="1.6" />
                  <rect x="3.25" y="13.25" width="7.5" height="7.5" rx="1.6" stroke="currentColor" strokeWidth="1.6" />
                  <rect x="13.25" y="13.25" width="7.5" height="7.5" rx="1.6" stroke="currentColor" strokeWidth="1.6" />
                </svg>
                My servers
              </a>
              <a className="profile-dropdown-item" href="/settings" role="menuitem" onClick={() => setMenuOpen(false)}>
                <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <circle cx="12" cy="12" r="2.9" stroke="currentColor" strokeWidth="1.6" />
                  <path d="M19.4 13.6a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V19.6a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1.08-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H4.4a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1.08 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H10.4a1.65 1.65 0 0 0 1-1.51V4.4a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V10.4a1.65 1.65 0 0 0 1.51 1h.09a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
                </svg>
                Settings
              </a>
              <span className="profile-dropdown-divider" aria-hidden="true" />
              <button
                type="button"
                className="profile-dropdown-item profile-dropdown-logout"
                role="menuitem"
                onClick={handleLogout}
              >
                <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M9 4.5H6.75A2.25 2.25 0 0 0 4.5 6.75v10.5A2.25 2.25 0 0 0 6.75 19.5H9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M15.5 15.5 20 12l-4.5-3.5M20 12H9.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Log out
              </button>
            </div>
          </div>
        ) : (
          <a className="login-link" href="/auth/discord/login" aria-label="Login with Discord">
            <span className="login-text">Login</span>
            <svg className="login-arrow" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M7 17 17 7M9 7h8v8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
        )}
        <a className="discord-link" href="https://discord.com/oauth2/authorize?client_id=1544448518310199427&permissions=8&integration_type=0&scope=bot" target="_blank" rel="noreferrer" aria-label="Invite Mocha to Discord">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M19.54 5.33A16.9 16.9 0 0 0 15.43 4l-.5 1.03a14.2 14.2 0 0 0-5.86 0L8.57 4a16.8 16.8 0 0 0-4.1 1.33C1.88 9.36 1.17 13.3 1.52 17.19a16.98 16.98 0 0 0 5.05 2.58l1.09-1.48c-.6-.22-1.17-.49-1.71-.8l.41-.31c3.29 1.55 7.06 1.55 10.31 0l.42.31c-.54.31-1.11.58-1.71.8l1.09 1.48a16.9 16.9 0 0 0 5.05-2.58c.41-4.51-.69-8.41-2.98-11.86ZM8.5 15.56c-.98 0-1.79-.89-1.79-1.98s.79-1.98 1.79-1.98 1.8.89 1.79 1.98c0 1.09-.79 1.98-1.79 1.98Zm7 0c-.98 0-1.79-.89-1.79-1.98s.79-1.98 1.79-1.98 1.8.89 1.79 1.98c0 1.09-.79 1.98-1.79 1.98Z" />
          </svg>
        </a>
      </div>
      <span className="nav-scrollline" aria-hidden="true">
        <i ref={lineRef as React.RefObject<HTMLElement>} />
      </span>
    </nav>
  );
}

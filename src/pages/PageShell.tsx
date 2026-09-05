import { useEffect, useRef, useState, type ReactNode } from "react";
import { Footer } from "../components/Tail";
import SiteNav from "../components/SiteNav";
import { mochaFace, mochaGlobe, mochaPaperclip } from "../assets/mochaAssets";
import { useRevealObserver } from "../lib/hooks";
import { Icon } from "../components/ui/Icon";
import { DISCORD_INVITE_URL, DISCORD_URL } from "../lib/site";

export { DISCORD_URL, DISCORD_INVITE_URL };

export type PageTone = "default" | "premium" | "commands" | "docs" | "legal" | "help";
export type PageSticker = "face" | "globe" | "paperclip" | "none";

const STICKERS: Record<Exclude<PageSticker, "none">, string> = {
  face: mochaFace,
  globe: mochaGlobe,
  paperclip: mochaPaperclip,
};

export type Crumb = { href?: string; label: string };

type PageShellProps = {
  eyebrow: string;
  title: ReactNode;
  intro?: ReactNode;
  /** Oversized word printed behind the header, like the homepage ghost type. */
  ghost?: string;
  /** Small mono facts rendered under the intro (counts, status, updated…). */
  meta?: ReactNode[];
  actions?: ReactNode;
  crumbs?: Crumb[];
  tone?: PageTone;
  sticker?: PageSticker;
  /** Vertical rail label shown on wide screens. */
  rail?: string;
  wide?: boolean;
  children: ReactNode;
};

/**
 * Shell shared by every standalone page: nav, layered background, page header,
 * content column and the site footer.
 *
 * It also installs the reveal observer (the homepage used to be the only place
 * that did, so `[data-reveal]` elements on subpages never animated in).
 */
export function PageShell({
  eyebrow,
  title,
  intro,
  ghost,
  meta,
  actions,
  crumbs,
  tone = "default",
  sticker = "face",
  rail,
  wide = false,
  children,
}: PageShellProps) {
  useRevealObserver(true);

  return (
    <div className={`page-root page-root--${tone}`}>
      <div className="page-aura" aria-hidden="true">
        <span className="page-aura-grid" />
        <span className="page-aura-glow page-aura-glow--a" />
        <span className="page-aura-glow page-aura-glow--b" />
        <span className="page-aura-noise" />
      </div>
      <div className="scanlines" aria-hidden="true" />

      {rail ? (
        <div className="page-rail" aria-hidden="true">
          <span className="chevron-label">
            {rail.split("").map((char, index) => (
              <span key={`${char}-${index}`}>
                <b>{char}</b>
                {index < rail.length - 1 ? <i>&gt;</i> : null}
              </span>
            ))}
          </span>
        </div>
      ) : null}

      <SiteNav />

      <main className={`site-page${wide ? " site-page--wide" : ""}`} id="top">
        <header className="page-header">
          {ghost ? (
            <div className="page-header-ghost" aria-hidden="true">
              {ghost}
            </div>
          ) : null}

          {sticker !== "none" ? (
            <div className="page-header-sticker" aria-hidden="true">
              <span className="page-header-tape" />
              <img src={STICKERS[sticker]} alt="" />
            </div>
          ) : null}

          {crumbs && crumbs.length ? (
            <nav className="page-crumbs" aria-label="Breadcrumb">
              {crumbs.map((crumb, index) => (
                <span className="page-crumb" key={crumb.label}>
                  {index > 0 ? <i aria-hidden="true">/</i> : null}
                  {crumb.href ? <a href={crumb.href}>{crumb.label}</a> : <b aria-current="page">{crumb.label}</b>}
                </span>
              ))}
            </nav>
          ) : null}

          <div className="section-eyebrow" data-reveal>
            {eyebrow}
          </div>

          <h1 className="page-title">
            <span className="line-mask">
              <span>{title}</span>
            </span>
          </h1>

          {intro ? (
            <p className="page-intro" data-reveal style={{ "--rd": ".14s" } as React.CSSProperties}>
              {intro}
            </p>
          ) : null}

          {meta && meta.length ? (
            <div className="page-meta" data-reveal style={{ "--rd": ".2s" } as React.CSSProperties}>
              {meta.map((item, index) => (
                <span className="page-meta-item" key={index}>
                  {item}
                </span>
              ))}
            </div>
          ) : null}

          {actions ? (
            <div className="page-actions" data-reveal style={{ "--rd": ".26s" } as React.CSSProperties}>
              {actions}
            </div>
          ) : null}
        </header>

        <div className="page-body">{children}</div>
      </main>

      <Footer />
      <BackToTop />
    </div>
  );
}

/** Floating "back to the top" control, revealed once the page has been scrolled. */
export function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => setVisible((window.scrollY || 0) > 640));
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <a className={`page-totop${visible ? " is-visible" : ""}`} href="#top" aria-label="Back to top" tabIndex={visible ? 0 : -1}>
      <Icon name="arrow-right" />
      <span>top</span>
    </a>
  );
}

/**
 * Section wrapper with the rhythm used across the subpages: generous vertical
 * space, a hairline rule, and an optional sticky heading column.
 */
export function PageSection({
  id,
  eyebrow,
  title,
  lead,
  aside,
  children,
  className = "",
  bare = false,
}: {
  id?: string;
  eyebrow?: ReactNode;
  title?: ReactNode;
  lead?: ReactNode;
  aside?: ReactNode;
  children: ReactNode;
  className?: string;
  bare?: boolean;
}) {
  return (
    <section className={`sp-section ${className}`.trim()} id={id}>
      {title || eyebrow || lead ? (
        <div className={`sp-head${aside ? " sp-head--split" : ""}`}>
          <div>
            {eyebrow ? (
              <div className="section-eyebrow" data-reveal>
                {eyebrow}
              </div>
            ) : null}
            {title ? (
              <h2 className="sp-title" data-reveal>
                {title}
              </h2>
            ) : null}
            {lead ? (
              <p className="sp-lead" data-reveal style={{ "--rd": ".08s" } as React.CSSProperties}>
                {lead}
              </p>
            ) : null}
          </div>
          {aside ? (
            <div className="sp-head-aside" data-reveal style={{ "--rd": ".12s" } as React.CSSProperties}>
              {aside}
            </div>
          ) : null}
        </div>
      ) : null}
      <div className={bare ? undefined : "sp-section-body"}>{children}</div>
    </section>
  );
}

/** Small helper for pages that want a scroll-driven parallax offset. */
export function useParallax<T extends HTMLElement = HTMLDivElement>(strength = 0.08) {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let frame = 0;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const rect = el.getBoundingClientRect();
        const center = rect.top + rect.height / 2 - window.innerHeight / 2;
        el.style.setProperty("--parallax", `${(-center * strength).toFixed(1)}px`);
      });
    };
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    update();
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
      cancelAnimationFrame(frame);
    };
  }, [strength]);

  return ref;
}

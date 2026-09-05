import { useRef, type ReactNode } from "react";
import { PageShell } from "../PageShell";
import { Icon } from "../../components/ui/Icon";
import { ArrowLink } from "../../components/ui/primitives";
import { useArticleHeadings } from "../../lib/headings";
import { DISCORD_URL, currentPath } from "../../lib/site";

/**
 * Shared shell for /terms, /privacy and /refunds.
 *
 * Legal pages are mostly text, so the polish here is structural: a sticky
 * contents column with scroll tracking, numbered sections, a consistent
 * reading width, and an honest, deliberately styled block for anything that
 * has not been written yet — no invented policy.
 */

const LEGAL_PAGES = [
  { href: "/terms", label: "Terms of Service", index: "01" },
  { href: "/privacy", label: "Privacy Policy", index: "02" },
  { href: "/refunds", label: "Refunds", index: "03" },
];

export function Pending({ children, label = "to be finalised" }: { children: ReactNode; label?: string }) {
  return (
    <div className="legal-pending">
      <span className="legal-pending-flag">
        <Icon name="clock" />
        {label}
      </span>
      <div className="legal-pending-body">{children}</div>
    </div>
  );
}

export function LegalSummary({ title = "At a glance", items }: { title?: string; items: ReactNode[] }) {
  return (
    <div className="legal-summary">
      <div className="legal-summary-title">
        <Icon name="list" />
        {title}
      </div>
      <ul>
        {items.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

export function LegalLayout({
  eyebrow,
  title,
  intro,
  meta,
  children,
  ghost,
}: {
  eyebrow: string;
  title: string;
  intro: ReactNode;
  meta?: ReactNode[];
  children: ReactNode;
  ghost: string;
}) {
  const path = currentPath();
  const articleRef = useRef<HTMLDivElement | null>(null);
  const { headings, activeId } = useArticleHeadings(articleRef);

  return (
    <PageShell
      tone="legal"
      eyebrow={eyebrow}
      title={title}
      intro={intro}
      ghost={ghost}
      sticker="none"
      rail="LEGAL"
      crumbs={[{ href: "/", label: "Home" }, { label: "Legal" }, { label: title }]}
      meta={meta}
      actions={<ArrowLink href={DISCORD_URL} external>questions? ask in the support server</ArrowLink>}
    >
      <div className="legal-shell">
        <aside className="docs-side legal-side" aria-label="Legal navigation">
          <div className="docs-side-group">
            <div className="docs-side-label">Legal</div>
            <nav className="docs-side-links">
              {LEGAL_PAGES.map((page) => {
                const active = page.href === path;
                return (
                  <a
                    key={page.href}
                    className={`docs-side-link${active ? " is-active" : ""}`}
                    href={page.href}
                    aria-current={active ? "page" : undefined}
                  >
                    {page.label}
                    <em>{page.index}</em>
                  </a>
                );
              })}
            </nav>
          </div>

          {headings.length > 1 ? (
            <div className="docs-side-group">
              <div className="docs-side-label">On this page</div>
              <nav className="docs-toc-list legal-contents">
                {headings.map((heading) => (
                  <a
                    key={heading.id}
                    className={`docs-toc-link${activeId === heading.id ? " is-active" : ""}`}
                    href={`#${heading.id}`}
                  >
                    <span className="docs-toc-num">{String(heading.num).padStart(2, "0")}</span>
                    {heading.text}
                  </a>
                ))}
              </nav>
            </div>
          ) : null}

          <div className="docs-side-card">
            <h4>Something unclear?</h4>
            <p>Ask in the official Mocha server — a real person reads it, and answers end up reflected on these pages.</p>
            <ArrowLink href="/help">support</ArrowLink>
          </div>
        </aside>

        <article className="legal-article prose" ref={articleRef}>
          {children}

          <div className="legal-contact">
            <div>
              <span className="panel-kicker">Contact</span>
              <h3>Reach Mocha</h3>
              <p>
                Every question about these pages — including requests about your data or a purchase — goes to the
                official Mocha server.
              </p>
            </div>
            <div className="legal-contact-actions">
              <a className="prm-cta-btn prm-cta-btn--ghost" href={DISCORD_URL} target="_blank" rel="noreferrer">
                <Icon name="discord" filled />
                Support server
              </a>
              <a className="arrow-link" href="/help">
                help page
                <Icon name="arrow-up-right" />
              </a>
            </div>
          </div>
        </article>
      </div>
    </PageShell>
  );
}

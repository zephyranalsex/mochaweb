import { useRef, type ReactNode } from "react";
import { PageShell } from "../PageShell";
import { Icon } from "../../components/ui/Icon";
import { ArrowLink, Reveal } from "../../components/ui/primitives";
import { DISCORD_URL, DOCS_NAV, currentPath } from "../../lib/site";
import { CATEGORIES, DISCORD_COMMANDS } from "../../data/commands";
import { useArticleHeadings } from "../../lib/headings";

/* =======================================================================
   Shared documentation shell: sidebar + article + "on this page" rail.
   ======================================================================= */

export type PagerEntry = { href: string; label: string; title: string };

export function DocsLayout({
  eyebrow,
  title,
  intro,
  meta,
  actions,
  children,
  prev,
  next,
  ghost = "DOCS",
  sticker = "paperclip",
}: {
  eyebrow: string;
  title: ReactNode;
  intro: ReactNode;
  meta?: ReactNode[];
  actions?: ReactNode;
  children: ReactNode;
  prev?: PagerEntry;
  next?: PagerEntry;
  ghost?: string;
  sticker?: "face" | "globe" | "paperclip" | "none";
}) {
  const path = currentPath();
  const articleRef = useRef<HTMLDivElement | null>(null);
  /* The "on this page" rail is generated from the article's own headings. */
  const { headings, activeId } = useArticleHeadings(articleRef);

  const groups = DOCS_NAV.reduce<{ group: string; items: typeof DOCS_NAV }[]>((acc, entry) => {
    const existing = acc.find((bucket) => bucket.group === entry.group);
    if (existing) existing.items.push(entry);
    else acc.push({ group: entry.group, items: [entry] });
    return acc;
  }, []);

  return (
    <PageShell
      tone="docs"
      eyebrow={eyebrow}
      title={title}
      intro={intro}
      ghost={ghost}
      sticker={sticker}
      rail="DOCUMENTATION"
      crumbs={[{ href: "/", label: "Home" }, { href: "/docs", label: "Docs" }, ...(path === "/docs" ? [] : [{ label: typeof title === "string" ? title : "Article" }])]}
      meta={meta}
      actions={actions}
    >
      <div className="docs-shell">
        <aside className="docs-side" aria-label="Documentation navigation">
          {groups.map((bucket, index) => (
            <div className="docs-side-group" key={bucket.group}>
              <div className="docs-side-label">
                {bucket.group}
              </div>
              <nav className="docs-side-links">
                {bucket.items.map((item, itemIndex) => {
                  const active = item.href === path;
                  return (
                    <a
                      key={item.href}
                      className={`docs-side-link${active ? " is-active" : ""}`}
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                    >
                      {item.label}
                      <em>{String(index * 10 + itemIndex + 1).padStart(2, "0")}</em>
                    </a>
                  );
                })}
              </nav>
            </div>
          ))}

          <div className="docs-side-group">
            <div className="docs-side-label">Elsewhere</div>
            <nav className="docs-side-links">
              <a className="docs-side-link" href="/commands">
                Command index
                <em>{DISCORD_COMMANDS.length}</em>
              </a>
              <a className="docs-side-link" href="/premium">
                Premium
              </a>
              <a className="docs-side-link" href={DISCORD_URL} target="_blank" rel="noreferrer">
                Support server
              </a>
            </nav>
          </div>

          <div className="docs-side-card">
            <h4>Something broken?</h4>
            <p>Bring logs, screenshots and the command you ran to the support server — that is the fastest route to a fix.</p>
            <ArrowLink href="/help">get help</ArrowLink>
          </div>
        </aside>

        <article className="docs-article prose" ref={articleRef}>
          {children}

          <nav className="docs-pager" aria-label="Documentation pager">
            {prev ? (
              <a className="pager-link pager-link--prev" href={prev.href}>
                <span className="pager-label">
                  <Icon name="arrow-left" />
                  {prev.label}
                </span>
                <span className="pager-title">{prev.title}</span>
              </a>
            ) : (
              <span className="pager-link pager-link--empty" aria-hidden="true" />
            )}
            {next ? (
              <a className="pager-link pager-link--next" href={next.href}>
                <span className="pager-label">
                  {next.label}
                  <Icon name="arrow-right" />
                </span>
                <span className="pager-title">{next.title}</span>
              </a>
            ) : (
              <span className="pager-link pager-link--empty" aria-hidden="true" />
            )}
          </nav>
        </article>

        {headings.length > 1 ? (
          <aside className="docs-toc" aria-label="On this page">
            <div className="docs-side-label">On this page</div>
            <nav className="docs-toc-list">
              {headings.map((heading) => (
                <a
                  key={heading.id}
                  className={`docs-toc-link docs-toc-link--h${heading.level}${activeId === heading.id ? " is-active" : ""}`}
                  href={`#${heading.id}`}
                >
                  {heading.level === 2 ? <span className="docs-toc-num">{String(heading.num).padStart(2, "0")}</span> : null}
                  {heading.text}
                </a>
              ))}
            </nav>
          </aside>
        ) : null}
      </div>
    </PageShell>
  );
}

/* =======================================================================
   /docs — documentation index
   ======================================================================= */

const DOC_CARDS = [
  {
    href: "/docs/getting-started",
    index: "01",
    title: "Getting started",
    description:
      "Add Mocha to a server, run your first command, point calls at the right channel, and make the prefix yours.",
    pills: ["invite", "first command", "call channel", "prefix"],
  },
  {
    href: "/docs/moderation",
    index: "02",
    title: "Moderation",
    description:
      "How bans, kicks, timeouts, channel locks, roles and the audit lookup fit together — and what to write in a reason.",
    pills: ["ban / kick", "timeouts", "locks", "roles", "audit"],
  },
  {
    href: "/docs/commands-reference",
    index: "03",
    title: "Using commands",
    description:
      "The guide to how Mocha commands actually work: slash versus text, syntax notation, arguments, subcommands and the patterns worth memorising.",
    pills: ["syntax", "arguments", "subcommands", "patterns"],
  },
];

const TASKS = [
  { label: "Connect two servers in one call", href: "/docs/getting-started#calls", icon: "signal" as const },
  { label: "Play music in a voice channel", href: "/commands?c=music", icon: "music" as const },
  { label: "Timeout someone for 10 minutes", href: "/commands?cmd=mute", icon: "shield" as const },
  { label: "Run a giveaway with entry rules", href: "/commands?cmd=giveaway", icon: "gift" as const },
  { label: "Change the command prefix", href: "/commands?cmd=set-prefix", icon: "hash" as const },
  { label: "Keep a message as a quote card", href: "/commands?c=quotes", icon: "quote" as const },
  { label: "Start a game and check the stats", href: "/commands?c=games", icon: "gamepad" as const },
  { label: "Look up a Valorant account", href: "/commands?cmd=valinfo", icon: "target" as const },
];

export function DocsPage() {
  return (
    <PageShell
      tone="docs"
      eyebrow="Documentation / index"
      title={
        <>
          Read the
          <br />
          <span className="page-title-accent">docs.</span>
        </>
      }
      intro="Three short guides cover the whole bot: getting Mocha into your server, keeping that server tidy, and understanding how its commands are put together. Everything else lives in the command index."
      ghost="DOCS"
      sticker="paperclip"
      rail="DOCUMENTATION"
      crumbs={[{ href: "/", label: "Home" }, { label: "Docs" }]}
      meta={[
        <>
          <b>3</b> guides
        </>,
        <>
          <b>{DISCORD_COMMANDS.length}</b> discord commands
        </>,
        <>
          <b>{CATEGORIES.length}</b> categories
        </>,
      ]}
      actions={
        <>
          <ArrowLink href="/docs/getting-started">start at the beginning</ArrowLink>
          <ArrowLink href="/commands">open the command index</ArrowLink>
        </>
      }
    >
      <div className="docs-index">
        {DOC_CARDS.map((card, index) => (
          <Reveal key={card.href} delay={index * 0.07}>
            <a className="docs-index-card" href={card.href}>
              <span className="docs-index-num">{card.index}</span>
              <div className="docs-index-body">
                <h3>{card.title}</h3>
                <p>{card.description}</p>
                <div className="docs-index-meta">
                  {card.pills.map((pill) => (
                    <span className="pill pill--outline" key={pill}>
                      {pill}
                    </span>
                  ))}
                </div>
              </div>
              <span className="docs-index-arrow" aria-hidden="true">
                <Icon name="arrow-up-right" />
              </span>
            </a>
          </Reveal>
        ))}
      </div>

      <div className="sp-section" style={{ marginTop: "clamp(56px, 6vw, 88px)" }}>
        <div className="sp-head sp-head--split">
          <div>
            <div className="section-eyebrow" data-reveal>
              Shortcut / by task
            </div>
            <h2 className="sp-title" data-reveal>
              What are you trying to do?
            </h2>
          </div>
          <div className="sp-head-aside" data-reveal>
            <ArrowLink href="/commands">full index</ArrowLink>
          </div>
        </div>

        <div className="card-grid card-grid--2">
          {TASKS.map((task, index) => (
            <Reveal key={task.href} delay={Math.min(index, 6) * 0.05}>
              <a className="task-card" href={task.href}>
                <span className="task-card-icon">
                  <Icon name={task.icon} />
                </span>
                <span className="task-card-label">{task.label}</span>
                <Icon name="arrow-up-right" className="task-card-arrow" />
              </a>
            </Reveal>
          ))}
        </div>
      </div>

      <Reveal className="docs-cta" delay={0.05}>
        <div>
          <span className="panel-kicker">Still stuck?</span>
          <h3 className="panel-title">The support server is where Mocha actually lives.</h3>
          <p className="panel-copy">
            Bug reports, setup questions and feature requests all land in the official Discord — the same place the
            people who write the bot read.
          </p>
        </div>
        <div className="docs-cta-actions">
          <ArrowLink href={DISCORD_URL} external>
            join the server
          </ArrowLink>
          <ArrowLink href="/help">help page</ArrowLink>
        </div>
      </Reveal>
    </PageShell>
  );
}

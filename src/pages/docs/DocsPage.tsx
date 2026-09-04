import type { ReactNode } from "react";
import { PageShell } from "../PageShell";

export function DocsCard({ href, index, title, description }: { href: string; index: string; title: string; description: string }) {
  return (
    <a className="docs-card" href={href}>
      <span className="docs-card-index">{index}</span>
      <div><h2>{title}</h2><p>{description}</p></div>
      <span className="docs-card-arrow">↗</span>
    </a>
  );
}

export function DocsLayout({ eyebrow, title, intro, children }: { eyebrow: string; title: string; intro: string; children: ReactNode }) {
  return (
    <PageShell eyebrow={eyebrow} title={title} intro={intro}>
      <div className="docs-layout">
        <aside className="docs-sidebar">
          <div className="docs-sidebar-label">Documentation</div>
          <a href="/docs">Docs home</a>
          <a href="/docs/getting-started">Getting started</a>
          <a href="/docs/moderation">Moderation</a>
          <a href="/docs/commands-reference">Command reference</a>
        </aside>
        <article className="docs-article">{children}</article>
      </div>
    </PageShell>
  );
}

export function DocsPage() {
  return (
    <PageShell eyebrow="Documentation / index" title="Read the docs." intro="Everything you need to install Mocha, configure it, moderate a server, and look up commands.">
      <div className="docs-index-grid">
        <DocsCard href="/docs/getting-started" index="01" title="Getting started" description="Invite Mocha, understand the basics, and get your first command running." />
        <DocsCard href="/docs/moderation" index="02" title="Moderation" description="Learn the moderation commands and the actions they perform." />
        <DocsCard href="/docs/commands-reference" index="03" title="Command reference" description="Browse the command index in one dedicated reference page." />
      </div>
    </PageShell>
  );
}

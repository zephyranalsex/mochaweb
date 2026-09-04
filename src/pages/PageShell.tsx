import type { ReactNode } from "react";
import { Footer } from "../components/Tail";

export const DISCORD_URL = "https://discord.gg/HK4Cg3hw59";
const pageLinks = [
  { href: "/premium", label: "Premium" }, { href: "/commands", label: "Commands" },
  { href: "/help", label: "Get help" }, { href: "/docs", label: "Docs" },
];

export function PageShell({ eyebrow, title, intro, children }: { eyebrow: string; title: string; intro: string; children: ReactNode }) {
  return <>
    <div className="scanlines" aria-hidden="true" />
    <nav className="simple-page-nav">
      <a className="simple-page-brand" href="/"><span className="simple-page-mark">m</span>mocha</a>
      <div className="simple-page-links">{pageLinks.map((link) => <a key={link.href} href={link.href}>{link.label}</a>)}</div>
      <a className="simple-page-discord" href={DISCORD_URL} target="_blank" rel="noreferrer">Discord →</a>
    </nav>
    <main className="site-page"><header className="site-page-header"><div className="section-eyebrow">{eyebrow}</div><h1 className="site-page-title">{title}</h1><p className="site-page-intro">{intro}</p></header><div className="site-page-content">{children}</div></main>
    <Footer />
  </>;
}

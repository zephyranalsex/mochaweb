import type { ReactNode } from "react";
import { PageSection, PageShell } from "./PageShell";
import { Icon, type IconName } from "../components/ui/Icon";
import { ArrowLink, CopyButton, Reveal, StickerButton } from "../components/ui/primitives";
import { DISCORD_URL } from "../lib/site";

/* =======================================================================
   /help — support, routed properly: one Discord for people, docs for
   setup, the index for commands, and a kit for writing a good report.
   ======================================================================= */

type Route = { icon: IconName; question: string; answer: string; href: string; cta: string };

const ROUTES: Route[] = [
  {
    icon: "compass",
    question: "I just added Mocha and nothing happens",
    answer: "Start with the setup guide: invite, first command, call channel, prefix.",
    href: "/docs/getting-started",
    cta: "getting started",
  },
  {
    icon: "slash",
    question: "How do I write this command?",
    answer: "The guide explains syntax, arguments and groups; the index lists every command.",
    href: "/docs/commands-reference",
    cta: "using commands",
  },
  {
    icon: "grid",
    question: "Which command does X?",
    answer: "Search the full index — filter by category, form, or who it is for.",
    href: "/commands",
    cta: "command index",
  },
  {
    icon: "shield",
    question: "A moderation action did something I did not expect",
    answer: "Moderation commands follow Discord's own permissions; the guide walks through each one.",
    href: "/docs/moderation",
    cta: "moderation guide",
  },
  {
    icon: "sparkles",
    question: "What does Premium actually change?",
    answer: "Embeds, priority under load, higher rate limits and AI features — never commands.",
    href: "/premium",
    cta: "premium",
  },
  {
    icon: "clock",
    question: "A purchase, a refund or a cancellation",
    answer: "Plan prices and the current state of the refund policy are written down here.",
    href: "/refunds",
    cta: "refunds",
  },
  {
    icon: "lock",
    question: "What does Mocha store about me?",
    answer: "The privacy policy describes sign-in data, cookies, sessions and bot-side processing.",
    href: "/privacy",
    cta: "privacy policy",
  },
  {
    icon: "lifebuoy",
    question: "A bug, a crash, or an idea for Mocha",
    answer: "Bug reports, suggestions and product updates are handled by people, in Discord.",
    href: DISCORD_URL,
    cta: "support server",
  },
];

const QUICK_ANSWERS: { icon: IconName; q: string; a: ReactNode; href?: string; cta?: string }[] = [
  {
    icon: "alert",
    q: "Slash commands are missing from the picker",
    a: (
      <>
        Run <code>mocha sync</code> in the server. It re-syncs the command tree for that server, which is the fix when
        a slash command has not appeared yet.
      </>
    ),
    href: "/commands?cmd=sync",
    cta: "sync",
  },
  {
    icon: "hash",
    q: "Can we use our own prefix?",
    a: (
      <>
        Yes — <code>/set-prefix</code> sets a custom prefix for the server, and running it with nothing after it
        clears the custom prefix again. Slash commands are unaffected either way.
      </>
    ),
    href: "/commands?cmd=set-prefix",
    cta: "set-prefix",
  },
  {
    icon: "quote",
    q: "The quote card came out empty",
    a: (
      <>
        <code>mocha quote</code> builds the card from the message you are <strong>replying to</strong>. Reply first,
        then run it — it is a text command, so there is no slash form.
      </>
    ),
    href: "/commands?cmd=quote",
    cta: "quote",
  },
  {
    icon: "gamepad",
    q: "A game is stuck running",
    a: (
      <>
        <code>mocha stop</code> stops the running game. The same word in music stops playback and clears the queue —
        the index lists both.
      </>
    ),
    href: "/commands?cmd=stop-game",
    cta: "stop",
  },
];

const REPORT_TEMPLATE = `command:      /mute @user 10 reason
expected:     a 10 minute timeout, reason attached
happened:     <what Mocha actually did, or the error it replied with>
every time?:  yes / no / first time
server id:    <id>
notes:        <permissions of the member who ran it, anything else>`;

export function HelpPage() {
  return (
    <PageShell
      tone="help"
      eyebrow="Support / get help"
      title={
        <>
          Need a
          <br />
          <span className="page-title-accent">hand?</span>
        </>
      }
      intro="One place for people, three places for everything else. Bug reports, suggestions and product updates live in the official Mocha server; setup lives in the docs; every command lives in the index."
      ghost="HELP"
      sticker="face"
      rail="SUPPORT"
      crumbs={[{ href: "/", label: "Home" }, { label: "Help" }]}
      meta={[<>discord-first support</>, <>docs for setup</>, <>index for commands</>]}
      actions={
        <>
          <StickerButton href={DISCORD_URL} external>
            Join Discord &gt;
          </StickerButton>
          <ArrowLink href="/docs">read the docs</ArrowLink>
        </>
      }
    >
      <PageSection>
        <Reveal className="help-stage">
          <div className="help-stage-copy">
            <span className="panel-kicker">Official support</span>
            <h2>Come hang out where Mocha actually lives.</h2>
            <p>
              The support server is where troubleshooting, bug reports, suggestions and product updates happen — the
              same channel the people building Mocha read. Bring the command you ran and what it did.
            </p>
            <div className="help-stage-list">
              <span>
                <Icon name="check" /> troubleshooting
              </span>
              <span>
                <Icon name="check" /> bug reports
              </span>
              <span>
                <Icon name="check" /> suggestions
              </span>
              <span>
                <Icon name="check" /> product updates
              </span>
            </div>
          </div>
          <a className="help-stage-cta" href={DISCORD_URL} target="_blank" rel="noreferrer">
            <Icon name="discord" filled />
            <b>Join the server</b>
            <i>discord.gg — opens in a new tab</i>
          </a>
        </Reveal>
      </PageSection>

      <PageSection
        eyebrow="Support / 02 — routing"
        title="Where each kind of question belongs"
        lead="Most questions already have a written answer. Find yours below and you will get it faster than in a queue."
      >
        <div className="help-routes">
          {ROUTES.map((route, index) => (
            <Reveal key={route.href + route.question} delay={Math.min(index, 6) * 0.05}>
              <a className="help-route" href={route.href} {...(route.href.startsWith("http") ? { target: "_blank", rel: "noreferrer" } : {})}>
                <span className="help-route-icon">
                  <Icon name={route.icon} />
                </span>
                <span className="help-route-body">
                  <b>{route.question}</b>
                  <i>{route.answer}</i>
                </span>
                <span className="help-route-cta">
                  {route.cta}
                  <Icon name="arrow-up-right" />
                </span>
              </a>
            </Reveal>
          ))}
        </div>
      </PageSection>

      <PageSection
        eyebrow="Support / 03 — quick answers"
        title="Four things people ask first"
      >
        <div className="card-grid card-grid--2">
          {QUICK_ANSWERS.map((item, index) => (
            <Reveal key={item.q} delay={index * 0.06} className="panel panel--ticks panel--hover help-answer">
              <span className="help-answer-icon">
                <Icon name={item.icon} />
              </span>
              <h3>{item.q}</h3>
              <p>{item.a}</p>
              {item.href ? <ArrowLink href={item.href}>{item.cta}</ArrowLink> : null}
            </Reveal>
          ))}
        </div>
      </PageSection>

      <PageSection
        eyebrow="Support / 04 — reporting"
        title="Write a bug report people can act on"
        lead="Five lines beats five screenshots of a conversation. Copy this, fill it in, post it in the support server."
      >
        <div className="help-report">
          <div className="code-block">
            <div className="code-block-head">
              <span className="terminal-dot r" aria-hidden="true" />
              <span className="terminal-dot b" aria-hidden="true" />
              <span className="terminal-dot c" aria-hidden="true" />
              report template
              <CopyButton value={REPORT_TEMPLATE} variant="ghost" />
            </div>
            <div className="code-block-body">
              {REPORT_TEMPLATE.split("\n").map((line) => (
                <div className="code-line" key={line}>
                  <code>{line}</code>
                </div>
              ))}
            </div>
          </div>

          <div className="help-report-notes">
            <h3>What makes a report useful</h3>
            <ul>
              <li>
                <Icon name="check" /> The exact command, with its arguments — not a description of it.
              </li>
              <li>
                <Icon name="check" /> What you expected versus what Mocha did or replied.
              </li>
              <li>
                <Icon name="check" /> Whether it happens every time, or only sometimes.
              </li>
              <li>
                <Icon name="check" /> The permissions of whoever ran it — moderation commands follow Discord's rules.
              </li>
              <li>
                <Icon name="check" /> The server id, if the problem only happens there.
              </li>
            </ul>
          </div>
        </div>
      </PageSection>

      <Reveal className="docs-cta" delay={0.05}>
        <div>
          <span className="panel-kicker">Before you go</span>
          <h3 className="panel-title">Everything else is one click away.</h3>
          <p className="panel-copy">
            The docs cover setup and moderation, the index covers every command, and the premium page covers the six
            plans.
          </p>
        </div>
        <div className="docs-cta-actions">
          <ArrowLink href="/docs">documentation</ArrowLink>
          <ArrowLink href="/commands">command index</ArrowLink>
          <ArrowLink href="/premium">premium</ArrowLink>
        </div>
      </Reveal>
    </PageShell>
  );
}

export default HelpPage;

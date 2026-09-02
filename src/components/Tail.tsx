import { useEffect, useRef, useState, type CSSProperties, type FormEvent } from "react";
import { mochaPaperclip } from "../assets/mochaAssets";
import { useCountOnView, useMagnetic } from "../lib/hooks";

const rd = (s: string) => ({ "--rd": s }) as CSSProperties;

/* ---------------- terminal ---------------- */

type Line = { kind: "cmd" | "res" | "err"; text: string };

const BOOT: Line[] = [
  { kind: "res", text: "mocha v2.4.1 — connected to #general." },
  { kind: "res", text: "type 'help' to see what i do." },
];

function respond(raw: string): Line[] {
  const cmd = raw.trim().toLowerCase();
  switch (cmd) {
    case "help":
      return [
        { kind: "res", text: "call ........ bridge this channel to another server" },
        { kind: "res", text: "hangup ...... end the current call / leave the queue" },
        { kind: "res", text: "ban / kick .. remove a member, reason logged" },
        { kind: "res", text: "mute / unmute  timeout, in minutes" },
        { kind: "res", text: "lock / unlock  freeze or thaw the channel" },
        { kind: "res", text: "set-prefix .. make it yours" },
      ];
    case "call":
      return [
        { kind: "res", text: "searching the queue…" },
        { kind: "res", text: "matched with THE-HANGOUT. say hi." },
        { kind: "res", text: "2 servers, 1 chat. behave." },
      ];
    case "hangup":
      return [{ kind: "res", text: "call ended. 41 minutes. new personal best." }];
    case "ban":
      return [
        { kind: "res", text: "member banned. reason attached to the log." },
        { kind: "res", text: "mercy: optional." },
      ];
    case "kick":
      return [{ kind: "res", text: "kicked. they'll live. probably." }];
    case "mute":
      return [{ kind: "res", text: "muted for 10 minutes. breathe, everyone." }];
    case "lock":
      return [{ kind: "res", text: "channel locked. adults are talking." }];
    case "prefix":
    case "set-prefix":
      return [{ kind: "res", text: "prefix updated. 'mocha' feels classic anyway." }];
    case "hello":
    case "hi":
      return [{ kind: "res", text: "hey. you typed to a bot. respectfully: same." }];
    case "sudo":
      return [{ kind: "err", text: "nice try, kestrel." }];
    default:
      return [{ kind: "err", text: `'${cmd}' not found. type 'help'.` }];
  }
}

function Terminal() {
  const [lines, setLines] = useState<Line[]>(BOOT);
  const [value, setValue] = useState("");
  const bodyRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = bodyRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [lines]);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const cmd = value.trim();
    if (!cmd) return;
    setValue("");
    if (cmd.toLowerCase() === "clear") {
      setLines([]);
      return;
    }
    const echo: Line = { kind: "cmd", text: cmd };
    setLines((prev) => [...prev, echo, ...respond(cmd)].slice(-60));
  };

  return (
    <div className="terminal" data-reveal>
      <div className="terminal-head">
        <span className="terminal-dot r" />
        <span className="terminal-dot b" />
        <span className="terminal-dot c" />
        mocha — tty0
        <span>try: help / call / sudo</span>
      </div>
      <div className="terminal-body" ref={bodyRef} aria-live="polite">
        {lines.map((l, i) =>
          l.kind === "cmd" ? (
            <div className="t-line t-cmd" key={i}>
              <b>mocha&gt;</b> {l.text}
            </div>
          ) : (
            <div className={`t-line t-res${l.kind === "err" ? " err" : ""}`} key={i}>
              {l.text}
            </div>
          )
        )}
      </div>
      <form className="terminal-form" onSubmit={submit}>
        <span className="terminal-prompt">mocha&gt;</span>
        <input
          className="terminal-input"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="type a command…"
          aria-label="Mocha command input"
          autoComplete="off"
          spellCheck={false}
        />
      </form>
    </div>
  );
}

/* ---------------- commands ---------------- */

const COLS: { name: string; tag: string; cards: { name: React.ReactNode; desc: React.ReactNode }[] }[] = [
  {
    name: "CALLS",
    tag: "connect rooms across servers",
    cards: [
      {
        name: (
          <>
            mocha <b>call</b>
          </>
        ),
        desc: "Connect this channel to another server, or join the queue to get matched.",
      },
      {
        name: (
          <>
            mocha <b>hangup</b>
          </>
        ),
        desc: "End the current call, or leave the queue.",
      },
    ],
  },
  {
    name: "MODERATION",
    tag: "keep the place tidy",
    cards: [
      {
        name: (
          <>
            mocha <b>ban</b> / <b>kick</b>
          </>
        ),
        desc: "Remove a member, with a reason attached to the log.",
      },
      {
        name: (
          <>
            mocha <b>mute</b> / <b>unmute</b>
          </>
        ),
        desc: "Timeout a member for a set number of minutes.",
      },
      {
        name: (
          <>
            mocha <b>lock</b> / <b>unlock</b>
          </>
        ),
        desc: "Stop or restore everyone's ability to send messages in a channel.",
      },
    ],
  },
  {
    name: "SETUP",
    tag: "make it yours",
    cards: [
      {
        name: (
          <>
            <b className="cmd-slash">/set-prefix</b>
          </>
        ),
        desc: "Change the command prefix for your server.",
      },
      {
        name: (
          <>
            mocha <b>help</b>
          </>
        ),
        desc: (
          <>
            Open the full command index. <span className="cmd-arrow">&#8599;</span>
          </>
        ),
        // link-styled card
      },
    ],
  },
];

export function Commands() {
  return (
    <section className="section commands-section" id="commands">
      <div className="cmd-top">
        <div>
          <div className="section-eyebrow" data-reveal>
            Reference / quickstart
          </div>
          <h2 className="line-mask">
            <span>Commands to get started</span>
          </h2>
          <p data-reveal style={rd(".1s")}>
            A handful of the basics, printed straight from the bot's own mouth — or run{" "}
            <code className="cmd-inline">mocha help</code> in chat for the full list. The terminal on the right is
            live. go on.
          </p>
        </div>
        <Terminal />
      </div>

      <div className="cmd-columns">
        {COLS.map((col, ci) => (
          <div className="cmd-col" key={col.name} data-reveal style={rd(`${ci * 0.08}s`)}>
            <div className="cmd-col-head">
              <span className="cmd-col-name">
                <i className="cmd-bar" />
                {col.name}
              </span>
              <span className="cmd-col-tag">{col.tag}</span>
            </div>
            {col.cards.map((c, i) => (
              <div className={`cmd-card${i === col.cards.length - 1 && ci === 2 ? " cmd-card--link" : ""}`} key={i}>
                <div className="cmd-card-name">{c.name}</div>
                <div className="cmd-card-desc">{c.desc}</div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}

/* ---------------- cta ---------------- */

export function Cta() {
  const onlineRef = useCountOnView<HTMLElement>(340, true, 1100);
  const memberRef = useCountOnView<HTMLElement>(2900, true, 1200);
  const joinRef = useMagnetic<HTMLAnchorElement>(0.22);

  return (
    <section className="section cta-section">
      <div className="cta-glow" aria-hidden="true" />
      <div className="cta-grid">
        <div className="cta-copy">
          <div className="section-eyebrow" data-reveal>
            Support / come hang out
          </div>
          <h2 className="cta-heading">
            <span className="line-mask">
              <span>Want more control?</span>
            </span>
            <span className="line-mask" style={{ "--d": ".12s" } as CSSProperties}>
              <span className="cta-heading-accent">Come hang out</span>
            </span>
            <span className="line-mask" style={{ "--d": ".24s" } as CSSProperties}>
              <span>where it lives.</span>
            </span>
          </h2>
          <p className="cta-sub" data-reveal style={rd(".2s")}>
            Join the support server for updates, bug reports, and a direct line if something breaks. It's where
            Mocha actually spends its time.
          </p>
          <div className="cta-actions" data-reveal style={rd(".3s")}>
            <a className="btn-sticker" ref={joinRef} href="https://discord.gg/HK4Cg3hw59" target="_blank" rel="noreferrer">
              <span className="shard" />
              <span className="plate plate--outline">Join Discord &gt;</span>
            </a>
            <a className="hero-text-link" href="#documentation">
              read the docs <span>&#8599;</span>
            </a>
          </div>
        </div>

        <div className="server-preview" data-reveal style={rd(".15s")}>
          <div className="server-preview-head">
            <img className="server-avatar-img" src={mochaPaperclip} alt="Mocha HQ server icon" />
            <div className="server-head-text">
              <div className="server-name">mocha hq</div>
              <div className="server-sub">official support server</div>
            </div>
            <div className="server-live">
              <span className="dot" />
              <span className="chevron-label chevron-label--live">
                <b>L</b>
                <i>&gt;</i>
                <b>I</b>
                <i>&gt;</i>
                <b>V</b>
                <i>&gt;</i>
                <b>E</b>
              </span>
            </div>
          </div>
          <div className="server-stats">
            <div>
              <span className="dot" />
              <strong ref={onlineRef}>0</strong>&nbsp;online
            </div>
            <div>
              <strong ref={memberRef}>0</strong>&nbsp;members
            </div>
          </div>
          <div className="channel-marquee">
            <div className="channel-track">
              {["#general", "#suggestions", "#help", "#bug-reports", "#updates", "#xerox-corner"].map((c) => (
                <span className="channel-tag" key={`a${c}`}>
                  {c}
                </span>
              ))}
              {["#general", "#suggestions", "#help", "#bug-reports", "#updates", "#xerox-corner"].map((c) => (
                <span className="channel-tag" key={`b${c}`}>
                  {c}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------- footer ---------------- */

export function Footer() {
  return (
    <footer className="mocha-footer" id="footer">
      <div className="footer-word" aria-hidden="true">
        {"MOCHA".split("").map((ch, i) => (
          <span key={i}>{ch}</span>
        ))}
      </div>
      <div className="footer-main">
        <div className="footer-brand">
          <div className="footer-brand-title">mocha</div>
          <div className="footer-brand-copy">
            A Discord bot for communities that want useful tools without turning the server into a dashboard.
          </div>
        </div>
        <div>
          <div className="footer-col-title">Product</div>
          <a className="footer-link" href="#commands">
            Commands
          </a>
          <a className="footer-link" href="#premium">
            Premium
          </a>
          <a className="footer-link" href="#about">
            About us
          </a>
        </div>
        <div>
          <div className="footer-col-title">Documentation</div>
          <a className="footer-link" href="#documentation">
            Getting started
          </a>
          <a className="footer-link" href="#documentation">
            Moderation
          </a>
          <a className="footer-link" href="#commands">
            Command reference
          </a>
        </div>
        <div>
          <div className="footer-col-title">Support</div>
          <a className="footer-link" href="https://discord.com/invite/mocha" target="_blank" rel="noreferrer">
            Discord
          </a>
          <a className="footer-link" href="https://discord.com/invite/mocha" target="_blank" rel="noreferrer">
            Get help
          </a>
        </div>
        <div>
          <div className="footer-col-title">Legal</div>
          <a className="footer-link" href="https://discord.com/invite/mocha" target="_blank" rel="noreferrer">
            Terms of Service
          </a>
          <a className="footer-link" href="https://discord.com/invite/mocha" target="_blank" rel="noreferrer">
            Privacy Policy
          </a>
          <a className="footer-link" href="https://discord.com/invite/mocha" target="_blank" rel="noreferrer">
            Refunds
          </a>
        </div>
      </div>
      <div className="footer-bottom">
        <div className="footer-legal">&copy; 2026 Mocha. All rights reserved.</div>
        <a className="footer-top" href="#top">
          back to the top <span>&#8593;</span>
        </a>
        <div className="footer-legal">
          <a href="https://discord.com/invite/mocha" target="_blank" rel="noreferrer">
            Terms
          </a>{" "}
          &nbsp;&middot;&nbsp;
          <a href="https://discord.com/invite/mocha" target="_blank" rel="noreferrer">
            Privacy
          </a>{" "}
          &nbsp;&middot;&nbsp;
          <a href="https://discord.com/invite/mocha" target="_blank" rel="noreferrer">
            Refunds
          </a>
        </div>
      </div>
    </footer>
  );
}

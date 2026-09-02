import { useEffect, useRef, useState, type ReactNode } from "react";
import { mochaFace } from "../assets/mochaAssets";
import { useCountOnView } from "../lib/hooks";

/* ---------------- ticker ---------------- */

export function Ticker({ items, red = false }: { items: string[]; red?: boolean }) {
  const group = (key: string) => (
    <div className="ticker-group" key={key}>
      {items.map((it) => (
        <span className="ticker-item" key={it}>
          {it}
          <i>&gt;</i>
        </span>
      ))}
    </div>
  );
  return (
    <div className={`ticker${red ? " ticker--red" : ""}`} aria-hidden="true">
      <div className="ticker-track">
        {group("a")}
        {group("b")}
      </div>
    </div>
  );
}

/* ---------------- features ---------------- */

type Feat = { num: string; title: string; desc: string; icon: ReactNode };

const FEATS: Feat[] = [
  {
    num: "01",
    title: "Cross-server calls",
    desc: "Connect your server to another one and chat live through it. One command, no extra setup, no bridge dashboard — the conversation just continues somewhere else.",
    icon: (
      <svg viewBox="0 0 48 48">
        <path d="M9 15c0-2.2 2-4 4.2-4h4.3l3 7-3.2 3.1c2.1 4.2 5.4 7.5 9.6 9.6l3.1-3.2 7 3v4.3c0 2.2-1.8 4.2-4 4.2C19.5 39 9 28.5 9 15Z" />
        <path d="M29 9c5 0 10 5 10 10M29 15c2.2 0 4 1.8 4 4" />
      </svg>
    ),
  },
  {
    num: "02",
    title: "Full moderation suite",
    desc: "Ban, kick, mute, lock channels, manage roles — all from chat, all with reasons attached to the log. The boring stuff, handled without leaving the conversation.",
    icon: (
      <svg viewBox="0 0 48 48">
        <path d="M24 6l14 5v10c0 9-6 16.5-14 21C16 37.5 10 30 10 21V11l14-5Z" />
        <path d="M18 22.5l4.2 4.3 8-9" />
      </svg>
    ),
  },
  {
    num: "03",
    title: "Custom prefixes",
    desc: "Set your own command prefix per server if “mocha” isn't your vibe. Everything else keeps working exactly the way muscle memory expects.",
    icon: (
      <svg viewBox="0 0 48 48">
        <path d="M14 14L6 24l8 10M34 14l8 10-8 10M27.5 9l-7 30" />
      </svg>
    ),
  },
  {
    num: "04",
    title: "Giveaways built in",
    desc: "Run giveaways without adding a second bot just for that. Set the prize, set the timer, let the channel hype itself — mocha draws the winner.",
    icon: (
      <svg viewBox="0 0 48 48">
        <rect x="8" y="20" width="32" height="20" />
        <path d="M8 27h32M24 20v20" />
        <path d="M24 20c-6 0-10-2.2-10-6 0-3 3-4.2 5-3.2 3 1.5 5 5.2 5 9.2Zm0 0c6 0 10-2.2 10-6 0-3-3-4.2-5-3.2-3 1.5-5 5.2-5 9.2Z" />
      </svg>
    ),
  },
  {
    num: "05",
    title: "Audit log lookup",
    desc: "Pull recent server activity straight into chat. Who changed what, when, and to whom — answered in the channel where the question was asked.",
    icon: (
      <svg viewBox="0 0 48 48">
        <circle cx="20" cy="20" r="11" />
        <path d="M28.5 28.5L40 40M15 17.5h10M15 22.5h7" />
      </svg>
    ),
  },
  {
    num: "06",
    title: "Amazing uptime",
    desc: "Always awake, always answering. Calls don't drop at 3am and moderation doesn't sleep in. (placeholder, obviously — but the intent is real.)",
    icon: (
      <svg viewBox="0 0 48 48">
        <circle cx="24" cy="24" r="16" />
        <path d="M13 24h5.5l3-7 4.5 14 3-7H35" />
      </svg>
    ),
  },
];

export function Features() {
  const [active, setActive] = useState(0);
  const rowRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const els = rowRefs.current.filter((el): el is HTMLDivElement => Boolean(el));
    if (!els.length || !("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            const i = els.indexOf(e.target as HTMLDivElement);
            if (i >= 0) setActive(i);
          }
        });
      },
      { rootMargin: "-44% 0px -44% 0px" }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <section className="section" id="documentation">
      <div className="feat-grid">
        <aside className="feat-aside">
          <div className="section-eyebrow" data-reveal>
            Feature set / what it does
          </div>
          <h2 className="line-mask">
            <span>What it can do</span>
          </h2>
          <p data-reveal style={{ "--rd": ".1s" } as React.CSSProperties}>
            Six things it's actually good at. No feature bloat, no dashboard tax — more being added when they earn
            their place.
          </p>
          <div className="feat-index" data-reveal style={{ "--rd": ".2s" } as React.CSSProperties}>
            {FEATS.map((f, i) => (
              <div className={`feat-index-item${active === i ? " is-active" : ""}`} key={f.num}>
                <span className="fi-num">{f.num}</span>
                <span>{f.title}</span>
              </div>
            ))}
          </div>
        </aside>

        <div className="feat-rows">
          {FEATS.map((f, i) => (
            <div
              className="feat-row"
              key={f.num}
              data-reveal
              style={{ "--rd": `${(i % 3) * 0.06}s` } as React.CSSProperties}
              ref={(el) => {
                rowRefs.current[i] = el;
              }}
            >
              <span className="feat-num">/{f.num}</span>
              <div>
                <h3 className="feat-title">{f.title}</h3>
                <p className="feat-desc">{f.desc}</p>
              </div>
              <span className="feat-icon">{f.icon}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- premium ---------------- */

export function Premium() {
  return (
    <section className="section pricing-section" id="premium">
      <div className="pricing-intro">
        <div>
          <div className="section-eyebrow" data-reveal>
            Premium / Optional
          </div>
          <h2 className="line-mask">
            <span>
              Free forever, <span>faster if you upgrade.</span>
            </span>
          </h2>
        </div>
        <p data-reveal style={{ "--rd": ".12s" } as React.CSSProperties}>
          Premium doesn't gate moderation or calls. It just gives the servers that want more a little more room —
          and keeps the lights on without selling the bot's personality.
        </p>
      </div>

      <div className="pricing-panel">
        <div className="pricing-note" data-reveal>
          <div className="pricing-note-mark">+</div>
          <div className="pricing-note-title">No contracts.</div>
          <div className="pricing-note-copy">No lock-ins. No paywalled moderation. Just better servers.</div>
          <a href="#commands">
            compare commands <span>&#8599;</span>
          </a>
        </div>

        <div className="price-card" data-reveal style={{ "--rd": ".1s" } as React.CSSProperties}>
          <div className="price-top">
            <h3>Free</h3>
            <span className="price-chip">$0 &middot; every server</span>
          </div>
          <div className="price-list">
            <div>
              <i />
              Cross-server calls
            </div>
            <div>
              <i />
              Full moderation suite
            </div>
            <div>
              <i />
              Giveaways &amp; audit logs
            </div>
            <div>
              <i />
              Standard call queue
            </div>
          </div>
          <div className="price-foot">everything essential stays free</div>
        </div>

        <div className="price-card price-card-premium" data-reveal style={{ "--rd": ".2s" } as React.CSSProperties}>
          <span className="stamp">worth it</span>
          <div className="price-top">
            <h3>Premium</h3>
            <span className="price-chip">per server &middot; cancel anytime</span>
          </div>
          <div className="price-list">
            <div>
              <i />
              Priority call matching
            </div>
            <div>
              <i />
              Longer message &amp; audit history
            </div>
            <div>
              <i />
              Custom bot avatar per server
            </div>
            <div>
              <i />
              Early access to new commands
            </div>
          </div>
          <a className="mini-sticker-cta" href="https://discord.com/invite/mocha" target="_blank" rel="noreferrer">
            <span className="shard" />
            <span className="plate">Get Premium &gt;</span>
          </a>
        </div>
      </div>
    </section>
  );
}

/* ---------------- about ---------------- */

export function About() {
  const s1 = useCountOnView<HTMLDivElement>(214, true, 1200);
  const s2 = useCountOnView<HTMLDivElement>(48930, true, 1400);
  const s3 = useCountOnView<HTMLDivElement>(6, true, 900);

  return (
    <section className="section about-section" id="about">
      <div className="about-ghost" aria-hidden="true">
        SERVER
      </div>

      <div className="about-head">
        <div className="section-eyebrow" data-reveal>
          About us / the idea
        </div>
        <h2 className="about-title line-mask">
          <span>
            Built around the <span>server</span>, not a dashboard.
          </span>
        </h2>
        <p className="about-lead" data-reveal style={{ "--rd": ".12s" } as React.CSSProperties}>
          Mocha is a Discord bot with a slightly unusual personality — practical tools, a little character, and a
          visual identity that doesn't look like every other admin panel. It lives inside the chat, where the
          community actually is.
        </p>
      </div>

      <div className="about-grid">
        <article className="about-card about-card--wide" data-reveal>
          <div className="about-card-kicker">01 / philosophy</div>
          <h3 className="about-card-title">Everything happens in chat.</h3>
          <p className="about-card-copy">
            No tab-switching, no clunky web panel to babysit. Moderation, calls, giveaways and lookups all run from
            the channel you're already in — the way a bot should feel.
          </p>
          <div className="about-tags">
            <span>in-chat first</span>
            <span>fast commands</span>
            <span>zero setup</span>
          </div>
        </article>

        <article className="about-card about-card--photo" data-reveal style={{ "--rd": ".1s" } as React.CSSProperties}>
          <div className="about-photo">
            <img src={mochaFace} alt="Mocha character artwork" />
            <span className="about-photo-wash" />
            <span className="about-photo-patch" />
          </div>
          <div className="about-photo-cap">the face of the bot</div>
        </article>

        <article className="about-card" data-reveal style={{ "--rd": ".16s" } as React.CSSProperties}>
          <div className="about-card-kicker">02 / identity</div>
          <h3 className="about-card-title">A face, not a logo.</h3>
          <p className="about-card-copy">
            The xerox-punk artwork isn't decoration — it's the whole personality. Ink line-art, red distress, a cyan
            glitch over the eye.
          </p>
        </article>

        <article className="about-card" data-reveal style={{ "--rd": ".22s" } as React.CSSProperties}>
          <div className="about-card-kicker">03 / promise</div>
          <h3 className="about-card-title">Stays out of the way.</h3>
          <p className="about-card-copy">
            Useful when you call it, invisible when you don't. No spam, no noise, no thirty-message onboarding.
          </p>
        </article>

        <article className="about-card about-card--stats" data-reveal>
          <div className="about-stat">
            <div className="about-stat-num" ref={s1}>
              0
            </div>
            <div className="about-stat-lbl">servers running mocha</div>
          </div>
          <div className="about-stat">
            <div className="about-stat-num" ref={s2}>
              0
            </div>
            <div className="about-stat-lbl">members reached</div>
          </div>
          <div className="about-stat">
            <div className="about-stat-num" ref={s3}>
              0
            </div>
            <div className="about-stat-lbl">core commands</div>
          </div>
          <div className="about-stat">
            <div className="about-stat-num about-stat-num--word">24/7</div>
            <div className="about-stat-lbl">awake &amp; answering</div>
          </div>
        </article>
      </div>
    </section>
  );
}

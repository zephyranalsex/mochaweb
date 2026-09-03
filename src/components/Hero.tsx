import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { pickMochaBackground, mochaGlobe, mochaPaperclip } from "../assets/mochaAssets";
import HeroScene, { type SceneState } from "./HeroScene";
import { useCountOnView, useMagnetic, usePrefersReducedMotion, useScramble, useMediaQuery } from "../lib/hooks";

const d = (s: string) => ({ "--d": s }) as CSSProperties;

const HINTS = [
  "click the drum — it copies",
  "it keeps copying.",
  "okay that's plenty.",
  "stop. (don't)",
];

export default function Hero({ ready }: { ready: boolean }) {
  const heroRef = useRef<HTMLElement | null>(null);
  const copyRef = useRef<HTMLDivElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const artRef = useRef<HTMLDivElement | null>(null);
  const logRef = useRef<HTMLDivElement | null>(null);
  const photoRef = useRef<HTMLDivElement | null>(null);
  const flashRef = useRef<HTMLDivElement | null>(null);
  const hudRef = useRef<HTMLSpanElement | null>(null);

  const [mochaBackground] = useState(() => pickMochaBackground());
  const [copies, setCopies] = useState(0);
  const stateRef = useRef<SceneState>({ scroll: 0, px: 0, py: 0 });

  const reduced = usePrefersReducedMotion();
  const isDesktop = useMediaQuery("(min-width: 1021px)");
  const show3d = isDesktop && !reduced;

  const scr1 = useScramble("Mo", ready, 500);
  const scr2 = useScramble("cha", ready, 650);

  const membersRef = useCountOnView(1842, ready, 1400);
  const serversRef = useCountOnView(214, ready, 1100);
  const reachedRef = useCountOnView(48930, ready, 1300);

  const inviteRef = useMagnetic<HTMLAnchorElement>(0.22);

  /* scroll choreography */
  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const hero = heroRef.current;
        if (!hero) return;
        const p = Math.min(Math.max(window.scrollY / (hero.offsetHeight * 0.9), 0), 1);
        stateRef.current.scroll = p;
        if (copyRef.current) {
          copyRef.current.style.transform = `translate3d(0, ${(-p * 110).toFixed(1)}px, 0)`;
          copyRef.current.style.opacity = String(Math.min(Math.max(1 - p * 1.25, 0), 1));
        }
        if (stageRef.current) {
          stageRef.current.style.opacity = String(Math.min(Math.max(1 - p * 1.05, 0), 1));
          stageRef.current.style.transform = `translate3d(0, ${(-p * 60).toFixed(1)}px, 0)`;
        }
        if (artRef.current) {
          artRef.current.style.transform = `translate3d(0, ${(-p * 90).toFixed(1)}px, 0) scale(${(1 + p * 0.05).toFixed(3)})`;
        }
        if (logRef.current) {
          logRef.current.style.transform = `rotate(-1deg) translate3d(0, ${(-p * 150).toFixed(1)}px, 0)`;
        }
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  /* cursor lamp + pointer parallax */
  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;
    const onMove = (e: PointerEvent) => {
      const r = hero.getBoundingClientRect();
      const x = e.clientX - r.left;
      const y = e.clientY - r.top;
      hero.style.setProperty("--mx", `${x}px`);
      hero.style.setProperty("--my", `${y}px`);
      hero.style.setProperty("--lx", `${x}px`);
      hero.style.setProperty("--ly", `${y}px`);
      hero.classList.add("lit");
      stateRef.current.px = Math.min(Math.max((x / r.width - 0.5) * 2, -1), 1);
      stateRef.current.py = Math.min(Math.max((y / r.height - 0.5) * 2, -1), 1);
    };
    const onLeave = () => {
      hero.classList.remove("lit");
      stateRef.current.px = 0;
      stateRef.current.py = 0;
    };
    hero.addEventListener("pointermove", onMove);
    hero.addEventListener("pointerleave", onLeave);
    return () => {
      hero.removeEventListener("pointermove", onMove);
      hero.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  /* pinned photo tilt */
  useEffect(() => {
    const el = photoRef.current;
    if (!el || reduced) return;
    const enter = () => el.classList.add("is-hovering");
    const move = (e: MouseEvent) => {
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      const rotZ = 5 - px * 7 + py * 3.5;
      el.style.transform = `perspective(700px) rotateZ(${rotZ}deg) rotateX(${(-py * 18).toFixed(2)}deg) rotateY(${(px * 18).toFixed(2)}deg) translateY(-10px) translateZ(26px) scale(1.055)`;
    };
    const leave = () => {
      el.classList.remove("is-hovering");
      el.style.transform = "";
    };
    el.addEventListener("mouseenter", enter);
    el.addEventListener("mousemove", move);
    el.addEventListener("mouseleave", leave);
    return () => {
      el.removeEventListener("mouseenter", enter);
      el.removeEventListener("mousemove", move);
      el.removeEventListener("mouseleave", leave);
    };
  }, [reduced]);

  const onCopy = useCallback(() => {
    setCopies((c) => c + 1);
    const flash = flashRef.current;
    if (flash) {
      flash.classList.remove("go");
      void flash.offsetWidth;
      flash.classList.add("go");
    }
    const hud = hudRef.current;
    if (hud) {
      hud.classList.remove("pop");
      void hud.offsetWidth;
      hud.classList.add("pop");
    }
  }, []);

  const hint = copies === 0 ? HINTS[0] : copies < 3 ? HINTS[1] : copies < 6 ? HINTS[2] : HINTS[3];

  return (
    <section className={`section hero-section${ready ? " is-ready" : ""}`} id="top" ref={heroRef as React.RefObject<HTMLElement>}>
      <div className="hero-art" ref={artRef} style={{ backgroundImage: `url(${mochaBackground})` }} aria-hidden="true" />
      <div className="hero-mono-wash" aria-hidden="true" />
      <div className="hero-ghost-word" aria-hidden="true">
        MOCHA
      </div>
      <div className="hero-lamp" aria-hidden="true" />

      <div className="hero-secret" aria-hidden="true">
        <span className="secret-item secret-death">
          HELLOW
          <br />
          TWIN
        </span>
        <span className="secret-item secret-note-1">no signal lost</span>
        <span className="secret-item secret-note-2">copy me</span>
        <span className="secret-item secret-note-3">est. panchiko</span>
        <span className="secret-item secret-stamp">
          xerox
          <br />
          approved
        </span>
        <span className="secret-item secret-barcode" />
        <span className="secret-item secret-arrow">
          <svg viewBox="0 0 120 90">
            <path d="M6 8 C 40 30, 70 34, 104 62 M92 58 l 14 6 -4 -15" />
          </svg>
        </span>
      </div>

      <div className="hero-copy" ref={copyRef}>
        <div className="hero-kicker hx" style={d(".15s")}>
          <span>Discord Bot</span>
          <i />
          <span>Depth &gt; Modest &gt; All</span>
        </div>

        <h1 className="hero-tagline">
          <span className="line-mask" style={d(".28s")}>
            <span className="line-meet">Meet</span>
          </span>
          <span className="line-mask" style={d(".4s")}>
            <span>
              <span className="line-mocha">
                <span className="scr">{scr1}</span>
                <span className="sticker-slot">
                  <img src={mochaPaperclip} alt="Mocha character sticker" className="word-sticker" />
                </span>
                <span className="scr">{scr2}</span>
              </span>
            </span>
          </span>
          <span className="line-mask" style={d(".55s")}>
            <span className="line-tail">
              <span className="tail-line">your server's</span>
              <span className="tail-line">
                <em>unusual</em>
                <span className="tail-rest"> little fixer.</span>
              </span>
            </span>
          </span>
        </h1>

        <p className="hero-sub hx" style={d(".72s")}>
          Cross-server calls, a full moderation suite, giveaways and the small things that make a community feel
          alive — wrapped in a bot that doesn't look like every other dashboard.
        </p>

        <div className="hero-actions hx" style={d(".86s")}>
          <a className="btn-sticker" ref={inviteRef} href="https://discord.com/oauth2/authorize?client_id=1544448518310199427&permissions=8&integration_type=0&scope=bot" target="_blank" rel="noreferrer">
            <span className="shard" />
            <span className="plate">Invite Mocha &gt;</span>
          </a>
          <a className="hero-text-link" href="#commands">
            view commands <span>&#8599;</span>
          </a>
        </div>

        <div className="live-stat-card hx" style={d("1s")}>
          <div className="live-stat-head">
            <span className="chevron-label chevron-label--live">
              <b>L</b>
              <i>&gt;</i>
              <b>I</b>
              <i>&gt;</i>
              <b>V</b>
              <i>&gt;</i>
              <b>E</b>
            </span>
            <span className="live-blink" aria-hidden="true" />
          </div>
          <div className="live-stat-main">
            <span className="live-stat-num" ref={membersRef}>
              0
            </span>
            <span className="live-stat-word">members</span>
          </div>
          <div className="live-stat-caption">across community servers</div>
          <div className="live-stat-divider" />
          <div className="live-stat-foot">
            <div className="live-stat-mini">
              <span className="live-mini-lbl">servers</span>
              <span className="live-mini-num" ref={serversRef}>
                0
              </span>
            </div>
            <span className="live-stat-sep" />
            <div className="live-stat-mini">
              <span className="live-mini-lbl">total users reached</span>
              <span className="live-mini-num" ref={reachedRef}>
                0
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="hero-stage" ref={stageRef}>
        {show3d && <HeroScene stateRef={stateRef} onCopy={onCopy} textureUrl={mochaGlobe} />}

        <div className="hero-fallback">
          <span className="tape" />
          <img src={mochaBackground} alt="Mocha character artwork" />
        </div>

        <div className="pinned-photo" ref={photoRef}>
          <span className="paperclip" aria-hidden="true" />
          <div className="frame">
            <div className="tape" />
            <img src={mochaPaperclip} alt="Mocha's hand-drawn sticker artwork" />
            <div className="wash" />
            <div className="glitch-patch" />
            <div className="cap">est. panchiko</div>
          </div>
        </div>

        <div className="message-log" ref={logRef}>
          <div className="message-log-head">
            <span>mocha call</span>
            <span className="route">
              late-night-lounge <span>&harr;</span> the-hangout
            </span>
          </div>
          <div className="message-log-body">
            <div className="log-msg">
              <div className="log-avatar">K</div>
              <div className="log-content">
                <div className="log-line1">
                  <span className="log-name">kestrel</span>
                  <span className="log-time">10:42 PM</span>
                </div>
                <div className="log-text">wait is this actually connected</div>
              </div>
            </div>
            <div className="log-msg bot">
              <div className="log-avatar">m</div>
              <div className="log-content">
                <div className="log-line1">
                  <span className="log-name">mocha</span>
                  <span className="log-tag">BOT</span>
                  <span className="log-time">10:42 PM</span>
                </div>
                <div className="log-text">connected late-night-lounge to the-hangout.</div>
              </div>
            </div>
            <div className="log-msg">
              <div className="log-avatar">R</div>
              <div className="log-content">
                <div className="log-line1">
                  <span className="log-name">rui</span>
                  <span className="log-time">10:43 PM</span>
                </div>
                <div className="log-text">hi from the other side</div>
              </div>
            </div>
            <div className="log-msg bot">
              <div className="log-avatar">m</div>
              <div className="log-content">
                <div className="log-line1">
                  <span className="log-name">mocha</span>
                  <span className="log-tag">BOT</span>
                  <span className="log-time">10:43 PM</span>
                </div>
                <div className="log-text">2 servers, 1 chat. behave.</div>
              </div>
            </div>
          </div>
          <div className="hero-message-foot">
            <span>cross-server calls</span>
            <span>&#9679; online</span>
          </div>
        </div>

        <div className="hero-scribble">
          made for servers
          <br />
          not dashboards.
        </div>

        {show3d && (
          <div className="scene-hud">
            <span className="hud-copies" ref={hudRef}>
              xerox copies: <b>{String(copies).padStart(2, "0")}</b>
            </span>
            <span className="hud-hint">{hint}</span>
          </div>
        )}
      </div>

      <div className="hero-light-hint hx" style={d("1.3s")}>
        <i />
        some ink only shows under the light — move it around
      </div>

      <div className="scroll-note">scroll to explore</div>
      <div className="xerox-flash" ref={flashRef} aria-hidden="true" />
    </section>
  );
}

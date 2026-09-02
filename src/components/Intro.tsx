import { useEffect, useRef } from "react";

export default function Intro({ onDone }: { onDone: () => void }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const doneRef = useRef(onDone);
  doneRef.current = onDone;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    document.body.classList.add("intro-lock");
    let seen = false;
    try {
      seen = sessionStorage.getItem("mocha-intro-seen") === "1";
    } catch {
      seen = false;
    }
    let dismissed = false;
    const dismiss = () => {
      if (dismissed) return;
      dismissed = true;
      el.classList.add("hide");
      document.body.classList.remove("intro-lock");
      try {
        sessionStorage.setItem("mocha-intro-seen", "1");
      } catch {
        /* ignore */
      }
      doneRef.current();
    };
    const timer = window.setTimeout(dismiss, seen ? 400 : 2150);
    el.addEventListener("click", dismiss);
    return () => {
      window.clearTimeout(timer);
      el.removeEventListener("click", dismiss);
      document.body.classList.remove("intro-lock");
    };
  }, []);

  return (
    <div id="intro-screen" ref={ref} aria-hidden="true">
      <span className="intro-corner tl">MOCHA // SYS</span>
      <span className="intro-corner br">
        EST.&nbsp;PANCHIKO
        <br />
        NO&nbsp;SIGNAL&nbsp;LOST
      </span>
      <div className="intro-tag">discord bot &mdash; booting personality</div>
      <div className="intro-wordmark">
        <span>
          MOCHA
          <span className="glitch-a" aria-hidden="true">
            MOCHA
          </span>
          <span className="glitch-b" aria-hidden="true">
            MOCHA
          </span>
        </span>
      </div>
      <div className="intro-bar-track">
        <div className="intro-bar-fill" />
      </div>
      <div className="intro-status">connecting to the hangout&hellip;</div>
      <div className="intro-skip">click anywhere to skip</div>
    </div>
  );
}

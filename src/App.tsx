import { useEffect, useRef, useState } from "react";

import Intro from "./components/Intro";
import Nav from "./components/Nav";
import Hero from "./components/Hero";
import { Ticker, Features, Premium, About } from "./components/Sections";
import { Commands, Cta, Footer } from "./components/Tail";
import { ZephyrPage } from "./pages/IndependentPages";
import { PremiumPage } from "./pages/PremiumPage";
import { CommandsPage } from "./pages/CommandsPage";
import { HelpPage } from "./pages/HelpPage";
import { TermsPage, PrivacyPage, RefundsPage } from "./pages/legal/LegalPages";
import { DocsPage } from "./pages/docs/DocsPage";
import { GettingStartedPage } from "./pages/docs/GettingStartedPage";
import { ModerationPage } from "./pages/docs/ModerationPage";
import { CommandsReferencePage } from "./pages/docs/CommandsReferencePage";
import { useRevealObserver } from "./lib/hooks";

const TICKER_A = [
  "cross-server calls",
  "full moderation",
  "giveaways built in",
  "audit log lookup",
  "custom prefixes",
  "24/7 uptime",
];

const TICKER_B = [
  "made for servers",
  "not dashboards",
  "no signal lost",
  "est. panchiko",
  "in-chat first",
  "zero setup",
];

function HomePage() {
  const [ready, setReady] = useState(false);
  const progressRef = useRef<HTMLDivElement | null>(null);
  useRevealObserver(ready);

  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        const p = max > 0 ? Math.min(window.scrollY / max, 1) : 0;
        if (progressRef.current) {
          progressRef.current.style.transform = `scaleX(${p})`;
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

  return (
    <>
      <Intro onDone={() => setReady(true)} />
      <div className="scanlines" aria-hidden="true" />
      <div className="scroll-progress" ref={progressRef} aria-hidden="true" />
      <div className="rail-label" aria-hidden="true">
        <span className="chevron-label">
          <b>M</b><i>&gt;</i><b>O</b><i>&gt;</i><b>C</b><i>&gt;</i><b>H</b><i>&gt;</i><b>A</b>
        </span>
      </div>
      <Nav />
      <main>
        <Hero ready={ready} />
        <Ticker items={TICKER_A} />
        <Features />
        <Premium />
        <About />
        <Commands />
        <Ticker items={TICKER_B} red />
        <Cta />
      </main>
      <Footer />
    </>
  );
}

export default function App() {
  const path = window.location.pathname.replace(/\/+$/, "") || "/";

  switch (path) {
    case "/zephyr":
      return <ZephyrPage />;
    case "/docs":
      return <DocsPage />;
    case "/docs/getting-started":
      return <GettingStartedPage />;
    case "/docs/moderation":
      return <ModerationPage />;
    case "/docs/commands-reference":
      return <CommandsReferencePage />;
    case "/premium":
      return <PremiumPage />;
    case "/commands":
      return <CommandsPage />;
    case "/help":
      return <HelpPage />;
    case "/terms":
      return <TermsPage />;
    case "/privacy":
      return <PrivacyPage />;
    case "/refunds":
      return <RefundsPage />;
    default:
      return <HomePage />;
  }
}

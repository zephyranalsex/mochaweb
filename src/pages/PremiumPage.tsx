import { useEffect, useState } from "react";
import { PageSection, PageShell, useParallax } from "./PageShell";
import { Icon } from "../components/ui/Icon";
import { ArrowLink, Pill, Reveal } from "../components/ui/primitives";
import {
  COMPARISON,
  PREMIUM_BENEFITS,
  PREMIUM_CATEGORIES,
  TOTAL_PLANS,
  formatPrice,
  lifetimeValue,
  lowestPrice,
  yearlySaving,
  type Plan,
  type PremiumCategory,
} from "../data/premium";
import { DISCORD_INVITE_URL, DISCORD_URL } from "../lib/site";
import { DISCORD_COMMANDS } from "../data/commands";

/* =======================================================================
   /premium — the most luxurious page on the site.
   Hierarchy first: two categories (User / Server), three cycles inside each,
   one recommended plan per category with animated emphasis.
   ======================================================================= */

function useReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function planSaving(category: PremiumCategory, plan: Plan): string {
  if (plan.cycle === "yearly") {
    const saving = yearlySaving(category);
    return `save $${formatPrice(saving.amount)} · ${saving.percent}% off monthly`;
  }
  if (plan.cycle === "lifetime") {
    const value = lifetimeValue(category);
    return `≈ ${value.months} months of monthly · pays back in ${value.years} years`;
  }
  return "billed each month";
}

function planLines(plan: Plan): string[] {
  if (plan.cycle === "monthly") return ["Every premium benefit", "Billed each month", "No year-long commitment"];
  if (plan.cycle === "yearly") return ["Every premium benefit", "Billed once a year", "Cheapest way to stay premium"];
  return ["Every premium benefit", "One payment", "Nothing renews, ever"];
}

function PlanCard({ category, plan, index }: { category: PremiumCategory; plan: Plan; index: number }) {
  const featured = Boolean(plan.recommended);

  return (
    <article
      className={`prm-plan${featured ? " prm-plan--featured" : ""}`}
      data-reveal
      style={{ "--rd": `${0.08 + index * 0.08}s` } as React.CSSProperties}
    >
      {featured ? (
        <span className="prm-stamp" aria-label="Best value">
          best value
        </span>
      ) : null}

      <div className="prm-plan-cycle">
        <span>{plan.label}</span>
        <i aria-hidden="true" />
      </div>

      <div className="prm-plan-price">
        <i>$</i>
        <b>{formatPrice(plan.price)}</b>
        <span>{plan.cadence}</span>
      </div>

      <div className="prm-plan-saving">{planSaving(category, plan)}</div>

      <p className="prm-plan-for">{plan.bestFor}</p>

      <ul className="prm-plan-list">
        {planLines(plan).map((line) => (
          <li key={line}>
            <Icon name="check" />
            {line}
          </li>
        ))}
      </ul>

      <a className="prm-plan-cta" href={DISCORD_URL} target="_blank" rel="noreferrer">
        {featured ? `Get ${category.short} ${plan.label}` : `Get ${plan.label}`}
        <Icon name="arrow-up-right" />
      </a>
    </article>
  );
}

function PlanStage({
  category,
  active,
  onActivate,
}: {
  category: PremiumCategory;
  active: boolean;
  onActivate: () => void;
}) {
  return (
    <section
      className={`prm-stage${active ? " is-active" : ""}`}
      id={`plan-${category.id}`}
      aria-label={category.label}
    >
      <button type="button" className="prm-stage-head" onClick={onActivate} aria-pressed={active}>
        <span className="prm-stage-icon">
          <Icon name={category.icon} />
        </span>
        <span className="prm-stage-title">
          <b>{category.label}</b>
          <i>{category.blurb}</i>
        </span>
        <span className="prm-stage-price">
          {category.plans.map((plan) => (
            <span key={plan.id}>
              <em>{plan.label}</em> ${formatPrice(plan.price)}
            </span>
          ))}
        </span>
      </button>

      <div className="prm-plans">
        {category.plans.map((plan, index) => (
          <PlanCard key={plan.id} category={category} plan={plan} index={index} />
        ))}
      </div>

      <p className="prm-stage-audience">
        <Icon name="info" />
        {category.audience}
      </p>
    </section>
  );
}

export function PremiumPage() {
  const [activeCategory, setActiveCategory] = useState<PremiumCategory["id"]>("user");
  const glowRef = useParallax<HTMLDivElement>(0.05);
  const reduced = useReducedMotion();

  /* keep the category switcher in sync with what is actually on screen */
  useEffect(() => {
    if (!("IntersectionObserver" in window)) return;
    const nodes = PREMIUM_CATEGORIES.map((category) => document.getElementById(`plan-${category.id}`)).filter(
      (node): node is HTMLElement => Boolean(node)
    );
    if (nodes.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.id.replace("plan-", "") as PremiumCategory["id"];
            setActiveCategory(id);
          }
        });
      },
      { rootMargin: "-30% 0px -55% 0px", threshold: 0 }
    );
    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, []);

  const jumpTo = (id: PremiumCategory["id"]) => {
    setActiveCategory(id);
    const node = document.getElementById(`plan-${id}`);
    if (node) node.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
  };

  return (
    <PageShell
      tone="premium"
      eyebrow="Product / premium"
      title={
        <>
          Premium,
          <br />
          <span className="page-title-accent">without the paywall.</span>
        </>
      }
      intro="Mocha's core functionality is free — every command on this site works without paying. Premium is the layer on top: more decorative and advanced embeds, priority usage when Mocha is under load, higher command rate limits, and additional AI-powered features."
      ghost="PREMIUM"
      sticker="face"
      rail="PREMIUM"
      crumbs={[{ href: "/", label: "Home" }, { label: "Premium" }]}
      meta={[
        <>
          <b>{TOTAL_PLANS}</b> plans
        </>,
        <>
          <b>2</b> categories
        </>,
        <>
          from <b>${formatPrice(lowestPrice(PREMIUM_CATEGORIES[0]))}</b>
        </>,
        <>monthly · yearly · lifetime</>,
      ]}
      actions={
        <>
          <ArrowLink href="#plans">see the plans</ArrowLink>
          <ArrowLink href="#compare">compare free &amp; premium</ArrowLink>
        </>
      }
    >
      {/* ---------------------------------------------------- 01 thesis -- */}
      <PageSection
        eyebrow="Premium / 01 — the idea"
        title={
          <>
            The free bot is <span className="sp-title-accent">the whole bot.</span>
          </>
        }
        lead="Premium does not unlock commands. It gives the people and servers that lean on Mocha hardest a little more polish, capacity and priority — and that is the entire pitch."
      >
        <div className="prm-thesis">
          <Reveal className="prm-thesis-card prm-thesis-card--free">
            <span className="prm-thesis-label">Free — $0</span>
            <h3>Mocha's core functionality</h3>
            <p>
              All {DISCORD_COMMANDS.length} Discord commands: cross-server calls, the moderation set, music, games,
              giveaways, quote cards and Valorant lookups. Nothing is held back.
            </p>
            <ul>
              <li>
                <Icon name="check" /> Every command, every server
              </li>
              <li>
                <Icon name="check" /> Standard embed presentation
              </li>
              <li>
                <Icon name="check" /> Standard rate limits
              </li>
            </ul>
          </Reveal>

          <Reveal delay={0.08} className="prm-thesis-card prm-thesis-card--premium">
            <span className="prm-thesis-label prm-thesis-label--gold">Premium — from ${formatPrice(lowestPrice(PREMIUM_CATEGORIES[0]))}</span>
            <h3>The same bot, with more room</h3>
            <p>
              Everything free does, plus the four things below. Choose it for your account or for a whole server, and
              pay monthly, yearly or once.
            </p>
            <ul>
              {PREMIUM_BENEFITS.map((benefit) => (
                <li key={benefit.id}>
                  <Icon name={benefit.icon} /> {benefit.title}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </PageSection>

      {/* -------------------------------------------------- 02 benefits -- */}
      <PageSection
        eyebrow="Premium / 02 — what changes"
        title="Four things get better."
        lead="This is the complete list of what Premium adds. Anything you cannot see here is either already free or does not exist yet."
      >
        <div className="prm-benefits">
          {PREMIUM_BENEFITS.map((benefit, index) => (
            <Reveal key={benefit.id} delay={index * 0.07} className="prm-benefit">
              <span className="prm-benefit-icon">
                <Icon name={benefit.icon} />
              </span>
              <span className="prm-benefit-num">{String(index + 1).padStart(2, "0")}</span>
              <h3>{benefit.title}</h3>
              <p>{benefit.copy}</p>
            </Reveal>
          ))}
        </div>
      </PageSection>

      {/* ----------------------------------------------------- 03 plans -- */}
      <PageSection
        id="plans"
        eyebrow="Premium / 03 — plans"
        title="Two categories. Three cycles. Six ways in."
        lead="User Premium follows your Discord account. Server Premium covers one server and everyone in it. Inside each category the yearly plan is the best value, and lifetime is the one that never comes back around."
        aside={
          <div className="prm-switch" role="tablist" aria-label="Premium category">
            {PREMIUM_CATEGORIES.map((category) => (
              <button
                key={category.id}
                type="button"
                role="tab"
                aria-selected={activeCategory === category.id}
                className={`prm-switch-btn${activeCategory === category.id ? " is-active" : ""}`}
                onClick={() => jumpTo(category.id)}
              >
                <Icon name={category.icon} />
                {category.short}
                <em>from ${formatPrice(lowestPrice(category))}</em>
              </button>
            ))}
            <span className="prm-switch-glide" data-active={activeCategory} aria-hidden="true" />
          </div>
        }
      >
        <div className="prm-plans-wrap">
          <div className="prm-glow" ref={glowRef} aria-hidden="true" />
          {PREMIUM_CATEGORIES.map((category) => (
            <PlanStage
              key={category.id}
              category={category}
              active={activeCategory === category.id}
              onActivate={() => jumpTo(category.id)}
            />
          ))}
        </div>

        <div className="prm-plans-note">
          <Icon name="info" />
          <p>
            Upgrades are arranged through the official Mocha server — tell us which plan you want and we will set it
            up. Questions about billing, cancellations or refunds are answered on the{" "}
            <a href="/refunds">refunds page</a>.
          </p>
        </div>
      </PageSection>

      {/* --------------------------------------------------- 04 compare -- */}
      <PageSection
        id="compare"
        eyebrow="Premium / 04 — comparison"
        title="Free, side by side with Premium."
        lead="The short version: the commands are identical. What changes is how Mocha presents them, how much of it you can do at once, and what happens when the bot is busy."
      >
        <div className="prm-compare" data-reveal>
          <div className="prm-compare-head">
            <span className="prm-compare-label">Capability</span>
            <span>Free</span>
            <span className="prm-compare-premium">
              Premium
              <Icon name="sparkles" />
            </span>
          </div>

          {COMPARISON.map((row, index) => (
            <div className="prm-compare-row" key={row.label} style={{ "--i": index } as React.CSSProperties}>
              <span className="prm-compare-label">
                {row.label}
                {row.note ? <i>{row.note}</i> : null}
              </span>
              <span data-label="Free">{row.free}</span>
              <span className="prm-compare-premium" data-label="Premium">
                {row.premium}
              </span>
            </div>
          ))}
        </div>

        <p className="prm-footnote">
          Moderation, calls, music, games and giveaways are never paywalled. Premium changes capacity and polish, not
          access.
        </p>
      </PageSection>

      {/* ----------------------------------------------- 05 which one --- */}
      <PageSection
        eyebrow="Premium / 05 — choosing"
        title="User, or server?"
        lead="Same four benefits, two different scopes. Pick the one that matches where you actually use Mocha."
      >
        <div className="prm-choose">
          {PREMIUM_CATEGORIES.map((category, index) => (
            <Reveal key={category.id} delay={index * 0.08} className="prm-choose-card panel panel--ticks">
              <span className="prm-choose-icon">
                <Icon name={category.icon} />
              </span>
              <h3>{category.label}</h3>
              <p>{category.audience}</p>
              <div className="prm-choose-meta">
                {category.plans.map((plan) => (
                  <span key={plan.id}>
                    {plan.label} <b>${formatPrice(plan.price)}</b>
                  </span>
                ))}
              </div>
              <ArrowLink href={`#plan-${category.id}`}>see {category.short.toLowerCase()} plans</ArrowLink>
            </Reveal>
          ))}
        </div>

        <p className="prm-footnote">
          Not sure which one fits? Ask in the support server and we will point you at the right one rather than the
          expensive one.
        </p>
      </PageSection>

      {/* ------------------------------------------- 06 reserved slot --- */}
      <PageSection
        eyebrow="Premium / 06 — next"
        title="One more thing is coming."
        lead="This space is reserved on purpose. There is nothing to announce yet, and no filler to pretend otherwise — when the next Mocha feature is ready, it lands here, beside the plans above."
      >
        <div className="prm-next" data-reveal>
          <span className="prm-next-watermark" aria-hidden="true">
            SOON
          </span>
          <div className="prm-next-head">
            <Pill tone="gold">
              <span className="prm-next-dot" aria-hidden="true" />
              in progress
            </Pill>
            <span className="prm-next-slot">slot 04 / reserved</span>
          </div>
          <h3>The next feature will appear here.</h3>
          <p>
            Everything Premium does today is listed above and included in every plan — monthly, yearly and lifetime.
            When the next feature ships, this section becomes its home: what it does, who it is for, and which plans
            carry it.
          </p>
          <div className="prm-next-ghosts" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
          <div className="prm-next-foot">
            <ArrowLink href={DISCORD_URL} external>
              hear about it first
            </ArrowLink>
          </div>
        </div>
      </PageSection>

      {/* ------------------------------------------------------ 07 cta --- */}
      <Reveal className="prm-cta">
        <div className="prm-cta-copy">
          <span className="panel-kicker">Ready when you are</span>
          <h3>
            Keep Mocha free.
            <br />
            <span className="prm-cta-accent">Or give it more room.</span>
          </h3>
          <p>
            Add the bot to your server first — everything essential works. Come back for Premium when the rate limits,
            the load or the polish start to matter.
          </p>
        </div>
        <div className="prm-cta-actions">
          <a className="prm-cta-btn" href={DISCORD_INVITE_URL} target="_blank" rel="noreferrer">
            <Icon name="discord" filled />
            Add Mocha to a server
          </a>
          <a className="prm-cta-btn prm-cta-btn--ghost" href={DISCORD_URL} target="_blank" rel="noreferrer">
            Get Premium via the support server
            <Icon name="arrow-up-right" />
          </a>
          <div className="prm-cta-links">
            <a href="/refunds">Refunds</a>
            <a href="/terms">Terms</a>
            <a href="/privacy">Privacy</a>
            <a href="/commands">Commands</a>
          </div>
        </div>
      </Reveal>
    </PageShell>
  );
}

export default PremiumPage;

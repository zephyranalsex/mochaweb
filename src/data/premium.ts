import type { IconName } from "../components/ui/Icon";

/**
 * Mocha Premium — the six offerings (two categories x three cycles) and the
 * benefit list. Prices are the real ones; every "save X" figure shown in the
 * UI is derived from them here rather than written by hand, so the page can
 * never disagree with the numbers.
 */

export type PlanCycle = "monthly" | "yearly" | "lifetime";

export type Plan = {
  id: string;
  cycle: PlanCycle;
  label: string;
  price: number;
  /** Billing line under the price. */
  cadence: string;
  /** One-line "who this is for". */
  bestFor: string;
  recommended?: boolean;
};

export type PremiumCategory = {
  id: "user" | "server";
  label: string;
  short: string;
  icon: IconName;
  blurb: string;
  audience: string;
  plans: Plan[];
};

export const PREMIUM_CATEGORIES: PremiumCategory[] = [
  {
    id: "user",
    label: "User Premium",
    short: "User",
    icon: "user",
    blurb: "Tied to your Discord account — it travels with you.",
    audience: "For the person who wants Mocha to feel better everywhere they use it.",
    plans: [
      {
        id: "user-monthly",
        cycle: "monthly",
        label: "Monthly",
        price: 2.99,
        cadence: "per month",
        bestFor: "Month to month, cancel whenever.",
      },
      {
        id: "user-yearly",
        cycle: "yearly",
        label: "Yearly",
        price: 8.99,
        cadence: "per year",
        bestFor: "The cheapest way to keep it for a year.",
        recommended: true,
      },
      {
        id: "user-lifetime",
        cycle: "lifetime",
        label: "Lifetime",
        price: 14.99,
        cadence: "one payment",
        bestFor: "Pay once, never think about it again.",
      },
    ],
  },
  {
    id: "server",
    label: "Server Premium",
    short: "Server",
    icon: "server",
    blurb: "Tied to one server — everyone in it gets the upgrade.",
    audience: "For communities that run Mocha hard: busy voice channels, big moderation teams, constant giveaways.",
    plans: [
      {
        id: "server-monthly",
        cycle: "monthly",
        label: "Monthly",
        price: 4.99,
        cadence: "per month",
        bestFor: "Try it on your server for a month.",
      },
      {
        id: "server-yearly",
        cycle: "yearly",
        label: "Yearly",
        price: 10.99,
        cadence: "per year",
        bestFor: "A year of headroom for less than ten months.",
        recommended: true,
      },
      {
        id: "server-lifetime",
        cycle: "lifetime",
        label: "Lifetime",
        price: 19.99,
        cadence: "one payment",
        bestFor: "One purchase, for as long as the server runs.",
      },
    ],
  },
];

export type Benefit = {
  id: string;
  title: string;
  copy: string;
  icon: IconName;
};

/** The four things Premium adds. Nothing beyond these is claimed anywhere. */
export const PREMIUM_BENEFITS: Benefit[] = [
  {
    id: "embeds",
    title: "More decorative, advanced embeds",
    copy:
      "The same commands, presented with more craft — richer and more decorative embed layouts wherever Mocha replies to you.",
    icon: "layers",
  },
  {
    id: "priority",
    title: "Priority during high load",
    copy:
      "When Mocha is flat out, premium users and servers are handled first instead of waiting in the same queue as everyone else.",
    icon: "bolt",
  },
  {
    id: "limits",
    title: "Higher command rate limits",
    copy:
      "More room between commands before Mocha asks you to slow down — useful for busy voice channels, moderation sweeps and back-to-back giveaways.",
    icon: "gauge",
  },
  {
    id: "ai",
    title: "Additional AI-powered features",
    copy:
      "Premium is where the AI-driven extras land as they are built, on top of everything the free bot already does.",
    icon: "sparkles",
  },
];

export type ComparisonRow = {
  label: string;
  free: string;
  premium: string;
  note?: string;
};

export const COMPARISON: ComparisonRow[] = [
  {
    label: "Every Mocha command",
    free: "Included",
    premium: "Included",
    note: "Calls, moderation, music, games, giveaways, quotes and Valorant lookups — none of it is paywalled.",
  },
  {
    label: "Embed presentation",
    free: "Standard",
    premium: "More decorative & advanced",
  },
  {
    label: "Command rate limits",
    free: "Standard",
    premium: "Higher",
  },
  {
    label: "Periods of high load",
    free: "Standard",
    premium: "Priority usage",
  },
  {
    label: "AI-powered features",
    free: "—",
    premium: "Additional features",
  },
];

/* ------------------------------------------------------------ derived -- */

export function formatPrice(value: number): string {
  return value.toFixed(2);
}

function plan(category: PremiumCategory, cycle: PlanCycle): Plan {
  return category.plans.find((entry) => entry.cycle === cycle) as Plan;
}

/** What the yearly plan saves against twelve months of the monthly plan. */
export function yearlySaving(category: PremiumCategory) {
  const monthlyTotal = plan(category, "monthly").price * 12;
  const yearly = plan(category, "yearly").price;
  return {
    amount: monthlyTotal - yearly,
    percent: Math.round((1 - yearly / monthlyTotal) * 100),
    monthlyTotal,
  };
}

/** Lifetime expressed in months of the monthly plan, and years of the yearly plan. */
export function lifetimeValue(category: PremiumCategory) {
  const lifetime = plan(category, "lifetime").price;
  const months = lifetime / plan(category, "monthly").price;
  const years = lifetime / plan(category, "yearly").price;
  return {
    months: Math.round(months * 10) / 10,
    years: Math.round(years * 10) / 10,
  };
}

export function lowestPrice(category: PremiumCategory): number {
  return Math.min(...category.plans.map((entry) => entry.price));
}

export const TOTAL_PLANS = PREMIUM_CATEGORIES.reduce((total, category) => total + category.plans.length, 0);

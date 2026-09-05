/** Site-wide links + navigation definitions shared by the standalone pages. */

export const DISCORD_URL = "https://discord.gg/HK4Cg3hw59";

/** Bot invite used by the nav and the CTAs (same target as the homepage nav). */
export const DISCORD_INVITE_URL =
  "https://discord.com/oauth2/authorize?client_id=1544448518310199427&permissions=8&integration_type=0&scope=bot";

export type NavRoute = {
  href: string;
  label: string;
  /** Short label used inside the compact / mobile nav. */
  short?: string;
  /** Matches the route and everything below it (e.g. /docs/*). */
  match?: "exact" | "prefix";
};

export const STANDALONE_NAV: NavRoute[] = [
  { href: "/commands", label: "Commands", match: "prefix" },
  { href: "/premium", label: "Premium", match: "exact" },
  { href: "/docs", label: "Docs", match: "prefix" },
  { href: "/help", label: "Help", match: "exact" },
];

export const DOCS_NAV: { href: string; label: string; group: string }[] = [
  { href: "/docs", label: "Overview", group: "Start here" },
  { href: "/docs/getting-started", label: "Getting started", group: "Start here" },
  { href: "/docs/moderation", label: "Moderation", group: "Guides" },
  { href: "/docs/commands-reference", label: "Using commands", group: "Guides" },
];

export function currentPath(): string {
  if (typeof window === "undefined") return "/";
  return window.location.pathname.replace(/\/+$/, "") || "/";
}

export function isRouteActive(route: NavRoute, path = currentPath()): boolean {
  if (route.match === "prefix") return path === route.href || path.startsWith(`${route.href}/`);
  return path === route.href;
}

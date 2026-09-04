import type { ReactElement, SVGProps } from "react";

/**
 * Single icon set for the standalone pages.
 *
 * Every glyph follows the language already used by the homepage nav/feature
 * icons: 24x24 viewBox, `currentColor`, 1.6 stroke, round caps. That keeps the
 * subpages reading as the same product instead of a second icon library.
 */

export type IconName =
  | "arrow-up-right"
  | "arrow-right"
  | "arrow-left"
  | "chevron-down"
  | "chevron-right"
  | "search"
  | "close"
  | "copy"
  | "check"
  | "menu"
  | "terminal"
  | "music"
  | "gamepad"
  | "shield"
  | "gift"
  | "quote"
  | "target"
  | "signal"
  | "sparkles"
  | "star"
  | "user"
  | "server"
  | "bolt"
  | "gauge"
  | "layers"
  | "lock"
  | "book"
  | "lifebuoy"
  | "compass"
  | "info"
  | "alert"
  | "bulb"
  | "slash"
  | "clock"
  | "grid"
  | "list"
  | "plus"
  | "discord"
  | "settings"
  | "logout"
  | "hash";

const PATHS: Record<IconName, ReactElement> = {
  "arrow-up-right": <path d="M7 17 17 7M9 7h8v8" strokeLinecap="round" strokeLinejoin="round" />,
  "arrow-right": <path d="M4 12h15m-5.5-5.5L19 12l-5.5 5.5" strokeLinecap="round" strokeLinejoin="round" />,
  "arrow-left": <path d="M20 12H5m5.5-5.5L5 12l5.5 5.5" strokeLinecap="round" strokeLinejoin="round" />,
  "chevron-down": <path d="m6 9.5 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />,
  "chevron-right": <path d="m9.5 6 6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />,
  search: (
    <>
      <circle cx="11" cy="11" r="6.4" />
      <path d="m16 16 4 4" strokeLinecap="round" />
    </>
  ),
  close: <path d="M6.5 6.5l11 11m0-11-11 11" strokeLinecap="round" />,
  copy: (
    <>
      <rect x="9" y="9" width="11" height="11" rx="2.2" />
      <path d="M15 5.8A1.8 1.8 0 0 0 13.2 4H5.8A1.8 1.8 0 0 0 4 5.8v7.4A1.8 1.8 0 0 0 5.8 15" strokeLinecap="round" />
    </>
  ),
  check: <path d="m5 12.5 4.5 4.5L19 7" strokeLinecap="round" strokeLinejoin="round" />,
  menu: <path d="M4 7.5h16M4 12h16M4 16.5h11" strokeLinecap="round" />,
  terminal: (
    <>
      <rect x="3" y="4.5" width="18" height="15" rx="2.4" />
      <path d="m7.5 10 2.4 2.4-2.4 2.4M12.6 15.2h4" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  music: (
    <>
      <path d="M9 18V6.6l10-2v11" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="6.6" cy="18" r="2.4" />
      <circle cx="16.6" cy="15.6" r="2.4" />
    </>
  ),
  gamepad: (
    <>
      <path d="M7.4 8h9.2a4.4 4.4 0 0 1 4.34 3.63l.8 4.5A2.6 2.6 0 0 1 19.2 19l-1.7-1.9a2 2 0 0 0-1.5-.7H8a2 2 0 0 0-1.5.7L4.8 19a2.6 2.6 0 0 1-2.54-2.87l.8-4.5A4.4 4.4 0 0 1 7.4 8Z" strokeLinejoin="round" />
      <path d="M7 12v2.4M5.8 13.2h2.4M15.6 12.6h.01M17.8 14.4h.01" strokeLinecap="round" />
    </>
  ),
  shield: (
    <>
      <path d="M12 3.2 19.2 6v6c0 4.6-3 7.9-7.2 9.8C7.8 19.9 4.8 16.6 4.8 12V6L12 3.2Z" strokeLinejoin="round" />
      <path d="m9.2 12.2 2.1 2.1 3.9-4.4" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  gift: (
    <>
      <rect x="3.6" y="9" width="16.8" height="11.4" rx="1.8" />
      <path d="M3.6 13.4h16.8M12 9v11.4" />
      <path d="M12 9S10.9 4.6 8.6 4.6a2.2 2.2 0 0 0 0 4.4H12Zm0 0s1.1-4.4 3.4-4.4a2.2 2.2 0 0 1 0 4.4H12Z" strokeLinejoin="round" />
    </>
  ),
  quote: (
    <>
      <path d="M9.6 6.4C6.9 7.5 5.2 9.9 5.2 12.9c0 2.6 1.5 4.4 3.6 4.4 1.8 0 3.1-1.3 3.1-3 0-1.8-1.2-3-2.9-3-.3 0-.6 0-.8.1.3-1.4 1.3-2.6 2.7-3.3l-1.3-1.7ZM18.4 6.4c-2.7 1.1-4.4 3.5-4.4 6.5 0 2.6 1.5 4.4 3.6 4.4 1.8 0 3.1-1.3 3.1-3 0-1.8-1.2-3-2.9-3-.3 0-.6 0-.8.1.3-1.4 1.3-2.6 2.7-3.3l-1.3-1.7Z" strokeLinejoin="round" />
    </>
  ),
  target: (
    <>
      <circle cx="12" cy="12" r="8.2" />
      <circle cx="12" cy="12" r="3.6" />
      <path d="M12 1.8v3.4M12 18.8v3.4M1.8 12h3.4M18.8 12h3.4" strokeLinecap="round" />
    </>
  ),
  signal: (
    <>
      <path d="M8.6 15.4c-2.2-2.2-2.2-5.8 0-8M5.6 18.4c-3.9-3.9-3.9-10.1 0-14M15.4 8.6c2.2 2.2 2.2 5.8 0 8M18.4 5.6c3.9 3.9 3.9 10.1 0 14" strokeLinecap="round" />
      <circle cx="12" cy="12" r="1.6" />
    </>
  ),
  sparkles: (
    <>
      <path d="m12 3.6 1.9 4.5 4.5 1.9-4.5 1.9L12 16.4l-1.9-4.5-4.5-1.9 4.5-1.9L12 3.6Z" strokeLinejoin="round" />
      <path d="M18.4 15.2l.8 1.9 1.9.8-1.9.8-.8 1.9-.8-1.9-1.9-.8 1.9-.8.8-1.9ZM5.2 14l.6 1.4 1.4.6-1.4.6-.6 1.4-.6-1.4L3.2 16l1.4-.6L5.2 14Z" strokeLinejoin="round" />
    </>
  ),
  star: <path d="m12 3.4 2.5 5.1 5.6.8-4 3.9 1 5.6-5.1-2.7-5 2.7 1-5.6-4.1-3.9 5.6-.8L12 3.4Z" strokeLinejoin="round" />,
  user: (
    <>
      <circle cx="12" cy="8.4" r="3.6" />
      <path d="M5.2 19.6c.7-3.3 3.5-5.2 6.8-5.2s6.1 1.9 6.8 5.2" strokeLinecap="round" />
    </>
  ),
  server: (
    <>
      <rect x="3.4" y="4.4" width="17.2" height="6.2" rx="1.8" />
      <rect x="3.4" y="13.4" width="17.2" height="6.2" rx="1.8" />
      <path d="M7 7.5h.01M7 16.5h.01M10.4 7.5h3M10.4 16.5h3" strokeLinecap="round" />
    </>
  ),
  bolt: <path d="M13.6 2.8 5.4 13.4h5.2l-.8 7.8 8.2-10.6h-5.2l.8-7.8Z" strokeLinejoin="round" />,
  gauge: (
    <>
      <path d="M4 17.4a9 9 0 1 1 16 0" strokeLinecap="round" />
      <path d="m12 13.6 3.6-3.4" strokeLinecap="round" />
      <circle cx="12" cy="14.6" r="1.5" />
    </>
  ),
  layers: (
    <>
      <path d="m12 3.6 8.4 4.2-8.4 4.2L3.6 7.8 12 3.6Z" strokeLinejoin="round" />
      <path d="m4.4 12 7.6 3.8L19.6 12M4.4 16.2l7.6 3.8 7.6-3.8" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  lock: (
    <>
      <rect x="4.8" y="10.4" width="14.4" height="9.6" rx="2.2" />
      <path d="M8.4 10.4V8a3.6 3.6 0 0 1 7.2 0v2.4" strokeLinecap="round" />
    </>
  ),
  book: (
    <>
      <path d="M6 4.75A2.75 2.75 0 0 1 8.75 2H20v17.25A2.75 2.75 0 0 0 17.25 16.5H6A2.75 2.75 0 0 0 3.25 19.25V5.5A.75.75 0 0 1 4 4.75H6Z" strokeLinejoin="round" />
      <path d="M6 4.75v11.75" />
    </>
  ),
  lifebuoy: (
    <>
      <circle cx="12" cy="12" r="8.6" />
      <circle cx="12" cy="12" r="3.6" />
      <path d="m6 6 3.5 3.5M18 6l-3.5 3.5M18 18l-3.5-3.5M6 18l3.5-3.5" strokeLinecap="round" />
    </>
  ),
  compass: (
    <>
      <circle cx="12" cy="12" r="8.6" />
      <path d="m15.4 8.6-2 4.8-4.8 2 2-4.8 4.8-2Z" strokeLinejoin="round" />
    </>
  ),
  info: (
    <>
      <circle cx="12" cy="12" r="8.6" />
      <path d="M12 11v5.4M12 7.9h.01" strokeLinecap="round" />
    </>
  ),
  alert: (
    <>
      <path d="M12 4.2 21 19.4H3L12 4.2Z" strokeLinejoin="round" />
      <path d="M12 10v4M12 16.8h.01" strokeLinecap="round" />
    </>
  ),
  bulb: (
    <>
      <path d="M9.2 17.4a6 6 0 1 1 5.6 0v1.8a1.8 1.8 0 0 1-1.8 1.8h-2a1.8 1.8 0 0 1-1.8-1.8v-1.8Z" strokeLinejoin="round" />
      <path d="M9.6 17.4h4.8" strokeLinecap="round" />
    </>
  ),
  slash: <path d="m14.4 4.6-4.8 14.8M8 8.4 4.6 12 8 15.6M16 8.4 19.4 12 16 15.6" strokeLinecap="round" strokeLinejoin="round" />,
  clock: (
    <>
      <circle cx="12" cy="12" r="8.4" />
      <path d="M12 7.4V12l3 1.8" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  grid: (
    <>
      <rect x="3.6" y="3.6" width="7" height="7" rx="1.6" />
      <rect x="13.4" y="3.6" width="7" height="7" rx="1.6" />
      <rect x="3.6" y="13.4" width="7" height="7" rx="1.6" />
      <rect x="13.4" y="13.4" width="7" height="7" rx="1.6" />
    </>
  ),
  list: <path d="M4 6.6h16M4 12h16M4 17.4h10" strokeLinecap="round" />,
  plus: <path d="M12 5v14M5 12h14" strokeLinecap="round" />,
  discord: (
    <path
      d="M19.54 5.33A16.9 16.9 0 0 0 15.43 4l-.5 1.03a14.2 14.2 0 0 0-5.86 0L8.57 4a16.8 16.8 0 0 0-4.1 1.33C1.88 9.36 1.17 13.3 1.52 17.19a16.98 16.98 0 0 0 5.05 2.58l1.09-1.48c-.6-.22-1.17-.49-1.71-.8l.41-.31c3.29 1.55 7.06 1.55 10.31 0l.42.31c-.54.31-1.11.58-1.71.8l1.09 1.48a16.9 16.9 0 0 0 5.05-2.58c.41-4.51-.69-8.41-2.98-11.86ZM8.5 15.56c-.98 0-1.79-.89-1.79-1.98s.79-1.98 1.79-1.98 1.8.89 1.79 1.98c0 1.09-.79 1.98-1.79 1.98Zm7 0c-.98 0-1.79-.89-1.79-1.98s.79-1.98 1.79-1.98 1.8.89 1.79 1.98c0 1.09-.79 1.98-1.79 1.98Z"
      fill="currentColor"
      stroke="none"
    />
  ),
  settings: (
    <>
      <circle cx="12" cy="12" r="2.9" />
      <path
        d="M19.4 13.6a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V19.6a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1.08-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H4.4a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1.08 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H10.4a1.65 1.65 0 0 0 1-1.51V4.4a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V10.4a1.65 1.65 0 0 0 1.51 1h.09a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z"
        strokeLinejoin="round"
      />
    </>
  ),
  logout: (
    <path
      d="M9 4.5H6.75A2.25 2.25 0 0 0 4.5 6.75v10.5A2.25 2.25 0 0 0 6.75 19.5H9M15.5 15.5 20 12l-4.5-3.5M20 12H9.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),
  hash: <path d="M6 9.6h13M5 14.6h13M10.4 4.6 8.6 19.4M16 4.6l-1.8 14.8" strokeLinecap="round" />,
};

type IconProps = SVGProps<SVGSVGElement> & {
  name: IconName;
  /** Icons that are purely decorative (most of them) get aria-hidden by default. */
  filled?: boolean;
};

export function Icon({ name, filled = false, ...rest }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke={filled ? "none" : "currentColor"}
      strokeWidth={1.6}
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      {PATHS[name]}
    </svg>
  );
}

/** The Discord wordmark glyph, filled, for the invite buttons. */
export function DiscordGlyph(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" {...props}>
      {PATHS.discord}
    </svg>
  );
}

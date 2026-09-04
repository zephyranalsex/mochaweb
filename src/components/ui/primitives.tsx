import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { Icon, type IconName } from "./Icon";

/* ------------------------------------------------------------------ *
 * Small shared primitives for the standalone pages.
 * Everything here reuses the homepage's visual language: mono eyebrows,
 * hairline borders, hard offset shadows, red/cyan accents, sticker chips.
 * ------------------------------------------------------------------ */

const rd = (delay: number) => ({ "--rd": `${delay}s` }) as CSSProperties;

/** Scroll-reveal wrapper. PageShell installs the observer for `[data-reveal]`. */
export function Reveal({
  children,
  delay = 0,
  className,
  style,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <div className={className} data-reveal style={{ ...rd(delay), ...style }}>
      {children}
    </div>
  );
}

/** Mono kicker used above section headings ("Premium / 02 — plans"). */
export function Eyebrow({
  children,
  className = "",
  delay = 0,
  reveal = true,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  reveal?: boolean;
}) {
  return (
    <div
      className={`section-eyebrow ${className}`.trim()}
      {...(reveal ? { "data-reveal": true, style: rd(delay) } : {})}
    >
      {children}
    </div>
  );
}

/** Heading + optional lead paragraph, revealed as a unit. */
export function SectionHead({
  eyebrow,
  title,
  lead,
  aside,
  delay = 0,
  align = "left",
}: {
  eyebrow?: ReactNode;
  title: ReactNode;
  lead?: ReactNode;
  aside?: ReactNode;
  delay?: number;
  align?: "left" | "split";
}) {
  return (
    <div className={`sp-head${align === "split" ? " sp-head--split" : ""}`}>
      <div>
        {eyebrow ? <Eyebrow delay={delay}>{eyebrow}</Eyebrow> : null}
        <h2 className="sp-title" data-reveal style={rd(delay + 0.06)}>
          {title}
        </h2>
        {lead ? (
          <p className="sp-lead" data-reveal style={rd(delay + 0.12)}>
            {lead}
          </p>
        ) : null}
      </div>
      {aside ? (
        <div className="sp-head-aside" data-reveal style={rd(delay + 0.16)}>
          {aside}
        </div>
      ) : null}
    </div>
  );
}

async function writeClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // fall through to the legacy path
  }
  try {
    const area = document.createElement("textarea");
    area.value = text;
    area.setAttribute("readonly", "");
    area.style.position = "fixed";
    area.style.opacity = "0";
    document.body.appendChild(area);
    area.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(area);
    return ok;
  } catch {
    return false;
  }
}

/** Copy-to-clipboard chip with honest success feedback. */
export function CopyButton({
  value,
  label = "copy",
  className = "",
  variant = "chip",
}: {
  value: string;
  label?: string;
  className?: string;
  variant?: "chip" | "ghost" | "block";
}) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (timer.current) window.clearTimeout(timer.current);
    },
    []
  );

  const copy = useCallback(
    async (event: React.MouseEvent) => {
      event.preventDefault();
      event.stopPropagation();
      const ok = await writeClipboard(value);
      if (!ok) return;
      setCopied(true);
      if (timer.current) window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setCopied(false), 1600);
    },
    [value]
  );

  return (
    <button
      type="button"
      className={`copy-btn copy-btn--${variant}${copied ? " is-copied" : ""} ${className}`.trim()}
      onClick={copy}
      aria-label={copied ? "Copied to clipboard" : `Copy ${value}`}
    >
      <Icon name={copied ? "check" : "copy"} />
      <span>{copied ? "copied" : label}</span>
    </button>
  );
}

type Token =
  | { kind: "slash" }
  | { kind: "name"; text: string }
  | { kind: "sub"; text: string }
  | { kind: "req"; text: string }
  | { kind: "opt"; text: string }
  | { kind: "plain"; text: string };

/**
 * Renders a command signature with syntax colouring:
 *   /mute <user> <minutes> [reason]
 * Slash, command name, subcommand, required and optional arguments each get
 * their own treatment so the notation teaches itself.
 */
export function Signature({ value, className = "" }: { value: string; className?: string }) {
  const parts = value.trim().split(/\s+/);
  const tokens: Token[] = [];

  parts.forEach((part, index) => {
    if (index === 0) {
      if (part.startsWith("/")) {
        tokens.push({ kind: "slash" });
        tokens.push({ kind: "name", text: part.slice(1) });
      } else if (part.toLowerCase() === "mocha") {
        tokens.push({ kind: "name", text: part });
      } else {
        tokens.push({ kind: "name", text: part });
      }
      return;
    }

    if (part.startsWith("<") && part.endsWith(">")) {
      tokens.push({ kind: "req", text: part.slice(1, -1) });
      return;
    }
    if (part.startsWith("[") && part.endsWith("]")) {
      tokens.push({ kind: "opt", text: part.slice(1, -1) });
      return;
    }
    if (/^[a-z0-9-]+$/i.test(part)) {
      tokens.push({ kind: "sub", text: part });
      return;
    }
    tokens.push({ kind: "plain", text: part });
  });

  return (
    <code className={`sig ${className}`.trim()}>
      {tokens.map((token, index) => {
        switch (token.kind) {
          case "slash":
            return (
              <span className="sig-slash" key={`s-${index}`}>
                /
              </span>
            );
          case "name":
            return (
              <span className="sig-name" key={`n-${index}`}>
                {token.text}
              </span>
            );
          case "sub":
            return (
              <span className="sig-sub" key={`b-${index}`}>
                {token.text}
              </span>
            );
          case "req":
            return (
              <span className="sig-arg sig-arg--req" key={`r-${index}`}>
                <i>&lt;</i>
                {token.text}
                <i>&gt;</i>
              </span>
            );
          case "opt":
            return (
              <span className="sig-arg sig-arg--opt" key={`o-${index}`}>
                <i>[</i>
                {token.text}
                <i>]</i>
              </span>
            );
          default:
            return (
              <span className="sig-plain" key={`p-${index}`}>
                {token.text}
              </span>
            );
        }
      })}
    </code>
  );
}

/** Inline note / tip / warning block used across docs and legal pages. */
export function Callout({
  tone = "note",
  title,
  icon,
  children,
}: {
  tone?: "note" | "tip" | "warn" | "premium";
  title?: ReactNode;
  icon?: IconName;
  children: ReactNode;
}) {
  const glyph: IconName = icon ?? (tone === "tip" ? "bulb" : tone === "warn" ? "alert" : tone === "premium" ? "sparkles" : "info");
  return (
    <aside className={`callout callout--${tone}`}>
      <span className="callout-icon">
        <Icon name={glyph} />
      </span>
      <div className="callout-body">
        {title ? <div className="callout-title">{title}</div> : null}
        <div className="callout-copy">{children}</div>
      </div>
    </aside>
  );
}

/** Small mono pill (facet chips, metadata, statuses). */
export function Pill({
  children,
  tone = "neutral",
  className = "",
}: {
  children: ReactNode;
  tone?: "neutral" | "red" | "cyan" | "blue" | "gold" | "outline";
  className?: string;
}) {
  return <span className={`pill pill--${tone} ${className}`.trim()}>{children}</span>;
}

/** Sticker-style CTA button, matching the homepage `.btn-sticker`. */
export function StickerButton({
  href,
  children,
  outline = false,
  external = false,
  onClick,
  className = "",
}: {
  href?: string;
  children: ReactNode;
  outline?: boolean;
  external?: boolean;
  onClick?: () => void;
  className?: string;
}) {
  const content = (
    <>
      <span className="shard" />
      <span className={`plate${outline ? " plate--outline" : ""}`}>{children}</span>
    </>
  );

  if (href) {
    return (
      <a
        className={`btn-sticker ${className}`.trim()}
        href={href}
        {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
      >
        {content}
      </a>
    );
  }

  return (
    <button type="button" className={`btn-sticker btn-sticker--button ${className}`.trim()} onClick={onClick}>
      {content}
    </button>
  );
}

/** Text link with the animated arrow used across the site. */
export function ArrowLink({
  href,
  children,
  external = false,
  className = "",
  onClick,
}: {
  href: string;
  children: ReactNode;
  external?: boolean;
  className?: string;
  onClick?: () => void;
}) {
  return (
    <a
      className={`arrow-link ${className}`.trim()}
      href={href}
      onClick={onClick}
      {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
    >
      {children}
      <Icon name="arrow-up-right" />
    </a>
  );
}

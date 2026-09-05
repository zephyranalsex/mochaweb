import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { PageShell } from "./PageShell";
import {
  CATEGORIES,
  CATEGORY_BY_ID,
  COMMANDS,
  DISCORD_COMMANDS,
  commandNames,
  commandSearchText,
  primarySignature,
  type Command,
} from "../data/commands";
import { Icon } from "../components/ui/Icon";
import { ArrowLink, CopyButton, Pill, Reveal, Signature, StickerButton } from "../components/ui/primitives";
import { DISCORD_INVITE_URL } from "../lib/site";

/* =======================================================================
   /commands — the complete visual index of every Mocha command.
   ======================================================================= */

type FormFilter = "all" | "slash" | "text";
type ScopeFilter = "all" | "everyone" | "server";

const SUGGESTIONS = ["mute", "queue", "giveaway", "role", "call", "prefix", "loop"];

function readParams() {
  if (typeof window === "undefined") return { q: "", c: "all", cmd: "" };
  const params = new URLSearchParams(window.location.search);
  const category = params.get("c") ?? "all";
  return {
    q: params.get("q") ?? "",
    c: CATEGORY_BY_ID[category] ? category : "all",
    cmd: params.get("cmd") ?? "",
  };
}

function Highlight({ text, query }: { text: string; query: string }) {
  const needle = query.trim();
  if (needle.length < 2) return <>{text}</>;
  const index = text.toLowerCase().indexOf(needle.toLowerCase());
  if (index === -1) return <>{text}</>;
  return (
    <>
      {text.slice(0, index)}
      <mark className="cmd-hit">{text.slice(index, index + needle.length)}</mark>
      {text.slice(index + needle.length)}
    </>
  );
}

function availability(command: Command): { label: string; tone: "neutral" | "cyan" | "blue" } {
  if (command.slash && command.prefix) return { label: "slash + text", tone: "cyan" };
  if (command.slash) return { label: "slash", tone: "blue" };
  return { label: "text", tone: "neutral" };
}

function matchesForm(command: Command, form: FormFilter) {
  if (form === "slash") return Boolean(command.slash);
  if (form === "text") return Boolean(command.prefix);
  return true;
}

function score(command: Command, query: string) {
  const needle = query.trim().toLowerCase();
  if (!needle) return 0;
  const names = commandNames(command).map((name) => name.toLowerCase());
  if (names.includes(needle)) return 0;
  if (names.some((name) => name.startsWith(needle))) return 1;
  if (names.some((name) => name.includes(needle))) return 2;
  return 3;
}

/* ------------------------------------------------------------------ */

function CommandRow({
  command,
  index,
  open,
  onToggle,
  query,
  registerRef,
}: {
  command: Command;
  index: number;
  open: boolean;
  onToggle: () => void;
  query: string;
  registerRef: (id: string, el: HTMLElement | null) => void;
}) {
  const info = availability(command);
  const panelId = `cmd-panel-${command.id}`;

  return (
    <div
      className={`cmd-item${open ? " is-open" : ""}`}
      style={{ "--i": index } as React.CSSProperties}
      ref={(el) => registerRef(command.id, el)}
    >
      <button
        type="button"
        className="cmd-item-head"
        onClick={onToggle}
        aria-expanded={open}
        aria-controls={panelId}
      >
        <span className="cmd-item-caret" aria-hidden="true">
          <Icon name="chevron-down" />
        </span>

        <span className="cmd-item-sig">
          <Signature value={primarySignature(command)} />
        </span>

        <span className="cmd-item-desc">
          <Highlight text={command.description} query={query} />
        </span>

        <span className="cmd-item-tags">
          <Pill tone={info.tone}>{info.label}</Pill>
          {command.scope === "server" ? (
            <Pill tone="red" className="pill--keep">
              <Icon name="shield" />
              server
            </Pill>
          ) : null}
        </span>
      </button>

      <div className="cmd-item-panel" id={panelId} role="region" aria-label={`${command.name} details`}>
        <div className="cmd-item-panel-inner">
          <div className="cmd-item-body">
            <div className="cmd-forms">
              {command.slash ? (
                <div className="cmd-form">
                  <span className="cmd-form-label">slash</span>
                  <Signature value={command.slash} />
                  <CopyButton value={command.slash} variant="ghost" label="copy" />
                </div>
              ) : null}
              {command.prefix ? (
                <div className="cmd-form">
                  <span className="cmd-form-label">text</span>
                  <Signature value={command.prefix} />
                  <CopyButton value={command.prefix} variant="ghost" label="copy" />
                </div>
              ) : null}
            </div>

            {command.args && command.args.length ? (
              <div className="cmd-args">
                <div className="cmd-args-title">arguments</div>
                {command.args.map((arg) => (
                  <div className={`cmd-arg cmd-arg--${arg.required ? "req" : "opt"}`} key={arg.name}>
                    <span className="cmd-arg-name">
                      {arg.required ? <i>&lt;</i> : <i>[</i>}
                      {arg.name}
                      {arg.required ? <i>&gt;</i> : <i>]</i>}
                    </span>
                    <span className="cmd-arg-desc">{arg.description}</span>
                  </div>
                ))}
              </div>
            ) : null}

            {command.subcommands && command.subcommands.length ? (
              <div className="cmd-args">
                <div className="cmd-sub-title">subcommands</div>
                <div className="cmd-subcommands">
                  {command.subcommands.map((sub) => (
                    <div className="cmd-sub" key={sub.name}>
                      <Signature value={sub.slash} />
                      <p>{sub.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {command.example ? (
              <div className="cmd-example">
                <span className="cmd-example-label">example</span>
                <code>{command.example}</code>
                <CopyButton value={command.example} variant="ghost" label="copy" />
              </div>
            ) : null}

            {command.note ? <p className="cmd-note">{command.note}</p> : null}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */

export function CommandsPage() {
  const initial = useRef(readParams()).current;
  const [query, setQuery] = useState(initial.q);
  const [category, setCategory] = useState(initial.c);
  const [form, setForm] = useState<FormFilter>("all");
  const [scope, setScope] = useState<ScopeFilter>("all");
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set(initial.cmd ? [initial.cmd] : []));

  const searchRef = useRef<HTMLInputElement | null>(null);
  const rowRefs = useRef(new Map<string, HTMLElement>());
  const didScroll = useRef(false);

  /* "/" focuses the search field, Escape clears it */
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const typing = target && (/^(INPUT|TEXTAREA)$/.test(target.tagName) || target.isContentEditable);
      if (event.key === "/" && !typing) {
        event.preventDefault();
        searchRef.current?.focus();
      }
      if (event.key === "Escape" && typing && target === searchRef.current) {
        setQuery("");
        searchRef.current?.blur();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  /* keep the address bar shareable without adding history entries */
  useEffect(() => {
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (category !== "all") params.set("c", category);
    const search = params.toString();
    const url = `${window.location.pathname}${search ? `?${search}` : ""}`;
    window.history.replaceState(null, "", url);
  }, [query, category]);

  /* deep link: /commands?cmd=role scrolls that command into view once */
  useEffect(() => {
    if (!initial.cmd || didScroll.current) return;
    didScroll.current = true;
    const el = rowRefs.current.get(initial.cmd);
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 190;
      window.scrollTo({ top, behavior: "auto" });
    }
  }, [initial.cmd]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return COMMANDS.filter((command) => {
      if (category !== "all" && command.category !== category) return false;
      if (scope === "server" && command.scope !== "server") return false;
      if (scope === "everyone" && command.scope !== "everyone") return false;
      if (!matchesForm(command, form)) return false;
      if (!needle) return true;
      return commandSearchText(command).includes(needle);
    }).sort((a, b) => score(a, query) - score(b, query));
  }, [query, category, form, scope]);

  const groups = useMemo(() => {
    return CATEGORIES.map((cat) => ({
      category: cat,
      items: filtered.filter((command) => command.category === cat.id),
    })).filter((group) => group.items.length > 0);
  }, [filtered]);

  /* The staggered entrance replays only when the shape of the list changes
     (category / facets) — the key below — never on every keystroke. */
  const allOpen = filtered.length > 0 && filtered.every((command) => expanded.has(command.id));

  const toggleAll = () => {
    setExpanded(allOpen ? new Set() : new Set(filtered.map((command) => command.id)));
  };

  const toggle = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const registerRef = (id: string, el: HTMLElement | null) => {
    if (el) rowRefs.current.set(id, el);
    else rowRefs.current.delete(id);
  };

  const resetFilters = () => {
    setQuery("");
    setCategory("all");
    setForm("all");
    setScope("all");
  };

  const meta: ReactNode[] = [
    <>
      <b>{DISCORD_COMMANDS.length}</b> discord commands
    </>,
    <>
      <b>{CATEGORIES.length}</b> categories
    </>,
    <>free to use &middot; premium raises limits</>,
  ];

  return (
    <PageShell
      tone="commands"
      eyebrow="Product / commands"
      title={
        <>
          Every command,
          <br />
          <span className="page-title-accent">one index.</span>
        </>
      }
      intro="The complete visual index of what Mocha can do in your server — calls, moderation, music, games, giveaways, quotes and Valorant lookups. Search it, filter it, open a row for arguments and examples."
      ghost="COMMANDS"
      sticker="globe"
      rail="COMMANDS"
      wide
      crumbs={[{ href: "/", label: "Home" }, { label: "Commands" }]}
      meta={meta}
      actions={
        <>
          <StickerButton href={DISCORD_INVITE_URL} external>
            Add Mocha &gt;
          </StickerButton>
          <ArrowLink href="/docs/commands-reference">learn how commands work</ArrowLink>
        </>
      }
    >
      <div className="cmd-hub">
        <div className="cmd-toolbar" data-reveal>
          <div className="cmd-toolbar-row">
            <label className="cmd-search">
              <Icon name="search" />
              <input
                ref={searchRef}
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search commands, arguments, descriptions…"
                aria-label="Search commands"
                autoComplete="off"
                spellCheck={false}
              />
              {query ? (
                <button type="button" className="cmd-search-clear" onClick={() => setQuery("")} aria-label="Clear search">
                  <Icon name="close" />
                </button>
              ) : (
                <span className="cmd-kbd" aria-hidden="true">
                  /
                </span>
              )}
            </label>

            <div className="cmd-toolbar-meta">
              <span className="cmd-count" key={filtered.length}>
                <b>{filtered.length}</b> / {COMMANDS.length} shown
              </span>
              <button
                type="button"
                className={`cmd-toggle-all${allOpen ? " is-open" : ""}`}
                onClick={toggleAll}
                disabled={filtered.length === 0}
              >
                <Icon name="chevron-down" />
                {allOpen ? "collapse all" : "expand all"}
              </button>
            </div>
          </div>

          <div className="cmd-facets" role="group" aria-label="Filter commands">
            <span className="cmd-facet-label">category</span>
            <button
              type="button"
              className={`cmd-chip${category === "all" ? " is-active" : ""}`}
              onClick={() => setCategory("all")}
              aria-pressed={category === "all"}
            >
              <Icon name="grid" />
              all <em>{COMMANDS.length}</em>
            </button>
            {CATEGORIES.map((cat) => {
              const count = COMMANDS.filter((command) => command.category === cat.id).length;
              return (
                <button
                  type="button"
                  key={cat.id}
                  className={`cmd-chip${category === cat.id ? " is-active" : ""}`}
                  onClick={() => setCategory(cat.id)}
                  aria-pressed={category === cat.id}
                >
                  <Icon name={cat.icon} />
                  {cat.short} <em>{count}</em>
                </button>
              );
            })}

            <span className="cmd-facet-sep" aria-hidden="true" />
            <span className="cmd-facet-label">form</span>
            {(
              [
                ["all", "any"],
                ["slash", "slash"],
                ["text", "text"],
              ] as [FormFilter, string][]
            ).map(([value, label]) => (
              <button
                type="button"
                key={value}
                className={`cmd-chip${form === value ? " is-active" : ""}`}
                onClick={() => setForm(value)}
                aria-pressed={form === value}
              >
                {label}
              </button>
            ))}

            <span className="cmd-facet-sep" aria-hidden="true" />
            <span className="cmd-facet-label">who</span>
            {(
              [
                ["all", "everyone + mods"],
                ["everyone", "for everyone"],
                ["server", "server tools"],
              ] as [ScopeFilter, string][]
            ).map(([value, label]) => (
              <button
                type="button"
                key={value}
                className={`cmd-chip cmd-chip--toggle${scope === value && value !== "all" ? " is-on" : ""}${
                  scope === value ? " is-active" : ""
                }`}
                onClick={() => setScope(value)}
                aria-pressed={scope === value}
              >
                {value === "server" ? <Icon name="shield" /> : null}
                {label}
              </button>
            ))}
          </div>
        </div>

        {groups.length === 0 ? (
          <div className="empty-state" data-reveal>
            <span className="empty-state-icon">
              <Icon name="search" />
            </span>
            <h3>No command matches “{query}”.</h3>
            <p>
              Try a shorter word, a category, or one of the commands people look up most. Search matches command
              names, aliases and descriptions.
            </p>
            <div className="empty-state-actions">
              {SUGGESTIONS.map((suggestion) => (
                <button type="button" key={suggestion} className="cmd-chip" onClick={() => setQuery(suggestion)}>
                  {suggestion}
                </button>
              ))}
              <button type="button" className="cmd-chip is-active" onClick={resetFilters}>
                reset filters
              </button>
            </div>
          </div>
        ) : (
          <div className="cmd-groups" key={`${category}-${form}-${scope}`}>
            {groups.map((group) => (
              <section className="cmd-group" key={group.category.id}>
                <header className="cmd-group-head">
                  <span className="cmd-group-icon">
                    <Icon name={group.category.icon} />
                  </span>
                  <div>
                    <h2>{group.category.label}</h2>
                    <p>{group.category.tagline}</p>
                  </div>
                  <span className="cmd-group-count">{String(group.items.length).padStart(2, "0")}</span>
                </header>

                <div className="cmd-list">
                  {group.items.map((command, index) => (
                    <CommandRow
                      key={command.id}
                      command={command}
                      index={index}
                      query={query}
                      open={expanded.has(command.id)}
                      onToggle={() => toggle(command.id)}
                      registerRef={registerRef}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}

        <div className="cmd-hub-foot">
          <Reveal className="cmd-premium-strip">
            <span className="cmd-premium-icon">
              <Icon name="sparkles" />
            </span>
            <div>
              <h3>Premium never locks a command.</h3>
              <p>
                Every command on this page is free. Premium raises command rate limits, gives your server priority
                during periods of high load, unlocks more decorative and advanced embeds, and adds AI-powered
                features on top.
              </p>
            </div>
            <ArrowLink href="/premium">see premium</ArrowLink>
          </Reveal>

          <Reveal delay={0.08} className="panel panel--ticks panel--hover">
            <span className="panel-kicker">Not sure where to start?</span>
            <h3 className="panel-title">Read the command guide</h3>
            <p className="panel-copy">
              Syntax, prefixes, arguments, common patterns and the tips that make commands feel natural — the guide
              teaches the system, this page lists everything it can do.
            </p>
            <div className="link-card-foot">
              <ArrowLink href="/docs/commands-reference">using commands</ArrowLink>
              <ArrowLink href="/docs/getting-started">getting started</ArrowLink>
            </div>
          </Reveal>
        </div>
      </div>
    </PageShell>
  );
}

export default CommandsPage;

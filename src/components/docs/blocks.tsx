import type { ReactNode } from "react";
import { CopyButton, Signature } from "../ui/primitives";
import { Icon } from "../ui/Icon";
import { findCommand } from "../../data/commands";

/**
 * Content blocks shared by the documentation pages. They exist so the docs can
 * *teach* without duplicating the command directory: `DocCommand` pulls the
 * signature/description straight from `data/commands.ts` and links the row into
 * the /commands hub, where the full detail lives.
 */

export type CodeLine = {
  prompt?: string;
  text: ReactNode;
  /** Raw text used by the copy button. */
  raw?: string;
  kind?: "cmd" | "res" | "err";
};

export function CodeBlock({
  title = "mocha — tty0",
  lines,
  copyValue,
}: {
  title?: string;
  lines: CodeLine[];
  copyValue?: string;
}) {
  const value = copyValue ?? lines.map((line) => line.raw ?? (typeof line.text === "string" ? line.text : "")).filter(Boolean).join("\n");

  return (
    <div className="code-block">
      <div className="code-block-head">
        <span className="terminal-dot r" aria-hidden="true" />
        <span className="terminal-dot b" aria-hidden="true" />
        <span className="terminal-dot c" aria-hidden="true" />
        {title}
        {value ? <CopyButton value={value} variant="ghost" /> : null}
      </div>
      <div className="code-block-body">
        {lines.map((line, index) => (
          <div className={`code-line${line.kind ? ` code-line--${line.kind}` : ""}`} key={index}>
            {line.prompt ? <span className="code-line-prompt">{line.prompt}</span> : null}
            <code>{line.text}</code>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Deep link into the /commands hub, pre-filtered and pre-expanded. */
export function commandHubLink(commandId: string, extra?: Record<string, string>) {
  const command = findCommand(commandId);
  const params = new URLSearchParams(extra);
  if (command) params.set("c", command.category);
  params.set("cmd", commandId);
  return `/commands?${params.toString()}`;
}

export function DocCommand({ id, children }: { id: string; children?: ReactNode }) {
  const command = findCommand(id);
  if (!command) return null;

  return (
    <div className="doc-cmd">
      <Signature value={command.slash ?? command.prefix ?? command.name} />
      <p>{children ?? command.description}</p>
      <a className="doc-cmd-link" href={commandHubLink(id)} aria-label={`${command.name} in the command index`}>
        <Icon name="arrow-up-right" />
      </a>
    </div>
  );
}

export function DocCommandList({ ids }: { ids: string[] }) {
  return (
    <div className="doc-cmd-list">
      {ids.map((id) => (
        <DocCommand key={id} id={id} />
      ))}
    </div>
  );
}

export function Steps({ children }: { children: ReactNode }) {
  return <div className="step-list">{children}</div>;
}

export function Step({ title, children }: { title: ReactNode; children: ReactNode }) {
  return (
    <div className="step-card">
      <div>
        <h3>{title}</h3>
        {children}
      </div>
    </div>
  );
}

export function DefList({
  items,
}: {
  items: { term: ReactNode; description: ReactNode; tone?: "req" | "opt" | "plain" }[];
}) {
  return (
    <div className="def-list">
      {items.map((item, index) => (
        <div className="def-row" key={index}>
          <span className={`def-term${item.tone && item.tone !== "plain" ? ` def-term--${item.tone}` : ""}`}>
            {item.term}
          </span>
          <span className="def-desc">{item.description}</span>
        </div>
      ))}
    </div>
  );
}

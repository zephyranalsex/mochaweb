import { DocsLayout } from "./DocsPage";

export function CommandsReferencePage() {
  return (
    <DocsLayout eyebrow="Documentation / 03" title="Command reference" intro="A dedicated reference page for the commands shown throughout the site.">
      <div className="docs-reference-grid">
        <div><code>help</code><span>Open the full command index.</span></div>
        <div><code>call</code><span>Bridge a channel to another server.</span></div>
        <div><code>hangup</code><span>End the current call or leave the queue.</span></div>
        <div><code>ban</code><span>Remove a member and attach a reason to the log.</span></div>
        <div><code>kick</code><span>Remove a member.</span></div>
        <div><code>mute</code></div><div><code>unmute</code></div><div><code>lock</code></div><div><code>unlock</code></div>
        <div><code>set-prefix</code><span>Change the command prefix for your server.</span></div>
      </div>
    </DocsLayout>
  );
}

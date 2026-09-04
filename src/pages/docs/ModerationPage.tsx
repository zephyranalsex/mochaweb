import { DocsLayout } from "./DocsPage";

export function ModerationPage() {
  return (
    <DocsLayout eyebrow="Documentation / 02" title="Moderation" intro="Keep the place tidy with commands that remove, timeout, or lock down access.">
      <div className="docs-command-list">
        <div><code>mocha ban</code><p>Remove a member with a reason attached to the log.</p></div>
        <div><code>mocha kick</code><p>Remove a member without the longer moderation flow.</p></div>
        <div><code>mocha mute</code><p>Timeout a member for a set number of minutes.</p></div>
        <div><code>mocha unmute</code><p>Restore a member's ability to participate after a timeout.</p></div>
        <div><code>mocha lock</code><p>Freeze a channel so messages cannot be sent normally.</p></div>
        <div><code>mocha unlock</code><p>Restore normal channel messaging.</p></div>
      </div>
      <a className="site-back-link" href="/docs/commands-reference">next: command reference →</a>
    </DocsLayout>
  );
}

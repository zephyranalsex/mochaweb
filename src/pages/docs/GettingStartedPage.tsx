import { DocsLayout } from "./DocsPage";

export function GettingStartedPage() {
  return (
    <DocsLayout eyebrow="Documentation / 01" title="Getting started" intro="The fastest path from a fresh Discord server to a working Mocha setup.">
      <h2>1. Add Mocha</h2><p>Start from the Mocha invite flow, then choose the server where you want the bot installed. Keep the bot's permissions limited to what your server actually needs.</p>
      <h2>2. Try the essentials</h2><div className="docs-code"><code>mocha help</code><code>mocha call</code><code>mocha hangup</code></div>
      <p>The interactive command terminal on the homepage mirrors the basic commands and gives you a quick feel for the bot's in-chat workflow.</p>
      <h2>3. Make it yours</h2><p>Use <code>/set-prefix</code> to change the command prefix for your server, then head to the moderation and command-reference pages for the rest of the workflow.</p>
      <a className="site-back-link" href="/docs/moderation">next: moderation →</a>
    </DocsLayout>
  );
}

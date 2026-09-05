import { DocsLayout } from "./DocsPage";
import { Callout } from "../../components/ui/primitives";
import { CodeBlock, DefList, DocCommandList, Steps, Step } from "../../components/docs/blocks";
import { Icon } from "../../components/ui/Icon";

export function GettingStartedPage() {
  return (
    <DocsLayout
      eyebrow="Documentation / 01"
      title="Getting started"
      intro="From an empty server to a working Mocha setup: add the bot, run your first command, point calls at the right channel, and make the prefix yours."
      ghost="SETUP"
      sticker="globe"
      meta={[
        <>
          <b>5</b> sections
        </>,
        <>slash + text commands</>,
        <>no dashboard</>,
      ]}
      next={{ href: "/docs/moderation", label: "next", title: "Moderation" }}
    >
      <h2>Add Mocha to your server</h2>
      <p>
        Use the invite button in the navigation (or the one at the top of this page) and pick the server you want
        Mocha in. Discord walks you through the permissions the bot is asking for — read that screen, adjust it if
        your server wants something narrower, and authorise.
      </p>
      <p>
        There is no dashboard to configure afterwards. Everything Mocha does is driven from chat, which is the whole
        point: the commands <em>are</em> the settings.
      </p>

      <Callout tone="tip" title="Moderation permissions">
        <p>
          Commands that act on other members — <code>ban</code>, <code>kick</code>, <code>mute</code>, <code>lock</code>,{" "}
          <code>role</code> — follow Discord's own permission rules. A member who cannot ban people in Discord cannot
          ban people through Mocha.
        </p>
      </Callout>

      <h2>Run your first command</h2>
      <p>Mocha answers to two forms of the same command, and you can mix them freely:</p>

      <DefList
        items={[
          {
            term: "/name",
            tone: "req",
            description:
              "Slash form. Type / in the message box and Discord opens the command picker with every argument listed for you.",
          },
          {
            term: "mocha name",
            tone: "opt",
            description:
              "Text form. Send it as a normal message in any channel Mocha can read. The word “mocha” is the default prefix and it can be changed per server.",
          },
        ]}
      />

      <CodeBlock
        title="first contact"
        lines={[
          { prompt: "#general >", text: <><b>/speak</b> hello from mocha</>, raw: "/speak hello from mocha" },
          { prompt: "mocha >", text: <>mocha <b>call</b></>, raw: "mocha call" },
          { prompt: "mocha >", text: <>mocha <b>hangup</b></>, raw: "mocha hangup" },
        ]}
      />

      <Callout tone="note" title="Slash commands missing from the picker?">
        <p>
          Run <code>mocha sync</code>. It re-syncs the command tree for the current server, which is the fix when a
          slash command has not shown up yet.
        </p>
      </Callout>

      <h2 id="calls">Set the channel used for calls</h2>
      <p>
        Cross-server calls are Mocha's signature trick: one channel here, another server's channel there, one
        conversation. Tell Mocha which channel to use first, then start calling.
      </p>

      <Steps>
        <Step title="Pick the call channel">
          <p>
            <code>/call-config</code> takes the channel that calls should run through. Do this once per server.
          </p>
          <CodeBlock
            title="call-config"
            lines={[{ prompt: "#general >", text: <><b>/call-config</b> #calls</>, raw: "/call-config #calls" }]}
          />
        </Step>
        <Step title="Queue up, or call a server directly">
          <p>
            Run <code>call</code> with no arguments to join the matchmaking queue and get paired with another server.
            Pass a server id to call that server directly.
          </p>
          <CodeBlock
            title="calling"
            lines={[
              { prompt: "#calls >", text: <>mocha <b>call</b></>, raw: "mocha call" },
              { prompt: "#calls >", text: <><b>/call</b> 123456789012345678</>, raw: "/call 123456789012345678" },
            ]}
          />
        </Step>
        <Step title="Hang up">
          <p>
            <code>hangup</code> ends the current call. Run it while still in the queue and it takes you out of the
            queue instead.
          </p>
        </Step>
      </Steps>

      <DocCommandList ids={["call-config", "call", "hangup"]} />

      <h2>Make the prefix yours</h2>
      <p>
        The text form of every command starts with a prefix, and the default is <code>mocha</code>. Your server can
        have its own:
      </p>

      <CodeBlock
        title="prefix"
        lines={[
          { prompt: "#general >", text: <><b>/set-prefix</b> !m</>, raw: "/set-prefix !m" },
          { prompt: "#general >", text: <>!m <b>quote</b></>, raw: "!m quote" },
          { prompt: "#general >", text: <><b>/set-prefix</b></>, raw: "/set-prefix" },
        ]}
      />

      <p>
        Running <code>/set-prefix</code> with nothing after it clears the custom prefix and puts the default back.
        Slash commands keep working either way — the prefix only affects the text form.
      </p>

      <h2>Play something in voice</h2>
      <p>
        Music lives in a voice channel. The usual session looks like this, and every step is optional except{" "}
        <code>join</code> and <code>play</code>:
      </p>

      <CodeBlock
        title="a whole session"
        lines={[
          { prompt: "voice >", text: <><b>/join</b></>, raw: "/join" },
          { prompt: "voice >", text: <><b>/play</b> lofi beats</>, raw: "/play lofi beats" },
          { prompt: "voice >", text: <><b>/queue</b></>, raw: "/queue" },
          { prompt: "voice >", text: <><b>/skip</b></>, raw: "/skip" },
          { prompt: "voice >", text: <><b>/loop</b> 3</>, raw: "/loop 3" },
          { prompt: "voice >", text: <><b>/stop</b></>, raw: "/stop" },
          { prompt: "voice >", text: <><b>/leave</b></>, raw: "/leave" },
        ]}
      />

      <p>
        <code>/play</code> accepts a song name, a YouTube URL or a Spotify URL. <code>/remove</code> takes a position
        number from <code>/queue</code>, and <code>/seek</code> jumps to a timestamp such as <code>1:23</code> or{" "}
        <code>90</code>.
      </p>

      <h2>Where to go next</h2>
      <div className="doc-next-grid">
        <a className="doc-next" href="/docs/moderation">
          <span className="doc-next-icon">
            <Icon name="shield" />
          </span>
          <span>
            <b>Moderation</b>
            <i>bans, timeouts, locks, roles and the audit log</i>
          </span>
          <Icon name="arrow-up-right" className="doc-next-arrow" />
        </a>
        <a className="doc-next" href="/docs/commands-reference">
          <span className="doc-next-icon">
            <Icon name="slash" />
          </span>
          <span>
            <b>Using commands</b>
            <i>syntax, arguments, subcommands and patterns</i>
          </span>
          <Icon name="arrow-up-right" className="doc-next-arrow" />
        </a>
        <a className="doc-next" href="/commands">
          <span className="doc-next-icon">
            <Icon name="gift" />
          </span>
          <span>
            <b>Command index</b>
            <i>every command, searchable and filterable</i>
          </span>
          <Icon name="arrow-up-right" className="doc-next-arrow" />
        </a>
      </div>
    </DocsLayout>
  );
}

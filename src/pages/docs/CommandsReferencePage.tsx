import { DocsLayout } from "./DocsPage";
import { ArrowLink, Callout, Pill } from "../../components/ui/primitives";
import { Icon } from "../../components/ui/Icon";
import { CodeBlock, DefList, DocCommandList } from "../../components/docs/blocks";
import { CATEGORIES, DISCORD_COMMANDS, commandsByCategory } from "../../data/commands";
import { DISCORD_URL } from "../../lib/site";

/**
 * /docs/commands-reference — the guide that teaches how Mocha commands work.
 *
 * Deliberately *not* a second list of commands: the complete, searchable
 * directory lives on /commands, and this page links into it (deep links carry
 * the category and the command to expand).
 */

export function CommandsReferencePage() {
  return (
    <DocsLayout
      eyebrow="Documentation / 03"
      title="Using commands"
      intro="How Mocha commands are built and how to read them: the two ways to run one, the syntax notation, arguments, groups, prefixes, and the patterns worth memorising. The full list of commands lives in the command index."
      ghost="SYNTAX"
      sticker="paperclip"
      meta={[
        <>guide, not a list</>,
        <>
          <b>{DISCORD_COMMANDS.length}</b> discord commands indexed
        </>,
      ]}
      prev={{ href: "/docs/moderation", label: "previous", title: "Moderation" }}
      next={{ href: "/commands", label: "browse", title: "The command index" }}
    >
      <h2>What a command actually is</h2>
      <p>
        A command is a message Mocha is listening for. You send it in a channel, Mocha reads the name and the
        arguments that follow it, and it performs the action — say something, start a call, queue a song, timeout a
        member, open a giveaway. Nothing happens in a dashboard, because there isn't one.
      </p>
      <p>
        Every command has a <strong>name</strong>, optionally a list of <strong>arguments</strong>, and a place it is
        allowed to run. Some commands belong to a <strong>group</strong>, in which case the name alone does nothing and
        a subcommand has to follow it.
      </p>

      <h2>Two ways to run the same command</h2>
      <p>
        Most Mocha commands exist in two forms. They do the same thing; they differ in how you type them and how much
        help Discord gives you while you do.
      </p>

      <DefList
        items={[
          {
            term: "/command",
            tone: "req",
            description:
              "Slash form. Type / and Discord opens a picker with the command's arguments laid out for you, so you cannot get the order wrong. Best for anything with several arguments — giveaways, roles, timeouts.",
          },
          {
            term: "mocha command",
            tone: "opt",
            description:
              "Text form. A normal message starting with the server prefix (mocha by default). Faster once you know a command, and the only form for a few of them — quote and sync, for example.",
          },
        ]}
      />

      <CodeBlock
        title="same command, two forms"
        lines={[
          { prompt: "#general >", text: <><b>/mute</b> @user 10 reason here</>, raw: "/mute @user 10 reason here" },
          { prompt: "#general >", text: <>mocha <b>mute</b> @user 10 reason here</>, raw: "mocha mute @user 10 reason here" },
          { prompt: "#general >", text: <><b>/call</b></>, raw: "/call" },
          { prompt: "#general >", text: <>mocha <b>call</b></>, raw: "mocha call" },
        ]}
      />

      <Callout tone="note" title="Not every command has both forms">
        <p>
          Some are slash-only (<code>/speak</code>, <code>/play</code>, <code>/giveaway</code>, <code>/valinfo</code>),
          some are text-only (<code>mocha quote</code>, <code>mocha sync</code>, <code>mocha ttt</code> uses the short
          text name while <code>/tictactoes</code> is the slash one). Every row in the{" "}
          <a href="/commands">command index</a> carries a pill telling you which forms exist.
        </p>
      </Callout>

      <h2>Reading the syntax</h2>
      <p>Documentation and the command index both write commands in one notation:</p>

      <DefList
        items={[
          { term: "<argument>", tone: "req", description: "Required. The command fails or does nothing useful without it." },
          { term: "[argument]", tone: "opt", description: "Optional. Leave it out and Mocha uses a sensible default." },
          { term: "name", description: "The command itself, written exactly as you type it." },
          { term: "group sub", description: "A subcommand: the group name, a space, then which action you want." },
        ]}
      />

      <p>Take the giveaway command, which uses every part of that notation at once:</p>

      <CodeBlock
        title="anatomy of a command"
        lines={[
          {
            prompt: "giveaway >",
            text: (
              <>
                <b>/giveaway</b> <em>&lt;duration&gt;</em> <em>&lt;channel&gt;</em> <em>&lt;winners&gt;</em>{" "}
                <em>&lt;prize&gt;</em> <span>[include]</span> <span>[exclude]</span>
              </>
            ),
            raw: "/giveaway <duration> <channel> <winners> <prize> [include] [exclude]",
          },
          { prompt: "example >", text: <><b>/giveaway</b> 3600 #giveaways 1 Nitro</>, raw: "/giveaway 3600 #giveaways 1 Nitro" },
        ]}
      />

      <DefList
        items={[
          { term: "duration", tone: "req", description: "How long the giveaway runs, in seconds. Maximum 30 days — so 3600 is one hour." },
          { term: "channel", tone: "req", description: "Where the giveaway is posted." },
          { term: "winners", tone: "req", description: "How many winners to pick." },
          { term: "prize", tone: "req", description: "What is being given away." },
          { term: "include", tone: "opt", description: "Users or roles allowed to enter — mentions or ids, space-separated." },
          { term: "exclude", tone: "opt", description: "Users or roles barred from entering, written the same way." },
        ]}
      />

      <DocCommandList ids={["giveaway"]} />

      <h2>What arguments accept</h2>
      <p>
        Arguments are typed, and Mocha is picky in the useful way — Discord's slash picker will only offer values that
        fit. Across the whole command set there are a handful of shapes:
      </p>

      <DefList
        items={[
          { term: "member / user", description: "A mention (@someone) or a user id. Used by moderation, roles, games and userinfo." },
          { term: "channel", description: "A channel mention (#name) or id. Used by call-config, lock, giveaways and quote mirroring." },
          { term: "role", description: "A role mention or name, for the /role group." },
          { term: "server id", description: "A snowflake. Used when a command has to target one specific server." },
          { term: "number", description: "Minutes for a timeout, a queue position for /remove, a count for /audit, winners for a giveaway, times for /loop." },
          { term: "time", description: "A timestamp like 1:23 or a plain number of seconds for /seek, seconds for a giveaway duration." },
          { term: "colour", description: "A hex value (#ff0000) or a named colour (red, blue) when creating a role." },
          { term: "text", description: "Free text: a reason, a prize, a song query, or the message /speak should say." },
          { term: "url", description: "/play also accepts a YouTube or Spotify URL instead of a search query." },
        ]}
      />

      <h2>Groups and subcommands</h2>
      <p>
        A few commands are groups. Running the group on its own does not perform an action — you follow it with the
        subcommand you want. <code>role</code> is the clearest example:
      </p>

      <CodeBlock
        title="one group, four actions"
        lines={[
          { prompt: "#staff >", text: <><b>/role add</b> @user Regulars</>, raw: "/role add @user Regulars" },
          { prompt: "#staff >", text: <><b>/role remove</b> @user Regulars</>, raw: "/role remove @user Regulars" },
          { prompt: "#staff >", text: <><b>/role create</b> Regulars red</>, raw: "/role create Regulars red" },
          { prompt: "#staff >", text: <><b>/role delete</b> Regulars</>, raw: "/role delete Regulars" },
        ]}
      />

      <p>
        <code>quotes</code> works the same way for configuration: <code>/quotes channel</code> picks the channel that
        every quote card gets mirrored to, and running it with no channel turns mirroring off.
      </p>

      <DocCommandList ids={["role", "quotes-channel"]} />

      <h2>Prefixes</h2>
      <p>
        The text form of a command always starts with the server prefix. The default is <code>mocha</code>, and each
        server can set its own with <code>/set-prefix</code>:
      </p>

      <CodeBlock
        title="prefix"
        lines={[
          { prompt: "#general >", text: <><b>/set-prefix</b> !m</>, raw: "/set-prefix !m" },
          { prompt: "#general >", text: <>!m <b>hangup</b></>, raw: "!m hangup" },
          { prompt: "#general >", text: <><b>/set-prefix</b></>, raw: "/set-prefix" },
        ]}
      />

      <p>
        Running it with no argument clears the custom prefix and returns to the default. Prefixes never affect slash
        commands — those are registered with Discord, not with a word in your message.
      </p>

      <h2>Patterns worth memorising</h2>
      <p>Most servers end up using the same four sequences. Learn these and the rest of the index is variation.</p>

      <h3>A call between two servers</h3>
      <CodeBlock
        title="calls"
        lines={[
          { prompt: "#general >", text: <><b>/call-config</b> #calls</>, raw: "/call-config #calls" },
          { prompt: "#calls >", text: <>mocha <b>call</b></>, raw: "mocha call" },
          { prompt: "#calls >", text: <><b>/call</b> 123456789012345678</>, raw: "/call 123456789012345678" },
          { prompt: "#calls >", text: <>mocha <b>hangup</b></>, raw: "mocha hangup" },
        ]}
      />

      <h3>A music session</h3>
      <CodeBlock
        title="music"
        lines={[
          { prompt: "voice >", text: <><b>/join</b></>, raw: "/join" },
          { prompt: "voice >", text: <><b>/play</b> https://open.spotify.com/track/…</>, raw: "/play https://open.spotify.com/track/..." },
          { prompt: "voice >", text: <><b>/queue</b></>, raw: "/queue" },
          { prompt: "voice >", text: <><b>/remove</b> 3</>, raw: "/remove 3" },
          { prompt: "voice >", text: <><b>/nowplaying</b></>, raw: "/nowplaying" },
          { prompt: "voice >", text: <><b>/leave</b></>, raw: "/leave" },
        ]}
      />

      <h3>Game night</h3>
      <CodeBlock
        title="games"
        lines={[
          { prompt: "#games >", text: <>mocha <b>ttt</b> @rival</>, raw: "mocha ttt @rival" },
          { prompt: "#games >", text: <><b>/fasttype</b></>, raw: "/fasttype" },
          { prompt: "#games >", text: <><b>/guesstheflag</b></>, raw: "/guesstheflag" },
          { prompt: "#games >", text: <>mocha <b>stop</b></>, raw: "mocha stop" },
          { prompt: "#games >", text: <><b>/stats</b> @rival</>, raw: "/stats @rival" },
          { prompt: "#games >", text: <><b>/leaderboard</b></>, raw: "/leaderboard" },
        ]}
      />

      <h3>Keeping the good lines</h3>
      <CodeBlock
        title="quotes"
        lines={[
          { prompt: "#general >", text: <>reply to a message, then: mocha <b>quote</b></>, raw: "mocha quote" },
          { prompt: "#staff >", text: <><b>/quotes channel</b> #quote-archive</>, raw: "/quotes channel #quote-archive" },
        ]}
      />

      <h2>Tips and gotchas</h2>
      <ul>
        <li>
          <strong>/stop means two things.</strong> In a game it stops the running game; in music it stops playback and
          clears the queue. Same word, different context — the index lists both.
        </li>
        <li>
          <strong>Quote needs a reply.</strong> <code>mocha quote</code> builds its card from the message you are
          replying to, so reply first.
        </li>
        <li>
          <strong>Giveaway duration is seconds.</strong> Not minutes, not "1h" — <code>3600</code> for an hour, up to a
          maximum of 30 days.
        </li>
        <li>
          <strong>Timeouts are minutes, and at least one.</strong> <code>/mute @user 0</code> is not a valid timeout.
        </li>
        <li>
          <strong>Queue positions come from /queue.</strong> <code>/remove</code> wants the number shown there, not a
          song title.
        </li>
        <li>
          <strong>/audit caps at 100.</strong> It defaults to 10 entries when you pass nothing.
        </li>
        <li>
          <strong>Loop takes a total count.</strong> <code>/loop 3</code> plays the track three times in total, no
          argument loops until you skip, and <code>/loop 0</code> turns looping off.
        </li>
        <li>
          <strong>Slash commands missing?</strong> <code>mocha sync</code> re-syncs the command tree for the server.
        </li>
        <li>
          <strong>Reasons are optional but permanent.</strong> Skip one and the log reads "No reason provided".
        </li>
      </ul>

      <h2>Getting help</h2>
      <p>Three places, in order of usefulness:</p>
      <ol>
        <li>
          <strong>The command index</strong> — every command with its arguments, both forms and a copyable example.
        </li>
        <li>
          <strong>The support server</strong> — real people, bug reports, and the fastest answer when something
          behaves oddly.
        </li>
        <li>
          <strong>These docs</strong> — setup, moderation and this guide, linked from the sidebar on every page.
        </li>
      </ol>

      <div className="doc-help-row">
        <ArrowLink href="/help">help page</ArrowLink>
        <ArrowLink href={DISCORD_URL} external>
          support server
        </ArrowLink>
        <ArrowLink href="/docs/getting-started">getting started</ArrowLink>
      </div>

      <h2>The complete command list</h2>
      <p>
        This guide teaches the system; the index lists everything it can do. Pick a category to open the index
        pre-filtered — {DISCORD_COMMANDS.length} Discord commands across {CATEGORIES.length} categories, each row
        expandable for arguments and examples.
      </p>

      <div className="cmd-cat-grid">
        {CATEGORIES.map((category) => {
          const count = commandsByCategory(category.id).length;
          return (
            <a className="cmd-cat-tile" key={category.id} href={`/commands?c=${category.id}`}>
              <span className="cmd-cat-icon">
                <Icon name={category.icon} />
              </span>
              <span className="cmd-cat-body">
                <b>{category.label}</b>
                <i>{category.tagline}</i>
              </span>
              <span className="cmd-cat-count">{String(count).padStart(2, "0")}</span>
            </a>
          );
        })}
      </div>

      <div className="doc-index-cta">
        <div>
          <span className="panel-kicker">Command index</span>
          <h3>Search, filter and expand every command</h3>
          <p>
            The index is the reference; this page is the lesson. Press <Pill tone="red">/</Pill> on that page to jump
            straight into search.
          </p>
        </div>
        <a className="doc-index-cta-link" href="/commands">
          open the command index
          <Icon name="arrow-up-right" />
        </a>
      </div>
    </DocsLayout>
  );
}

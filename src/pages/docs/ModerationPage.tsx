import { DocsLayout } from "./DocsPage";
import { Callout } from "../../components/ui/primitives";
import { CodeBlock, DefList, DocCommandList, Steps, Step } from "../../components/docs/blocks";
import { Icon } from "../../components/ui/Icon";

export function ModerationPage() {
  return (
    <DocsLayout
      eyebrow="Documentation / 02"
      title="Moderation"
      intro="Everything Mocha gives a moderation team: removals, timeouts, channel locks, role management and a quick look at the audit log — plus how the pieces fit together in a real incident."
      ghost="MODERATION"
      sticker="face"
      meta={[
        <>
          <b>8</b> commands + 4 role subcommands
        </>,
        <>reasons logged</>,
        <>discord permissions apply</>,
      ]}
      prev={{ href: "/docs/getting-started", label: "previous", title: "Getting started" }}
      next={{ href: "/docs/commands-reference", label: "next", title: "Using commands" }}
    >
      <h2>How Mocha moderation behaves</h2>
      <p>
        Moderation commands are chat-first: no panel, no queue of reports, no separate site to log into. You run a
        command in the channel where the problem is happening, Mocha performs the Discord action, and the reason you
        passed ends up attached to it.
      </p>
      <p>Three things are true of every command on this page:</p>
      <ul>
        <li>
          They follow <strong>Discord's permissions</strong>. Mocha cannot let someone ban a member who could not ban
          that member anyway.
        </li>
        <li>
          The <code>reason</code> argument is always optional. Leave it out and Mocha records{" "}
          <code>No reason provided</code> — which is exactly why writing one is worth the two seconds.
        </li>
        <li>
          They act on the server you run them in, so a member can be handled without leaving the conversation that
          caused the problem.
        </li>
      </ul>

      <Callout tone="warn" title="Irreversible actions">
        <p>
          <code>ban</code>, <code>kick</code>, <code>role delete</code> and <code>lock</code> affect real people and
          real channels immediately. When in doubt, start with a timeout — it is the one action here that has a built-in
          expiry.
        </p>
      </Callout>

      <h2>Removing a member: kick or ban</h2>
      <p>
        <code>kick</code> removes a member from the server. <code>ban</code> removes them and, as with any Discord ban,
        keeps them off the server until someone unbans them. Both take an optional reason.
      </p>

      <CodeBlock
        title="removals"
        lines={[
          { prompt: "#staff >", text: <><b>/kick</b> @user Raids in #general</>, raw: "/kick @user Raids in #general" },
          { prompt: "#staff >", text: <><b>/ban</b> @user Posting invite links after warning</>, raw: "/ban @user Posting invite links after warning" },
          { prompt: "#staff >", text: <>mocha <b>ban</b> @user</>, raw: "mocha ban @user" },
        ]}
      />

      <DocCommandList ids={["kick", "ban"]} />

      <h2>Timeouts: mute and unmute</h2>
      <p>
        A timeout is the middle option: the member stays in the server, cannot participate for a while, and the
        timeout ends on its own. <code>mute</code> takes a duration in <strong>minutes</strong>, and it must be at
        least 1.
      </p>

      <DefList
        items={[
          { term: "<user>", tone: "req", description: "The member to timeout." },
          { term: "<minutes>", tone: "req", description: "How long the timeout lasts, in minutes. Minimum 1." },
          { term: "[reason]", tone: "opt", description: "Optional. Defaults to “No reason provided”." },
        ]}
      />

      <CodeBlock
        title="timeouts"
        lines={[
          { prompt: "#staff >", text: <><b>/mute</b> @user 10 Earrape in voice</>, raw: "/mute @user 10 Earrape in voice" },
          { prompt: "#staff >", text: <><b>/unmute</b> @user</>, raw: "/unmute @user" },
        ]}
      />

      <p>
        <code>unmute</code> removes a member's timeout early — the standard move once someone has calmed down or
        apologised.
      </p>

      <DocCommandList ids={["mute", "unmute"]} />

      <h2>Locking a channel down</h2>
      <p>
        When a channel is the problem, lock the channel instead of chasing individuals. <code>lock</code> stops
        everyone from sending messages in it; <code>unlock</code> puts it back to normal. Both default to the channel
        you run them in, or take a channel of your choice.
      </p>

      <CodeBlock
        title="locks"
        lines={[
          { prompt: "#general >", text: <>mocha <b>lock</b></>, raw: "mocha lock" },
          { prompt: "#general >", text: <><b>/lock</b> #general</>, raw: "/lock #general" },
          { prompt: "#general >", text: <><b>/unlock</b> #general</>, raw: "/unlock #general" },
        ]}
      />

      <Callout tone="tip" title="Lock, then talk">
        <p>
          A locked channel is a good place to post what happened and what happens next — the conversation stops, but
          the room is still there.
        </p>
      </Callout>

      <DocCommandList ids={["lock", "unlock"]} />

      <h2>Roles</h2>
      <p>
        <code>role</code> is a command group: on its own it does nothing, it needs one of its four subcommands.
      </p>

      <DefList
        items={[
          { term: "/role add", tone: "req", description: "Give a member a role. Takes the member, then the role." },
          { term: "/role remove", tone: "req", description: "Take a role off a member." },
          {
            term: "/role create",
            tone: "req",
            description:
              "Create a new role by name. The colour is optional and accepts values such as #ff0000, red or blue; leave it out for the default.",
          },
          { term: "/role delete", tone: "req", description: "Delete a role from the server." },
        ]}
      />

      <CodeBlock
        title="roles"
        lines={[
          { prompt: "#staff >", text: <><b>/role create</b> Regulars #ff0000</>, raw: "/role create Regulars #ff0000" },
          { prompt: "#staff >", text: <><b>/role add</b> @user Regulars</>, raw: "/role add @user Regulars" },
          { prompt: "#staff >", text: <><b>/role remove</b> @user Regulars</>, raw: "/role remove @user Regulars" },
          { prompt: "#staff >", text: <>mocha <b>role delete</b> Old Role</>, raw: "mocha role delete Old Role" },
        ]}
      />

      <h2>Checking what happened: audit</h2>
      <p>
        <code>audit</code> pulls recent server audit-log entries into chat, which is the fastest way to see who did
        what when you arrive after the fact. It shows 10 entries by default and accepts up to 100.
      </p>

      <CodeBlock
        title="audit"
        lines={[
          { prompt: "#staff >", text: <><b>/audit</b></>, raw: "/audit" },
          { prompt: "#staff >", text: <><b>/audit</b> 25</>, raw: "/audit 25" },
        ]}
      />

      <DocCommandList ids={["audit", "role"]} />

      <h2>A flow that works in practice</h2>
      <Steps>
        <Step title="Slow the room down first">
          <p>
            Timeout the member (<code>/mute @user 10 reason</code>) and, if the channel is spinning,{" "}
            <code>lock</code> it. Nothing else gets decided while it is still happening.
          </p>
        </Step>
        <Step title="Look at the record">
          <p>
            <code>/audit 25</code> shows the recent actions on the server so you are reacting to what actually
            happened, not to the loudest message about it.
          </p>
        </Step>
        <Step title="Escalate only if you have to">
          <p>
            <code>kick</code> for a member who should leave but could come back, <code>ban</code> for one who should
            not. Write the reason as if a stranger will read it in six months.
          </p>
        </Step>
        <Step title="Put the room back">
          <p>
            <code>unlock</code> the channel, <code>unmute</code> anyone who has served their time, and use{" "}
            <code>/role</code> to give trusted members the permissions that make the next incident shorter.
          </p>
        </Step>
      </Steps>

      <Callout tone="premium" title="Premium and moderation">
        <p>
          Moderation is never paywalled. Premium changes how much room you get around the bot — higher command rate
          limits, priority usage during periods of high load, richer embeds and additional AI-powered features — not
          who is allowed to keep their server safe.
        </p>
      </Callout>

      <h2>The rest of the moderation set</h2>
      <p>
        Every argument, both command forms and a copyable example for each moderation command live in the command
        index. Open it filtered to moderation and nothing is missing.
      </p>
      <div className="doc-index-cta">
        <div>
          <span className="panel-kicker">Command index</span>
          <h3>Moderation, filtered</h3>
          <p>Eight commands plus the four <code>/role</code> subcommands, each one expandable.</p>
        </div>
        <a className="doc-index-cta-link" href="/commands?c=moderation">
          open the moderation index
          <Icon name="arrow-up-right" />
        </a>
      </div>
    </DocsLayout>
  );
}

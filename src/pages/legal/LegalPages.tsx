import { LegalLayout, LegalSummary, Pending } from "./LegalLayout";
import { Callout } from "../../components/ui/primitives";
import { PREMIUM_CATEGORIES, formatPrice } from "../../data/premium";
import { DISCORD_COMMANDS, TERMINAL_COMMANDS } from "../../data/commands";
import { DISCORD_URL } from "../../lib/site";

/**
 * Terms, Privacy and Refunds.
 *
 * These pages only state what Mocha actually does. Where a policy decision has
 * not been made yet (refund windows, retention periods, liability), the section
 * is structured and marked as pending rather than filled with invented text.
 */

const DRAFT_NOTE = (
  <Callout tone="warn" title="Status: in progress">
    <p>
      Sections marked <strong>to be finalised</strong> are still being written. Everything else on this page describes
      how Mocha works today — if a section says it, the product does it.
    </p>
  </Callout>
);

/* ======================================================================= */

export function TermsPage() {
  return (
    <LegalLayout
      eyebrow="Legal / terms"
      title="Terms of Service"
      intro="The rules for using the Mocha bot and this website: what you agree to, what Mocha does, what Premium is, and what happens when either of those changes."
      ghost="TERMS"
      meta={[
        <>
          <b>9</b> sections
        </>,
        <>covers the bot + this site</>,
        <>draft in progress</>,
      ]}
    >
      {DRAFT_NOTE}

      <LegalSummary
        items={[
          <>Using Mocha means following Discord's rules, the law, and your server's rules.</>,
          <>
            Every command is free — {DISCORD_COMMANDS.length} Discord commands and {TERMINAL_COMMANDS.length} terminal
            commands. Premium is optional and adds polish, capacity and priority.
          </>,
          <>Moderation commands are bound by Discord's own permission system.</>,
          <>Features can change or be removed as Mocha evolves; availability is not guaranteed.</>,
        ]}
      />

      <h2>What these terms cover</h2>
      <p>
        These terms cover two things: the <strong>Mocha Discord bot</strong>, and <strong>this website</strong>,
        including signing in to it with Discord. Using either one means you accept these terms. If you are inviting
        Mocha to a server, you also accept them on behalf of that server's members insofar as the bot operates there.
      </p>

      <h2>Using Mocha</h2>
      <p>When you use Mocha you agree to:</p>
      <ul>
        <li>
          Follow <strong>Discord's Terms of Service and Community Guidelines</strong>. Mocha is a guest on Discord's
          platform, and breaking their rules puts your account and the servers you manage at risk regardless of what
          these terms say.
        </li>
        <li>Follow the laws that apply to you and to the communities you run.</li>
        <li>
          Respect the rules of each server you use Mocha in. Server owners set those rules; Mocha is a tool for
          enforcing them, not an excuse to ignore them.
        </li>
      </ul>

      <h2>Servers, permissions and responsibility</h2>
      <p>
        Mocha acts on a server when a member with the right permissions tells it to. Discord's permission system is
        what decides who that is: a member who cannot ban people in Discord cannot ban people through Mocha, and a
        member who cannot manage roles cannot use the role group.
      </p>
      <p>
        If you invite Mocha to a server, you are responsible for the permissions you grant it and for how your
        moderation team uses it. Actions taken through Mocha — bans, kicks, timeouts, channel locks, role changes —
        are actions taken by the member who ran the command.
      </p>

      <h2>Acceptable use</h2>
      <p>Do not use Mocha, or this website, to:</p>
      <ul>
        <li>Harass, abuse, threaten or defraud other people, or coordinate raids against servers.</li>
        <li>Access systems, accounts or servers you are not authorised to access.</li>
        <li>
          Interfere with the way Mocha works — including circumventing its rate limits, forging its commands, or
          abusing the authentication flow of this website.
        </li>
        <li>Post content that breaks Discord's rules or the law.</li>
      </ul>

      <h2>Free, and Premium</h2>
      <p>
        Mocha's core functionality is free. Premium is optional, and it does not gate commands: it adds more
        decorative and advanced embeds, priority usage during periods of high load, higher command rate limits, and
        additional AI-powered features.
      </p>

      <div className="legal-price-table">
        {PREMIUM_CATEGORIES.map((category) => (
          <div className="legal-price-row" key={category.id}>
            <span className="legal-price-cat">{category.label}</span>
            {category.plans.map((plan) => (
              <span className="legal-price-cell" key={plan.id}>
                <em>{plan.label}</em>
                <b>
                  ${formatPrice(plan.price)}
                  <i>{plan.cadence}</i>
                </b>
              </span>
            ))}
          </div>
        ))}
      </div>

      <p>
        The full description of Premium lives on the <a href="/premium">premium page</a>. Purchases, cancellations and
        refunds are described on the <a href="/refunds">refunds page</a>.
      </p>

      <h2>Changes to Mocha</h2>
      <p>
        Mocha is a product in motion. Features may be added, changed, paused or removed as it develops — including
        commands, games, music behaviour and anything bundled with Premium. Where a change affects something you paid
        for, the <a href="/refunds">refunds page</a> and the support server are where it is dealt with.
      </p>

      <h2>Availability</h2>
      <p>
        Availability is not guaranteed. Mocha depends on Discord's platform and APIs, and maintenance, periods of high
        load, or changes upstream at Discord can affect what works and how quickly. Premium includes priority usage
        during periods of high load; it is not an uptime guarantee.
      </p>

      <h2>Sections still being finalised</h2>
      <Pending label="drafting">
        <p>The following standard sections have not been published yet, and will appear on this page when they are:</p>
        <ul>
          <li>Limitation of liability and disclaimers.</li>
          <li>Suspension or termination of access to Mocha.</li>
          <li>Governing law and dispute resolution.</li>
          <li>Intellectual property — Mocha's branding, and what you may do with content Mocha generates for you.</li>
        </ul>
      </Pending>

      <h2>Changes to these terms</h2>
      <p>
        When these terms change, the updated version is published on this page. Continued use of Mocha or this website
        after a change means you accept the updated terms.
      </p>

      <h2>Contact</h2>
      <p>
        Questions about these terms go to the{" "}
        <a href={DISCORD_URL} target="_blank" rel="noreferrer">
          official Mocha server
        </a>{" "}
        — the same place bug reports and premium questions are handled.
      </p>
    </LegalLayout>
  );
}

/* ======================================================================= */

export function PrivacyPage() {
  return (
    <LegalLayout
      eyebrow="Legal / privacy"
      title="Privacy Policy"
      intro="What the Mocha website stores when you sign in with Discord, how sessions work, what the bot itself needs in order to run its commands, and how to ask for your data."
      ghost="PRIVACY"
      meta={[
        <>
          <b>10</b> sections
        </>,
        <>no ad or analytics scripts</>,
        <>draft in progress</>,
      ]}
    >
      {DRAFT_NOTE}

      <LegalSummary
        items={[
          <>Signing in with Discord stores your Discord id, username, display name, email, avatar hash and encrypted OAuth tokens.</>,
          <>Your browser only ever receives an opaque session cookie — never a Discord token.</>,
          <>This website loads no advertising or analytics scripts.</>,
          <>Avatars are served directly from Discord's CDN.</>,
        ]}
      />

      <h2>What this policy covers</h2>
      <p>
        This policy covers the Mocha website — including signing in with Discord — and the data Mocha needs in order to
        run its commands inside a Discord server. Discord itself has its own privacy policy, which applies to your
        Discord account and to everything you post there.
      </p>

      <h2>Signing in with Discord</h2>
      <p>
        Login uses Discord's OAuth flow. When you authorise it, the website stores the following about your account:
      </p>
      <ul>
        <li>Your Discord user id, username and display name.</li>
        <li>The email address on your Discord account, and whether Discord has verified it.</li>
        <li>Your avatar hash, which is used to build your avatar URL.</li>
        <li>
          Encrypted access and refresh tokens, so the site can act on your behalf later (for example, to list the
          servers you are in when you ask it to) without asking you to log in again.
        </li>
        <li>The list of servers returned when you request your servers, and when that happened.</li>
      </ul>
      <p>
        Tokens are encrypted before they are written to the database and decrypted only inside the server. They are
        never sent to your browser. The encryption key supports rotation, so old tokens can be re-secured without
        logging you out.
      </p>

      <h2>Sessions and cookies</h2>
      <p>Two cookies are involved, and both are first-party and HttpOnly:</p>
      <ul>
        <li>
          <code>mocha_session</code> — set when you log in. It holds a random session id; the server stores only a
          hash of that id, together with a hash of your browser's user agent and an expiry (30 days by default). A
          session presented from a different user agent is treated as stolen and revoked, and logging in again ends
          your other active sessions.
        </li>
        <li>
          <code>mocha_oauth_txn</code> — a short-lived cookie (10 minutes) used only during the login redirect to
          prove the browser finishing the login is the one that started it. It is deleted when the login completes.
        </li>
      </ul>
      <p>
        Logging out deletes your session on the server and clears the cookie. Expired sessions and expired login
        states are swept from the database on a recurring cleanup.
      </p>

      <h2>What the bot processes</h2>
      <p>
        Mocha cannot run its commands without processing some of what happens in your server. Concretely: the command
        you send and its arguments (a member, a channel, a role, a reason, a song query, a prize, a message you
        replied to when creating a quote card), the server and channel it was sent in, and who sent it.
      </p>
      <p>
        Some features only work because data is kept: game statistics and the global leaderboard require per-member
        records, giveaways require their entries and winners, and quote cards are built from the message you reply to.
      </p>
      <Pending label="to be finalised">
        <p>
          The exact bot-side storage — which of the above is written to disk, for how long, and what moderation or
          command logs are kept — is documented separately and this section is being completed. Until it is published
          here, treat anything you send to a command as something Mocha may keep in order to provide that feature.
        </p>
      </Pending>

      <h2>Avatars and images</h2>
      <p>
        Avatars shown in the navigation are loaded by your browser directly from Discord's content delivery network
        (<code>cdn.discordapp.com</code>). The website stores the avatar hash, not the image. If an avatar fails to
        load, Discord's default avatars are used as a fallback.
      </p>

      <h2>How information is used</h2>
      <ul>
        <li>To authenticate you and keep you signed in on this website.</li>
        <li>To provide the bot's features to the servers it is installed in.</li>
        <li>To carry out the moderation, music, game, giveaway and quote actions its members request.</li>
        <li>To answer support requests made through the official server.</li>
        <li>To keep the service secure: rate limiting, session validation, and abuse prevention.</li>
      </ul>

      <h2>How information is protected</h2>
      <ul>
        <li>OAuth tokens encrypted at rest, with support for key rotation.</li>
        <li>Session ids and OAuth states stored only as hashes.</li>
        <li>Sessions bound to the user agent that created them, and revoked when that does not match.</li>
        <li>Rate limiting on the login route, the callback route, and the API in general.</li>
        <li>
          Login CSRF protection (a state bound to your browser via a short-lived cookie) plus PKCE on the
          authorization code exchange.
        </li>
        <li>
          Security response headers on API responses, origin checking on state-changing requests, and HttpOnly
          cookies.
        </li>
        <li>
          Logs deliberately exclude secrets: raw Discord API bodies and token payloads are never written to them.
        </li>
      </ul>

      <h2>Third parties</h2>
      <p>
        Mocha is built on Discord and talks to Discord's API to authenticate you and to perform bot actions. Discord
        is a separate service with its own privacy policy. This website loads no advertising or analytics scripts, and
        its only external asset requests are the fonts it renders with and Discord's avatar CDN.
      </p>

      <h2>Retention and deletion</h2>
      <ul>
        <li>Sessions expire after 30 days by default and are removed from the database by the recurring cleanup.</li>
        <li>Logging out deletes your session immediately.</li>
        <li>
          To ask for the account record this website holds about you to be deleted, contact us through the official
          Mocha server.
        </li>
      </ul>
      <Pending label="to be finalised">
        <p>
          Bot-side retention periods (how long statistics, giveaway records, quote content and any moderation logs are
          kept) are not published yet, and will be listed here when they are decided.
        </p>
      </Pending>

      <h2>Changes to this policy</h2>
      <p>
        When this policy changes, the updated version is published on this page. Material changes to what is collected
        will be reflected here before they take effect.
      </p>

      <h2>Contact</h2>
      <p>
        Privacy questions, access requests and deletion requests are all handled in the{" "}
        <a href={DISCORD_URL} target="_blank" rel="noreferrer">
          official Mocha server
        </a>
        .
      </p>
    </LegalLayout>
  );
}

/* ======================================================================= */

export function RefundsPage() {
  return (
    <LegalLayout
      eyebrow="Legal / refunds"
      title="Refunds"
      intro="What the six Premium plans cost, how a purchase is arranged, and what has not been decided yet about refunds and cancellations."
      ghost="REFUNDS"
      meta={[
        <>
          <b>6</b> plans
        </>,
        <>from $2.99</>,
        <>refund window pending</>,
      ]}
    >
      {DRAFT_NOTE}

      <LegalSummary
        title="The short version"
        items={[
          <>Six plans: User Premium and Server Premium, each monthly, yearly or lifetime.</>,
          <>Lifetime plans are a single payment with no renewal.</>,
          <>Purchases are arranged through the official Mocha server.</>,
          <>The refund window and cancellation rules have not been published yet — see below.</>,
        ]}
      />

      <h2>What you can buy</h2>
      <p>
        Premium is optional. Every Mocha command works without it; Premium adds more decorative and advanced embeds,
        priority usage during periods of high load, higher command rate limits, and additional AI-powered features.
      </p>

      <div className="legal-price-table">
        {PREMIUM_CATEGORIES.map((category) => (
          <div className="legal-price-row" key={category.id}>
            <span className="legal-price-cat">{category.label}</span>
            {category.plans.map((plan) => (
              <span className="legal-price-cell" key={plan.id}>
                <em>{plan.label}</em>
                <b>
                  ${formatPrice(plan.price)}
                  <i>{plan.cadence}</i>
                </b>
              </span>
            ))}
          </div>
        ))}
      </div>

      <p>
        User Premium is tied to your Discord account; Server Premium is tied to one server. Both are described in full
        on the <a href="/premium">premium page</a>.
      </p>

      <h2>How a purchase is arranged</h2>
      <p>
        Purchases are arranged through the{" "}
        <a href={DISCORD_URL} target="_blank" rel="noreferrer">
          official Mocha server
        </a>
        : tell us which plan you want — user or server, and which cycle — and it is set up from there. That is also
        where any question about a purchase is answered fastest.
      </p>

      <h2>Lifetime plans</h2>
      <p>
        A lifetime plan is one payment. Nothing renews, and there is no second charge. It stays tied to the same scope
        it was bought for: your Discord account, for User Premium, or the server it was purchased for, with Server
        Premium.
      </p>

      <h2>Refund window</h2>
      <Pending>
        <p>
          The refund eligibility period and the conditions under which a purchase is refunded have not been published
          yet. This section will state both, in plain numbers, as soon as they are decided.
        </p>
        <p>
          Until then, bring any refund request to the official Mocha server with the plan you bought, when you bought
          it, and what went wrong — it will be handled directly rather than by a form.
        </p>
      </Pending>

      <h2>Cancellations and renewals</h2>
      <Pending>
        <p>
          How monthly and yearly plans renew, how a cancellation is made, and what happens to Premium access between
          cancelling and the end of a paid period are not published yet. Lifetime plans do not renew.
        </p>
      </Pending>

      <h2>If Premium is removed or changes</h2>
      <Pending>
        <p>
          Mocha's features change over time. What happens to an existing Premium purchase if a benefit is removed or
          the product changes shape is not defined here yet, and will be added to this page when it is.
        </p>
      </Pending>

      <h2>Contact</h2>
      <p>
        Refund requests, billing questions and anything about a purchase you have already made: the{" "}
        <a href={DISCORD_URL} target="_blank" rel="noreferrer">
          official Mocha server
        </a>
        . See also the <a href="/terms">Terms of Service</a> and the <a href="/privacy">Privacy Policy</a>.
      </p>
    </LegalLayout>
  );
}

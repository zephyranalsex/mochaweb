import { LegalLayout, LegalSummary } from "./LegalLayout";
import { Callout } from "../../components/ui/primitives";
import { PREMIUM_CATEGORIES, formatPrice } from "../../data/premium";
import { DISCORD_COMMANDS } from "../../data/commands";
import { DISCORD_URL } from "../../lib/site";

/**
 * Terms of Service, Privacy Policy and Refund Policy.
 *
 * The finalised legal documents. They state what Mocha actually does — where
 * a section describes a practice (sessions, tokens, the refund window), the
 * product works that way. Cross-links between the three documents use the
 * canonical routes; everything goes through the official support server.
 */

/** Date shown as "Last updated" on all three legal documents. */
const LAST_UPDATED = "September 8, 2026";

const POLICY_LINKS = [
  { href: "/terms", label: "Terms of Service" },
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/refunds", label: "Refund Policy" },
] as const;

function SupportServerLink() {
  return (
    <a href={DISCORD_URL} target="_blank" rel="noreferrer">
      official Mocha support server
    </a>
  );
}

/** The document's contact list: the support server plus the other two policies. */
function ContactList({ current }: { current: "/terms" | "/privacy" | "/refunds" }) {
  return (
    <ul>
      <li>
        Discord support server: <SupportServerLink />
      </li>
      {POLICY_LINKS.filter((link) => link.href !== current).map((link) => (
        <li key={link.href}>
          {link.label}: <a href={link.href}>{link.href}</a>
        </li>
      ))}
    </ul>
  );
}

/** The six Premium plans, kept in sync with the premium page's numbers. */
function PriceTable() {
  return (
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
  );
}

function Updated() {
  return <p className="legal-updated">Last updated {LAST_UPDATED}</p>;
}

/* ======================================================================= */

export function TermsPage() {
  return (
    <LegalLayout
      eyebrow="Legal / terms"
      title="Terms of Service"
      intro="The rules for using Mocha — the bot, this website, and Premium: what you agree to, how Premium and refunds work, and what happens when things go wrong."
      ghost="TERMS"
      meta={[
        <>
          <b>15</b> sections
        </>,
        <>
          <b>last updated</b> {LAST_UPDATED}
        </>,
        <>covers the bot + this site</>,
      ]}
    >
      <Updated />

      <p>
        These Terms of Service ("Terms") govern your access to and use of Mocha, including the Mocha Discord bot, this
        website, Premium services, commands, features, and related services (collectively, the "Service").
      </p>

      <Callout tone="note" title="Independent of Discord">
        <p>
          Mocha is an independently developed project operated by an individual developer. It is not owned, operated,
          endorsed, sponsored by, or affiliated with Discord Inc. or its affiliates. Discord is a separate third-party
          service, subject to its own terms, policies, and requirements.
        </p>
      </Callout>

      <p>
        By inviting Mocha to a Discord server, using the Service, authorizing Mocha through Discord, or purchasing a
        Mocha Premium service, you agree to these Terms to the extent permitted by applicable law. If you do not agree
        to these Terms, you must not use, authorize, invite, or purchase the Service.
      </p>

      <LegalSummary
        items={[
          <>Using Mocha means following these Terms, Discord's own rules, and the laws that apply to you.</>,
          <>
            Every command is free — all {DISCORD_COMMANDS.length} of them. Premium is optional and adds polish,
            capacity and priority.
          </>,
          <>
            Refunds follow the <a href="/refunds">refund policy</a>: a six-hour window from the completed transaction.
          </>,
          <>Mocha's AI features can produce wrong output — check anything important before relying on it.</>,
          <>Features can change or be removed as Mocha develops; availability is not guaranteed.</>,
        ]}
      />

      <h2>Eligibility</h2>
      <p>Mocha is intended to be available to users of all ages.</p>
      <p>
        Certain activities — including purchases, and particular uses of the Service — may be subject to age
        requirements, parental or guardian authorization, payment-provider requirements, or other legal requirements.
      </p>
      <p>
        You are responsible for making sure that your use of the Service, and any transaction you enter into, complies
        with the requirements that apply to you.
      </p>

      <h2>Discord</h2>
      <p>
        Your use of Mocha through Discord is additionally subject to Discord's Terms of Service, Community Guidelines,
        Developer Terms, and other applicable Discord policies. You must not use Mocha in a manner that violates
        Discord's rules.
      </p>
      <p>
        Mocha does not control Discord and cannot guarantee the availability, functionality, compatibility, or
        continued operation of Discord or any Discord API, feature, or service.
      </p>

      <h2>Acceptable use</h2>
      <p>You may use Mocha only for lawful and legitimate purposes. You must not use the Service to:</p>
      <ul>
        <li>harass, threaten, bully, stalk, intimidate, or target another person;</li>
        <li>facilitate unlawful activity;</li>
        <li>distribute or generate content intended to cause unlawful harm;</li>
        <li>conduct spam, raids, unsolicited advertising, or other abusive activity;</li>
        <li>interfere with the operation or availability of the Service;</li>
        <li>attempt to obtain unauthorized access to Mocha, its infrastructure, accounts, databases, APIs, or other systems;</li>
        <li>bypass or circumvent access controls, rate limits, restrictions, subscription limitations, or other safeguards;</li>
        <li>exploit vulnerabilities, bugs, or unintended behavior for unauthorized benefit;</li>
        <li>impersonate Mocha, its operator, staff, or another person for deceptive purposes;</li>
        <li>use the Service for fraud or other deceptive conduct;</li>
        <li>
          manipulate accounts, transactions, entitlements, promotions, refunds, or other Service systems for an
          unauthorized advantage; or
        </li>
        <li>
          use the Service in any manner that is unlawful, fraudulent, abusive, or reasonably likely to cause material
          harm to Mocha, its operator, other users, Discord, or another third party.
        </li>
      </ul>
      <p>
        The examples above are not exhaustive. Conduct that achieves substantially the same prohibited result through
        another method is also prohibited.
      </p>

      <h2>Bugs, vulnerabilities, and security</h2>
      <p>
        You must not intentionally exploit, weaponize, disclose for exploitation, or distribute instructions intended
        to facilitate exploitation of vulnerabilities or unintended behavior in Mocha.
      </p>
      <p>
        If you discover a bug or security vulnerability, report it privately through the <SupportServerLink />.
      </p>
      <p>
        Reporting a vulnerability does not grant permission to access systems, information, or functionality that you
        would not otherwise be authorized to access.
      </p>

      <h2>Artificial intelligence features</h2>
      <p>Mocha may provide features that use artificial intelligence systems operated by Mocha or third-party providers.</p>
      <p>
        AI-generated output may be inaccurate, incomplete, misleading, offensive, or otherwise unsuitable for a
        particular purpose. AI systems may also produce incorrect output due to technical limitations, hallucinations,
        malfunction, or malicious or misleading input.
      </p>
      <p>
        Mocha does not guarantee the accuracy, reliability, completeness, or suitability of AI-generated content. You
        are responsible for evaluating AI-generated output before relying upon it.
      </p>
      <p>You must not use AI features for purposes prohibited by these Terms or applicable law.</p>

      <h2>Intellectual property</h2>
      <p>
        Mocha's original software, source code, branding, visual materials, interfaces, written materials, designs,
        and other original content are owned by or licensed to the operator of Mocha, except for third-party materials.
      </p>
      <p>Except where expressly permitted by law or authorized in writing, you may not:</p>
      <ul>
        <li>reproduce or redistribute Mocha's proprietary software or materials;</li>
        <li>sell, sublicense, or commercially exploit Mocha's proprietary materials;</li>
        <li>create a substantially similar service using copied or extracted proprietary material;</li>
        <li>reverse engineer, decompile, disassemble, or attempt to derive source code or underlying implementation; or</li>
        <li>scrape or systematically extract proprietary data, functionality, or content for unauthorized purposes.</li>
      </ul>
      <p>Nothing in these Terms transfers ownership of Mocha or its intellectual property to you.</p>

      <h2>Premium services</h2>
      <p>
        Mocha offers certain features for purchase under the Premium name. The applicable price, billing period,
        included features, and other material purchase terms are presented before purchase. Premium pricing, features,
        availability, and subscription structures may be changed prospectively.
      </p>
      <p>
        Premium does not gate Mocha's commands: every command works without it. A purchase adds more decorative and
        advanced embeds, priority usage during periods of high load, higher command rate limits, and additional
        AI-powered features.
      </p>

      <PriceTable />

      <p>
        A Premium purchase grants access to the applicable service for the purchased period. It does not grant
        ownership of Mocha, its software, source code, intellectual property, or any underlying technology. User
        Premium is tied to your Discord account, Server Premium is tied to one server, and lifetime plans are a single
        payment with no renewal — the full description lives on the <a href="/premium">premium page</a>.
      </p>
      <p>
        Premium access may depend upon third-party services, including Discord, hosting providers, payment providers,
        and other infrastructure.
      </p>

      <h2>Payments and refunds</h2>
      <p>Premium purchases are subject to the payment provider used for the relevant transaction.</p>
      <p>
        The <a href="/refunds">refund policy</a> governs Mocha's refund rules — including the six-hour refund window —
        except where the applicable payment provider's terms or mandatory law provide otherwise.
      </p>
      <p>Nothing in these Terms or the Refund Policy removes a consumer right that cannot legally be excluded.</p>
      <p>
        You must not submit fraudulent payment disputes, chargebacks, refund requests, or other claims for the purpose
        of obtaining Premium services without paying for them. Where a transaction is reversed, refunded, or charged
        back, the associated Premium entitlement may be revoked.
      </p>

      <h2>Suspension and termination</h2>
      <p>Mocha may suspend, restrict, or terminate your access to all or part of the Service where it reasonably determines that you:</p>
      <ul>
        <li>violated these Terms;</li>
        <li>violated applicable law or relevant third-party requirements;</li>
        <li>engaged in fraud, abuse, deception, or unauthorized use;</li>
        <li>attempted to circumvent technical, account, payment, subscription, or access restrictions;</li>
        <li>created a material security, operational, or legal risk; or</li>
        <li>engaged in conduct materially inconsistent with the legitimate operation of the Service.</li>
      </ul>
      <p>
        Where reasonably practicable, notice may be provided before suspension or termination. Immediate action may be
        taken where reasonably necessary to protect the Service, its users, its infrastructure, or its legitimate
        interests.
      </p>
      <p>
        Suspension or termination does not create an automatic right to a refund. Any rights that cannot lawfully be
        excluded remain unaffected.
      </p>

      <h2>Availability and changes</h2>
      <p>
        Mocha is an actively developed project. Features may be added, removed, changed, restricted, suspended, or
        discontinued — no particular command, feature, integration, or Premium benefit is guaranteed to remain
        available permanently.
      </p>
      <p>
        The Service may experience downtime, maintenance, technical failures, or interruptions caused by Mocha or by
        third-party services.
      </p>

      <h2>Disclaimer</h2>
      <p>
        To the fullest extent permitted by applicable law, the Service is provided on an "as is" and "as available"
        basis. Mocha does not guarantee that it will always be uninterrupted, error-free, secure, accurate, or
        available.
      </p>
      <p>Nothing in these Terms excludes any right, guarantee, warranty, or protection that cannot legally be excluded.</p>

      <h2>Limitation of liability</h2>
      <p>
        To the fullest extent permitted by applicable law, the operator of Mocha will not be liable for indirect,
        incidental, consequential, special, exemplary, or punitive damages, or for loss of profits, revenue, data,
        goodwill, or business opportunities, arising from or relating to use of the Service.
      </p>
      <p>Nothing in these Terms excludes or limits liability where doing so would be unlawful.</p>

      <h2>Changes to these terms</h2>
      <p>
        These Terms may be updated as the Service develops. The current version is published on this page with an
        updated "Last updated" date — currently {LAST_UPDATED}.
      </p>
      <p>Where applicable law requires a different method of obtaining agreement to a material change, that method will be used.</p>

      <h2>Governing rules</h2>
      <p>
        These Terms are subject to applicable law. Nothing in them is intended to deprive a consumer of a mandatory
        legal protection or right that cannot lawfully be excluded.
      </p>

      <h2>Contact</h2>
      <p>
        For support, privacy requests, refund requests, bug reports, security reports, or questions concerning these
        Terms, contact Mocha through the official support server:
      </p>
      <ContactList current="/terms" />
    </LegalLayout>
  );
}

/* ======================================================================= */

export function PrivacyPage() {
  return (
    <LegalLayout
      eyebrow="Legal / privacy"
      title="Privacy Policy"
      intro="What Mocha collects when you use the website and the bot, how that information is used and protected, how long it is kept, and how to ask for your data."
      ghost="PRIVACY"
      meta={[
        <>
          <b>13</b> sections
        </>,
        <>
          <b>last updated</b> {LAST_UPDATED}
        </>,
        <>no ad or analytics scripts</>,
      ]}
    >
      <Updated />

      <p>
        This Privacy Policy explains how Mocha collects, uses, stores, and protects information when you use the Mocha
        website, the Mocha Discord bot, Premium services, and related services.
      </p>

      <Callout tone="note" title="Independent of Discord">
        <p>
          Mocha is an independently developed project operated by an individual developer and is not owned, operated,
          endorsed, sponsored by, or affiliated with Discord Inc. or its affiliates. Your Discord account itself is
          covered by Discord's own privacy policy.
        </p>
      </Callout>

      <LegalSummary
        items={[
          <>Signing in with Discord stores your Discord id, username, display name, email, avatar hash and encrypted OAuth tokens.</>,
          <>Your browser only ever receives an opaque session cookie — never a Discord token.</>,
          <>This website loads no advertising or analytics scripts.</>,
          <>Avatars are loaded by your browser directly from Discord's CDN; the site stores only the hash.</>,
          <>Mocha does not sell personal information for advertising purposes.</>,
        ]}
      />

      <h2>Information collected</h2>
      <p>The information collected depends on how you use Mocha.</p>

      <h3>Website use</h3>
      <p>
        You may access publicly available portions of the Mocha website without logging in or authorizing Mocha. Mocha
        does not intentionally store personal information merely because you visit a public page, except where
        information is automatically processed by services required to operate, secure, or maintain the website.
      </p>
      <p>
        Depending on the infrastructure used, technical information may be processed, such as IP address, browser
        information, device information, timestamps, and request information.
      </p>

      <h3>Discord authorization</h3>
      <p>
        If you authorize Mocha through Discord, Mocha receives the information made available through the Discord
        permissions and OAuth scopes that you grant. Concretely, signing in to this website stores:
      </p>
      <ul>
        <li>your Discord user id, username, and display name;</li>
        <li>the email address on your Discord account, and whether Discord has verified it;</li>
        <li>your avatar hash, which is used to build your avatar URL;</li>
        <li>
          encrypted access and refresh tokens, so the site can act on your behalf inside the features you use without
          asking you to log in again; and
        </li>
        <li>the list of servers you are a member of, when you ask the site to fetch it.</li>
      </ul>
      <p>
        Tokens are encrypted before they are written to the database and decrypted only inside the server — they are
        never sent to your browser. Mocha only receives information made available through the permissions and
        functionality actually used by the Service, and the permissions requested may change as the Service develops.
        You should review the Discord authorization screen before authorizing Mocha.
      </p>

      <h3>Sessions and cookies</h3>
      <p>Two cookies are involved, and both are first-party and HttpOnly:</p>
      <ul>
        <li>
          <code>mocha_session</code> — set when you log in. It holds a random session id; the server stores only a hash
          of that id, together with a hash of your browser's user agent and an expiry (30 days by default). A session
          presented from a different user agent is treated as stolen and revoked, and logging in again ends your other
          active sessions.
        </li>
        <li>
          <code>mocha_oauth_txn</code> — a short-lived cookie (10 minutes) used only during the login redirect to prove
          that the browser finishing the login is the one that started it. It is deleted when the login completes.
        </li>
      </ul>
      <p>
        Logging out deletes your session on the server and clears the cookie. Expired sessions and expired login
        states are swept from the database by a recurring cleanup.
      </p>

      <h3>Premium and transaction information</h3>
      <p>
        Where you purchase Premium, Mocha processes the information necessary to identify and administer the
        transaction. This may include transaction identifiers, subscription and purchase status, account identifiers,
        and other information supplied by the payment provider. Payment information is processed directly by the
        applicable payment provider rather than stored by Mocha.
      </p>

      <h2>How information is used</h2>
      <p>Information may be used to:</p>
      <ul>
        <li>operate and provide Mocha;</li>
        <li>authenticate authorized users;</li>
        <li>administer Premium services and subscriptions;</li>
        <li>process and investigate refunds and payment disputes;</li>
        <li>provide customer support;</li>
        <li>maintain security;</li>
        <li>detect fraud, abuse, and circumvention;</li>
        <li>investigate violations of the Terms of Service;</li>
        <li>maintain and improve the Service;</li>
        <li>comply with applicable legal obligations; and</li>
        <li>protect Mocha, its operator, users, and third parties.</li>
      </ul>
      <p>Mocha does not sell personal information for advertising purposes.</p>

      <h2>Third-party providers</h2>
      <p>Mocha may rely upon third-party services necessary to operate the Service, including providers for:</p>
      <ul>
        <li>hosting;</li>
        <li>databases;</li>
        <li>authentication;</li>
        <li>Discord integrations;</li>
        <li>artificial intelligence;</li>
        <li>payment processing;</li>
        <li>security;</li>
        <li>analytics; and</li>
        <li>other technical infrastructure.</li>
      </ul>
      <p>
        Where a third-party provider processes information on behalf of Mocha, that processing is subject to the
        provider's applicable terms and policies as well as any requirements imposed upon Mocha.
      </p>
      <p>
        Mocha does not intentionally provide personal information to unrelated third parties for their own advertising
        purposes. This website itself loads no advertising or analytics scripts — its only external asset requests are
        the fonts it renders with and Discord's avatar CDN.
      </p>

      <h2>Artificial intelligence</h2>
      <p>
        Some Mocha features use third-party artificial intelligence services. Where necessary to provide those
        features, information may be transmitted to the relevant AI provider; what is transmitted depends on the
        feature being used and its technical implementation.
      </p>
      <p>You should not submit sensitive, confidential, or unnecessary personal information to an AI feature.</p>

      <h2>Data retention</h2>
      <p>
        Mocha retains personal information only for as long as reasonably necessary for legitimate operational,
        security, legal, contractual, dispute-resolution, or other stated purposes. Different categories of
        information may be retained for different periods:
      </p>
      <ul>
        <li>
          Website sessions expire after 30 days by default and are removed from the database by the recurring cleanup;
          logging out deletes your session immediately.
        </li>
        <li>
          Records that exist to provide a bot feature — game statistics and the global leaderboard, giveaway entries
          and winners, quote cards — are kept for as long as they remain needed to provide that feature.
        </li>
      </ul>
      <p>
        When information is no longer reasonably required, Mocha may delete or anonymize it, subject to lawful
        retention requirements, security considerations, backups, technical limitations, or unresolved disputes.
      </p>

      <h2>Data security</h2>
      <p>
        Reasonable technical and organizational measures are used to protect personal information against unauthorized
        access, disclosure, alteration, loss, or misuse. In concrete terms:
      </p>
      <ul>
        <li>OAuth tokens are encrypted at rest, with support for key rotation.</li>
        <li>Session ids and OAuth states are stored only as hashes.</li>
        <li>Sessions are bound to the browser that created them, and revoked when that does not match.</li>
        <li>The login route, the callback route, and the API in general are rate-limited.</li>
        <li>
          Login uses CSRF protection (a state bound to your browser via a short-lived cookie) plus PKCE on the
          authorization code exchange.
        </li>
        <li>
          API responses carry security headers, state-changing requests are origin-checked, and cookies are HttpOnly.
        </li>
        <li>Logs deliberately exclude secrets: raw Discord API bodies and token payloads are never written to them.</li>
      </ul>
      <p>
        However, no online service, database, communication system, or electronic storage system can be guaranteed to
        be completely secure. Accordingly, Mocha cannot guarantee that unauthorized access or security incidents will
        never occur.
      </p>

      <h2>Disclosure of information</h2>
      <p>Information may be disclosed where reasonably necessary to:</p>
      <ul>
        <li>comply with applicable law or a lawful legal process;</li>
        <li>investigate fraud, abuse, security incidents, or violations of the Terms;</li>
        <li>protect Mocha, its operator, users, or third parties;</li>
        <li>enforce legal or contractual rights; or</li>
        <li>investigate payment disputes, refunds, fraud claims, or chargebacks.</li>
      </ul>
      <p>
        Where appropriate and legally permitted, disclosure is limited to the information reasonably relevant to the
        purpose at hand.
      </p>

      <h2>Privacy requests</h2>
      <p>
        Depending on applicable law, you may have rights concerning personal information held by Mocha, including
        rights relating to access, correction, deletion, restriction, or other forms of control. Privacy requests are
        submitted through the <SupportServerLink />.
      </p>
      <p>
        Mocha may request sufficient information to verify a request before taking action. Some information may be
        retained where required by law, necessary to prevent fraud or abuse, necessary to establish or defend legal
        claims, or otherwise subject to a lawful exception.
      </p>

      <h2>Discord authorization and deletion</h2>
      <p>
        If you authorized Mocha through Discord and later want the information associated with that authorization
        deleted, submit a request through the <SupportServerLink />.
      </p>
      <p>
        Removing or revoking Discord authorization does not necessarily delete information that Mocha is legally or
        legitimately required to retain. If you authorize Mocha again later, information made available through the
        new authorization may be processed again.
      </p>

      <h2>Children and minors</h2>
      <p>
        Mocha is intended to be available to users of all ages. Applicable laws may nevertheless impose additional
        requirements concerning the collection of personal information from children, or the ability of minors to
        enter into certain transactions — where parental or guardian authorization is required by law, that
        requirement remains applicable.
      </p>
      <p>Mocha does not knowingly require users to provide unnecessary personal information belonging to another person.</p>

      <h2>International processing</h2>
      <p>
        Mocha may use service providers whose infrastructure is located in countries other than the country in which
        you reside. As a result, information may be processed or stored internationally. Where applicable law imposes
        requirements on international data transfers, Mocha will take the measures required by that law.
      </p>

      <h2>Changes to this policy</h2>
      <p>
        This Privacy Policy may be updated when Mocha's services, data practices, or applicable requirements change.
        The latest version is published on this page with an updated "Last updated" date — currently {LAST_UPDATED}.
        Where applicable law requires additional notice or consent for a material change, the required process will be
        followed.
      </p>

      <h2>Contact</h2>
      <p>Privacy requests and questions are submitted through the official support server:</p>
      <ContactList current="/privacy" />
    </LegalLayout>
  );
}

/* ======================================================================= */

export function RefundsPage() {
  return (
    <LegalLayout
      eyebrow="Legal / refunds"
      title="Refund Policy"
      intro="What the six Premium plans cost, how a purchase is arranged, and the rules for refunds — including the six-hour refund window and how abuse of it is handled."
      ghost="REFUNDS"
      meta={[
        <>
          <b>6</b> plans
        </>,
        <>from $2.99</>,
        <>
          <b>last updated</b> {LAST_UPDATED}
        </>,
      ]}
    >
      <Updated />

      <p>
        This Refund Policy applies to purchases of Mocha Premium services and other paid digital services. Where a
        purchase is processed through a third-party payment provider, the provider's applicable terms and mandatory
        consumer protections may also apply.
      </p>
      <p>
        Nothing in this Refund Policy limits, excludes, or waives any refund, cancellation, withdrawal, warranty, or
        other consumer right that cannot legally be limited or waived.
      </p>

      <Callout tone="note" title="The six-hour rule">
        <p>
          If a purchase is not what you expected, you can request a refund within six hours of the completed
          transaction, through the official support server. A request inside the window is a request — not an
          automatic approval. The conditions in this policy decide the outcome.
        </p>
      </Callout>

      <LegalSummary
        title="The short version"
        items={[
          <>Six plans: User Premium and Server Premium, each monthly, yearly or lifetime — from $2.99.</>,
          <>The refund window is six hours, measured from when the payment provider records the transaction as completed.</>,
          <>
            Requests go through the <a href={DISCORD_URL} target="_blank" rel="noreferrer">official support server</a>,
            with enough detail to identify the transaction.
          </>,
          <>Approved refunds go back through the original payment method; processing time depends on the provider.</>,
          <>Fraud, chargeback abuse, and related-account circumvention are denied — and the associated Premium revoked.</>,
        ]}
      />

      <h2>Premium plans</h2>
      <p>
        Premium is optional — every Mocha command works without it. There are six plans: User Premium, tied to your
        Discord account, and Server Premium, tied to one server; each is available monthly, yearly, or as a lifetime
        one-time payment.
      </p>

      <PriceTable />

      <p>
        Purchases are arranged through the <SupportServerLink />: tell us which plan you want — user or server, and
        which cycle — and it is set up from there. That is also where any question about a purchase is answered
        fastest. Lifetime plans are a single payment: nothing renews, and there is no second charge.
      </p>

      <h2>Standard refund period</h2>
      <p>
        Subject to the conditions of this policy and any mandatory legal rights, an eligible customer may request a
        refund within six (6) hours of the applicable transaction. A request made within the six-hour period is a
        request for a refund — it does not automatically guarantee approval.
      </p>
      <p>
        The six-hour period is calculated from the time the relevant transaction is recorded as successfully completed
        by the applicable payment provider.
      </p>
      <p>
        After six hours, discretionary refund requests will ordinarily not be accepted, except where a refund is
        required by applicable law or an exception is otherwise appropriate.
      </p>

      <h2>How to request a refund</h2>
      <p>
        Refund requests are submitted through the <SupportServerLink />. Provide sufficient information for the
        transaction to be identified — the plan, roughly when you bought it, and what went wrong. Mocha may request
        information reasonably necessary to verify the transaction and evaluate the request.
      </p>

      <h2>When a refund may be denied</h2>
      <p>A refund may be denied where:</p>
      <ul>
        <li>the refund period has expired and no mandatory legal right to a refund applies;</li>
        <li>the refund request contains false or materially misleading information;</li>
        <li>there is reasonable evidence of fraud or abuse;</li>
        <li>there is reasonable evidence that the purchase, account, or refund process has been manipulated;</li>
        <li>the request is part of an attempt to circumvent purchase, subscription, account, or refund restrictions;</li>
        <li>
          the Premium service was knowingly used in a manner materially inconsistent with the applicable purchase
          terms before the refund request;
        </li>
        <li>there is reasonable evidence of repeated or coordinated abuse of the refund system; or</li>
        <li>granting the refund would improperly provide a financial benefit the customer was not entitled to receive.</li>
      </ul>
      <p>These circumstances are not exhaustive.</p>

      <h2>Refund abuse and circumvention</h2>
      <p>
        You must not attempt to obtain Premium services, refunds, discounts, promotional benefits, or other financial
        advantages by circumventing the intended operation of Mocha's purchase or refund systems. Prohibited conduct
        includes, without limitation:
      </p>
      <ul>
        <li>manipulating account or transaction relationships to circumvent restrictions;</li>
        <li>making transactions through related accounts for the purpose of defeating purchase or refund limitations;</li>
        <li>providing false information in a refund request;</li>
        <li>repeatedly obtaining Premium access and subsequently reversing payment without a legitimate basis;</li>
        <li>exploiting technical defects or unintended behavior to obtain Premium access or a financial benefit;</li>
        <li>
          intentionally creating transactions or account activity designed to defeat fraud-prevention, purchase, or
          refund controls;
        </li>
        <li>coordinating with another person to circumvent restrictions; or</li>
        <li>
          otherwise attempting to obtain the benefit of a paid service without bearing the corresponding payment
          obligation.
        </li>
      </ul>
      <p>
        Mocha is not required to disclose internal fraud-detection methods, thresholds, technical safeguards,
        account-linking methods, or other measures used to detect or prevent abuse.
      </p>

      <h2>Related accounts and transactions</h2>
      <p>
        For the purpose of investigating suspected abuse, transactions and accounts may be considered related where
        there is reasonable evidence that they are being used together to circumvent restrictions or obtain an
        unauthorized benefit.
      </p>
      <p>
        Different usernames, Discord accounts, email addresses, payment methods, or other identifiers do not
        necessarily prevent transactions from being treated as related when the surrounding circumstances reasonably
        indicate coordinated activity.
      </p>

      <h2>Technical failures</h2>
      <p>
        Where Premium was purchased successfully but a material technical failure attributable to Mocha prevented you
        from receiving the purchased service, contact support. Depending on the circumstances, Mocha may:
      </p>
      <ul>
        <li>restore the affected Premium access;</li>
        <li>extend the applicable subscription;</li>
        <li>provide an appropriate replacement benefit; or</li>
        <li>issue a full or partial refund.</li>
      </ul>
      <p>
        The appropriate remedy depends on the circumstances of the issue. Temporary outages, scheduled maintenance,
        third-party failures, or minor interruptions do not automatically create a refund entitlement unless required
        by applicable law.
      </p>

      <h2>Unauthorized transactions</h2>
      <p>
        If you believe a transaction was genuinely unauthorized, contact the payment provider and Mocha promptly — the{" "}
        <SupportServerLink /> is the fastest way to reach Mocha.
      </p>
      <p>
        You must not falsely characterize an authorized transaction as unauthorized for the purpose of obtaining a
        refund or reversing payment.
      </p>
      <p>
        Where a payment provider reverses a transaction, the associated Premium entitlement may be suspended or
        revoked while the matter is reviewed.
      </p>

      <h2>Chargebacks and payment reversals</h2>
      <p>A chargeback or payment reversal does not by itself establish that a refund was legitimately owed.</p>
      <p>
        Where reasonably necessary, Mocha may provide relevant transaction or account information to the applicable
        payment provider in connection with payment disputes, fraud investigations, refunds, or chargebacks, subject
        to applicable law.
      </p>
      <p>
        Where a legitimate transaction is reversed after Premium access has been provided, Mocha may revoke the
        associated Premium entitlement and may restrict further purchases where reasonably necessary to prevent abuse.
      </p>

      <h2>Partial refunds</h2>
      <p>
        Where appropriate, a partial refund may be issued instead of a full refund. A partial refund provided in one
        case does not establish an entitlement to the same remedy in future cases.
      </p>

      <h2>Terminated accounts</h2>
      <p>
        Where access to Premium is terminated because of fraud, abuse, circumvention, or a material violation of the{" "}
        <a href="/terms">Terms of Service</a>, termination does not by itself create an entitlement to a discretionary
        refund. This does not affect any refund right that cannot legally be excluded.
      </p>

      <h2>Refund processing</h2>
      <p>
        Approved refunds are normally processed through the original payment method or through the applicable payment
        provider's refund mechanism. The time required for a refund to appear may depend on the payment provider,
        bank, card issuer, or other financial institution — Mocha does not control third-party processing times.
      </p>

      <h2>Mandatory legal rights</h2>
      <p>
        Nothing in this policy is intended to remove or restrict any statutory right that applies to a customer and
        cannot legally be excluded. Where mandatory law provides greater rights than those stated in this policy, the
        mandatory law prevails to the extent required.
      </p>

      <h2>Changes to this policy</h2>
      <p>
        This policy may be updated from time to time. The version applicable to a transaction is generally the version
        in effect when that transaction was completed, except where a later change is legally required or expressly
        provides greater rights. The current version is the one published above, last updated {LAST_UPDATED}.
      </p>

      <h2>Contact</h2>
      <p>Refund requests are submitted through the official support server:</p>
      <ContactList current="/refunds" />
    </LegalLayout>
  );
}

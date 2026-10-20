import { createFileRoute, Link } from "@tanstack/react-router";
import { LegalCallout, LegalPage } from "@/components/LegalPage";
import { SiteShell } from "@/components/SiteShell";
import { SITE } from "@/lib/site-knowledge";

export const Route = createFileRoute("/data-protection")({ component: Page });

/**
 * The processing side of the shop, as it actually is.
 *
 * The privacy page tells a customer their rights. This page tells them what we
 * are as an organisation: which law, which data, which processors, how long, and
 * who to write to. Every processor named here is one this application is
 * configured to use — hosting, the Postgres database, Google sign-in, the email
 * sender, and the courier whose name a customer writes at the top of their
 * address. Nothing speculative.
 */

const COLLECTS: { what: string; why: string; ifRefused: string }[] = [
  {
    what: "Name, email, sign-in provider, profile picture",
    why: "To create and recognise your account, and to address you in your own dashboard.",
    ifRefused: "No account — you can still book as a guest.",
  },
  {
    what: "Phone number and delivery address",
    why: "To pack, ship and deliver the piece, and to reach you if the courier cannot.",
    ifRefused: "We cannot deliver an order.",
  },
  {
    what: "The pieces you booked, quantities, amounts, booking reference",
    why: "To confirm the right item, issue an invoice, and answer “which one was it?” a year later.",
    ifRefused: "We cannot fulfil or trace an order.",
  },
  {
    what: "Messages you send on WhatsApp, Instagram or through the site",
    why: "To answer the question you asked, and to keep the promise attached to a booking.",
    ifRefused: "Nothing — but there is no conversation to work from.",
  },
  {
    what: "Session and security records: sign-in token, IP address, user agent, dates",
    why: "To keep you signed in, to detect an account being used from somewhere else, and to protect the shop.",
    ifRefused: "Sign-in cannot work.",
  },
  {
    what: "Cart and saved pieces, held in your browser",
    why: "So a reload does not empty your cart.",
    ifRefused: "The cart becomes a per-page list.",
  },
];

function CollectsTable() {
  return (
    <table>
      <caption>What · Why · What happens if you decline</caption>
      <thead>
        <tr>
          <th scope="col">Data</th>
          <th scope="col">Why we need it</th>
          <th scope="col">If you decline</th>
        </tr>
      </thead>
      <tbody>
        {COLLECTS.map((r) => (
          <tr key={r.what}>
            <td className="text-fg">{r.what}</td>
            <td>{r.why}</td>
            <td>{r.ifRefused}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function Page() {
  return (
    <SiteShell>
      <LegalPage
        title="Data protection"
        kicker="Your data"
        updated="20 October 2026"
        wide
        image="/images/nav-craft.jpg"
        imageAlt="Hand-strung beads at the Raakha Grace bench"
        toc={[
          { href: "#who", label: "Who we are" },
          { href: "#law", label: "The law we answer to" },
          { href: "#collect", label: "What we collect, and why" },
          { href: "#never", label: "What we never touch" },
          { href: "#basis", label: "The basis for processing" },
          { href: "#sharing", label: "Who sees your data" },
          { href: "#security", label: "How it is protected" },
          { href: "#retention", label: "How long we keep it" },
          { href: "#rights", label: "Your rights" },
          { href: "#grievance", label: "Grievance redressal" },
        ]}
      >
        <p>
          This page is the working document behind the <a href="/privacy">privacy policy</a>: what
          the atelier collects, on what legal footing, who else touches it, how long it stays, and
          exactly how to get it corrected or removed. It is written to be read by a customer, not to
          be filed.
        </p>

        <LegalCallout
          label="Three sentences of it"
          points={[
            "We keep only what an order needs — an identity, an address, and a list of pieces.",
            "No payment card data ever reaches this site, and we do not sell or rent your data, ever.",
            "One message on WhatsApp gets you a copy, a correction, or a deletion.",
          ]}
        />

        <h2 id="who">Who we are</h2>
        <p>
          Raakha Grace is an independent handmade jewellery atelier in Hyderabad, Telangana, India,
          operating this website and taking orders through it and through WhatsApp. For everything
          on this page, the atelier itself is the party that decides why and how personal data is
          processed — there is no separate data-protection agency, and no third party sets the terms
          for your data except the ones listed under “Who sees your data”.
        </p>
        <p>
          You can reach the person responsible for this at {SITE.whatsapp} on WhatsApp, or by
          Instagram DM at <a href={SITE.instagram}>@raakhagrace</a>. Both routes reach the founder
          directly.
        </p>

        <h2 id="law">The law we answer to</h2>
        <p>
          This shop is run in India, for customers in India, so the framework we write against is
          the <strong>Digital Personal Data Protection Act, 2023</strong> — which is the law that
          replaced the older Information Technology rules for personal data — together with the
          consumer-facing obligations of the Consumer Protection Act, 2019 and its E-Commerce Rules,
          2020. Where a customer is in a region with a stricter standard, we apply the stricter
          standard rather than the local minimum: the rights below are offered to everyone, not only
          to people protected by Indian law.
        </p>
        <p>
          What that means practically is that each of the DPDP concepts has a plain answer on this
          page: the data we are responsible for, the purpose behind each piece of it, the people we
          entrust it to, the clock on keeping it, and a route to complain that a human reads.
        </p>

        <h2 id="collect">What we collect, and why</h2>
        <p>
          Every row below exists because an order needs it. We do not collect data “in case it is
          useful later”.
        </p>
        <CollectsTable />

        <h2 id="never">What we never touch</h2>
        <p>
          There is no card checkout on this site, so there is no card number, no CVV, and no bank
          login to intercept — payment happens between your UPI app or bank and our account, and the
          only record kept here is that the order was paid for. We do not ask for government ID, do
          not read your contacts, do not track where else you have been on the internet, do not buy
          marketing lists, and do not sell, rent or exchange your data with anyone.
        </p>
        <p>
          The <a href="/cookie-information">cookie information page</a> lists every cookie and
          storage key this site writes; none of them is an advertising or tracking cookie.
        </p>

        <h2 id="basis">The basis for processing</h2>
        <ul>
          <li>
            <strong>Your consent</strong>, given when you create an account or start a booking and
            withdrawable at any time. Withdrawing consent on an active order is not something we can
            complete while the parcel is still in transit — we would have to be able to deliver what
            you bought — but it applies to everything after.
          </li>
          <li>
            <strong>Performance of the order</strong> — the address, the phone number, the pieces and
            the reference. This is a contract, not a preference.
          </li>
          <li>
            <strong>A legal obligation</strong> — records that tax or consumer law requires us to
            keep, and any lawful request from an authority, which we would answer and tell you about
            unless we are prohibited from doing so.
          </li>
          <li>
            <strong>A legitimate, narrow purpose</strong> — keeping the shop secure, and the honest
            arithmetic in the atelier desk: how many bookings, which pieces, which statuses. Counted
            from orders and accounts in our own database. We do not reach that number by following
            visitors around the web.
          </li>
        </ul>

        <h2 id="sharing">Who sees your data</h2>
        <p>
          We share the least each party needs to do its job, and only with these:
        </p>
        <ul>
          <li>
            <strong>Our hosting and database providers.</strong> The site runs on Vercel and the
            data lives in a managed Neon Postgres database. They store what we write; they are not
            given permission to use it for their own purposes.
          </li>
          <li>
            <strong>Google</strong>, if you sign in with it. Google handles the authentication and
            hands us back your name, email and profile picture. We do not receive your Google
            password, and we do not get a list of your other account data.
          </li>
          <li>
            <strong>Our transactional email provider (Resend)</strong>, for the verification and
            welcome messages, and the enquiry mail that carries the details of a piece you asked
            about.
          </li>
          <li>
            <strong>WhatsApp (Meta) and Instagram</strong>, once a conversation moves there — which
            is where most orders close. Those platforms process your messages under their own terms;
            we only pass them what you choose to send.
          </li>
          <li>
            <strong>Courier partners</strong> — the service you name at the top of your address, such
            as DTDC, Blue Dart or India Post. They get the delivery triad and nothing else: name,
            phone number, address, and the parcel contents described generically.
          </li>
        </ul>
        <p>
          Outside of these, only if the law requires it. We do not disclose your data for marketing,
          research, or to an advertiser, and we have never sold a customer list.
        </p>

        <h3>Location and transfers</h3>
        <p>
          Customers, orders and messages are handled from India. Our infrastructure providers operate
          global platforms, and a provider may process or back up data on servers outside India.
          Where that happens we rely on the provider's own safeguards for the region; we do not send
          your data anywhere for the purpose of marketing or profiling. If we ever engage a processor
          in a jurisdiction without comparable protection, this page will name it before it touches
          a record.
        </p>

        <h2 id="security">How it is protected</h2>
        <ul>
          <li>Everything travels over HTTPS, and the shop is served only over the secure origin.</li>
          <li>
            The sign-in cookie is HttpOnly, Secure, SameSite=Lax and host-only, so a script cannot
            read it and another site cannot write it — see the{" "}
            <a href="/cookie-information">cookie page</a> for the names.
          </li>
          <li>
            Session tokens are stored hashed by the authentication layer, not in the clear, and a
            stolen record is not a usable token.
          </li>
          <li>
            Admin access is not a password field on a page. The atelier desk checks your verified
            sign-in against a fixed allow-list of addresses; an unlisted email gets a locked screen,
            not a limited view.
          </li>
          <li>
            Database access is a single server-side credential held on the hosting platform, never in
            the browser bundle. Queries are parameterised; nothing on this site concatenates a
            customer's message into SQL.
          </li>
          <li>
            Card data is not in scope because there is no card checkout to receive it.
          </li>
        </ul>
        <p>
          No system is impenetrable, and honesty about that is part of the obligation: if we ever
          identify a breach that puts your data at real risk, we will tell you what happened, what we
          did about it, and what you should do — and report it to the authority the law asks us to.
        </p>

        <h2 id="retention">How long we keep it</h2>
        <ul>
          <li>
            <strong>Account data</strong> — while the account is open. Close it and the identity
            record goes.
          </li>
          <li>
            <strong>Order records</strong> — kept after delivery because an invoice may need
            reissuing, a claim about a parcel is answered from the order, and Indian tax and consumer
            records outlive the parcel. We keep the order, not the conversation around it.
          </li>
          <li>
            <strong>Messages</strong> — WhatsApp history lives in the app you and we both use, not on
            this site. Anything we deliberately save against a booking is a note about the order.
          </li>
          <li>
            <strong>Browser storage</strong> — until you clear it; nothing about your cart is mirrored
            to our servers unless you book it.
          </li>
          <li>
            <strong>Aggregate numbers</strong> — counts and totals with no name attached are kept
            indefinitely, because “which collections sell out” is how a small bench decides what to
            string next.
          </li>
        </ul>

        <h2 id="rights">Your rights</h2>
        <p>Send one message and we will do the work. You can:</p>
        <ol>
          <li>
            <strong>Ask what we hold.</strong> We will send the account record, the bookings, and the
            note attached to each — the actual rows, not a summary.
          </li>
          <li>
            <strong>Correct it.</strong> An address, a phone number, a spelling, a name change after
            marriage. Correcting a dispatched order may be faster done with the courier, and we will
            tell you which.
          </li>
          <li>
            <strong>Delete it.</strong> Close the account and remove the identity record. Where an
            order must be kept for tax or record-keeping reasons, we will say exactly which fields
            survive and why, rather than quietly keeping everything.
          </li>
          <li>
            <strong>Withdraw consent</strong> for anything that is not needed to deliver what you
            bought.
          </li>
          <li>
            <strong>Grievance and escalation</strong>, described below, and the right to go to the
            Data Protection Board if you are unhappy with our answer.
          </li>
          <li>
            <strong>Nominate someone</strong> to exercise these rights if you cannot — relevant under
            Indian law, and we will record the nomination on request.
          </li>
        </ol>
        <p>
          These rights are free. We will acknowledge a request within one working day and complete it
          within thirty, and we may ask one verification question first — the same one we would ask
          before telling anyone where a parcel went.
        </p>

        <h2 id="grievance">Grievance redressal</h2>
        <p>
          Raakha Grace is a bench of a few hands, so the person who reads a complaint is the person
          who packed the parcel. Write to {SITE.whatsapp} on WhatsApp and say it is a data or privacy
          grievance; you will get a reference number and a reply within one working day, and a
          resolution inside fifteen. If your concern is about an order rather than your data,{" "}
          <a href="/terms">the terms page</a> is where the process is set out, and{" "}
          <a href="/faq">the FAQ</a> answers most of it before you have to write at all.
        </p>
        <p>
          If you are not satisfied with how we handle a grievance, you may escalate it to the
          appropriate authority under the Digital Personal Data Protection Act, 2023. We would rather
          you came to us first — we can usually fix it in a morning.
        </p>

        <h2 id="children">Children</h2>
        <p>
          This shop is for adults, and we do not knowingly collect personal data from children. If a
          young person has created an account or sent us an address, tell us and we will delete it
          and stop processing it.
        </p>

        <h2 id="changes">Changes to this page</h2>
        <p>
          When this page changes materially, the date at the top changes and the shop notes it. A
          material change to what we collect, who we share with, or where data goes is also announced
          on WhatsApp before it applies.
        </p>

        <div className="not-prose mt-10 rounded-lg border border-line bg-surface px-5 py-4">
          <p className="text-[0.65rem] tracking-[0.2em] text-subtle uppercase">Read next</p>
          <ul className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
            {[
              { to: "/privacy", label: "Privacy policy — your rights in short" },
              { to: "/cookie-information", label: "Cookie information — every key we write" },
              { to: "/code-of-conduct", label: "Code of conduct — how we work" },
              { to: "/reach-information", label: "Reach & information — who we are" },
            ].map((l) => (
              <li key={l.to}>
                <Link to={l.to} className="text-accent hover:underline">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </LegalPage>
    </SiteShell>
  );
}

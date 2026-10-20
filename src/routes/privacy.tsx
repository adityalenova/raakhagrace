import { createFileRoute } from "@tanstack/react-router";
import { LegalCallout, LegalPage } from "@/components/LegalPage";
import { SiteShell } from "@/components/SiteShell";
import { SITE } from "@/lib/site-knowledge";

export const Route = createFileRoute("/privacy")({ component: Page });

/**
 * The customer-facing half of the privacy story.
 *
 * The operational detail — who processes what, where records live, how long each
 * one survives, how a grievance is escalated — moved to `/data-protection`, so
 * this page can stay short enough to read. It is deliberately the same shape as
 * before: collect, refuse, use, share, keep, rights.
 */
function Page() {
  return (
    <SiteShell>
      <LegalPage
        title="Privacy Policy"
        updated="20 October 2026"
        wide
        toc={[
          { href: "#summary", label: "The short version" },
          { href: "#who", label: "Who we are" },
          { href: "#collect", label: "What we collect" },
          { href: "#not", label: "What we do not collect" },
          { href: "#use", label: "How we use it" },
          { href: "#sharing", label: "Who we share it with" },
          { href: "#cookies", label: "Cookies & tracking" },
          { href: "#retention", label: "How long we keep it" },
          { href: "#rights", label: "Your rights" },
          { href: "#children", label: "Children" },
          { href: "#changes", label: "Changes" },
        ]}
      >
        <p>
          Raakha Grace (“we”, “the atelier”) collects only what we need to take an order, keep your
          account, and answer you afterwards. This policy says what that is and what you can do about
          it. The operational detail — the processors we use, where records sit, how long each one is
          kept, and how to escalate a complaint — is on the{" "}
          <a href="/data-protection">data protection page</a>, and every cookie and storage key this
          site writes is named on the <a href="/cookie-information">cookie information page</a>.
        </p>

        <LegalCallout
          label="The short version"
          points={[
            "We keep an identity, a delivery address, and a list of pieces. That is the whole set.",
            "No card or UPI credential ever reaches this site — there is no card checkout to leak.",
            "We do not sell, rent or trade your data, and we do not run advertising or tracking cookies.",
            "One message on WhatsApp gets you a copy, a correction, or a deletion.",
          ]}
        />

        <h2 id="who">Who we are</h2>
        <p>
          Raakha Grace is an independent handmade jewellery atelier in Hyderabad, Telangana, India.
          We are the party responsible for the personal data described here — there is no separate
          data-protection officer, and the founder answers privacy requests directly. Write to us on
          WhatsApp at {SITE.whatsapp} or by Instagram DM at{" "}
          <a href={SITE.instagram}>@raakhagrace</a>. Who we are not — no affiliation with any larger
          brand — is on the <a href="/affiliations">affiliations page</a>.
        </p>

        <h2 id="collect">What we collect</h2>
        <ul>
          <li>
            <strong>Account identity</strong> — name, email, profile picture and sign-in provider
            (Google, or email where enabled) when you create an account.
          </li>
          <li>
            <strong>Order data</strong> — the pieces you book or save, quantities, amounts, your
            booking reference, the delivery name, phone number and address, and any note you send with
            it.
          </li>
          <li>
            <strong>Messages</strong> — what you send us on WhatsApp, Instagram or through this site
            when you ask for help.
          </li>
          <li>
            <strong>Security and session records</strong> — a session token, IP address, browser
            string and timestamps, so the shop knows you are you and can keep an account quiet when it
            is being used from somewhere else.
          </li>
          <li>
            <strong>Technical essentials</strong> — the session cookie and browser storage that make
            the cart, the sign-in and the opening overlay work.
          </li>
        </ul>
        <p>
          We do not ask for government ID, do not read your contacts, and do not collect anything from
          you that you did not type, send, or hand us by signing in.
        </p>

        <h2 id="not">What we do not collect</h2>
        <p>
          We never store card numbers, CVVs, UPI PINs, net-banking credentials or any payment secret —
          there is no card checkout on this site, because payment happens between your UPI app or bank
          account and ours, and the only record kept here is that the order was paid for. We do not buy
          marketing lists. We do not sell your data. We do not profile what you look at elsewhere on
          the internet.
        </p>

        <h2 id="use">How we use it</h2>
        <p>
          To confirm stock and take your order, pack and ship the right pieces to the right pin code,
          show your bookings and their tracking in your dashboard, honour a warranty, answer support,
          and keep the shop secure. Where a piece needs an invoice or a warranty record, the order
          history is what proves it.
        </p>
        <p>
          Aggregated, non-identifying counts — which collections sold out, which occasions buy, how
          many bookings came through the site versus WhatsApp — inform what we string next and appear
          in the atelier's own dashboard. Those numbers are calculated from orders and accounts in our
          database, not from tracking visitors across the web, and no name is attached to them.
        </p>

        <h2 id="sharing">Who we share it with</h2>
        <p>
          Only processors who need the specific piece to do their job: our hosting provider and the
          managed Postgres database that stores orders; Google, if you sign in with it, which handles
          authentication and hands us back your name, email and picture — never your password; our
          transactional email provider, for verification, welcome and enquiry messages; and the
          courier partner you name at the top of your address, who receives the delivery triad and
          nothing else.
        </p>
        <p>
          Conversations that move to WhatsApp or Instagram are then processed by those platforms under
          their own terms as well as ours. We disclose information if the law requires it, and we have
          never sold a customer list. The full list, with what each party can see, is on the{" "}
          <a href="/data-protection">data protection page</a>.
        </p>

        <h2 id="cookies">Cookies and tracking</h2>
        <p>
          This site sets a small number of cookies, all strictly necessary for sign-in and the cart,
          and uses a handful of browser storage keys for the cart, saved pieces, the guest session and
          the opening note. There are no advertising cookies, no tracking cookies and no third-party
          marketing pixel. The <a href="/cookie-information">cookie information page</a> lists every
          one by name, with what it holds and how long it lasts.
        </p>

        <h2 id="retention">How long we keep it</h2>
        <p>
          Account data stays while your account is open. Order records outlive delivery, because the
          atelier warranty runs for a year, an invoice may need reissuing, and Indian tax and consumer
          records require us to keep them. Cart contents and saved pieces stay in your own browser and
          are never mirrored to our servers unless you book them. We keep no card data, so nothing on
          that front can be retained. Full schedules on the{" "}
          <a href="/data-protection">data protection page</a>.
        </p>

        <h2 id="rights">Your rights</h2>
        <p>
          Under India's Digital Personal Data Protection Act, 2023 — and offered to every customer
          regardless of where they live — you can ask for a copy of what we hold, ask us to correct
          it, ask us to delete it, withdraw consent for anything not needed to deliver an order, and
          nominate someone to act for you. Send one message on WhatsApp and we will do the work: we
          acknowledge within one working day and complete within thirty, and we may ask one
          verification question first.
        </p>
        <p>
          If you are unhappy with how we handle a request, there is an escalation route described on
          the <a href="/data-protection">data protection page</a>, and you may take it to the Data
          Protection Board. Note that deleting an order record while a parcel is in transit is
          something we cannot do — we have to be able to deliver what you bought.
        </p>

        <h2 id="children">Children</h2>
        <p>
          The shop is intended for adults. We do not knowingly collect personal data from children, and
          if a young person has sent us an address or created an account, tell us and we will delete
          it.
        </p>

        <h2 id="changes">Changes</h2>
        <p>
          If this policy changes in a material way — what we collect, who we share with, or where your
          data goes — we update the date above, note it on the site, and tell customers with an open
          order on WhatsApp before it applies. Our conduct, as opposed to our data handling, is on the{" "}
          <a href="/code-of-conduct">code of conduct page</a>.
        </p>
      </LegalPage>
    </SiteShell>
  );
}

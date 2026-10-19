import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/LegalPage";
import { SiteShell } from "@/components/SiteShell";

export const Route = createFileRoute("/privacy")({ component: Page });

function Page() {
  return (
    <SiteShell>
      <LegalPage title="Privacy Policy" updated="28 August 2026">
        <p>
          Raakha Grace (“we”, “the atelier”) collects only what we need to take an order, keep your
          account, and improve the shop. This policy explains what that is, why we hold it, and how
          you can ask us to change or delete it.
        </p>
        <h2>Who we are</h2>
        <p>
          Raakha Grace is an independent jewellery house. For privacy questions write to us on
          WhatsApp at <a href="https://wa.me/916304837120">+91 63048 37120</a> or Instagram DM{" "}
          <a href="https://www.instagram.com/raakhagrace/">@raakhagrace</a>.
        </p>
        <h2>What we collect</h2>
        <ul>
          <li>
            Account identity: name, email, and sign-in provider (Google, X, or email) when you
            create an account.
          </li>
          <li>
            Order and cart data: pieces you save or purchase, quantities, and delivery notes you
            send us.
          </li>
          <li>Messages you send on WhatsApp or Instagram when you ask for help.</li>
          <li>
            Technical essentials: session cookies and local storage so the cart and welcome overlay
            work.
          </li>
        </ul>
        <h2>What we do not collect</h2>
        <p>
          We never store card numbers or UPI secrets on this site. Payment, when enabled, is handled
          by a payment provider. We do not buy marketing lists. We do not sell your data.
        </p>
        <h2>How we use it</h2>
        <p>
          To fulfil orders, show your dashboard, remember a cart, answer support, and keep the shop
          secure. Aggregated, non-identifying notes (for example, which collections are viewed) may
          inform what we make next.
        </p>
        <h2>Sharing</h2>
        <p>
          We share data only with processors who help us run the shop (hosting, authentication).
          Third-party sign-in (Google, X) is handled by our authentication provider; we receive
          identity, not your social passwords. We disclose information if the law requires it.
        </p>
        <h2>Retention and your rights</h2>
        <p>
          Account data stays while your account is open. You may request a copy, a correction, or
          deletion via WhatsApp. We will respond within a reasonable time. Some records (invoices)
          may be kept as required by tax law.
        </p>
        <h2>Children</h2>
        <p>The shop is intended for adults. We do not knowingly collect data from children.</p>
        <h2>Changes</h2>
        <p>
          If this policy changes in a material way, we will update the date above and, where
          appropriate, note it on the site.
        </p>
      </LegalPage>
    </SiteShell>
  );
}

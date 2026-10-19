import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/LegalPage";
import { SiteShell } from "@/components/SiteShell";

export const Route = createFileRoute("/terms")({ component: Page });

function Page() {
  return (
    <SiteShell>
      <LegalPage title="Terms of Service" updated="28 August 2026">
        <p>
          By browsing or shopping at Raakha Grace you agree to these terms. If you do not agree, please do not use the site
          or place an order.
        </p>
        <h2>The shop</h2>
        <p>
          Pieces are sold as described on each product page. Gold and diamond weights are approximate within hallmark
          tolerances. Photography is of the design; small handmade variation is part of the work, not a defect.
        </p>
        <h2>Orders and payment</h2>
        <p>
          An order is confirmed when we accept payment (or, for WhatsApp orders, when we confirm in writing). Prices are in
          Indian rupees and may change with metal rates. We may cancel an order if a listing is clearly wrong; we will tell
          you and refund any amount already taken.
        </p>
        <h2>Shipping</h2>
        <p>
          We ship across India. Timing is an estimate, not a guarantee. Risk passes when the carrier collects the parcel;
          please inspect on arrival and write to us within 48 hours if something is damaged in transit.
        </p>
        <h2>Returns</h2>
        <p>
          Standard jewellery may be returned unused, in original packaging, within 7 days of delivery. Custom, engraved, or
          sized-to-order pieces cannot be returned unless they are faulty. Sale and special-offer pieces follow the same
          unused-return rule unless the product page says otherwise.
        </p>
        <h2>Intellectual property</h2>
        <p>
          The site, photography, copy, lotus mark, and the Raakha Grace name are our intellectual property. You may not copy
          them for a competing shop.
        </p>
        <h2>Shop with AI</h2>
        <p>
          The in-site assistant is for product discovery only. It does not create a contract, a valuation, or a custom-order
          promise until you check out or we confirm in writing.
        </p>
        <h2>Limitation</h2>
        <p>
          To the extent the law allows, our liability for any order is limited to the amount you paid for that order. Nothing
          in these terms limits rights you have as a consumer under Indian law that cannot be waived.
        </p>
        <h2>Contact</h2>
        <p>
          Questions: WhatsApp <a href="https://wa.me/6304837120">6304837120</a>.
        </p>
      </LegalPage>
    </SiteShell>
  );
}

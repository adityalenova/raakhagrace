import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/LegalPage";
import { SiteShell } from "@/components/SiteShell";

export const Route = createFileRoute("/terms")({ component: Page });

function Page() {
  return (
    <SiteShell>
      <LegalPage title="Terms of Service" updated="19 October 2026">
        <p>
          These terms govern every booking placed with Raakha Grace, whether the enquiry begins on
          WhatsApp, through this website, or by email. By placing an order you accept them in full.
          If you do not accept them, please do not place an order.
        </p>

        <div className="not-prose my-8 rounded-lg border border-line bg-paper px-5 py-4 text-fg">
          <p className="text-[0.65rem] tracking-[0.2em] text-subtle uppercase">Before you order</p>
          <ul className="mt-3 space-y-2 text-sm leading-relaxed">
            <li>Nothing is held, packed or dispatched before payment is received in full.</li>
            <li>
              All sales are final: no exchange, return or refund on the basis of personal preference.
            </li>
            <li>
              Record a continuous 360-degree unboxing video. It is the only proof we can accept for
              transit damage or a missing item.
            </li>
            <li>Send the payment screenshot as soon as you pay, and write your courier service at the top of your address.</li>
          </ul>
        </div>

        <h2>1. Enquiries and order confirmation</h2>
        <p>
          We confirm orders, not window-shopping. Every enquiry is checked against live stock before
          we reply, and a piece is only held once we have accepted your payment. Please write with a
          genuine intent to buy: speculative enquiries hold up confirmation for other customers and
          may be closed without a reply.
        </p>
        <p>
          We treat every customer the same. Requests to skip the queue, to hold a piece without
          payment, or to override these terms for one order over another are declined.
        </p>

        <h2>2. Payment</h2>
        <p>
          Payment is due in full before dispatch, and there is no holding of stock against an unpaid
          order. Prices are in Indian rupees and may change with metal and stone rates until an
          order is confirmed.
        </p>
        <p>
          Share the payment screenshot or reference immediately after paying. A payment is treated as
          received when it reflects in our account, not when the screenshot is sent.
        </p>

        <h2>3. Shipping charges and address format</h2>
        <p>
          Shipping charges are fixed. They are set by our courier partners and are not negotiable,
          discountable or absorbable, and no request to reduce them will be entertained.
        </p>
        <p>
          Write the courier service that actually reaches your pin code — DTDC, Blue Dart, India Post
          or otherwise — on the first line, above your address. An address without that line delays
          dispatch, and we are not responsible for a mis-routed parcel where the customer did not
          tell us which service covers their area.
        </p>

        <h2>4. Dispatch, tracking and delivery time</h2>
        <p>
          Orders are dispatched in the sequence they are confirmed. After dispatch, allow two to
          three working days for the courier to update the tracking record, and then wait for the
          delivery window shown on that record before writing to us. A tracking number that has not
          moved on day one is normal, not a lost parcel.
        </p>
        <p>
          Please contact us about a shipment only if it has not been delivered within ten to fifteen
          days of dispatch. Before that we can genuinely tell you nothing the tracking page does not
          already say.
        </p>

        <h2>5. Receiving your parcel: the unboxing video</h2>
        <p>
          Every parcel must be opened on a single, continuous 360-degree video that shows the sealed
          package, the label, the opening, and every item inside, without a pause, a cut or a second
          take. Send the video to us within five to six hours of receiving the parcel.
        </p>
        <p>
          This video is the sole basis on which we accept a claim for transit damage, a wrong item,
          or a missing item. A claim reported after that window, or without a continuous video,
          cannot be considered — we have no way to establish what happened between the courier and
          your hands.
        </p>

        <h2>6. What is not treated as damage</h2>
        <p>
          These are handmade pieces assembled from small components, and the following are not
          counted as transit damage: a stone that has loosened or fallen, a pearl that has come
          loose or is missing, a slight difference in tone or shade, or a finish that reads
          differently from the photograph. Such items are covered by the atelier warranty and repair
          process on the product page, not by a damage claim.
        </p>

        <h2>7. Colour, size and the nature of handmade work</h2>
        <p>
          Slight colour variation, or a lighter or darker appearance, is expected: it comes from
          digital photography and from the colour profile of your phone or computer monitor. The
          same piece can read differently on two screens, and that is not a defect.
        </p>
        <p>
          Bangles in particular vary from one manufacturer to another, and an internal diameter
          marked the same by two makers will not sit the same on the wrist. Order bangles with your
          measurement taken from a piece you already wear, and note that size variation between
          makers is bought at your own risk.
        </p>

        <h2>8. Exchange, return and refund policy</h2>
        <p>
          There is no exchange, no return and no refund on the basis of dislike — not liking the
          colour, the size, the design, the weight, or how it looks when worn is not grounds for a
          return. Pieces are sold exactly as shown and as described.
        </p>
        <p>
          Where we do approve an exchange or a return for a genuine fault, the one-way shipping
          cost is borne by the customer, without exception. Approved refund amounts are not paid out
          in cash or back to the source account; they are adjusted against your next order only.
        </p>

        <h2>9. Product descriptions and availability</h2>
        <p>
          Each product page describes the piece as it is made and photographed. Because our pieces
          are handmade in small batches, availability changes through the day; we confirm stock in
          writing before payment, and we may cancel and refund an order if a listed piece sells out
          or a listing is clearly in error.
        </p>

        <h2>10. Intellectual property</h2>
        <p>
          The site, its photography, copy, the lotus mark, and the name Raakha Grace are our
          intellectual property. You may not reproduce them for another shop, listing, or social
          account without written consent.
        </p>

        <h2>11. Limitation of liability</h2>
        <p>
          To the extent permitted by law, our liability for any order is limited to the amount you
          paid for that order. Nothing in these terms limits rights you hold as a consumer under
          Indian law that cannot be waived.
        </p>

        <h2>12. Questions</h2>
        <p>
          Ask us anything about a piece, an order, or a delivery — we would rather answer it before
          you buy than after. WhatsApp is the fastest route to a person, and we reply within one
          working day.
        </p>
        <p>
          Orders and enquiries: WhatsApp{" "}
          <a href="https://wa.me/916304837120">+91 63048 37120</a>.
        </p>
        <p>
          Thank you for believing in us. Every piece that leaves the atelier is packed with that in
          mind.
        </p>
      </LegalPage>
    </SiteShell>
  );
}

/**
 * The house terms, as data.
 *
 * This is the single source for the wording: `/terms` renders all of it, and a
 * product page renders the buyer-facing subset so the two can never disagree.
 * Copy is the atelier's own policy text — edit it here, nowhere else.
 */

export const TERMS_UPDATED = "20 October 2026";

/** The four things a customer must know before ordering. */
export const TERMS_AT_A_GLANCE: string[] = [
  "Nothing is held, packed or dispatched before payment is received in full.",
  "All sales are final: no exchange, return or refund on the basis of personal preference.",
  "Record a continuous 360-degree unboxing video. It is the only proof we can accept for transit damage or a missing item.",
  "Send the payment screenshot as soon as you pay, and write your courier service at the top of your address.",
];

export type TermsSection = {
  n: number;
  title: string;
  body: string[];
  /** Shown on a product page, where a buyer needs it before paying. */
  buyer?: boolean;
};

export const TERMS_SECTIONS: TermsSection[] = [
  {
    n: 1,
    title: "Enquiries and order confirmation",
    body: [
      "We confirm orders, not window-shopping. Every enquiry is checked against live stock before we reply, and a piece is only held once we have accepted your payment. Please write with a genuine intent to buy: speculative enquiries hold up confirmation for other customers and may be closed without a reply.",
      "We treat every customer the same. Requests to skip the queue, to hold a piece without payment, or to override these terms for one order over another are declined.",
    ],
  },
  {
    n: 2,
    title: "Payment",
    buyer: true,
    body: [
      "Payment is due in full before dispatch, and there is no holding of stock against an unpaid order. Prices are in Indian rupees and may change with metal and stone rates until an order is confirmed.",
      "Share the payment screenshot or reference immediately after paying. A payment is treated as received when it reflects in our account, not when the screenshot is sent.",
    ],
  },
  {
    n: 3,
    title: "Shipping charges and address format",
    buyer: true,
    body: [
      "Shipping charges are fixed. They are set by our courier partners and are not negotiable, discountable or absorbable, and no request to reduce them will be entertained.",
      "Write the courier service that actually reaches your pin code — DTDC, Blue Dart, India Post or otherwise — on the first line, above your address. An address without that line delays dispatch, and we are not responsible for a mis-routed parcel where the customer did not tell us which service covers their area.",
    ],
  },
  {
    n: 4,
    title: "Dispatch, tracking and delivery time",
    buyer: true,
    body: [
      "Orders are dispatched in the sequence they are confirmed. After dispatch, allow two to three working days for the courier to update the tracking record, and then wait for the delivery window shown on that record before writing to us. A tracking number that has not moved on day one is normal, not a lost parcel.",
      "Please contact us about a shipment only if it has not been delivered within ten to fifteen days of dispatch. Before that we can genuinely tell you nothing the tracking page does not already say.",
    ],
  },
  {
    n: 5,
    title: "Receiving your parcel: the unboxing video",
    buyer: true,
    body: [
      "Every parcel must be opened on a single, continuous 360-degree video that shows the sealed package, the label, the opening, and every item inside, without a pause, a cut or a second take. Send the video to us within five to six hours of receiving the parcel.",
      "This video is the sole basis on which we accept a claim for transit damage, a wrong item, or a missing item. A claim reported after that window, or without a continuous video, cannot be considered — we have no way to establish what happened between the courier and your hands.",
    ],
  },
  {
    n: 6,
    title: "What is not treated as damage",
    buyer: true,
    body: [
      "These are handmade pieces assembled from small components, and the following are not counted as transit damage: a stone that has loosened or fallen, a pearl that has come loose or is missing, a slight difference in tone or shade, or a finish that reads differently from the photograph.",
      "None of that is grounds for a damage claim or a refund. It is the nature of handmade work, and it is what you are buying.",
    ],
  },
  {
    n: 7,
    title: "Colour, size and the nature of handmade work",
    buyer: true,
    body: [
      "Slight colour variation, or a lighter or darker appearance, is expected: it comes from digital photography and from the colour profile of your phone or computer monitor. The same piece can read differently on two screens, and that is not a defect.",
      "Bangles in particular vary from one manufacturer to another, and an internal diameter marked the same by two makers will not sit the same on the wrist. Order bangles with your measurement taken from a piece you already wear, and note that size variation between makers is bought at your own risk.",
    ],
  },
  {
    n: 8,
    title: "Exchange, return and refund policy",
    buyer: true,
    body: [
      "There is no exchange, no return and no refund on the basis of dislike — not liking the colour, the size, the design, the weight, or how it looks when worn is not grounds for a return. Pieces are sold exactly as shown and as described.",
      "Where we do approve an exchange or a return for a genuine fault, the one-way shipping cost is borne by the customer, without exception. Approved refund amounts are not paid out in cash or back to the source account; they are adjusted against your next order only.",
    ],
  },
  {
    n: 9,
    title: "Product descriptions and availability",
    body: [
      "Each product page describes the piece as it is made and photographed. Because our pieces are handmade in small batches, availability changes through the day; we confirm stock in writing before payment, and we may cancel and refund an order if a listed piece sells out or a listing is clearly in error.",
    ],
  },
  {
    n: 10,
    title: "Intellectual property",
    body: [
      "The site, its photography, copy, the lotus mark, and the name Raakha Grace are our intellectual property. You may not reproduce them for another shop, listing, or social account without written consent.",
    ],
  },
  {
    n: 11,
    title: "Limitation of liability",
    body: [
      "To the extent permitted by law, our liability for any order is limited to the amount you paid for that order. Nothing in these terms limits rights you hold as a consumer under Indian law that cannot be waived.",
    ],
  },
  {
    n: 12,
    title: "Questions",
    body: [
      "Ask us anything about a piece, an order, or a delivery — we would rather answer it before you buy than after. WhatsApp is the fastest route to a person, and we reply within one working day.",
    ],
  },
];

/** The clauses a buyer sees on a product page, in reading order. */
export const BUYER_TERMS = TERMS_SECTIONS.filter((s) => s.buyer);

/**
 * What the atelier does and does not promise after the piece is paid for.
 * There is no warranty, guarantee or free servicing on these pieces — this is
 * the text that says so, in one place.
 */
export const AFTER_SALES_TERMS =
  "Sold exactly as shown and described. All sales are final: no exchange, return or refund on preference, and no warranty or guarantee period on the piece. What happens after delivery is governed by the house terms — the unboxing video, what counts as damage, and how refunds are adjusted against a future order.";

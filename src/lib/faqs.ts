import { SITE } from "./site-knowledge";

/**
 * Every answer a customer can ask for, in the words this site already uses.
 *
 * This file is the single source for the FAQ page, the homepage teaser, and the
 * questions Grace is allowed to answer. The numbers come from `SITE` (which is
 * transcribed from `/terms`), so a policy change happens in one place and the
 * FAQ cannot quietly disagree with the terms page.
 */

export type Faq = { q: string; a: string; to?: { label: string; href: string } };
export type FaqGroup = { id: string; label: string; note: string; items: Faq[] };

export const FAQ_GROUPS: FaqGroup[] = [
  {
    id: "ordering",
    label: "Ordering & payment",
    note: "How a booking starts, and what makes it official.",
    items: [
      {
        q: "How do I order?",
        a: "Put the pieces you like in the cart, or open any product page and choose “Book on WhatsApp”. Either way you get a booking reference like RG-7K4MQP, WhatsApp opens with your details already typed, and we confirm stock and price with you there. Nothing is held or packed until payment reaches us.",
        to: { label: "How ordering works", href: "/terms" },
      },
      {
        q: "Why is there no card checkout?",
        a: "We are a small bench, not a warehouse, so stock moves during the day and we would rather confirm the piece with you in person than take money against something that sold an hour ago. Orders close on WhatsApp, and payment is by UPI or bank transfer.",
      },
      {
        q: "How do I pay, and when is my order confirmed?",
        a: "UPI or bank transfer, in full and in advance. Share the payment screenshot or reference as soon as you pay — but a payment counts when it reflects in our account, not when the screenshot arrives. Your order is confirmed at that point, and only then does a piece get packed.",
        to: { label: "Payment terms", href: "/terms" },
      },
      {
        q: "Do you offer cash on delivery, EMI or a part payment?",
        a: "No to all three. There is no cash on delivery, no EMI and no part payment, and nothing is dispatched before the full amount is with us.",
      },
      {
        q: "Can I get a discount, or negotiate the price?",
        a: "The price on the page is the price we charge — there are no coupon codes and nothing to negotiate. Where a piece shows a second, struck-through number, that comparison price is already taken off. Shipping is a fixed charge from our courier partners, so it does not move either.",
        to: { label: "Browse the catalogue", href: "/jewellery" },
      },
      {
        q: "Is the price the whole amount, or does it change?",
        a: `Prices are in Indian rupees and are the price we charge today. Because they depend on metal and stone rates, a price can change between your enquiry and your confirmation — but never after we have accepted your payment. Shipping is added as a fixed charge and told to you before you pay.`,
      },
    ],
  },
  {
    id: "shipping",
    label: "Shipping, tracking & receiving",
    note: "What happens after you pay, and how to open the parcel.",
    items: [
      {
        q: "How long does delivery take?",
        a: `Two clocks matter. A piece in hand leaves the atelier once payment is confirmed; a sold-out piece is strung for you and takes ${SITE.madeToOrder} at the bench. After dispatch the courier takes ${SITE.deliveryWindow}, so an everyday in-stock order is usually with you inside a fortnight, and a made-to-order one a few weeks more.`,
        to: { label: "Lead times in full", href: "/terms" },
      },
      {
        q: "How do I write my address?",
        a: "Write the courier service that actually reaches your pin code — DTDC, Blue Dart, India Post or otherwise — on the very first line, above your address. An address without that line delays dispatch, and a parcel mis-routed because the service was not named is not something we can put right quickly.",
      },
      {
        q: "Where do I find my tracking number?",
        a: "In your account. Every booking shows its tracking number on this site the moment we enter it, and the status moves through confirmed, packed, shipped and delivered. Sign in with the same Google account you booked with, or claim the booking with its reference code.",
        to: { label: "Open your account", href: "/dashboard" },
      },
      {
        q: "My tracking has not moved. Is my parcel lost?",
        a: `Almost certainly not. After dispatch, allow ${SITE.trackingSettle} for the courier to open the record properly — a number that has not moved on day one is normal. Please write to us about a shipment only if it has not arrived within ${SITE.escalation} of dispatch; before that we can genuinely tell you nothing the tracking page does not already say.`,
      },
      {
        q: "Why do I have to film myself opening the parcel?",
        a: `Because it is the only proof either of us can use. Open every parcel on one continuous 360-degree video — sealed package, label, the opening, every item inside, with no pause, cut or second take — and send it to us within ${SITE.claimWindow} of receiving it. Without it we cannot establish what happened between the courier and your hands, so a claim for transit damage, a wrong item or a missing item cannot be considered.`,
        to: { label: "The unboxing rule", href: "/terms" },
      },
      {
        q: "Do you ship outside India?",
        a: "Not yet. If you have someone in India who can receive it — family, a friend, an office — we will happily ship it to them.",
      },
    ],
  },
  {
    id: "returns",
    label: "Returns, warranty & care",
    note: "What is final, what is covered, and what is neither.",
    items: [
      {
        q: "Can I return it if I don't like it?",
        a: "No. All sales are final: not liking the colour, the size, the design, the weight, or how it looks when worn is not grounds for a return, exchange or refund. Pieces are handmade in small batches and sold exactly as shown and as described. This is the single most important thing to read before you pay.",
        to: { label: "Read the full policy", href: "/terms" },
      },
      {
        q: "So a refund is never possible?",
        a: "Where we approve an exchange or a return for a genuine fault, the one-way shipping cost is borne by you, and the approved amount is adjusted against your next order — it is not paid back in cash or to the source account. If a piece we listed turns out to be sold out or the listing is in error, we cancel and refund in full.",
      },
      {
        q: "A stone fell out. Is that damage?",
        a: "No, and it is not a reason to worry. These pieces are assembled from small components, so a stone that loosens or falls, a pearl that comes away, a slight difference in tone, or a finish that reads differently from the photograph are not counted as transit damage. They fall under the atelier warranty instead — message us and we will fix it.",
      },
      {
        q: "What does the warranty cover?",
        a: "One year on craftsmanship and setting, plus a free first polish within six months. It does not cover loss, theft or accidental damage.",
        to: { label: "Care & warranty", href: "/terms" },
      },
      {
        q: "How do I make it last?",
        a: "Wipe with a soft dry cloth after each wear. Keep it away from perfume, water, sweat and gym sessions, and put it on after your lotion and hair oil have settled. Store it flat with the pieces apart. Treated that way, gold polish keeps its warmth for years — untreated polish dulls, and that is wear, not a defect.",
      },
      {
        q: "It looks a different colour to the photo.",
        a: "Slight colour variation is expected and is not a defect. Digital photography and the colour profile of your phone or monitor both shift how gold polish reads, and the same piece can look different on two screens.",
      },
    ],
  },
  {
    id: "pieces",
    label: "The pieces themselves",
    note: "Materials, sizing, customising and gifting.",
    items: [
      {
        q: "Is this real gold?",
        a: "No, and we would never describe it that way. Everything here is handmade fashion jewellery — gold polish and gold-plated metal with pearls, kundan, ruby-tone and crystal stones. It is not solid gold and it is not hallmarked. That honesty is exactly what lets a hand-strung piece cost a few hundred rupees instead of tens of thousands.",
        to: { label: "Meet the atelier", href: "/about" },
      },
      {
        q: "How do I choose a size?",
        a: "Necklace lengths are stated on each piece — 16, 18 and 21 inch appear most, and some are marked customisable, which means we set the length before stringing. Bangles are the tricky one: they vary from manufacturer to manufacturer, and an inner diameter marked the same by two makers will not sit the same on your wrist. Measure a bangle you already wear, and order knowing that variation is at your own risk.",
        to: { label: "Size & fit", href: "/terms" },
      },
      {
        q: "Can you make something to my own design?",
        a: `Send us a reference picture on WhatsApp and we will tell you what is possible, what it costs and how long it takes before anything begins. Pieces marked “customisable” are strung to your length or colour before they leave, and anything sold out is made to order in ${SITE.madeToOrder}.`,
        to: { label: "Ask about a piece", href: "/community" },
      },
      {
        q: "Is it gift-wrapped?",
        a: "Everything leaves the atelier gift-ready — box, ribbon and a hand-written note if you tell us what to say. Gifts cost the same as pieces you keep for yourself, and the Gifts section is already sorted by occasion: birthday, anniversary, wedding and personal milestone.",
        to: { label: "Shop gifts by occasion", href: "/gifts" },
      },
      {
        q: "Can I try it on or visit you first?",
        a: "Raakha Grace is a bench, not a shopfront — there is no walk-in counter or trial room. What we can do is send close-up photographs and a video of the actual piece, on a person or flat, before you pay. Ask for it on WhatsApp; it is a normal request here.",
        to: { label: "How we work", href: "/reach-information" },
      },
    ],
  },
  {
    id: "account",
    label: "Your account & your data",
    note: "Sign-in, bookings and what we keep about you.",
    items: [
      {
        q: "Do I need an account to order?",
        a: "No. You can book as a guest straight from WhatsApp. An account is what gives you the other half: your bookings and their statuses, your tracking numbers, your saved pieces and your cart, all in one place. Sign in with Google and it takes a few seconds.",
        to: { label: "Open your account", href: "/dashboard" },
      },
      {
        q: "I booked without signing in. Can I still see the order?",
        a: "Yes. Every booking gets a reference code like RG-7K4MQP. Sign in, type that reference and your mobile number into the claim box on the account page, and the order joins your list.",
      },
      {
        q: "What personal data does this site keep?",
        a: "Only what an order needs: your name, email and sign-in provider, the address and contact details you send for delivery, the pieces you booked, and the messages you send us. No payment card data ever touches this site, because payment happens with us directly rather than through a checkout form.",
        to: { label: "Data protection", href: "/data-protection" },
      },
      {
        q: "Do you use cookies or track me?",
        a: "Only the strictly necessary ones — a session cookie so you stay signed in, and browser storage for your cart, the opening overlay and the welcome note. There are no advertising cookies and no tracking cookies on this site today.",
        to: { label: "Cookie information", href: "/cookie-information" },
      },
      {
        q: "How do I get in touch with a person?",
        a: `WhatsApp ${SITE.whatsapp} is the fastest route to someone at the bench — send a screenshot of what you like and we will tell you honestly whether it is still here. We reply within one working day, and usually much sooner. Instagram DM reaches the same people.`,
        to: { label: "Reach us", href: "/reach-information" },
      },
    ],
  },
];

/** The questions people actually arrive with — used for the homepage teaser. */
export const FAQ_HEADLINES: Faq[] = [
  FAQ_GROUPS[0].items[0],
  FAQ_GROUPS[0].items[2],
  FAQ_GROUPS[2].items[0],
  FAQ_GROUPS[1].items[4],
  FAQ_GROUPS[3].items[0],
  FAQ_GROUPS[3].items[1],
];

/** Flat list, so a search or an AI prompt can use the same copy. */
export const ALL_FAQS: Faq[] = FAQ_GROUPS.flatMap((g) => g.items);

export const FAQ_CATEGORIES = FAQ_GROUPS.map((g) => ({
  id: g.id,
  label: g.label,
  count: g.items.length,
}));

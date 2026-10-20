import { formatInr } from "./utils";
import type { Product } from "./products";

/**
 * What Raakha Grace's website actually says, as data.
 *
 * Grace the assistant answers from this file and from the live catalogue only.
 * Every line here is traceable to a page a customer can click — `/terms`,
 * `/privacy`, a product page, or the checkout flow — so the assistant cannot
 * promise a policy the atelier never wrote. When you change a page, change the
 * matching fact here; `siteBrief` hands both to the model as its ground truth.
 */

export type SiteLink = { label: string; to: string };

export const SITE = {
  whatsapp: "+91 63048 37120",
  instagram: "https://www.instagram.com/raakhagrace/",
  madeToOrder: "10–16 days",
  deliveryWindow: "3–7 working days",
  trackingSettle: "2–3 working days",
  claimWindow: "5–6 hours",
  escalation: "10–15 days",
} as const;

export type Fact = {
  id: string;
  /** Phrases that mean "this question is about me". Longest match wins. */
  ask: string[];
  answer: string;
  links?: SiteLink[];
};

export const FACTS: Fact[] = [
  {
    id: "ordering",
    ask: [
      "how do i order",
      "how to order",
      "how do we order",
      "how can i buy",
      "how do i buy",
      "place an order",
      "place order",
      "ordering",
      "booking",
      "book this",
      "add to cart",
      "cart",
      "process",
      "steps",
    ],
    answer:
      "Ordering here is a conversation, not a checkout form. Put the pieces you like in the cart, or open any product page and choose “Book on WhatsApp” — you get a booking reference like RG-7K4MQP, and WhatsApp opens with your details already typed. We confirm stock and price with you, take payment, and dispatch. That reference is what makes the order findable: it appears in your account on this site, and its status changes as we move it through confirmed, packed and shipped.",
    links: [
      { label: "How ordering works", to: "/terms" },
      { label: "Your account", to: "/dashboard" },
    ],
  },
  {
    id: "payment",
    ask: [
      "payment",
      "pay",
      "upi",
      "cash on delivery",
      "cod",
      "advance",
      "card",
      "online payment",
      "bank transfer",
      "screenshot",
      "emi",
      "installment",
      "part payment",
      "google pay",
      "phonepe",
      "phone pe",
      "paytm",
      "how do i pay",
    ],
    answer:
      "Payment is in full and in advance — UPI or bank transfer — and nothing is held, packed or dispatched before it reaches us. There is no cash on delivery, no card checkout on this site and no EMI or part payment. Send the payment screenshot or reference as soon as you pay; a payment counts when it reflects in our account, not when the screenshot arrives.",
    links: [{ label: "Payment terms", to: "/terms" }],
  },
  {
    id: "pricing",
    ask: [
      "discount",
      "discounted",
      "negotiate",
      "best price",
      "cheaper",
      "coupon",
      "any offer",
      "sale price",
      "any deal",
      "price drop",
      "mrp",
    ],
    answer:
      "The price on the page is the price we charge — there are no coupon codes and nothing to negotiate. Where a piece shows a second, struck-through number, that is the comparison price already taken off. Shipping is a fixed charge from our courier partners, so it does not move either. What we can do is tell you honestly which piece is the better value for the occasion.",
    links: [
      { label: "Browse the catalogue", to: "/jewellery" },
      { label: "Full terms", to: "/terms" },
    ],
  },
  {
    id: "shipping",
    ask: [
      "shipping",
      "ship",
      "courier",
      "dtdc",
      "bluedart",
      "blue dart",
      "india post",
      "dispatch",
      "free shipping",
      "shipping charge",
      "outside india",
      "international",
      "address",
    ],
    answer:
      `Every piece ships across India in ${SITE.deliveryWindow} in gift-ready packaging, insured, and shipping charges are fixed by our courier partners — not negotiable or discountable. Write the courier service that actually reaches your pin code on the first line, above your address; without it dispatch is delayed. We do not ship outside India yet, but if you have someone here who can receive it, we will happily send it to them.`,
    links: [{ label: "Shipping & address rules", to: "/terms" }],
  },
  {
    id: "delivery-time",
    ask: [
      "how long will it take",
      "how long does it take",
      "how long till",
      "how long to arrive",
      "how long until",
      "when will i get",
      "when will it arrive",
      "when can i expect",
      "how soon",
      "how quickly",
      "delivery time",
      "for delivery",
      "delivery",
      "how many days",
      "lead time",
      "need it by",
      "by my wedding",
      "before the wedding",
      "by friday",
      "by saturday",
      "date i need",
      "too late",
    ],
    answer:
      `Two clocks matter. A piece in hand leaves the atelier once payment is confirmed; a sold-out piece is strung for you and takes ${SITE.madeToOrder} at the bench. After dispatch the courier takes ${SITE.deliveryWindow}, so an everyday in-stock order is usually with you inside a fortnight, and a made-to-order one a few weeks more. Tell us a date you are buying for and we will say honestly whether we can make it before you pay.`,
    links: [
      { label: "Ordering & lead times", to: "/terms" },
      { label: "Ask about a date", to: "/community" },
    ],
  },
  {
    id: "tracking",
    ask: [
      "tracking",
      "track",
      "where is my order",
      "has my order gone",
      "not updated",
      "not moved",
      "has not moved",
      "parcel",
      "where is my parcel",
      "status",
      "how far",
    ],
    answer:
      `After dispatch, allow ${SITE.trackingSettle} for the courier to open a tracking record — a number that has not moved on day one is normal, not a lost parcel. Your booking shows that tracking number in your account on this site the moment we enter it. Please write to us about a shipment only if it has not arrived within ${SITE.escalation} of dispatch.`,
    links: [{ label: "Open your bookings", to: "/dashboard" }],
  },
  {
    id: "returns",
    ask: [
      "return",
      "returns",
      "exchange",
      "refund",
      "replacement",
      "cancel",
      "i dont like",
      "don't like",
      "change my mind",
      "not satisfied",
    ],
    answer:
      "All sales are final. Not liking the colour, size, design, weight or how it looks worn is not grounds for a return — pieces are handmade in small batches and we cannot restock one. Where we do approve an exchange or return for a genuine fault, the one-way shipping cost is yours, and any approved refund is adjusted against your next order rather than paid back in cash.",
    links: [{ label: "Read the full policy", to: "/terms" }],
  },
  {
    id: "unboxing",
    ask: [
      "unboxing",
      "video",
      "damaged",
      "damage",
      "broken",
      "missing item",
      "wrong item",
      "transit",
      "claim",
      "complaint",
    ],
    answer:
      `Open every parcel on one continuous 360-degree video — sealed package, label, the opening, every item inside, with no pause, cut or second take — and send it to us within ${SITE.claimWindow} of receiving it. That video is the only proof we can accept for transit damage, a wrong item or a missing item; a claim made after the window, or without it, cannot be considered.`,
    links: [{ label: "The unboxing rule", to: "/terms" }],
  },
  {
    id: "not-damage",
    ask: [
      "stone fell",
      "stone falling",
      "stone loose",
      "pearl missing",
      "pearl came off",
      "loose pearl",
      "not counted",
      "wear and tear",
    ],
    answer:
      "These are assembled from small components, so a stone that loosens or falls, a pearl that comes away, a slight difference in tone, or a finish that reads differently from the photograph are not counted as transit damage. They fall under the atelier warranty and repair process on your product page instead — message us and we will fix it.",
    links: [{ label: "What is not damage", to: "/terms" }],
  },
  {
    id: "warranty",
    ask: ["warranty", "guarantee", "repair", "free polish", "how long will it last"],
    answer:
      "There is a one-year atelier warranty on craftsmanship and setting, plus a free first polish within six months. It does not cover loss, theft or accidental damage.",
    links: [{ label: "Care & warranty", to: "/terms" }],
  },
  {
    id: "colour",
    ask: [
      "colour",
      "color",
      "shade",
      "same as photo",
      "looks different",
      "tone",
      "real colour",
      "photo",
    ],
    answer:
      "Slight colour variation is expected and is not a defect — digital photography and the colour profile of your phone or monitor both shift how gold polish reads, and the same piece can look different on two screens.",
    links: [{ label: "Handmade & colour", to: "/terms" }],
  },
  {
    id: "sizing",
    ask: [
      "size",
      "sizing",
      "fit",
      "measurement",
      "length",
      "inch",
      "bangle size",
      "inner diameter",
      "too tight",
      "too loose",
    ],
    answer:
      "Necklace lengths are stated on each piece — 16, 18 and 21 inch appear most, and some are marked customisable, which means we set the length before stringing. Bangles are the tricky one: they vary from manufacturer to manufacturer, and an inner diameter marked the same by two makers will not sit the same on your wrist. Measure a bangle you already wear and order knowing that variation is at your own risk.",
    links: [{ label: "Size & fit", to: "/terms" }],
  },
  {
    id: "material",
    ask: [
      "real gold",
      "pure gold",
      "22k",
      "18k",
      "gold plated",
      "gold polish",
      "hallmark",
      "original",
      "fake",
      "what is it made of",
      "material",
      "stones real",
      "diamond real",
    ],
    answer:
      "Everything here is handmade fashion jewellery — gold polish and gold-plated metal with pearls, kundan, ruby-tone and crystal stones. It is not solid gold and is not hallmarked, and we would never describe it that way. That is exactly what lets a hand-strung piece cost a few hundred rupees instead of tens of thousands.",
    links: [{ label: "Meet the atelier", to: "/about" }],
  },
  {
    id: "care",
    ask: [
      "care",
      "clean",
      "tarnish",
      "maintain",
      "store",
      "shower",
      "perfume",
      "lotion",
      "fade",
      "fades",
      "colour fade",
      "color fade",
      "go black",
      "turn black",
      "last long",
      "does it last",
      "how will it hold up",
    ],
    answer:
      "Wipe with a soft dry cloth after each wear, keep it away from perfume, water, sweat and gym sessions, and put it on after your lotion and hair oil have settled. Store it flat with the pieces apart. Treated like that, gold polish keeps its warmth for years; treated like that is also the whole condition — polish that is worn through sweat and perfume and never wiped does dull, and that is wear, not a defect. The first polish is free within six months.",
    links: [
      { label: "Care rules in full", to: "/terms" },
      { label: "A day at the bench", to: "/blog" },
    ],
  },
  {
    id: "custom",
    ask: [
      "custom",
      "personalise",
      "personalize",
      "engrave",
      "bespoke",
      "own design",
      "my own design",
      "made to order",
      "how long does made to order take",
    ],
    answer:
      `Pieces marked “customisable” are strung to your length or colour before they leave. Anything sold out is made to order and takes ${SITE.madeToOrder}. For something from your own reference image, send it to us on WhatsApp and we will tell you what is possible, what it costs and how long it takes before anything begins.`,
    links: [{ label: "How ordering works", to: "/terms" }],
  },
  {
    id: "gifting",
    ask: [
      "gift",
      "gifting",
      "packaging",
      "box",
      "wrapped",
      "gift wrap",
      "note",
      "card message",
      "birthday gift",
      "anniversary gift",
    ],
    answer:
      "Everything leaves the atelier gift-ready — box, ribbon and a hand-written note if you tell us what to say. Gifts cost the same as pieces you keep for yourself, and the Gifts section is already sorted by occasion: birthday, anniversary, wedding and personal milestone.",
    links: [{ label: "Shop gifts by occasion", to: "/gifts" }],
  },
  {
    id: "account",
    ask: [
      "account",
      "sign in",
      "login",
      "log in",
      "my orders",
      "my bookings",
      "where is my order",
      "dashboard",
      "profile",
      "claim",
    ],
    answer:
      "Sign in with Google and your bookings, saved pieces and cart live in one account. Every booking you start on WhatsApp gets a reference code — if you booked without signing in, type that reference and your mobile number into the link box on the account page and the order joins your list.",
    links: [{ label: "Open your account", to: "/dashboard" }],
  },
  {
    id: "contact",
    ask: [
      "whatsapp",
      "contact",
      "call",
      "phone",
      "number",
      "talk to a person",
      "human",
      "email",
      "reply time",
      "open",
      "timing",
    ],
    answer:
      `The fastest way to a person is WhatsApp on ${SITE.whatsapp} — send a screenshot of what you like and we will tell you honestly whether it is still at the bench. We reply within one working day, and usually much sooner.`,
    links: [{ label: "Community & contact", to: "/community" }],
  },
  {
    id: "visit",
    ask: [
      "can i come",
      "can we come",
      "visit you",
      "visit the",
      "your shop",
      "the shop",
      "a store",
      "showroom",
      "walk in",
      "in person",
      "physically",
      "see it before",
      "try it on",
      "hyderabad can",
    ],
    answer:
      "Raakha Grace is a bench, not a shopfront — pieces are strung, photographed and packed at our workroom in Hyderabad, and there is no walk-in counter or trial room to visit. Everything is ordered through this site and WhatsApp, and we will send close-up photographs and a video of the actual piece, on a person or flat, before you pay. If you are in Hyderabad and want something for a function on a date, say so and we will tell you honestly whether we can make it.",
    links: [
      { label: "Meet the atelier", to: "/about" },
      { label: "Ask for a close-up", to: "/community" },
    ],
  },
  {
    id: "about",
    ask: [
      "who are you",
      "about you",
      "about raakha",
      "raakha grace",
      "where are you based",
      "hyderabad",
      "is it a factory",
      "handmade",
      "who makes",
      "independent",
    ],
    answer:
      "Raakha Grace is an independent atelier — light, handmade jewellery made to be worn every day and remembered for years. Every strand is strung, photographed and packed by hand at our bench in Hyderabad. The lotus is our only mark.",
    links: [
      { label: "Our story", to: "/about" },
      { label: "The journal", to: "/blog" },
    ],
  },
  {
    id: "privacy",
    ask: ["privacy", "data", "personal information", "gdpr", "cookies", "secure"],
    answer:
      "We keep only what an order needs — your name, number, address and what you booked — and sign-in is through Google. No payment card data ever touches this site, because payment happens with us directly on WhatsApp. Every cookie and storage key is named on the site, and there are no advertising or tracking cookies.",
    links: [
      { label: "Privacy policy", to: "/privacy" },
      { label: "Data protection", to: "/data-protection" },
      { label: "Cookie information", to: "/cookie-information" },
    ],
  },
  {
    id: "faq",
    ask: [
      "faqs",
      "faq",
      "frequently asked",
      "common questions",
      "questions answered",
      "is there a help page",
      "where can i read the rules",
      "help centre",
    ],
    answer:
      "There is a Questions page that answers all of it in one place — how an order becomes official, payment, delivery and tracking, the unboxing video, returns, warranty, sizing, materials, gifting and your data. Everything I say here comes from the same pages, so reading them is the same conversation, only faster.",
    links: [
      { label: "All questions", to: "/faq" },
      { label: "Terms of service", to: "/terms" },
    ],
  },
  {
    id: "conduct",
    ask: [
      "code of conduct",
      "conduct",
      "ethics",
      "your values",
      "child labour",
      "who makes it",
      "are workers paid",
      "environment",
      "sustainability",
      "are you ethical",
    ],
    answer:
      "We publish a code of conduct — what we promise about honesty in materials, paying the hands that make each piece, telling you the inconvenient rules before you pay, treating every customer the same, and owning a mistake in one message. It is written so a customer can quote it back at us, and it is what the atelier and the workshops we place work with are held to.",
    links: [
      { label: "Code of conduct", to: "/code-of-conduct" },
      { label: "Meet the atelier", to: "/about" },
    ],
  },
  {
    id: "reach",
    ask: [
      "where are you",
      "your address",
      "reach you",
      "contact details",
      "opening hours",
      "who runs it",
      "business details",
      "gst",
      "invoic",
    ],
    answer:
      `We are a working bench in Hyderabad, Telangana — not a showroom, so there is no retail address to walk up to and no trial room. Reach us on WhatsApp at ${SITE.whatsapp} or Instagram @raakhagrace; both come to the same people, Monday to Saturday through the working day, Sunday messages read on Monday. Invoices and the atelier's trade details come with your order — ask for them before dispatch.`,
    links: [
      { label: "Reach & information", to: "/reach-information" },
      { label: "About the atelier", to: "/about" },
    ],
  },
  {
    id: "browse",
    ask: [
      "what can i see",
      "what pages",
      "which pages",
      "site map",
      "sitemap",
      "site pages",
      "where can i find",
      "how do i find",
      "show me everything",
      "all pieces",
      "collections",
      "navigation",
      "how do i browse",
      "what is on this site",
      "what is on the site",
      "which sections",
      "what sections",
    ],
    answer:
      "The header has five doors: Jewellery (necklaces, earrings, rings, pendants, bracelets, mangalsutra), Ornaments (ceremonial bangles, sets and sacred threads), Gifts (by occasion), Collections (Specials, Daily Wear, Gifting, All Pieces) and The House (the atelier, the journal, the community). Everything you add goes to a cart, and every order closes on WhatsApp.",
    links: [
      { label: "All jewellery", to: "/jewellery" },
      { label: "Specials", to: "/specials" },
      { label: "Daily wear", to: "/daily-wear" },
      { label: "Gifts", to: "/gifts" },
    ],
  },
];

/** Phrases that mean "recommend me something" rather than "explain the shop". */
export const LOOKING_WORDS = [
  "recommend",
  "suggest",
  "show me",
  "i want",
  "looking for",
  "need",
  "gift for",
  "something",
  "any",
  "do you have",
  "have you got",
  "at the bench",
];

/**
 * Numbers Grace is allowed to quote about the shop. Computed from the live
 * catalogue so the answer cannot drift from what is actually listed.
 */
export type CatalogueFacts = ReturnType<typeof catalogueFacts>;

export function catalogueFacts(catalog: Product[]) {
  const prices = catalog.map((p) => p.price);
  const byCategory = new Map<string, Product[]>();
  for (const p of catalog) {
    const list = byCategory.get(p.category) ?? [];
    list.push(p);
    byCategory.set(p.category, list);
  }
  const inStock = catalog.filter((p) => p.stock > 0);
  const latest = catalog.filter((p) => p.latest);
  return {
    count: catalog.length,
    min: Math.min(...prices),
    max: Math.max(...prices),
    inStockCount: inStock.length,
    madeToOrder: catalog.filter((p) => p.stock === 0),
    latest: latest.length ? latest : catalog.slice(0, 3),
    cheapest: [...catalog].sort((a, b) => a.price - b.price)[0],
    dearest: [...catalog].sort((a, b) => b.price - a.price)[0],
    categories: [...byCategory.entries()].map(([key, list]) => ({
      key,
      label: key.charAt(0).toUpperCase() + key.slice(1),
      count: list.length,
      min: Math.min(...list.map((p) => p.price)),
      max: Math.max(...list.map((p) => p.price)),
      inStock: list.filter((p) => p.stock > 0).length,
    })),
  };
}

/** A sentence or two of real arithmetic, for "what are your prices" questions. */
export function priceSummary(f: CatalogueFacts, category?: string | null) {
  if (category) {
    const c = f.categories.find((x) => x.key === category);
    if (c) {
      return `${c.label}: ${c.count} ${c.count === 1 ? "piece" : "pieces"} at the bench, ${formatInr(c.min)} to ${formatInr(c.max)}, ${c.inStock} ready to ship.`;
    }
  }
  const lines = f.categories
    .map((c) => `${c.label} ${formatInr(c.min)}–${formatInr(c.max)}`)
    .join(" · ");
  return `${f.count} pieces listed, from ${formatInr(f.min)} to ${formatInr(f.max)}. ${lines}.`;
}

/**
 * The ground truth handed to the language model. Kept short on purpose: the
 * catalogue is small enough to include whole, the facts are the ones this
 * question actually touched.
 */
export function siteBrief(catalog: Product[], facts: Fact[] = FACTS) {
  const f = catalogueFacts(catalog);
  const rows = catalog
    .map(
      (p) =>
        `${p.id} | ${p.name} | ${p.sku} | ₹${p.price} | ${p.category} | ${p.collection} | ${p.wear} | ${p.occasion ?? "any"} | ${p.stones} | ${p.metal} | ${p.size} | stock ${p.stock}`,
    )
    .join("\n");
  const policy = facts
    .map((x) => `- ${x.id}: ${x.answer}`)
    .join("\n");
  return `RAAKHA GRACE — an independent handmade jewellery atelier in Hyderabad, India.
Orders close on WhatsApp at ${SITE.whatsapp}. Prices in Indian rupees.
${priceSummary(f)}
Made-to-order pieces take ${SITE.madeToOrder}; shipping across India is ${SITE.deliveryWindow}.

SITE PAGES: /jewellery /ornaments /gifts /specials /daily-wear /about /blog /community /cart /checkout /dashboard /terms /privacy /data-protection /cookie-information /code-of-conduct /reach-information /faq /affiliations

WHAT THE SITE PROMISES (quote this, never invent a policy):
${policy}

CATALOGUE (recommend by exact id only):
${rows}`;
}

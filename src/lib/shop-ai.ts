import { formatInr } from "./utils";
import type { Product } from "./products";

/**
 * The shopkeeper's side of "Shop with AI".
 *
 * Grace answers from the live catalogue with no API key and no network call, so
 * the assistant still works on a deploy where no model credentials are set.
 * `askShopAi` layers a model on top when one is configured and falls back to
 * this when the call fails — the answers below are the floor, never the ceiling.
 */
export type AiReply = { text: string; ids: string[] };

type Facet = { key: string; words: string[] };

const CATEGORIES: Facet[] = [
  { key: "necklaces", words: ["necklace", "necklaces", "choker", "haram", "haaram", "set", "sets"] },
  { key: "pendants", words: ["pendant", "pendants", "locket"] },
  { key: "bracelets", words: ["bangle", "bangles", "bracelet", "bracelets", "kada", "gajje"] },
  { key: "mangalsutra", words: ["mangalsutra", "mangalyam", "thali", "mangal"] },
  { key: "earrings", words: ["earring", "earrings", "jhumka", "jhumkas", "stud", "studs", "hoop", "hoops"] },
  { key: "rings", words: ["ring", "rings"] },
];

const OCCASIONS: Facet[] = [
  { key: "birthday", words: ["birthday", "birth day"] },
  { key: "anniversary", words: ["anniversary", "wedding anniversary", "years together"] },
  { key: "milestone", words: ["milestone", "promotion", "new job", "graduation", "housewarming"] },
  { key: "wedding", words: ["wedding", "marriage", "engaged", "reception", "sangeet", "bride", "bridal"] },
];

const WEARS: Facet[] = [
  { key: "daily", words: ["daily", "everyday", "day to day", "office", "work", "casual", "college", "simple", "light", "lightweight", "temple"] },
  { key: "special", words: ["special", "party", "function", "festive", "festival", "occasion", "statement", "heavy", "grand", "premium", "rich"] },
];

const MATERIALS: Facet[] = [
  { key: "pearl", words: ["pearl", "pearls", "swarovski"] },
  { key: "kundan", words: ["kundan", "jadu", "polki"] },
  { key: "coral", words: ["coral", "onyx"] },
  { key: "crystal", words: ["crystal", "ad", "american diamond"] },
  { key: "black beads", words: ["black bead", "black beads", "mangalsutra"] },
  { key: "gold", words: ["gold", "golden", "sona"] },
];

/** Questions about the shop rather than about a piece. */
const POLICY_TOPICS: { words: string[]; answer: string }[] = [
  {
    words: ["how do i order", "how to order", "how do we order", "how can i buy", "place order", "ordering", "process"],
    answer:
      "Ordering is personal, not a checkout form. Add what you like to the cart, then send it to us on WhatsApp — we confirm stock and price with you, share the payment details, and dispatch once it is received. Nothing is held without payment, and every piece is photographed and packed by hand before it leaves.",
  },
  {
    words: ["payment", "pay", "upi", "cod", "cash on delivery", "advance"],
    answer:
      "We work on advance payment only — UPI or bank transfer — and dispatch after the payment screenshot reaches us. There is no cash on delivery, and pieces are not held while a decision is pending.",
  },
  {
    words: ["shipping", "ship", "delivery", "courier", "how long", "dtdc", "tracking", "dispatch"],
    answer:
      "Shipping is across India in 3–7 working days in gift-ready packaging, insured, with the courier written at the top of your address. Tracking usually appears with DTDC within 2–3 working days; if it has not moved after 10–15 days, message us and we will chase it.",
  },
  {
    words: ["return", "exchange", "refund", "replacement", "cancel"],
    answer:
      "All sales are final — every piece is made by hand, so we cannot restock a return. If something is genuinely wrong, send a continuous 360-degree unboxing video within 5–6 hours of receiving the parcel; that video is the only proof we can accept. Where we do replace or refund, one-side shipping is on the customer, and refunds are adjusted against your next orders.",
  },
  {
    words: ["size", "fit", "measurement", "bangle size", "length"],
    answer:
      "Necklace lengths are noted on each piece (16, 18 and 21 inch appear most), and several can be customised before stringing. Bangle sizing is the tricky one: it varies from manufacturer to manufacturer, so share your inner diameter in inches and we will match the closest pair.",
  },
  {
    words: ["colour", "color", "shade", "same as photo", "real"],
    answer:
      "What you see is what is strung, but slight colour variation is normal — digital photography and every monitor renders gold polish differently. Ask for a real photograph of your exact piece before dispatch and we will send one.",
  },
  {
    words: ["care", "clean", "tarnish", "how long will it last", "maintain"],
    answer:
      "Wipe with a soft dry cloth after each wear, keep it away from perfume, water and sweat, and store it flat with the pieces apart. Put jewellery on after your lotion and hair oil settle. Treated gently, gold polish holds its warmth for years.",
  },
  {
    words: ["warranty", "guarantee", "break", "damage"],
    answer:
      "There is a one-year atelier warranty on craftsmanship and setting, plus a free first polish within six months. It does not cover loss, theft or accidental damage, and small things like a stone loosening or a pearl coming off are treated as wear, not damage.",
  },
  {
    words: ["whatsapp", "contact", "call", "talk", "person", "message"],
    answer:
      "The fastest way to a person is WhatsApp on +91 63048 37120 — send a screenshot of what you like and we will tell you honestly whether it is still at the bench.",
  },
  {
    words: ["custom", "personalise", "personalize", "engrave", "bespoke", "made to order", "own design"],
    answer:
      "Yes — most strands can be re-strung to your length, colour or stone. Send us a reference image on WhatsApp and we will say what is possible, what it costs, and how long it takes before anything begins.",
  },
  {
    words: ["gift", "gifting", "packaging", "box", "wrapped"],
    answer:
      "Everything leaves the atelier gift-ready: box, ribbon and a hand-written note if you tell us what to say. Gifts are priced the same as pieces you keep for yourself.",
  },
];

const GREETING =
  /^(hi|hello|hey|yo|namaste|namaskaram|good (morning|afternoon|evening)|start)\b/i;
const THANKS = /\b(thanks|thank you|thanku|thx)\b/i;

function words(text: string) {
  return ` ${text.toLowerCase().replace(/[^a-z0-9₹.,\s]/g, " ").replace(/\s+/g, " ")} `;
}

function matched(text: string, facets: Facet[]): string | null {
  let best: { key: string; hits: number } | null = null;
  for (const f of facets) {
    const hits = f.words.reduce((n, w) => (text.includes(` ${w}`) ? n + w.length : n), 0);
    if (hits > 0 && (!best || hits > best.hits)) best = { key: f.key, hits };
  }
  return best?.key ?? null;
}

/** ₹1,500 / 1500 / 1.5k / "under 1000" — the largest number mentioned. */
function budgetIn(text: string): number | null {
  const t = text.replace(/,/g, "");
  const hits = [...t.matchAll(/(₹\s*)?(\d+(?:\.\d+)?)\s*(k|thousand|rs|₹)?/g)];
  let best: number | null = null;
  for (const m of hits) {
    const raw = Number(m[2]);
    if (!Number.isFinite(raw) || raw <= 0) continue;
    const scale = m[3]?.toLowerCase();
    const value = scale === "k" || scale === "thousand" ? raw * 1000 : raw;
    if (value < 100) continue; // "2 pieces", "18 inch"
    if (best === null || value > best) best = value;
  }
  return best;
}

function line(p: Product) {
  return `**${p.name}** — ${formatInr(p.price)} · ${p.description}`;
}

function pick(list: Product[], n = 3) {
  return list.slice(0, n);
}

/** Rank so that in-stock, then latest, then cheapest-first reads naturally. */
function rank(list: Product[]) {
  return [...list].sort(
    (a, b) =>
      Number(b.stock > 0) - Number(a.stock > 0) ||
      Number(Boolean(b.latest)) - Number(Boolean(a.latest)) ||
      a.price - b.price,
  );
}

function reply(text: string, ids: string[] = []): AiReply {
  return { text, ids };
}

/**
 * Answer one customer message against the live catalogue.
 *
 * Pure and synchronous on purpose: it is the fallback path when no model is
 * configured, and it is what the model is handed as its shortlist.
 */
export function answerAboutShop(rawMessage: string, catalog: Product[]): AiReply {
  const text = words(rawMessage);
  const message = rawMessage.trim();

  if (!message) {
    return reply("Tell me who it is for, or the occasion, and I will pull a few pieces.");
  }

  const budget = budgetIn(text);
  const category = matched(text, CATEGORIES);
  const occasion = matched(text, OCCASIONS);
  const wear = matched(text, WEARS);
  const material = matched(text, MATERIALS);
  const askingPrice = /\b(price|cost|how much|rate|expensive|budget|under|within|rupees|₹)\b/i.test(
    rawMessage,
  );

  // Shop questions first — they are the ones a shopper actually needs answered.
  if (!category && !occasion && !budget) {
    for (const topic of POLICY_TOPICS) {
      if (topic.words.some((w) => text.includes(` ${w}`))) {
        return reply(topic.answer, pick(rank(catalog), 2).map((p) => p.id));
      }
    }
  }

  let list = rank(catalog);
  const narrowed: string[] = [];
  if (occasion) {
    const byOcc = list.filter((p) => p.occasion === occasion);
    if (byOcc.length) {
      list = byOcc;
      narrowed.push(occasion);
    }
  }
  if (category) {
    const byCat = list.filter((p) => p.category === category);
    if (byCat.length) {
      list = byCat;
      narrowed.push(category);
    } else {
      const alsoCat = catalog.filter((p) => p.category === category);
      if (!alsoCat.length) {
        const nearby = rank(catalog).slice(0, 3);
        return reply(
          `We do not have ${category} at the bench right now — everything is made by hand, so some lines are simply between batches. ${
            wear === "daily" ? "For everyday wear" : "For now"
          }, these are the closest in spirit, and if you want a ${category} made we can string one for you:`,
          nearby.map((p) => p.id),
        );
      }
    }
  }
  if (wear) {
    const byWear = list.filter((p) => p.wear === wear);
    if (byWear.length) {
      list = byWear;
      narrowed.push(wear);
    }
  }
  if (material) {
    const byMat = list.filter((p) =>
      [p.stones, p.metal, p.description, p.name].join(" ").toLowerCase().includes(material),
    );
    if (byMat.length) {
      list = byMat;
      narrowed.push(material);
    }
  }
  if (budget) {
    const within = list.filter((p) => p.price <= budget);
    if (within.length) {
      list = [...within].sort((a, b) => b.price - a.price);
    } else {
      const cheapest = [...list].sort((a, b) => a.price - b.price);
      return reply(
        `Nothing at the bench is under ${formatInr(budget)} in that line right now — the closest is ${cheapest[0].name} at ${formatInr(cheapest[0].price)}. If you can stretch a little, or let us string something lighter for you, I can work with that.`,
        [cheapest[0].id],
      );
    }
  }

  const opening = budget
    ? `Within ${formatInr(budget)}${narrowed.length ? ` for ${narrowed.join(", ")}` : ""}:`
    : narrowed.length
      ? `${narrowed[narrowed.length - 1].charAt(0).toUpperCase()}${narrowed[narrowed.length - 1].slice(1)} from the bench:`
      : askingPrice
        ? "Here is where our prices sit:"
        : null;

  if (!opening) {
    if (THANKS.test(message)) {
      return reply("Any time. Send me a screenshot if you spot something later — I keep the pieces we discuss.");
    }
    if (GREETING.test(message)) {
      return reply(
        "Hello — I am Grace, and I know every piece in the atelier. Tell me who it is for, the occasion, or a budget, and I will bring out a few strands. You can also ask me about shipping, sizing or how ordering works.",
        pick(rank(catalog), 3).map((p) => p.id),
      );
    }
    if (message.length <= 3) {
      return reply("A word or two is enough — try “anniversary”, “under 500”, or “light daily necklace”.");
    }
    return reply(
      "From what you describe, these read closest — all handmade, all shippable across India this week. Tell me an occasion or a budget and I will narrow it down.",
      pick(rank(catalog), 3).map((p) => p.id),
    );
  }

  const chosen = pick(list, budget ? 3 : 3);
  const body = chosen.map((p) => `• ${line(p)}`).join("\n");
  const tail =
    chosen.length === 1
      ? "Say the word and I will hold it while you decide."
      : "Add any of these to the cart and I will send the whole thing to us on WhatsApp in one message.";
  return reply(`${opening}\n\n${body}\n\n${tail}`, chosen.map((p) => p.id));
}

/** One-line catalogue digest the model is allowed to reason over. */
export function aiCatalogBrief(catalog: Product[]) {
  return catalog
    .map(
      (p) =>
        `${p.id} | ${p.name} | ${p.price} | ${p.category} | ${p.wear} | ${p.occasion ?? "-"} | ${p.stones} | ${p.size}`,
    )
    .join("\n");
}

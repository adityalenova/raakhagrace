import { formatInr } from "./utils";
import type { Product } from "./products";
import {
  FACTS,
  LOOKING_WORDS,
  SITE,
  catalogueFacts,
  priceSummary,
  type Fact,
  type SiteLink,
} from "./site-knowledge";

/**
 * The shopkeeper's side of "Shop with AI".
 *
 * Grace answers from the live catalogue and from `site-knowledge.ts` — the two
 * things this app can actually vouch for — with no network call, so the
 * assistant still works on a deploy with no model credentials and is the floor
 * the model is handed when one is configured.
 *
 * It is deliberately conversational: facets (budget, category, occasion, wear,
 * material) carry forward from earlier turns, and the pieces Grace last put on
 * screen become `focus`, so "is that still available?" and "the second one"
 * resolve to something real instead of restarting the search.
 */

export type AiReply = { text: string; ids: string[]; links: SiteLink[] };

export type Ask = {
  message: string;
  /** Earlier turns, oldest first — used to carry filters forward. */
  history?: { role: "user" | "assistant"; content: string }[];
  /** Ids Grace showed last, so "that one" has a referent. */
  focus?: string[];
};

type Facets = {
  budget: number | null;
  category: string | null;
  occasion: string | null;
  wear: string | null;
  material: string | null;
};

/**
 * Category words must map onto the `category` values actually used in
 * `products.ts`, or a filter silently matches nothing. The catalogue stocks
 * necklaces, pendants, bracelets, mangalsutra and rings — nothing else.
 */
const CATEGORIES: { key: string; words: string[] }[] = [
  { key: "necklaces", words: ["necklace", "necklaces", "choker", "haram", "haaram", "sagaya"] },
  { key: "pendants", words: ["pendant", "pendants", "locket"] },
  { key: "bracelets", words: ["bangle", "bangles", "bracelet", "bracelets", "kada", "gajje"] },
  { key: "mangalsutra", words: ["mangalsutra", "mangalyam", "thali", "mangal"] },
  { key: "rings", words: ["ring", "rings"] },
];

/**
 * Lines customers ask for that this bench does not list on their own. Earrings
 * exist only inside sets, so "cheapest earring" must be answered honestly
 * instead of being filtered into an empty pool or matched to one set by name.
 */
const NOT_STOCKED: { label: string; words: string[] }[] = [
  { label: "earrings", words: ["earring", "earrings", "jhumka", "jhumkas", "stud", "studs", "hoop", "hoops"] },
  { label: "anklets", words: ["anklet", "anklets", "payal"] },
  { label: "nose pins", words: ["nose pin", "nosepin", "nose ring", "nath"] },
  { label: "chains for men", words: ["men chain", "mens chain", "chain for men"] },
  { label: "tiaras", words: ["tiara", "tiaras", "headpiece", "crown"] },
  { label: "maang tikkas", words: ["maang tikka", "maang tikkas", "maangtikka", "tikka", "tikkas", "matha patti"] },
  { label: "brooches", words: ["brooch", "brooches", "boutonniere"] },
  { label: "waist chains", words: ["waist chain", "waist belt", "kamarbandh"] },
  { label: "toe rings", words: ["toe ring", "toe rings", "metti", "methai"] },
];

/** Facts that outrank a shopping brief — the shop's own terms, not a pick. */
const POLICY_FACTS = new Set(FACTS.filter((f) => f.id !== "gifting").map((f) => f.id));

/**
 * Pages of this site a customer can be sent to. `pieces` marks the sections
 * where showing three strands beats just handing over a link.
 */
const SITE_SECTIONS: {
  label: string;
  to: string;
  words: string[];
  blurb: string;
  pieces?: boolean;
}[] = [
  {
    label: "the jewellery catalogue",
    to: "/jewellery",
    words: ["jewellery", "jewelry", "catalogue", "catalog"],
    blurb: "Every piece in one place, filterable by category and price.",
    pieces: true,
  },
  {
    label: "ornaments",
    to: "/ornaments",
    words: ["ornament", "ornaments", "ceremonial"],
    blurb: "Ceremonial bangles, sets and sacred threads live under Ornaments.",
  },
  {
    label: "gifts",
    to: "/gifts",
    words: ["gift", "gifts", "present", "presents"],
    blurb: "Gifts are sorted by occasion — birthday, anniversary, wedding, milestone — and all leave wrapped.",
    pieces: true,
  },
  {
    label: "specials",
    to: "/specials",
    words: ["special", "specials", "statement", "bridal"],
    blurb: "The heavier, celebratory pieces are in the Specials collection.",
    pieces: true,
  },
  {
    label: "daily wear",
    to: "/daily-wear",
    words: ["daily wear", "everyday", "day to day"],
    blurb: "Light strands for office and every day are the Daily Wear edit.",
    pieces: true,
  },
  {
    label: "the atelier page",
    to: "/about",
    words: ["about", "atelier", "story", "the house", "house"],
    blurb: "Who makes the pieces, and how, is on the House page.",
  },
  {
    label: "the journal",
    to: "/blog",
    words: ["blog", "journal", "posts"],
    blurb: "Notes from the bench are in the journal.",
  },
  {
    label: "the community page",
    to: "/community",
    words: ["community", "reviews", "instagram"],
    blurb: "What people wore, and how to reach us, is on the community page.",
  },
  {
    label: "your cart",
    to: "/cart",
    words: ["cart", "basket"],
    blurb: "What you have picked so far sits in the cart, and one WhatsApp message sends it to us.",
  },
  {
    label: "your account",
    to: "/dashboard",
    words: ["account", "booking", "bookings", "my orders", "dashboard"],
    blurb: "Every booking you start on WhatsApp shows up in your account with its status and tracking number.",
  },
  {
    label: "the terms page",
    to: "/terms",
    words: ["terms", "policy"],
    blurb: "Ordering, payment, shipping and the unboxing rule are written out in full on the terms page.",
  },
  {
    label: "the privacy page",
    to: "/privacy",
    words: ["privacy"],
    blurb: "What we keep, and what we never touch, is on the privacy page.",
  },
];

const OCCASIONS: { key: string; words: string[] }[] = [
  { key: "birthday", words: ["birthday", "birth day"] },
  { key: "anniversary", words: ["anniversary", "wedding anniversary", "years together"] },
  {
    key: "milestone",
    words: ["milestone", "promotion", "new job", "graduation", "housewarming"],
  },
  {
    key: "wedding",
    words: ["wedding", "marriage", "engaged", "engagement", "reception", "sangeet", "bride", "bridal"],
  },
];

const WEARS: { key: string; words: string[] }[] = [
  {
    key: "daily",
    words: [
      "daily",
      "everyday",
      "day to day",
      "office",
      "work",
      "casual",
      "college",
      "simple",
      "light",
      "lightweight",
    ],
  },
  {
    key: "special",
    words: [
      "special",
      "party",
      "function",
      "festive",
      "festival",
      "occasion",
      "statement",
      "heavy",
      "grand",
      "premium",
      "rich",
      "ceremony",
    ],
  },
];

const MATERIALS: { key: string; words: string[] }[] = [
  { key: "pearl", words: ["pearl", "pearls", "swarovski"] },
  { key: "kundan", words: ["kundan", "jadu", "polki"] },
  { key: "coral", words: ["coral", "onyx"] },
  { key: "crystal", words: ["crystal", "american diamond", "diamond"] },
  { key: "ruby", words: ["ruby", "red stone"] },
  { key: "black bead", words: ["black bead", "black beads"] },
  { key: "gold", words: ["gold", "golden", "sona"] },
];

/** Who the piece is for — a gift is usually described by its recipient. */
const RECIPIENTS: { words: string[]; lean: Partial<Facets> }[] = [
  { words: ["wife", "husband", "my wife", "for her", "for him", "girlfriend", "boyfriend"], lean: { occasion: "anniversary" } },
  { words: ["mother", "mom", "mum", "father", "dad", "parents"], lean: { wear: "daily" } },
  { words: ["daughter", "son", "sister", "brother", "friend", "cousin"], lean: { occasion: "birthday" } },
  { words: ["bride", "wedding", "reception", "sangeet"], lean: { occasion: "wedding", wear: "special" } },
];

const GREETING = /^(hi|hello|hey|yo|namaste|namaskaram|good (morning|afternoon|evening))\b/i;
const THANKS = /\b(thanks|thank you|thanku|thx)\b/i;
/** Only plainly about the assistant itself — "who are you people?" is about the atelier. */
const CAPABILITY =
  /\b(what can you do|what do you do|how do you work|are you (a robot|real|human|an ai|a bot)|who made you|who are you and)\b/i;

/** Words that describe the shop, not a piece — "real", "gold", "light" name nothing. */
const NAME_STOP = new Set([
  "this",
  "that",
  "these",
  "those",
  "with",
  "from",
  "your",
  "ours",
  "real",
  "pure",
  "gold",
  "silver",
  "set",
  "sets",
  "one",
  "ones",
  "small",
  "medium",
  "large",
  "light",
  "heavy",
  "new",
  "cheap",
  "cheapst",
  "best",
  "pretty",
  "simple",
]);

/** A question about the shop's terms, which no product page can own. */
const POLICY_ASK =
  /\b(policy|terms|return|returns|refund|exchange|cancel|ship|shipping|deliver|delivery|payment|pay|upi|cod|track|tracking|order|ordering|book|booking|warrant|warranty|claim|damag|damage|broken|unboxing|hallmark|gold|privacy|data|cookies|invoice|custo?m|personali[sz]e|engrav)\w*/i;

function norm(text: string) {
  return ` ${text.toLowerCase().replace(/[^a-z0-9₹.,\s]/g, " ").replace(/\s+/g, " ")} `;
}

/** Longest matching phrase wins, so "bangle size" beats plain "size". */
function matched(text: string, facets: { key: string; words: string[] }[]): string | null {
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

function facetsOf(raw: string): Facets {
  const text = norm(raw);
  return {
    budget: budgetIn(text),
    category: matched(text, CATEGORIES),
    occasion: matched(text, OCCASIONS),
    wear: matched(text, WEARS),
    material: matched(text, MATERIALS),
  };
}

function anyFacet(f: Facets) {
  return Boolean(f.budget || f.category || f.occasion || f.wear || f.material);
}

/**
 * Carry filters from the turns before this one — but only when this turn is
 * itself a refinement. "under ₹2,000" then "for a wedding" keeps the budget;
 * "what's the weather" must not inherit the daily-wear filter from three turns
 * ago and answer with three necklaces. Turns with no filter of their own start
 * fresh; a pointed question ("is that still in stock?") is carried by `focus`
 * instead, which names the actual piece rather than a stale facet.
 */
function carry(history: Ask["history"], current: Facets): Facets {
  if (!anyFacet(current)) return current;
  // A turn that names its own subject — a category or a material, "kundan
  // bangles", "pearl necklaces" — is a fresh search, not a refinement of the
  // last one. Carrying "birthday, daily wear, under ₹500" from three turns ago
  // onto it produced "nothing at the bench fits ₹500" and one necklace for
  // someone who had just asked about bangles. Only a bare refinement ("for a
  // wedding", "under ₹1,000", "something lighter") inherits the earlier brief.
  if (current.category || current.material) return current;
  const out = { ...current };
  const prior = (history ?? [])
    .filter((h) => h.role === "user")
    .slice(-2)
    .reverse();
  for (const turn of prior) {
    const f = facetsOf(turn.content);
    if (out.budget === null && f.budget !== null) out.budget = f.budget;
    if (!out.occasion && f.occasion) out.occasion = f.occasion;
    if (!out.wear && f.wear) out.wear = f.wear;
  }
  return out;
}

function scoreFact(text: string, fact: Fact) {
  let score = 0;
  for (const w of fact.ask) if (text.includes(` ${w}`)) score += w.length * w.length;
  return score;
}

function bestFact(text: string): Fact | null {
  let best: { fact: Fact; score: number } | null = null;
  for (const f of FACTS) {
    const score = scoreFact(text, f);
    if (score > 0 && (!best || score > best.score)) best = { fact: f, score };
  }
  return best?.fact ?? null;
}

/**
 * Newest first, then cheapest. There is no availability term here on purpose:
 * the site does not count pieces, so "what is in hand" is not a signal Grace
 * can honestly sort on. `latest` and price are the two real keys.
 */
function rank(list: Product[]) {
  return [...list].sort(
    (a, b) => Number(Boolean(b.latest)) - Number(Boolean(a.latest)) || a.price - b.price,
  );
}

/** Words a piece is actually called by — its own name and SKU, nothing else. */
function nameTokens(p: Product) {
  return [
    ...new Set(
      norm(`${p.name} ${p.sku}`)
        .split(" ")
        .filter((w) => w.length > 3 && !NAME_STOP.has(w) && !/^[\d.,&-]+$/.test(w)),
    ),
  ];
}

/**
 * Which single piece is the customer holding a screenshot of?
 *
 * Deliberately strict, because a loose match is worse than none: "is this real
 * gold?" once resolved to *Real Coral Tulips & Onyx Pumpkins* and answered a
 * policy question with one product's metal. So a hit needs either two of the
 * piece's own name words ("the coral tulip"), or one word long enough and
 * idiosyncratic enough to belong to that piece alone ("cascade", "tulips").
 * Everyday words — gold, pearl, real, set — can never name a piece by
 * themselves; they are facets, and the recommendation branch handles them.
 */
function findProduct(text: string, catalog: Product[]): Product | null {
  const lineWords = NOT_STOCKED.flatMap((n) => n.words);
  const words = text
    .trim()
    .split(/\s+/)
    .map((w) => w.replace(/[^a-z0-9]/g, ""))
    .filter(
      (w) =>
        w.length > 3 &&
        !NAME_STOP.has(w) &&
        // "earring" must never identify a set by itself; that is the not-stocked
        // branch's job, not a pointer at one product.
        !lineWords.some((lw) => lw.startsWith(w) || w.startsWith(lw)),
    );
  if (!words.length) return null;

  const byId = catalog.find((p) => text.includes(` ${p.id.replace(/-/g, " ")} `));
  if (byId) return byId;

  const perProduct = catalog.map((p) => ({ p, tokens: nameTokens(p) }));
  const owners = new Map<string, number>();
  for (const { tokens } of perProduct) {
    for (const t of tokens) owners.set(t, (owners.get(t) ?? 0) + 1);
  }

  let best: { p: Product; score: number } | null = null;
  for (const { p, tokens } of perProduct) {
    const hits = tokens.filter((t) =>
      words.some((w) => w === t || (w.length > 4 && (t.startsWith(w) || w.startsWith(t)))),
    );
    if (!hits.length) continue;
    const unique = hits.find((t) => (owners.get(t) ?? 0) === 1 && t.length >= 5);
    if (hits.length < 2 && !unique) continue;
    const score = hits.reduce((n, t) => n + t.length, 0);
    if (!best || score > best.score) best = { p, score };
  }
  return best?.p ?? null;
}

function productLine(p: Product) {
  return `**${p.name}** — ${formatInr(p.price)} · ${p.description}`;
}

/**
 * The one-line spec Grace reads out for a piece. The last fragment used to
 * branch on stock ("12 at the bench" or "made to order") — neither is a fact
 * this site knows, so it now says only the true thing: the piece is strung by
 * hand and its availability is settled with the customer on WhatsApp before
 * payment, never by a counter on the page.
 */
function detail(p: Product) {
  const bits = [
    p.size,
    p.stones,
    p.metal,
    "strung by hand — availability confirmed on WhatsApp before payment",
  ];
  return bits.filter(Boolean).join(" · ");
}

function dedupeLinks(links: SiteLink[]) {
  const seen = new Set<string>();
  return links.filter((l) => (seen.has(l.to) ? false : (seen.add(l.to), true)));
}

function reply(text: string, ids: string[] = [], links: SiteLink[] = []): AiReply {
  return { text, ids, links: dedupeLinks(links) };
}

/**
 * Narrow the shop by the facets the customer gave us.
 *
 * Category and budget are the two hard edges. Someone who asked for bangles and
 * gets a necklace, or who set ₹500 and gets ₹3,499, has been answered by a
 * filter list rather than by a shopkeeper — so those two never relax, and
 * `recommend` turns an empty result into the honest sentence. Occasion, wear and
 * material are taste-facets and do relax, because "kundan earrings for a
 * wedding" with no exact triple should still show something.
 */
function filterTo(list: Product[], f: Facets): Product[] {
  let out = list;
  if (f.category && out.some((p) => p.category === f.category)) out = out.filter((p) => p.category === f.category);
  if (f.occasion) {
    const by = out.filter((p) => p.occasion === f.occasion);
    if (by.length) out = by;
  }
  if (f.wear) {
    const by = out.filter((p) => p.wear === f.wear);
    if (by.length) out = by;
  }
  if (f.material) {
    const by = out.filter((p) =>
      [p.stones, p.metal, p.description, p.name].join(" ").toLowerCase().includes(f.material!),
    );
    if (by.length) out = by;
  }
  if (f.budget) out = out.filter((p) => p.price <= f.budget!);
  return rank(out);
}

/** "a wedding", "an anniversary" — the label is read aloud, so get it right. */
function article(word: string) {
  return `aeiou`.includes(word[0] ?? "") ? "an" : "a";
}

/** The brief as a customer would say it, minus any facet that found nothing. */
function narrowingLabel(f: Facets, pool: Product[]) {
  const parts = [
    f.budget && pool.length ? `within ${formatInr(f.budget)}` : null,
    f.occasion ? `for ${article(f.occasion)} ${f.occasion}` : null,
    f.material ? f.material : null,
    f.wear ? `${f.wear} wear` : null,
    f.category ? f.category : null,
  ].filter(Boolean);
  return parts.length ? parts.join(", ") : "from the bench";
}

function categoryLink(f: Facets): SiteLink | null {
  if (f.category) {
    return { label: `See all ${f.category}`, to: `/jewellery?category=${f.category}` };
  }
  if (f.occasion) return { label: `All ${f.occasion} gifts`, to: `/gifts?occasion=${f.occasion}` };
  if (f.wear === "daily") return { label: "The daily wear edit", to: "/daily-wear" };
  if (f.wear === "special") return { label: "Specials", to: "/specials" };
  return null;
}

/** The shortlist Grace would show, shared by every recommendation branch. */
function recommend(f: Facets, catalog: Product[], opener?: string): AiReply {
  const pool = rank(catalog);
  if (!pool.length) {
    return reply(
      "The bench is between batches right now, so nothing is listed. Tell us what you had in mind on WhatsApp and we will string it for you.",
      [],
      [{ label: "Message the atelier", to: "/community" }],
    );
  }

  const list = filterTo(pool, f);

  if (f.budget && list.length === 0) {
    // Stay inside the rest of the brief — including the category — and show the
    // genuinely cheapest pieces there. The customer set the number; the honest
    // answer is "nothing in this line under ₹X, the floor is ₹Y", not a wider
    // pool with a piece from another shelf in it.
    const inScope = [...filterTo(pool, { ...f, budget: null })].sort((a, b) => a.price - b.price);
    const near = inScope.slice(0, 3);
    const line = f.category ? ` in ${f.category}` : "";
    return reply(
      `Nothing at the bench fits ${formatInr(f.budget)}${line} today — the cheapest${line} is ${near[0].name} at ${formatInr(near[0].price)}. Everything is strung by hand, so a little more stretch gets you these; if the number is fixed, tell me the occasion and I will look at the rest of the bench.`,
      near.map((p) => p.id),
      [
        { label: "Browse everything", to: "/jewellery" },
        { label: "Ask us to string something cheaper", to: "/community" },
      ],
    );
  }

  const chosen = (list.length ? list : pool).slice(0, 3);
  const brief = narrowingLabel(f, list);
  const head =
    opener ??
    (brief === "from the bench"
      ? "At the bench today:"
      : `${brief.replace(/^./, (c) => c.toUpperCase())} — ${chosen.length} at the bench:`);
  const tail = anyFacet(f)
    ? ""
    : "\n\nIf you had a particular piece in mind, name it or the occasion and I will check the bench for it.";
  const link = categoryLink(f);
  // Every answer hands the customer a way out of the chat panel. A narrowed
  // brief goes back to its own filter page; the whole-shop version gets the
  // catalogue, so the chip row is never empty.
  const where = link
    ? `, or open ${link.label.toLowerCase()}`
    : ", or see the whole catalogue in one place";
  return reply(
    `${head}\n\n${chosen.map((p) => `• ${productLine(p)}`).join("\n")}\n\nAdd any of these to the cart and one WhatsApp message sends the whole lot to us${where}.${tail}`,
    chosen.map((p) => p.id),
    [link ?? { label: "Browse everything", to: "/jewellery" }],
  );
}

/** Whole-word phrase test — `text.includes("any")` once matched "many days". */
function says(text: string, phrase: string) {
  const esc = phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`\\b${esc}\\b`, "i").test(text);
}

/**
 * Is this a shopping request rather than a question about the shop?
 * "anniversary gift under ₹1,500" wants pieces; "what is your return policy"
 * wants the terms. Both can carry a facet-shaped word, so the difference has to
 * be made explicit or the policy answer wins and shows nothing to buy.
 */
function shoppingIntent(text: string, asked: Facets): boolean {
  if (POLICY_ASK.test(text)) return false;
  const looking = LOOKING_WORDS.some((w) => says(text, w));
  const budgeted = /\b(under|within|below|up to|upto|less than|budget of|around|near)\b/i.test(text);
  const forSomeone = RECIPIENTS.some((r) => r.words.some((w) => says(text, w)));
  return Boolean(looking || budgeted || forSomeone || anyFacet(asked));
}

/**
 * Answer one customer message against the catalogue and the site's own copy.
 *
 * Pure and synchronous on purpose: it is the fallback path when no model is
 * configured, and it is the shortlist the model is handed when one is.
 */
export function answerAboutShop(ask: Ask, catalog: Product[]): AiReply {
  const message = ask.message.trim();
  const text = norm(message);
  if (!message) return reply("Tell me who it is for, or the occasion, and I will pull a few pieces.");

  const facts = catalogueFacts(catalog);
  // "what is at the bench right now?" means the whole shop — filters from the
  // turns before it must not silently shrink the answer.
  const wholeShop =
    /\b(everything|all pieces|whole shop|at the bench right now|what do you have|what have you got|full catalogue|browse all)\b/i.test(
      message,
    );
  const asked = wholeShop ? facetsOf(message) : carry(ask.history, facetsOf(message));
  const focus = (ask.focus ?? []).map((id) => catalog.find((p) => p.id === id)).filter(Boolean) as Product[];
  const wantsToShop = shoppingIntent(text, asked);
  const pointing = /\b(this|that|these|those|it|its|one|second|first|third|last)\b/i.test(message);

  // --- a line this bench does not list on its own --------------------------
  // Ahead of the single-piece branch, so "cheapest earring" is answered honestly
  // rather than matched to the one set whose name contains the word.
  const missing = NOT_STOCKED.find((n) => n.words.some((w) => says(text, w)));
  const named = findProduct(text, catalog);
  if (missing && !named) {
    const asPartOfSet = rank(catalog).filter((p) =>
      [p.name, p.stones, p.description, p.details.join(" ")]
        .join(" ")
        .toLowerCase()
        .includes(missing.label.replace(/s$/, "")),
    );
    return reply(
      asPartOfSet.length
        ? `We do not list ${missing.label} on their own — they come with the sets they belong to. These include them:\n\n${asPartOfSet
            .slice(0, 3)
            .map((p) => `• ${productLine(p)}`)
            .join("\n")}\n\nIf you want ${missing.label} alone, we will make a pair for you — send a reference picture on WhatsApp.`
        : `We do not have ${missing.label} at the bench today. Everything here is handmade, so some lines are simply between batches — these read closest, and we can make ${missing.label} to order if you send a reference.`,
      (asPartOfSet.length ? asPartOfSet : rank(catalog)).slice(0, 3).map((p) => p.id),
      [
        { label: "Browse everything", to: "/jewellery" },
        { label: "Ask for a pair", to: "/community" },
      ],
    );
  }

  // --- small talk, and what Grace is for -----------------------------------
  if (GREETING.test(message) && !anyFacet(asked)) {
    return reply(
      `Hello — I am Grace. I know all ${facts.count} pieces at the bench, how ordering works, and exactly what our terms say about shipping and returns. Tell me who it is for, the occasion or a budget, and I will bring out a few strands.`,
      rank(catalog).slice(0, 3).map((p) => p.id),
      [{ label: "Start with the gifts edit", to: "/gifts" }],
    );
  }
  if (THANKS.test(message) && !anyFacet(asked)) {
    return reply("Any time. Send us a screenshot if you spot something later — we keep the pieces we discuss.");
  }
  if (CAPABILITY.test(message) && !anyFacet(asked)) {
    return reply(
      `I answer from two places: the live catalogue — ${facts.count} pieces, ${formatInr(facts.min)} to ${formatInr(facts.max)} — and what this site actually promises about ordering, payment, shipping, sizing and returns. Ask me to narrow by occasion or budget, ask what a piece is made of, or ask how a claim works.`,
      rank(catalog).slice(0, 2).map((p) => p.id),
      [{ label: "How ordering works", to: "/terms" }],
    );
  }

  // --- "the cheapest earring" / "the grandest set" -------------------------
  const superlative = /\b(cheapest|least expensive|lowest priced|most expensive|dearest|grandest|costliest)\b/i.test(
    message,
  );
  if (superlative) {
    const low = /\b(cheapest|least expensive|lowest priced)\b/i.test(message);
    const scope = asked.category ? catalog.filter((p) => p.category === asked.category) : catalog;
    if (scope.length) {
      const sorted = [...scope].sort((a, b) => (low ? a.price - b.price : b.price - a.price));
      const top = sorted.slice(0, 3);
      const noun = asked.category ? ` ${asked.category}` : " piece at the bench";
      return reply(
        `${low ? "The cheapest" : "The grandest"}${noun} here is ${top[0].name} at ${formatInr(top[0].price)} — ${top[0].description} ${
          top.length > 1
            ? `After that: ${top.slice(1).map((p) => `${p.name} ${formatInr(p.price)}`).join(", ")}.`
            : ""
        }`,
        top.map((p) => p.id),
        asked.category
          ? [{ label: `All ${asked.category}`, to: `/jewellery?category=${asked.category}` }]
          : [{ label: "Browse by category", to: "/jewellery" }],
      );
    }
  }

  // --- a piece the customer is pointing at ---------------------------------
  // Two guards, because a pronoun is not proof of a referent. First, a shopping
  // brief ("do you have pearl necklaces?") must not collapse onto the one product
  // whose name contains both words. Second, "the chain broke, can you repair it?"
  // points at a *line* and an order, not at whatever was on screen four turns
  // ago — so a focus-only pointer needs a bare pronoun and a question that a
  // single piece can actually answer.
  const about = {
    stock: /\b(stock|available|availability|in hand|left|sold out|made to order)\b/i.test(message),
    price: /\b(price|cost|how much|rate|worth)\b/i.test(message),
    size: /\b(size|fit|length|inch|measurement)\b/i.test(message),
    care: /\b(care|clean|tarnish|store|maintain)\b/i.test(message),
    material: /\b(gold|real|pure|plated|polish|stone|pearl|kundan|diamond|material|made of)\b/i.test(
      message,
    ),
    warranty: /\b(warranty|guarantee|repair|break|damage)\b/i.test(message),
  };
  const asksAboutPiece = Object.values(about).some(Boolean);
  const pronounOnly =
    /\b(it|its|this|that|these|those|one|first|second|third|last)\b/i.test(message) &&
    !/\b(chain|parcel|packet|package|order|booking|delivery|courier|refund|invoice|discount)\b/i.test(message);
  const piece = pointing
    ? (named ?? (focus.length && pronounOnly && asksAboutPiece ? focus[ordinal(message, focus.length)] : null))
    : (wantsToShop ? null : named);

  // --- "what is the difference between these" ------------------------------
  // Ahead of the single-piece answer, or "how does it compare" would describe
  // one strand and stop.
  if (/\b(vs|versus|compare|comparison|difference|which is better|which one)\b/i.test(message)) {
    const byName = catalog.filter((p) => nameTokens(p).some((w) => says(text, w)));
    // "compare it with the first one" means the pieces already on screen, so
    // start from what Grace showed rather than from the whole shelf.
    const wanted = named ?? (focus.length ? focus[ordinal(message, focus.length)] : null);
    const pool = [...new Set([...(wanted ? [wanted] : []), ...byName, ...(named ? [named] : []), ...focus])];
    const pair = pool.slice(0, 2);
    if (!pair.length) pair.push(...rank(catalog).slice(0, 2));
    if (pair.length === 1) {
      const next = rank(catalog).find((p) => p.id !== pair[0].id);
      if (next) pair.push(next);
    }
    if (pair.length === 2) {
      const [a, b] = pair;
      const line = (p: Product) =>
        `**${p.name}** — ${formatInr(p.price)}, ${p.stones}, ${p.size}, ${p.wear} wear, strung by hand`;
      const verdict =
        a.price === b.price
          ? "Same money, so pick on the stone and the length."
          : `${a.price < b.price ? a.name : b.name} is ${formatInr(Math.abs(a.price - b.price))} less; the dearer one buys you more presence when it is worn. ${a.wear === b.wear ? "" : `For every day, ${a.wear === "daily" ? a.name : b.name}.`}`;
      return reply(
        `${line(a)}\n${line(b)}\n\n${verdict}`,
        pair.map((p) => p.id),
        [{ label: "Compare in the catalogue", to: "/jewellery" }],
      );
    }
  }

  if (piece) {
    const wanted = asksAboutPiece;
    const link = { label: `Open ${piece.name}`, to: `/product/${piece.id}` };

    // "is it available?" is a fair question and we keep answering it — but the
    // site counts nothing, so the honest reply names the piece, says no count
    // exists, and points to the WhatsApp confirmation that actually settles it.
    if (about.stock) {
      return reply(
        `${piece.name} (${piece.sku}) — this site does not track how many of a piece exist, so I cannot say whether it is in hand or sold out. Everything is handmade, and we confirm availability with you on WhatsApp before any payment; a piece that has to be strung takes ${SITE.madeToOrder}. ${formatInr(piece.price)}, ${piece.size}.`,
        [piece.id],
        [link],
      );
    }
    if (about.price) {
      const other = facts.categories.find((c) => c.key === piece.category);
      return reply(
        `${piece.name} is ${formatInr(piece.price)}${piece.compareAt ? `, down from ${formatInr(piece.compareAt)}` : ""} plus fixed shipping. ${other ? `That sits in the middle of our ${other.label} range, ${formatInr(other.min)} to ${formatInr(other.max)}.` : ""}`,
        [piece.id],
        [link],
      );
    }
    if (about.size) {
      return reply(
        `${piece.name} is ${piece.size}. ${piece.category === "bracelets" ? "Bangle sizing varies between manufacturers, so measure the inner diameter of one you already wear and tell us the number — variation between makers is bought at your own risk." : "If you want a different length, say so before we string it and we will set it for you."}`,
        [piece.id],
        [{ label: "Sizing & fit", to: "/terms" }],
      );
    }
    if (about.care) {
      return reply(`${piece.name}: ${piece.care}`, [piece.id], [link]);
    }
    if (about.material) {
      // Built from `metal`, `stones` and `size` only — the old sentence quoted a
      // purity and a weight the shop never measured. The disclaimer stays, in
      // those exact protections: gold polish / fashion jewellery, not solid
      // gold, not hallmarked. The code of conduct forbids calling anything
      // hallmarked or certified unless it is, so that line is load-bearing.
      const stones =
        piece.stones && !/^none$/i.test(piece.stones) ? ` with ${piece.stones.toLowerCase()}` : "";
      return reply(
        `${piece.name} is ${piece.metal.toLowerCase()}${stones} — handmade fashion jewellery in gold polish or gold plate, not solid gold and not hallmarked. ${piece.size}.`,
        [piece.id],
        [link],
      );
    }
    if (about.warranty) {
      return reply(`${piece.name}: ${piece.warranty}`, [piece.id], [{ label: "Full terms", to: "/terms" }]);
    }
    if (wanted) return reply(`${piece.name}: ${detail(piece)}`, [piece.id], [link]);

    // No qualifier — describe it, then offer the next step.
    return reply(
      `**${piece.name}** — ${formatInr(piece.price)}\n${piece.story}\n\n${detail(piece)}. ${piece.shipping}`,
      [piece.id],
      [link],
    );
  }

  // --- prices across the shop ---------------------------------------------
  if (
    /\b(cheapest|most expensive|price range|how much does|average price|prices|budget of|under ₹?\d|within ₹?\d)\b/i.test(
      message,
    ) &&
    !anyFacet({ ...asked, budget: null })
  ) {
    return reply(
      `${priceSummary(facts)} The cheapest single piece is ${facts.cheapest.name} at ${formatInr(facts.cheapest.price)} and the grandest is ${facts.dearest.name} at ${formatInr(facts.dearest.price)}.`,
      [facts.cheapest.id, facts.dearest.id],
      [{ label: "Browse by category", to: "/jewellery" }],
    );
  }

  // --- "what's new at the bench?" -----------------------------------------
  // Ahead of the fact branch. This asked "show me new arrivals" once and got
  // courier timings, because "arrival" is an ask on the delivery-time fact and
  // facts are matched before anything else. Newness is a shopping question.
  const wantsNew =
    /\b(new arrivals?|new in|new pieces?|new collection|new stock|anything new|what(?:'?s| is) new|latest|just arrived|fresh off the bench|recently)\b/i.test(
      message,
    );
  if (wantsNew && !asked.budget) {
    const inLine = asked.category
      ? rank(catalog).filter((p) => p.category === asked.category && p.latest)
      : [];
    const list = (inLine.length ? inLine : facts.latest).slice(0, 3);
    const link = categoryLink(asked);
    // The old tail counted made-to-order lines and promised the rest were in
    // hand. Neither is known, so it says only what is true about new pieces.
    const tail =
      "These came off the bench most recently. Nothing here is counted, so we confirm each one is still available on WhatsApp before you pay.";
    return reply(
      `Fresh off the bench:\n\n${list.map((p) => `• ${productLine(p)}`).join("\n")}\n\n${tail}`,
      list.map((p) => p.id),
      [link ?? { label: "Browse everything", to: "/jewellery" }],
    );
  }

  // --- what the site says --------------------------------------------------
  const fact = bestFact(text);
  if (fact) {
    // A question about the shop's own terms gets the terms, even when it also
    // names a category: "how do I clean my necklace?" wants the care rule, not
    // three necklaces. A budget in the message always means shopping, and the
    // gifting fact is a shopping fact.
    const phrasedAsPolicy =
      POLICY_FACTS.has(fact.id) && !asked.budget && scoreFact(text, fact) >= 25;
    if (phrasedAsPolicy || !wantsToShop) return reply(fact.answer, [], fact.links ?? []);
  }

  // --- "what is running low / sold out?" ------------------------------------
  // The question is legitimate and stays detected. The old block filtered on
  // `stock <= 4` and named pieces as disappearing — both invented, since the
  // site counts nothing. The true answer is that nothing is marked as running
  // out, and a piece they actually want is answered piece by piece on WhatsApp.
  if (/\b(sold out|low stock|running low|left|only a few)\b/i.test(message) && !anyFacet(asked)) {
    return reply(
      "Nothing on this site is counted, so no piece is ever marked sold out, low or about to run out — those numbers do not exist here. Everything is handmade, and we confirm whether a piece is available with you on WhatsApp before you pay. Name the piece you have your eye on and I will pull it up.",
      [],
      [
        { label: "Browse everything", to: "/jewellery" },
        { label: "Ask about a piece", to: "/community" },
      ],
    );
  }

  // --- a real recommendation ----------------------------------------------
  if (anyFacet(asked) || wantsToShop) {
    const recipient = RECIPIENTS.find((r) => r.words.some((w) => text.includes(` ${w}`)));
    const merged = { ...asked };
    if (recipient) {
      for (const [k, v] of Object.entries(recipient.lean)) {
        if (!(merged as Record<string, unknown>)[k]) (merged as Record<string, unknown>)[k] = v;
      }
    }
    if (merged.category) {
      const any = catalog.some((p) => p.category === merged.category);
      if (!any) {
        const nearby = rank(catalog).slice(0, 3);
        return reply(
          `We do not have ${merged.category} at the bench right now — everything is handmade, so some lines are simply between batches. These read closest:\n\n${nearby
            .map((p) => `• ${productLine(p)}`)
            .join("\n")}\n\nIf you want ${merged.category} specifically, tell us on WhatsApp and we will string them for you.`,
          nearby.map((p) => p.id),
          [{ label: "Ask us on WhatsApp", to: "/community" }],
        );
      }
    }
    const out = recommend(merged, catalog);
    // "anniversary gift under ₹1,500" is both a shopping brief and a question
    // the shop has an answer for — show the pieces, then say the true thing.
    if (fact) {
      const line = fact.answer.length > 260 ? `${fact.answer.split(". ")[0]}.` : fact.answer;
      out.text = `${out.text}\n\n${line}`;
      out.links = dedupeLinks([...out.links, ...(fact.links ?? [])]);
    }
    return out;
  }

  // --- "where is the gifts section?" and other navigation -----------------
  if (/\b(show|link|link me|pages?|page\b|go to|open|where|navigate|which section|what section)\b/i.test(message)) {
    const section = SITE_SECTIONS.find((s) => s.words.some((w) => says(text, w)));
    if (section) {
      return reply(
        `${section.blurb} You will find it under ${section.label}.`,
        section.pieces ? rank(catalog).slice(0, 3).map((p) => p.id) : [],
        [{ label: `Open ${section.label}`, to: section.to }],
      );
    }
    return reply(
      "The header has five doors — Jewellery, Ornaments, Gifts by occasion, Collections (Specials, Daily Wear, All Pieces) and The House (the atelier, the journal, the community). Here is where the bench is strongest today:",
      rank(catalog).slice(0, 3).map((p) => p.id),
      [
        { label: "All jewellery", to: "/jewellery" },
        { label: "Gifts by occasion", to: "/gifts" },
        { label: "Daily wear", to: "/daily-wear" },
        { label: "Specials", to: "/specials" },
      ],
    );
  }

  // --- nothing matched: be honest, and hand over --------------------------
  return reply(
    `I did not want to guess at that one — I only answer from what is actually at the bench and what our pages promise. Try an occasion ("anniversary"), a budget ("under ₹1,500"), a piece ("the pearl set"), or a shop question ("what is your return policy"). For anything else, ${SITE.whatsapp} reaches a person within a working day.`,
    rank(catalog).slice(0, 3).map((p) => p.id),
    [
      { label: "Browse the catalogue", to: "/jewellery" },
      { label: "How ordering works", to: "/terms" },
    ],
  );
}

/** "the second one" → an index into the pieces Grace just showed. */
function ordinal(message: string, len: number): number {
  const m = message.toLowerCase();
  const n = /\bfirst\b/.test(m)
    ? 0
    : /\bsecond\b/.test(m)
      ? 1
      : /\bthird\b/.test(m)
        ? 2
        : /\blast\b/.test(m)
          ? len - 1
          : 0;
  return Math.max(0, Math.min(n, len - 1));
}

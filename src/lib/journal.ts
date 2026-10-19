export type JournalPost = {
  slug: string;
  title: string;
  kicker: string;
  minutes: number;
  image: string;
  excerpt: string;
  body: string[];
};

export const JOURNAL: JournalPost[] = [
  {
    slug: "how-to-layer-light-pieces",
    title: "How to layer light pieces",
    kicker: "Styling",
    minutes: 4,
    image: "/images/hero-woman.jpg",
    excerpt: "A simple rule for mixing pendants and chains without weight or clutter — perfect for workdays and weekends.",
    body: [
      "Start with one fine chain at the collarbone. That first line is the architecture; everything else hangs from how quietly it sits.",
      "Add a slightly longer pendant — two to four centimetres below — so the two lengths never fight. Keep metals in the same family: yellow with yellow, rose with rose, or a considered mix of two at most.",
      "If you add a third piece, make it a bracelet or a pair of hoops, not another necklace. The neck is a small stage. Leave it air.",
      "Raakha Grace pieces are designed to stack this way: the Triad Pendant over a plain chain, Cafe Gold Hoops with a tennis line, never a pile.",
    ],
  },
  {
    slug: "why-we-choose-premium-beads",
    title: "Why we choose premium beads",
    kicker: "Craft",
    minutes: 5,
    image: "/images/cat-mangalsutra.jpg",
    excerpt: "Material notes on colour, finish, and longevity — and how small choices change how jewellery feels on skin.",
    body: [
      "A bead is not filler. On a mangalsutra or a layered necklace it is the rhythm the gold keeps time with.",
      "We source for even tone, smooth edges, and a density that does not drag. Cheap beads chip, fade, and catch on silk. Ours are meant to be forgotten on the skin and remembered in the mirror.",
      "The difference shows after a full day: less snag, more comfort, colour that still reads true under evening light.",
      "If a strand does not pass a hand-feel test in the atelier, it does not leave. That is the whole policy.",
    ],
  },
  {
    slug: "gifts-that-travel-well",
    title: "Gifts that travel well",
    kicker: "Gifting",
    minutes: 3,
    image: "/images/occ-birthday.jpg",
    excerpt: "From anniversaries to firsts — choosing a piece that arrives beautifully and becomes part of someone’s everyday.",
    body: [
      "The best gift is the one that is worn on a Tuesday. Lightweight studs, slim bracelets, and small pendants pack easily and suit most styles.",
      "We wrap every order as if it were leaving our hands, not a warehouse. Add a short note at checkout; we include it on cream card inside the box.",
      "If you are unsure of size, choose an adjustable chain or a pair of hoops. WhatsApp us with a photograph of their current jewellery — we will suggest a sister piece.",
      "Birthday Spark, Cafe Gold Hoops, and the Vow Circle Ring are the three we send most often. None of them need a ceremony to make sense.",
    ],
  },
  {
    slug: "keeping-pieces-luminous",
    title: "Keeping pieces luminous",
    kicker: "Care",
    minutes: 3,
    image: "/images/cat-bracelets.jpg",
    excerpt: "Soft cloth, dry storage, and when to avoid water — a short care guide for everyday sparkle.",
    body: [
      "Wipe gold and diamonds with a soft, dry cloth after wear. Oils from skin and perfume dull a finish faster than time does.",
      "Put jewellery on last — after lotion, after scent. Take it off first when you wash, swim, or sleep.",
      "Store flat or hanging, pieces apart so clasps do not scratch neighbours. A pouch in a drawer is enough; a heap is not.",
      "If a piece needs a deeper clean, bring it to a trusted jeweller or message us. We would rather see it than have you use a harsh paste.",
    ],
  },
  {
    slug: "wedding-week-lightly-worn",
    title: "Wedding week, lightly worn",
    kicker: "Occasions",
    minutes: 4,
    image: "/images/occ-wedding.jpg",
    excerpt: "How to choose pieces that photograph well and still feel comfortable through long ceremonies.",
    body: [
      "A wedding week is long. Prioritise secure backs, balanced weight, and one statement piece so the rest of the look can stay soft.",
      "The Sacred Thread Mangalsutra and Layered Grace set are built for this: ceremonial in photograph, liveable in a crowded hall.",
      "Match metal to the rest of the jewellery already in the family — not to a trend. Heirlooms sit beside new pieces more kindly when the gold speaks the same language.",
      "If you are travelling between functions, keep a cloth and a spare pair of backs in the clutch. That is the whole emergency kit.",
    ],
  },
  {
    slug: "a-day-at-the-bench",
    title: "A day at the bench",
    kicker: "Studio",
    minutes: 2,
    image: "/images/hero-pendant.jpg",
    excerpt: "From wire to finish — a quiet walk through how a Raakha Grace piece comes together.",
    body: [
      "Sketch. Form. Set. Polish. Check. We only ship what we would wear ourselves.",
      "Mornings are for metal — sawing, soldering, the slow work that does not photograph well. Afternoons are for stones and the last light on a finished surface.",
      "Every piece is signed off by a second pair of eyes. If a prong is impatient, it goes back. Luxury, for us, is that patience made visible.",
      "The lotus on the box is the last thing we place. Grace, packed.",
    ],
  },
];

export function getPost(slug: string) {
  return JOURNAL.find((p) => p.slug === slug);
}

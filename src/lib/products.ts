import { AFTER_SALES_TERMS } from "./terms";

export type Product = {
  id: string;
  name: string;
  sku: string;
  price: number;
  compareAt?: number;
  category: "rings" | "earrings" | "pendants" | "necklaces" | "bracelets" | "mangalsutra";
  collection: "jewellery" | "gifts" | "ornaments";
  wear: "daily" | "special";
  occasion?: "birthday" | "anniversary" | "milestone" | "wedding";
  image: string;
  description: string;
  story: string;
  details: string[];
  metal: string;
  stones: string;
  size: string;
  care: string;
  warranty: string;
  shipping: string;
  latest?: boolean;
};

export const CATEGORIES = [
  { slug: "rings", label: "Rings", image: "/images/cat-rings.jpg", size: "lg" as const },
  { slug: "earrings", label: "Earrings", image: "/images/cat-earrings.jpg", size: "lg" as const },
  { slug: "pendants", label: "Pendants", image: "/images/cat-pendants.jpg", size: "sm" as const },
  {
    slug: "necklaces",
    label: "Necklaces",
    image: "/images/cat-necklaces.jpg",
    size: "sm" as const,
  },
  {
    slug: "bracelets",
    label: "Bracelets",
    image: "/images/cat-bracelets.jpg",
    size: "sm" as const,
  },
  {
    slug: "mangalsutra",
    label: "Mangalsutra",
    image: "/images/cat-mangalsutra.jpg",
    size: "sm" as const,
  },
] as const;

export const OCCASIONS = [
  { slug: "birthday", label: "Birthday", image: "/images/occ-birthday.jpg" },
  { slug: "anniversary", label: "Anniversary", image: "/images/occ-anniversary.jpg" },
  { slug: "milestone", label: "Personal Milestone", image: "/images/occ-milestone.jpg" },
  { slug: "wedding", label: "Wedding", image: "/images/occ-wedding.jpg" },
] as const;

const CARE_BEADS =
  "Wipe with a soft dry cloth after wear. Keep away from perfume, water, and sweat. Store flat, pieces apart.";
const CARE_GOLD =
  "Wipe with a soft dry cloth after wear. Put jewellery on after perfume and lotion. Avoid water, gym, and sleep. Store flat, pieces apart.";
/**
 * Shipping stated the way the house terms state it: no insurance we do not
 * carry, and the claim window is the unboxing video, not "write within 48
 * hours".
 */
const SHIP_STD =
  "Dispatched after payment is confirmed, in gift-ready packaging, by DTDC, Blue Dart or India Post. Shipping charges are fixed and are not negotiable or discountable. Write the courier service that reaches your pin code on the first line above your address. Allow two to three working days for tracking to appear, and open the parcel on one continuous 360-degree video.";
/** There is no warranty on these pieces — this is what is said instead. */
const WARRANTY = AFTER_SALES_TERMS;

export const PRODUCTS: Product[] = [
  {
    id: "ruby-drop-necklace",
    name: "Ruby Drop Gold Polish Necklace",
    sku: "RG-N-RUBY-DROP",
    price: 399,
    category: "necklaces",
    collection: "jewellery",
    wear: "daily",
    occasion: "birthday",
    image: "/images/products/WA0016.jpg",
    description:
      "Gold-polish choker with ruby-tone drops and gold beads — festive light for everyday grace.",
    story:
      "Hand-finished gold polish with a curve of ruby drops. Light enough for daily wear, bright enough for celebrations.",
    details: ["Gold polish finish", "Ruby-tone drops", "Handmade", "Plus shipping"],
    metal: "Gold polish",
    stones: "Ruby-tone beads",
    size: "Adjustable necklace length",
    care: CARE_BEADS,
    warranty: WARRANTY,
    shipping: SHIP_STD,
    latest: true,
  },
  {
    id: "swarovski-pearl-set",
    name: "Swarovski Pearl Necklace & Earrings",
    sku: "RG-SET-SWARO-16",
    price: 1099,
    category: "necklaces",
    collection: "jewellery",
    wear: "special",
    occasion: "anniversary",
    image: "/images/products/WA0017.jpg",
    description:
      "Four-strand Swarovski pearl necklace with matching earrings — 16 inch, handmade set.",
    story:
      "Swarovski pearls with an elegant gold centrepiece. Lightweight and comfortable for daily wear or special occasions.",
    details: ["Swarovski pearls", "Handmade necklace & earrings", "16 inch", "Lightweight"],
    metal: "Gold polish with pearls",
    stones: "Swarovski pearls",
    size: "16 inch necklace",
    care: CARE_BEADS,
    warranty: WARRANTY,
    shipping: SHIP_STD,
    latest: true,
  },
  {
    id: "jadu-kundan-pearl-set",
    name: "Jadu Kundan with Swarovski Pearls",
    sku: "RG-SET-JK-SWARO",
    price: 3499,
    category: "necklaces",
    collection: "jewellery",
    wear: "special",
    occasion: "wedding",
    image: "/images/products/WA0018.jpg",
    description:
      "Traditional Jadu Kundan necklace with Swarovski pearls, ruby accents, and matching earrings.",
    story:
      "Royal finish for weddings, festivals, and special occasions. Traditional craftsmanship with premium pearls.",
    details: ["Jadu Kundan", "Swarovski pearls", "Matching earrings", "Handmade"],
    metal: "Gold polish Kundan",
    stones: "Swarovski pearls, ruby-tone, Kundan",
    size: "Necklace with earrings set",
    care: CARE_BEADS,
    warranty: WARRANTY,
    shipping: SHIP_STD,
    latest: true,
  },
  {
    id: "matt-floral-bangles",
    name: "Matt Finish Gold Polish Bangles",
    sku: "RG-B-MATT-24",
    price: 329,
    category: "bracelets",
    collection: "ornaments",
    wear: "daily",
    occasion: "birthday",
    image: "/images/products/WA0019.jpg",
    description:
      "2.4 size gold polish bangles in matt finish with floral openwork — sold as a pair.",
    story:
      "Intricate flower lattice in matt gold polish. A pair for everyday stacking or festive sets.",
    details: ["2.4 size", "Matt finish", "Gold polish", "Pair"],
    metal: "Gold polish",
    stones: "None",
    size: "2.4 (pair)",
    care: CARE_BEADS,
    warranty: WARRANTY,
    shipping: SHIP_STD,
  },
  {
    id: "minimal-black-bead-necklace",
    name: "Minimal Black Bead Necklace",
    sku: "RG-N-BLACK-16",
    price: 499,
    category: "mangalsutra",
    collection: "jewellery",
    wear: "daily",
    occasion: "milestone",
    image: "/images/products/WA0020.jpg",
    description: "16-inch minimal black bead handmade necklace with gold leaf drops.",
    story:
      "Timeless black beads with delicate gold leaf pendants. Everyday elegance you can trust.",
    details: ["16 inch", "Black beads", "Gold leaf drops", "Handmade"],
    metal: "Gold polish with beads",
    stones: "Black beads",
    size: "16 inch",
    care: CARE_BEADS,
    warranty: WARRANTY,
    shipping: SHIP_STD,
    latest: true,
  },
  {
    id: "black-diamond-4-layer-haram",
    name: "Black Diamond 4-Layer Long Haram",
    sku: "RG-N-BD-4L",
    price: 899,
    category: "necklaces",
    collection: "jewellery",
    wear: "special",
    occasion: "wedding",
    image: "/images/products/WA0021.jpg",
    description: "Gold plated 4-layer long haram with black diamond-tone beads.",
    story:
      "Four cascading layers of gold and black beads. Statement length for festive and bridal looks.",
    details: ["4 layer", "Gold plated", "Black diamond-tone beads", "Long haram"],
    metal: "Gold plated",
    stones: "Black diamond-tone beads",
    size: "Long haram",
    care: CARE_BEADS,
    warranty: WARRANTY,
    shipping: SHIP_STD,
  },
  {
    id: "acrylic-pearl-gold-ball",
    name: "Acrylic Pearl & Gold Ball Necklace",
    sku: "RG-N-PEARL-21",
    price: 399,
    category: "necklaces",
    collection: "ornaments",
    wear: "daily",
    occasion: "birthday",
    image: "/images/products/WA0022.jpg",
    description:
      "21-inch handmade necklace with acrylic pearls and gold balls — can be customised.",
    story:
      "Classic pearl-and-gold rhythm. Lightweight, customisable length, made for everyday grace.",
    details: ["21 inch", "Acrylic pearls", "Gold balls", "Customisable"],
    metal: "Gold polish",
    stones: "Acrylic pearls",
    size: "21 inch (customisable)",
    care: CARE_BEADS,
    warranty: WARRANTY,
    shipping: SHIP_STD,
  },
  {
    id: "traditional-heavy-set",
    name: "Traditional Heavy Necklace Set",
    sku: "RG-SET-TRAD-HVY",
    price: 430,
    category: "necklaces",
    collection: "jewellery",
    wear: "special",
    occasion: "wedding",
    image: "/images/products/WA0023.jpg",
    description:
      "Traditional heavy necklace set with green drops and matching jhumkas — festivals, weddings & celebrations.",
    story:
      "Antique-look detailing with temple motifs and green bead drops. Comfortable enough for long wear.",
    details: ["Necklace & earrings", "Green drops", "Gold-like finish", "Traditional design"],
    metal: "Gold polish",
    stones: "Green bead drops, multi-stone accents",
    size: "Set — necklace & jhumkas",
    care: CARE_BEADS,
    warranty: WARRANTY,
    shipping: SHIP_STD,
  },
  {
    id: "coral-tulip-onyx",
    name: "Real Coral Tulips & Onyx Pumpkins",
    sku: "RG-N-CORAL-ONYX",
    price: 2499,
    category: "necklaces",
    collection: "jewellery",
    wear: "special",
    occasion: "anniversary",
    image: "/images/products/coral-onyx.jpg",
    description: "Handmade necklace with real coral tulips and onyx pumpkins, gold-plated finish.",
    story:
      "Real coral and onyx, strung by hand. A richer strand for gifting and occasions that matter.",
    details: ["Real coral & onyx", "Gold plated finish", "Handmade with care", "Plus shipping"],
    metal: "Gold plated",
    stones: "Real coral tulips, onyx pumpkins",
    size: "Standard necklace length",
    care: CARE_BEADS,
    warranty: WARRANTY,
    shipping: SHIP_STD,
    latest: true,
  },
  {
    id: "sandstone-coin-necklace",
    name: "Sandstone Coin Necklace",
    sku: "RG-N-SAND-COIN",
    price: 899,
    category: "necklaces",
    collection: "jewellery",
    wear: "daily",
    occasion: "milestone",
    image: "/images/products/WA0027.jpg",
    description:
      "Multi-strand sandstone bead necklace with gold coin drops — a bond of love, forever.",
    story: "Warm sandstone beads with gold coin charms. Lightweight, durable, made for her.",
    details: ["Sandstone beads", "Gold coin drops", "Multi-strand", "Handmade"],
    metal: "Gold polish",
    stones: "Sandstone",
    size: "Choker / short multi-strand",
    care: CARE_BEADS,
    warranty: WARRANTY,
    shipping: SHIP_STD,
  },
  {
    id: "lakshmi-black-bead-minimal",
    name: "Minimal Black Bead Lakshmi Pendant",
    sku: "RG-N-LAKSHMI-18",
    price: 450,
    category: "mangalsutra",
    collection: "jewellery",
    wear: "daily",
    occasion: "milestone",
    image: "/images/products/WA0028.jpg",
    description: "18-inch minimal gold chains with black beads and Lakshmi pendant.",
    story: "Effortless, elegant, everyday. A sacred pendant on light chains for daily wear.",
    details: ["18 inch", "Black beads", "Lakshmi pendant", "Minimal"],
    metal: "Gold polish",
    stones: "Black beads, ruby-tone accent",
    size: "18 inch",
    care: CARE_BEADS,
    warranty: WARRANTY,
    shipping: SHIP_STD,
  },
  {
    id: "kerala-palaka-set",
    name: "Kerala Palaka Necklace Set",
    sku: "RG-SET-PALAKA",
    price: 399,
    category: "necklaces",
    collection: "jewellery",
    wear: "special",
    occasion: "wedding",
    image: "/images/products/WA0029.jpg",
    description:
      "Kerala Palaka gold-plated necklace with green and ruby accents, matching earrings.",
    story: "A touch of tradition, a statement of grace. Gold plated finish for every occasion.",
    details: ["Kerala Palaka", "Gold plated", "Matching earrings", "Green & ruby accents"],
    metal: "Gold plated",
    stones: "Green stone drops, ruby-tone",
    size: "Necklace & earrings set",
    care: CARE_BEADS,
    warranty: WARRANTY,
    shipping: SHIP_STD,
    latest: true,
  },
  {
    id: "crystal-pearl-pendant",
    name: "Crystal & Pearl Pendant Necklace",
    sku: "RG-N-CRYSTAL-PEARL",
    price: 319,
    category: "pendants",
    collection: "ornaments",
    wear: "daily",
    occasion: "birthday",
    image: "/images/products/WA0030.jpg",
    description: "Gold polish necklace with crystals, pearls, and a sparkling ball pendant.",
    story: "Soft pastels and a bright pendant. Suitable for women and girls — light and graceful.",
    details: ["Gold polish", "Crystals & pearls", "Ball pendant", "Handmade"],
    metal: "Gold polish",
    stones: "Crystal beads, pearls",
    size: "Long pendant necklace",
    care: CARE_BEADS,
    warranty: WARRANTY,
    shipping: SHIP_STD,
  },
  {
    id: "red-crystal-minimal",
    name: "Minimal Red Crystal Necklace",
    sku: "RG-N-RED-CRYSTAL",
    price: 379,
    category: "necklaces",
    collection: "ornaments",
    wear: "daily",
    occasion: "birthday",
    image: "/images/products/WA0031.jpg",
    description: "Minimal red crystal necklace with gold polish — oval crystals on a fine chain.",
    story: "Seven red crystals on a delicate gold chain. Simple, bright, handmade with heart.",
    details: ["Red crystals", "Gold polish", "Minimal", "Handmade"],
    metal: "Gold polish",
    stones: "Red crystals",
    size: "Standard necklace",
    care: CARE_BEADS,
    warranty: WARRANTY,
    shipping: SHIP_STD,
  },
  {
    id: "ad-flower-pendant",
    name: "AD Flower Pendant Necklace",
    sku: "RG-N-AD-FLOWER",
    price: 349,
    category: "pendants",
    collection: "ornaments",
    wear: "daily",
    occasion: "birthday",
    image: "/images/products/WA0032.jpg",
    description: "AD (American diamond) flower pendant on gold polish chain with crystal side.",
    story:
      "A small flower in gold polish with AD sparkle. Everyday jewellery, handmade with grace.",
    details: ["AD stones", "Flower pendant", "Gold polish", "Handmade"],
    metal: "Gold polish",
    stones: "American diamonds (AD)",
    size: "Standard necklace",
    care: CARE_BEADS,
    warranty: WARRANTY,
    shipping: SHIP_STD,
  },

  // ── From the atelier's own Instagram posts, 2 October 2026 ──────────────────
  // Names, prices and the bullet copy below are transcribed from the shop's own
  // listing cards — including "plus shipping", which the site already handles.
  // The six September posts without a name or price on the card are deliberately
  // not listed: a piece with no price is not a product yet.
  {
    id: "dual-side-kundan-necklace",
    name: "Dual Side Kundan Necklace",
    sku: "RG-N-DUAL-KUNDAN",
    price: 2899,
    category: "necklaces",
    collection: "jewellery",
    wear: "special",
    occasion: "wedding",
    image: "/images/products/ig-dual-kundan-necklace.jpg",
    description:
      "One necklace, two faces — white kundan on one side, pink enamel on the other, strung with green beads.",
    story:
      "Reversible by design: turn it over and the same necklace becomes a different piece. Light enough to wear through a whole wedding day, finished in premium gold polish by hand.",
    details: [
      "Dual side design — white kundan & pink enamel",
      "2 looks in 1 necklace with green beads",
      "Elegant party wear, lightweight",
      "Handmade with premium gold polish",
      "Perfect for saree & wedding wear",
    ],
    metal: "Premium gold polish",
    stones: "Kundan, pink enamel, green beads",
    size: "Necklace length as shown",
    care: CARE_GOLD,
    warranty: WARRANTY,
    shipping: SHIP_STD,
    latest: true,
  },
  {
    id: "dual-side-kundan-choker",
    name: "Dual Side Kundan Choker with Earrings",
    sku: "RG-SET-DUAL-CHK",
    price: 2699,
    category: "necklaces",
    collection: "jewellery",
    wear: "special",
    occasion: "anniversary",
    image: "/images/products/ig-dual-kundan-choker.jpg",
    description:
      "A reversible kundan choker in pink and green enamel, with matching handmade earrings in the set.",
    story:
      "Two looks in one piece — wear the kundan face for the ceremony and the enamel face for the reception. Sits close to the neck and comes with its own earrings.",
    details: [
      "Dual side kundan choker — pink & green enamel",
      "2 looks in 1 design, reversible wear",
      "Premium kundan with green beads & pearls",
      "Includes matching handmade earrings",
      "Perfect for wedding & party wear",
    ],
    metal: "Premium gold polish",
    stones: "Kundan, green beads, pearls",
    size: "Choker with matching earrings",
    care: CARE_GOLD,
    warranty: WARRANTY,
    shipping: SHIP_STD,
    latest: true,
  },
  {
    id: "antique-pearl-flower-haram",
    name: "Antique Pearl Flower Long Haram Set",
    sku: "RG-SET-PRFL-HARAM",
    price: 3600,
    category: "necklaces",
    collection: "ornaments",
    wear: "special",
    occasion: "wedding",
    image: "/images/products/ig-antique-pearl-haram.jpg",
    description:
      "A long antique-gold haram of pearl flower clusters and engraved bars, with matching jhumkas.",
    story:
      "The bridal edit: engraved gold bars alternate with pearl clusters around a ruby centre, falling to a long pearl-flower pendant. Comes with the long jhumka earrings shown.",
    details: [
      "Antique gold long necklace with pearl flower pendant",
      "Intricate engraved bars with ruby centre & pearl cluster",
      "Matching long jhumka earrings with pearl flower",
      "Antique premium quality bridal collection",
      "Perfect for saree & bridal wear",
    ],
    metal: "Antique gold finish",
    stones: "Pearls, ruby-tone centres",
    size: "Long haram with jhumka earrings",
    care: CARE_GOLD,
    warranty: WARRANTY,
    shipping: SHIP_STD,
    latest: true,
  },
  {
    id: "antique-brass-diamond-pearl-haram",
    name: "Antique Brass Diamond Pearl Long Haram Set",
    sku: "RG-SET-BRASS-HARAM",
    price: 3990,
    category: "necklaces",
    collection: "ornaments",
    wear: "special",
    occasion: "wedding",
    image: "/images/products/ig-antique-brass-haram.jpg",
    description:
      "Antique brass haram with diamond-engraved plates, pearl flowers and ruby centres, with pearl-drop earrings.",
    story:
      "Brass worked the old way: diamond-engraved plates, pearl flower motifs at the centre of each, and a single pearl drop on each earring. Made for a saree and a long day.",
    details: [
      "Premium antique brass long haram with diamond engraved plates",
      "Pearl flower motif with ruby centre",
      "Single pearl drop earrings included",
      "Traditional antique finish with intricate detailing",
      "Perfect for saree, wedding & festive wear",
    ],
    metal: "Antique brass",
    stones: "Pearls, ruby-tone stones",
    size: "Long haram with drop earrings",
    care: CARE_GOLD,
    warranty: WARRANTY,
    shipping: SHIP_STD,
    latest: true,
  },
  {
    id: "pichwai-cow-earrings",
    name: "Handpainted Pichwai Cow Earrings",
    sku: "RG-E-PICHWAI-COW",
    price: 780,
    category: "earrings",
    collection: "jewellery",
    wear: "special",
    occasion: "milestone",
    image: "/images/products/ig-pichwai-cow-earrings.jpg",
    description:
      "Round gold-polished frames holding a handpainted Pichwai cow, topped with a kundan lotus and pearl drops.",
    story:
      "Each disc is painted by hand — the cow in a lotus pond, in the Pichwai tradition — then set under a kundan lotus stud with ruby and green stone and a fringe of pearls.",
    details: [
      "Handpainted Pichwai cow art with lotus pond",
      "Kundan lotus stud with ruby, green stone & pearl drops",
      "Gold polished round frame with intricate Pichwai painting",
      "Lightweight artistic statement earrings",
      "Perfect for festive, traditional & gifting",
    ],
    metal: "Gold polish",
    stones: "Kundan, ruby-tone, green stone, pearls",
    size: "Statement drop earrings",
    care: CARE_GOLD,
    warranty: WARRANTY,
    shipping: SHIP_STD,
    latest: true,
  },
  {
    id: "nakshi-crystal-mala",
    name: "Nakshi Crystal Mala with Earrings",
    sku: "RG-N-NAKSHI-MALA",
    price: 750,
    category: "necklaces",
    collection: "jewellery",
    wear: "special",
    occasion: "birthday",
    image: "/images/products/ig-nakshi-crystal-mala.jpg",
    description:
      "A nakshi-gold crystal mala with a large round pendant in ruby pink and emerald green, and matching earrings.",
    story:
      "Fine nakshi work around a round pendant — ruby pink on the outer ring, emerald green at the centre — hung on a chain of nakshi ball motifs. The earrings repeat the pendant in miniature.",
    details: [
      "Nakshi gold polished crystal mala with AD stones",
      "Large round pendant with ruby pink & emerald green detailing",
      "Long chain with nakshi ball motifs & designer caps",
      "Matching round earrings with leaf hangings",
      "Perfect for festive, wedding & traditional wear",
    ],
    metal: "Nakshi gold polish",
    stones: "AD crystals, ruby-tone, emerald-tone",
    size: "Long mala with matching earrings",
    care: CARE_GOLD,
    warranty: WARRANTY,
    shipping: SHIP_STD,
    latest: true,
  },
];

export function mergeProduct(base: Product, patch?: Partial<Product>): Product {
  if (!patch) return base;
  return {
    ...base,
    ...patch,
    details: patch.details ?? base.details,
  };
}

export function getProduct(id: string, catalog: Product[] = PRODUCTS) {
  return catalog.find((p) => p.id === id);
}

export function productsByCollection(
  collection: Product["collection"],
  catalog: Product[] = PRODUCTS,
) {
  return catalog.filter((p) => p.collection === collection);
}

export function productsByCategory(slug: string, catalog: Product[] = PRODUCTS) {
  return catalog.filter((p) => p.category === slug);
}

export function productsByOccasion(slug: string, catalog: Product[] = PRODUCTS) {
  return catalog.filter((p) => p.occasion === slug);
}

export function productsByWear(wear: Product["wear"], catalog: Product[] = PRODUCTS) {
  return catalog.filter((p) => p.wear === wear);
}

export function latestProducts(catalog: Product[] = PRODUCTS) {
  return catalog.filter((p) => p.latest);
}

export function catalogForAi(catalog: Product[] = PRODUCTS) {
  return catalog.map((p) => ({
    id: p.id,
    name: p.name,
    price: p.price,
    category: p.category,
    collection: p.collection,
    occasion: p.occasion,
    metal: p.metal,
    description: p.description,
  }));
}

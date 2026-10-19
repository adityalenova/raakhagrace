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
  purity: string;
  weight: string;
  stones: string;
  size: string;
  hallmark: string;
  certification: string;
  care: string;
  warranty: string;
  shipping: string;
  stock: number;
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
const SHIP_STD =
  "Ships across India in 3–7 working days in gift-ready packaging. Insured. Inspect on arrival and write within 48 hours if transit-damaged.";
const WARRANTY =
  "1-year atelier warranty on craftsmanship and setting. Free first polish within 6 months. Does not cover loss, theft, or accidental damage.";

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
    purity: "Fashion jewellery",
    weight: "Lightweight",
    stones: "Ruby-tone beads",
    size: "Adjustable necklace length",
    hallmark: "Raakha Grace atelier",
    certification: "Handmade — as shown",
    care: CARE_BEADS,
    warranty: WARRANTY,
    shipping: SHIP_STD,
    stock: 12,
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
    purity: "Fashion jewellery",
    weight: "Lightweight",
    stones: "Swarovski pearls",
    size: "16 inch necklace",
    hallmark: "Raakha Grace atelier",
    certification: "Handmade — as shown",
    care: CARE_BEADS,
    warranty: WARRANTY,
    shipping: SHIP_STD,
    stock: 8,
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
    purity: "Fashion jewellery",
    weight: "Statement set",
    stones: "Swarovski pearls, ruby-tone, Kundan",
    size: "Necklace with earrings set",
    hallmark: "Raakha Grace atelier",
    certification: "Handmade — as shown",
    care: CARE_BEADS,
    warranty: WARRANTY,
    shipping: SHIP_STD,
    stock: 5,
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
    purity: "Fashion jewellery",
    weight: "Lightweight pair",
    stones: "None",
    size: "2.4 (pair)",
    hallmark: "Raakha Grace atelier",
    certification: "Handmade — as shown",
    care: CARE_BEADS,
    warranty: WARRANTY,
    shipping: SHIP_STD,
    stock: 15,
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
    purity: "Fashion jewellery",
    weight: "Lightweight",
    stones: "Black beads",
    size: "16 inch",
    hallmark: "Raakha Grace atelier",
    certification: "Handmade — as shown",
    care: CARE_BEADS,
    warranty: WARRANTY,
    shipping: SHIP_STD,
    stock: 10,
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
    purity: "Fashion jewellery",
    weight: "Statement",
    stones: "Black diamond-tone beads",
    size: "Long haram",
    hallmark: "Raakha Grace atelier",
    certification: "Handmade — as shown",
    care: CARE_BEADS,
    warranty: WARRANTY,
    shipping: SHIP_STD,
    stock: 7,
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
    purity: "Fashion jewellery",
    weight: "Lightweight",
    stones: "Acrylic pearls",
    size: "21 inch (customisable)",
    hallmark: "Raakha Grace atelier",
    certification: "Handmade — as shown",
    care: CARE_BEADS,
    warranty: WARRANTY,
    shipping: SHIP_STD,
    stock: 14,
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
    purity: "Fashion jewellery",
    weight: "Statement set",
    stones: "Green bead drops, multi-stone accents",
    size: "Set — necklace & jhumkas",
    hallmark: "Raakha Grace atelier",
    certification: "Handmade — as shown",
    care: CARE_BEADS,
    warranty: WARRANTY,
    shipping: SHIP_STD,
    stock: 9,
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
    purity: "Fashion jewellery with real stones",
    weight: "Medium",
    stones: "Real coral tulips, onyx pumpkins",
    size: "Standard necklace length",
    hallmark: "Raakha Grace atelier",
    certification: "Handmade — as shown",
    care: CARE_BEADS,
    warranty: WARRANTY,
    shipping: SHIP_STD,
    stock: 4,
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
    purity: "Fashion jewellery",
    weight: "Lightweight",
    stones: "Sandstone",
    size: "Choker / short multi-strand",
    hallmark: "Raakha Grace atelier",
    certification: "Handmade — as shown",
    care: CARE_BEADS,
    warranty: WARRANTY,
    shipping: SHIP_STD,
    stock: 8,
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
    purity: "Fashion jewellery",
    weight: "Lightweight",
    stones: "Black beads, ruby-tone accent",
    size: "18 inch",
    hallmark: "Raakha Grace atelier",
    certification: "Handmade — as shown",
    care: CARE_BEADS,
    warranty: WARRANTY,
    shipping: SHIP_STD,
    stock: 11,
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
    purity: "Fashion jewellery",
    weight: "Lightweight",
    stones: "Green stone drops, ruby-tone",
    size: "Necklace & earrings set",
    hallmark: "Raakha Grace atelier",
    certification: "Handmade — as shown",
    care: CARE_BEADS,
    warranty: WARRANTY,
    shipping: SHIP_STD,
    stock: 10,
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
    purity: "Fashion jewellery",
    weight: "Lightweight",
    stones: "Crystal beads, pearls",
    size: "Long pendant necklace",
    hallmark: "Raakha Grace atelier",
    certification: "Handmade — as shown",
    care: CARE_BEADS,
    warranty: WARRANTY,
    shipping: SHIP_STD,
    stock: 12,
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
    purity: "Fashion jewellery",
    weight: "Lightweight",
    stones: "Red crystals",
    size: "Standard necklace",
    hallmark: "Raakha Grace atelier",
    certification: "Handmade — as shown",
    care: CARE_BEADS,
    warranty: WARRANTY,
    shipping: SHIP_STD,
    stock: 9,
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
    purity: "Fashion jewellery",
    weight: "Lightweight",
    stones: "American diamonds (AD)",
    size: "Standard necklace",
    hallmark: "Raakha Grace atelier",
    certification: "Handmade — as shown",
    care: CARE_BEADS,
    warranty: WARRANTY,
    shipping: SHIP_STD,
    stock: 13,
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

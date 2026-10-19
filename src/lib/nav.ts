/**
 * Header navigation, shared by the desktop mega panel and the mobile drawer.
 *
 * Every tile is a real route: `to` is the path and `search` the filter the
 * catalog page reads (`category`, `occasion`, or `wear`).
 */
export type NavTile = {
  label: string;
  to: "/jewellery" | "/ornaments" | "/gifts" | "/specials" | "/daily-wear" | "/about" | "/blog" | "/community";
  search?: Record<string, string>;
  image: string;
  caption?: string;
};

export type NavMenu = {
  label: string;
  /** Route the top-level item itself points to. */
  to: NavTile["to"];
  /** Line of copy that opens the panel. */
  blurb: string;
  tiles: NavTile[];
};

export const NAV_MENUS: NavMenu[] = [
  {
    label: "Jewellery",
    to: "/jewellery",
    blurb: "Necklaces, rings and everyday gold, finished by hand in the atelier.",
    tiles: [
      { label: "Necklaces", to: "/jewellery", search: { category: "necklaces" }, image: "/images/cat-necklaces.jpg" },
      { label: "Earrings", to: "/jewellery", search: { category: "earrings" }, image: "/images/cat-earrings.jpg" },
      { label: "Rings", to: "/jewellery", search: { category: "rings" }, image: "/images/cat-rings.jpg" },
      { label: "Pendants", to: "/jewellery", search: { category: "pendants" }, image: "/images/cat-pendants.jpg" },
      { label: "Bracelets", to: "/jewellery", search: { category: "bracelets" }, image: "/images/cat-bracelets.jpg" },
      { label: "Mangalsutra", to: "/jewellery", search: { category: "mangalsutra" }, image: "/images/cat-mangalsutra.jpg" },
    ],
  },
  {
    label: "Ornaments",
    to: "/ornaments",
    blurb: "Ceremonial pieces with a lighter hand — bangles, sets and sacred threads.",
    tiles: [
      { label: "Bangles", to: "/ornaments", search: { category: "bracelets" }, image: "/images/nav-bangles.jpg" },
      { label: "Necklaces", to: "/ornaments", search: { category: "necklaces" }, image: "/images/cat-necklaces.jpg" },
      { label: "Pendants", to: "/ornaments", search: { category: "pendants" }, image: "/images/cat-pendants.jpg" },
      { label: "All Ornaments", to: "/ornaments", image: "/images/occ-wedding.jpg" },
    ],
  },
  {
    label: "Gifts",
    to: "/gifts",
    blurb: "Wrapped as if they left our hands, not a warehouse.",
    tiles: [
      { label: "Birthday", to: "/gifts", search: { occasion: "birthday" }, image: "/images/occ-birthday.jpg" },
      { label: "Anniversary", to: "/gifts", search: { occasion: "anniversary" }, image: "/images/occ-anniversary.jpg" },
      { label: "Wedding", to: "/gifts", search: { occasion: "wedding" }, image: "/images/occ-wedding.jpg" },
      { label: "Milestone", to: "/gifts", search: { occasion: "milestone" }, image: "/images/occ-milestone.jpg" },
    ],
  },
  {
    label: "Collections",
    to: "/specials",
    blurb: "Four edits of the bench: what is new, what is light, what is for ceremony.",
    tiles: [
      { label: "Specials", to: "/specials", image: "/images/nav-bridal.jpg" },
      { label: "Daily Wear", to: "/daily-wear", image: "/images/cat-earrings.jpg" },
      { label: "Gifting", to: "/gifts", image: "/images/nav-gifting.jpg" },
      { label: "All Pieces", to: "/jewellery", image: "/images/nav-atelier.jpg" },
    ],
  },
  {
    label: "The House",
    to: "/about",
    blurb: "Who we are, how the work gets made, and where to talk to a person.",
    tiles: [
      { label: "The Atelier", to: "/about", image: "/images/nav-atelier.jpg" },
      { label: "The Journal", to: "/blog", image: "/images/hero-woman.jpg" },
      { label: "Community", to: "/community", image: "/images/checkout-model.jpg" },
    ],
  },
];

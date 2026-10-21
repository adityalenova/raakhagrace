/**
 * The line in the thin strip above the header, picked per page.
 *
 * It used to be one sentence repeated on all twenty-eight routes, which meant
 * the first thing a returning visitor read on a policy page was the same
 * "free shipping" line they had already read on the home page. A strip this
 * prominent is worth saying something true about the page it sits on top of.
 *
 * The rule for these: state something the page below actually delivers, in the
 * roughly 55 characters that survive one line on a phone. No scarcity, no
 * superlatives, and no promise the shop has not already committed to in writing
 * — see `code-of-conduct.tsx`, which forbids inventing any of those.
 */

/** Ordered longest-prefix wins, so `/blog/$slug` can differ from `/blog`. */
const LINES: ReadonlyArray<readonly [prefix: string, line: string]> = [
  ["/", "Handmade with heart · Free shipping across India"],

  // Collections — each echoes what that shelf actually holds.
  ["/jewellery", "Rings, earrings, pendants, necklaces, bracelets, mangalsutras"],
  ["/daily-wear", "Hoops, pendants and quiet rings made for Tuesdays"],
  ["/ornaments", "Ceremonial pieces — mangalsutra, bridal sets, heirloom gold"],
  ["/specials", "Statement pieces, and the offers running on them"],
  ["/gifts", "Complimentary gift wrapping on your first order"],

  // Buying path.
  ["/product/", "Photographs are of the piece we will send you"],
  ["/cart", "Nothing is charged here — we confirm the order on WhatsApp"],
  ["/checkout", "Your booking is confirmed by a person, not a system"],

  // Account.
  ["/login", "Your saved pieces and booking history, in one place"],
  ["/dashboard", "Saved pieces, bookings and order history"],
  ["/admin", "Atelier desk — orders, catalogue and what the bench sold"],

  // House.
  ["/about", "An independent atelier in Hyderabad — the lotus is our only mark"],
  ["/blog", "Notes from the bench"],
  ["/community", "Tag @raakhagrace to be featured"],
  ["/affiliations", "Who we work with, and what we do not claim"],
  ["/faq", "How an order becomes official, and what to film when it arrives"],
  ["/reach-information", "WhatsApp and Instagram reach the same people, Mon–Sat"],

  // Legal. These pages are read carefully, so the strip can be plain.
  ["/terms", "The rules that decide a refund, written before you pay"],
  ["/privacy", "What we collect, what we never touch, and who sees either"],
  ["/data-protection", "Your rights over what this shop holds about you"],
  ["/cookie-information", "Every cookie this site sets, and what each one does"],
  ["/cookies", "Every cookie this site sets, and what each one does"],
  ["/code-of-conduct", "The promises you are allowed to hold against a receipt"],
];

/** The home line, used for any route not listed above. */
export const DEFAULT_BANNER_LINE = LINES[0][1];

/**
 * Best match for a pathname by longest prefix. `/` is deliberately the shortest
 * entry, so it only wins when nothing longer matches.
 */
export function bannerLineFor(pathname: string): string {
  let best: readonly [string, string] | null = null;
  for (const entry of LINES) {
    const prefix = entry[0];
    const hit =
      prefix === "/" ? pathname === "/" : pathname === prefix || pathname.startsWith(prefix);
    if (hit && (!best || prefix.length > best[0].length)) best = entry;
  }
  return best?.[1] ?? DEFAULT_BANNER_LINE;
}

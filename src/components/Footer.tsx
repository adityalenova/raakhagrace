import { Link } from "@tanstack/react-router";
import { INSTAGRAM_LINK, WHATSAPP_DISPLAY, whatsappLink } from "@/lib/contact";
import { LotusMark } from "./LotusMark";

export function Footer() {
  return (
    <footer className="bg-ink text-ink-fg">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 md:grid-cols-2 lg:grid-cols-6">
        <div className="lg:col-span-2">
          <div className="flex items-center gap-2">
            <LotusMark className="h-8" />
            <Link to="/" className="font-display text-xl tracking-[0.16em]">
              RAAKHA GRACE
            </Link>
          </div>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-ink-muted">
            Handmade craft, premium beads, and jewellery light enough for every occasion. An
            independent atelier — the lotus is our only mark.
          </p>
          {/* Instagram and WhatsApp live here as icons, not as links in the
              Legal column — they are how you reach us, not a policy. */}
          <div className="mt-6 flex items-center gap-3">
            <a
              href={INSTAGRAM_LINK}
              target="_blank"
              rel="noreferrer"
              aria-label="Raakha Grace on Instagram"
              title="Instagram"
              className="grid h-10 w-10 place-items-center rounded-full border border-white/15 text-ink-fg transition hover:border-accent hover:bg-white/5"
            >
              <InstagramGlyph />
            </a>
            <a
              href={whatsappLink(
                "Namaste! I would like to know more about Raakha Grace jewellery.",
              )}
              target="_blank"
              rel="noreferrer"
              aria-label="Order from Raakha Grace on WhatsApp"
              title={`WhatsApp · ${WHATSAPP_DISPLAY}`}
              className="grid h-10 w-10 place-items-center rounded-full border border-white/15 text-ink-fg transition hover:border-accent hover:bg-white/5"
            >
              <WhatsAppGlyph />
            </a>
          </div>
        </div>
        <div>
          <h3 className="font-sans text-xs tracking-[0.2em] uppercase text-ink-muted">Shop</h3>
          <ul className="mt-4 space-y-2 text-sm">
            <li>
              <Link to="/jewellery" className="hover:text-accent">
                Jewellery
              </Link>
            </li>
            <li>
              <Link to="/gifts" className="hover:text-accent">
                Gifts
              </Link>
            </li>
            <li>
              <Link to="/specials" className="hover:text-accent">
                Specials
              </Link>
            </li>
            <li>
              <Link to="/daily-wear" className="hover:text-accent">
                Daily Wear
              </Link>
            </li>
            <li>
              <Link to="/ornaments" className="hover:text-accent">
                Ornaments
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h3 className="font-sans text-xs tracking-[0.2em] uppercase text-ink-muted">House</h3>
          <ul className="mt-4 space-y-2 text-sm">
            <li>
              <Link to="/about" className="hover:text-accent">
                About us
              </Link>
            </li>
            <li>
              <Link to="/blog" className="hover:text-accent">
                Blog
              </Link>
            </li>
            <li>
              <Link to="/community" className="hover:text-accent">
                Community
              </Link>
            </li>
            <li>
              <Link to="/affiliations" className="hover:text-accent">
                Affiliations
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h3 className="font-sans text-xs tracking-[0.2em] uppercase text-ink-muted">Help</h3>
          <ul className="mt-4 space-y-2 text-sm">
            <li>
              <Link to="/faq" className="hover:text-accent">
                Questions
              </Link>
            </li>
            <li>
              <Link to="/reach-information" className="hover:text-accent">
                Reach &amp; information
              </Link>
            </li>
            <li>
              <Link to="/community" hash="contact" className="hover:text-accent">
                Contact
              </Link>
            </li>
            <li>
              <Link to="/dashboard" className="hover:text-accent">
                Your account
              </Link>
            </li>
            <li>
              <Link to="/admin" className="hover:text-accent">
                Atelier admin
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h3 className="font-sans text-xs tracking-[0.2em] uppercase text-ink-muted">Legal</h3>
          <ul className="mt-4 space-y-2 text-sm">
            <li>
              <Link to="/terms" className="hover:text-accent">
                Terms of Service
              </Link>
            </li>
            <li>
              <Link to="/privacy" className="hover:text-accent">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link to="/data-protection" className="hover:text-accent">
                Data protection
              </Link>
            </li>
            <li>
              <Link to="/cookie-information" className="hover:text-accent">
                Cookie information
              </Link>
            </li>
            <li>
              <Link to="/code-of-conduct" className="hover:text-accent">
                Code of conduct
              </Link>
            </li>
          </ul>
        </div>
      </div>
      {/*
        Left-aligned inside the same 7xl column as the link grid above it, so the
        line reads as the last row of the footer rather than a caption floating in
        the middle of the band.
      */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <p className="border-t border-white/10 py-6 text-left text-xs tracking-[0.16em] uppercase text-ink-muted">
          © {new Date().getFullYear()} Raakha Grace. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

/** Instagram, drawn on the same 24-grid as the rest of the lucide icons here. */
function InstagramGlyph() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-[18px] w-[18px]"
      aria-hidden="true"
    >
      <rect x="2.5" y="2.5" width="19" height="19" rx="5.2" />
      <circle cx="12" cy="12" r="4.3" />
      <circle cx="17.4" cy="6.6" r="1.15" fill="currentColor" stroke="none" />
    </svg>
  );
}

/** The WhatsApp glyph is a brand mark, so it is filled rather than stroked. */
function WhatsAppGlyph() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-[18px] w-[18px]" aria-hidden="true">
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.46 1.32 4.96L2 22l5.25-1.38a9.86 9.86 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91C21.96 6.45 17.5 2 12.04 2Zm0 18.13a8.2 8.2 0 0 1-4.18-1.14l-.3-.18-3.11.82.83-3.04-.19-.31a8.19 8.19 0 0 1-1.26-4.37c0-4.54 3.7-8.23 8.24-8.23 2.2 0 4.27.86 5.82 2.42a8.18 8.18 0 0 1 2.41 5.82c0 4.54-3.69 8.21-8.2 8.21Zm4.52-6.15c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.12-.16.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.01-.38.11-.51.11-.11.25-.29.37-.43.13-.14.17-.25.25-.41.08-.17.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.4-.42-.56-.43h-.47c-.17 0-.43.06-.66.31-.22.25-.86.85-.86 2.07 0 1.22.89 2.4 1.01 2.56.12.17 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.47-.07 1.47-.6 1.67-1.18.21-.58.21-1.07.15-1.18-.06-.1-.23-.16-.48-.28Z" />
    </svg>
  );
}

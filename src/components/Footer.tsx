import { Link } from "@tanstack/react-router";
import { LotusMark } from "./LotusMark";

export function Footer() {
  return (
    <footer className="bg-ink text-ink-fg">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 md:grid-cols-2 lg:grid-cols-5">
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
              <Link to="/community" hash="contact" className="hover:text-accent">
                Contact
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h3 className="font-sans text-xs tracking-[0.2em] uppercase text-ink-muted">Policies</h3>
          <ul className="mt-4 space-y-2 text-sm">
            <li>
              <Link to="/privacy" className="hover:text-accent">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link to="/terms" className="hover:text-accent">
                Terms of Service
              </Link>
            </li>
            <li>
              <Link to="/cookies" className="hover:text-accent">
                Cookie Policy
              </Link>
            </li>
            <li>
              <Link to="/affiliations" className="hover:text-accent">
                Affiliations
              </Link>
            </li>
            <li>
              <Link to="/admin" className="hover:text-accent">
                Atelier admin
              </Link>
            </li>
            <li>
              <a
                href="https://www.instagram.com/raakhagrace/"
                target="_blank"
                rel="noreferrer"
                className="hover:text-accent"
              >
                Instagram
              </a>
            </li>
            <li>
              <a
                href="https://wa.me/916304837120"
                target="_blank"
                rel="noreferrer"
                className="hover:text-accent"
              >
                WhatsApp · +91 63048 37120
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 px-4 py-6 text-center text-xs tracking-[0.16em] uppercase text-ink-muted">
        © {new Date().getFullYear()} Raakha Grace. All rights reserved.
      </div>
    </footer>
  );
}

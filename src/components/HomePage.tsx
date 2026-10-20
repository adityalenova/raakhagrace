import { Link } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef } from "react";
import { InViewVideo } from "./InViewVideo";
import { FaqList } from "./FaqList";
import { FAQ_HEADLINES } from "@/lib/faqs";
import { CATEGORIES, latestProducts, OCCASIONS } from "@/lib/products";
import { useProductList } from "@/lib/catalog-store";
import { ProductCard } from "./ProductCard";

export function HomePage() {
  const catalog = useProductList();
  const occRef = useRef<HTMLDivElement>(null);
  const scrollOcc = (dir: number) => {
    occRef.current?.scrollBy({ left: dir * 280, behavior: "smooth" });
  };

  return (
    <main>
      {/* The hero is the film, by design — nothing on top of it. Screen readers
          and search engines still need a page title, so it lives here unseen. */}
      <h1 className="sr-only">
        Raakha Grace — handmade jewellery, light enough for every occasion
      </h1>
      <section className="relative w-full overflow-hidden bg-ink">
        <InViewVideo
          wrapperClassName="aspect-video w-full"
          className="h-full w-full object-cover"
          src="/videos/hero-jewellery.mp4"
          poster="/images/hero-poster.jpg"
        />
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <h2 className="text-center font-display text-4xl">Shop By Categories</h2>
        <p className="mt-2 text-center text-sm text-muted">
          Find your perfect sparkle across every category
        </p>
        <div className="mt-10 grid gap-4 md:grid-cols-2">
          {CATEGORIES.filter((c) => c.size === "lg").map((c) => (
            <Link
              key={c.slug}
              to="/jewellery"
              search={{ category: c.slug }}
              className="group relative overflow-hidden rounded-xl"
            >
              <img
                src={c.image}
                alt={c.label}
                loading="lazy"
                decoding="async"
                className="h-72 w-full object-cover transition duration-500 group-hover:scale-[1.03] sm:h-80"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-fg/50 to-transparent" />
              <div className="absolute bottom-5 left-5 text-bg">
                <p className="font-display text-3xl">{c.label}</p>
                <p className="mt-1 text-[0.7rem] tracking-[0.2em] uppercase">Explore</p>
              </div>
            </Link>
          ))}
        </div>
        <div className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {CATEGORIES.filter((c) => c.size === "sm").map((c) => (
            <Link
              key={c.slug}
              to="/jewellery"
              search={{ category: c.slug }}
              className="group relative overflow-hidden rounded-xl"
            >
              <img
                src={c.image}
                alt={c.label}
                loading="lazy"
                decoding="async"
                className="h-48 w-full object-cover transition duration-500 group-hover:scale-[1.03] sm:h-56"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-fg/45 to-transparent" />
              <p className="absolute bottom-4 left-4 font-display text-xl text-bg">{c.label}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="relative h-[70vh] min-h-[420px] overflow-hidden bg-ink">
        <InViewVideo
          wrapperClassName="absolute inset-0"
          className="h-full w-full object-cover"
          src="/videos/cover.mp4"
          poster="/images/atelier-still.jpg"
        />
        {/*
          No colour wash across the film. The title sits on the footage itself and
          carries a soft shadow instead, which keeps it readable over a bright
          frame without tinting the whole band the way `bg-fg/25` used to.
        */}
        <div className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center text-bg [text-shadow:0_1px_18px_rgba(40,22,14,0.65)]">
          <p className="text-[0.7rem] tracking-[0.4em] uppercase">The Atelier Film</p>
          <h2 className="mt-4 font-display text-4xl sm:text-6xl">Light, made to be worn</h2>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <h2 className="text-center font-display text-4xl">Shop Latest Products</h2>
        <p className="mt-2 text-center text-sm text-muted">New from the bench this season</p>
        <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {latestProducts(catalog)
            .slice(0, 8)
            .map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <h2 className="text-center font-display text-4xl">
          Extraordinary Gifts for Every Occasion
        </h2>
        <p className="mt-2 text-center text-sm text-muted">
          Unique gifts crafted for every celebration.
        </p>
        <div className="relative mt-10">
          <button
            type="button"
            aria-label="Previous occasions"
            className="absolute left-0 top-1/2 z-10 hidden h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-surface shadow md:grid"
            onClick={() => scrollOcc(-1)}
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            aria-label="Next occasions"
            className="absolute right-0 top-1/2 z-10 hidden h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-surface shadow md:grid"
            onClick={() => scrollOcc(1)}
          >
            <ChevronRight className="h-5 w-5" />
          </button>
          <div ref={occRef} className="flex gap-4 overflow-x-auto pb-2 md:px-12">
            {OCCASIONS.map((o) => (
              <Link
                key={o.slug}
                to="/gifts"
                search={{ occasion: o.slug }}
                className="relative w-[78vw] shrink-0 overflow-hidden rounded-xl sm:w-72"
              >
                <img
                  src={o.image}
                  alt={o.label}
                  loading="lazy"
                  decoding="async"
                  className="h-[420px] w-full object-cover"
                />
                <span className="absolute bottom-5 left-1/2 -translate-x-1/2 rounded-sm bg-paper px-4 py-2 text-sm">
                  {o.label}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-bg py-16">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-2">
          {/* A still, not a second copy of the film: two <video> tags on one
              source made the browser download the whole file twice. */}
          <div className="overflow-hidden rounded-xl">
            <img
              src="/images/atelier-still.jpg"
              alt="Beads and gold work in progress at the Raakha Grace bench"
              loading="lazy"
              decoding="async"
              className="aspect-[4/3] w-full object-cover"
            />
          </div>
          <div>
            <p className="text-[0.7rem] tracking-[0.3em] text-accent uppercase">
              The Raakha Grace Promise
            </p>
            <h2 className="mt-3 font-display text-4xl">Made to be lived in</h2>
            <ul className="mt-8 grid gap-6 sm:grid-cols-2">
              {[
                ["Handmade craftsmanship", "Every piece is finished by hand in our atelier."],
                ["Premium quality beads", "Selected stones and beads, never rushed."],
                ["Lightweight and comfortable", "Designed for all-day wear, not the box."],
                ["Perfect for every occasion", "From a quiet Tuesday to a wedding night."],
              ].map(([t, d]) => (
                <li key={t}>
                  <p className="font-medium">{t}</p>
                  <p className="mt-1 text-sm text-muted">{d}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="overflow-hidden border-y border-line bg-paper py-10">
        <h2 className="mb-6 text-center font-display text-3xl">What they say</h2>
        <div className="marquee-track flex w-max gap-6">
          {[...TESTIMONIALS, ...TESTIMONIALS].map((t, i) => (
            <blockquote key={i} className="w-[min(80vw,360px)] shrink-0 rounded-xl bg-surface p-6">
              <p className="font-display text-xl italic leading-snug">“{t.quote}”</p>
              <footer className="mt-4 text-xs tracking-[0.16em] text-muted uppercase">
                {t.name}
              </footer>
            </blockquote>
          ))}
        </div>
      </section>

      {/* Questions people arrive with, answered before they reach the cart —
          the same copy as /faq, so the two can never disagree. */}
      <section className="bg-bg py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <p className="text-[0.7rem] tracking-[0.3em] text-accent uppercase">Before you order</p>
          <h2 className="mt-3 font-display text-4xl">The questions we are asked most</h2>
          <p className="mt-4 text-sm leading-relaxed text-muted">
            Short answers to the things that decide a purchase here — how an order becomes official,
            what happens if you do not like it, and why the unboxing video matters. The{" "}
            <Link to="/faq" className="text-accent underline underline-offset-2">
              full list of questions
            </Link>{" "}
            covers shipping, sizing, care, gifts and your data.
          </p>
          <div className="mt-8 border-t border-line">
            <FaqList items={FAQ_HEADLINES} />
          </div>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              to="/faq"
              className="rounded-full bg-fg px-5 py-3 text-[0.7rem] tracking-[0.16em] text-bg uppercase transition hover:opacity-90"
            >
              All questions
            </Link>
            <Link
              to="/reach-information"
              className="rounded-full border border-line px-5 py-3 text-[0.7rem] tracking-[0.16em] uppercase transition hover:border-fg"
            >
              Reach the atelier
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

const TESTIMONIALS = [
  {
    name: "Ananya, Hyderabad",
    quote: "The mangalsutra is so light I forget I am wearing it — until someone asks.",
  },
  {
    name: "Meera, Bengaluru",
    quote: "Gifted the triad pendant for a promotion. It felt personal, not ceremonial.",
  },
  {
    name: "Kabir, Pune",
    quote: "Packaging, finish, and the way it sits on the skin. Quiet luxury, actually.",
  },
  {
    name: "Sana, Delhi",
    quote: "Wore the swirl hoops from breakfast to a wedding. Still comfortable.",
  },
];

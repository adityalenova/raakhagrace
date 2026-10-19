import { Link } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef } from "react";
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
      <section className="grid lg:grid-cols-2">
        <div className="relative min-h-[70vh] overflow-hidden bg-[#FAF8F5]">
          <video
            className="absolute inset-0 h-full w-full object-cover"
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            poster="/images/hero-woman.jpg"
          >
            <source src="/videos/hero.mp4" type="video/mp4" />
          </video>
        </div>
        <div className="relative min-h-[50vh] overflow-hidden bg-ink">
          <img src="/images/hero-pendant.jpg" alt="Geometry drop pendant" className="h-full w-full object-cover" />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <h2 className="text-center font-display text-4xl">Shop By Categories</h2>
        <p className="mt-2 text-center text-sm text-muted">Find your perfect sparkle across every category</p>
        <div className="mt-10 grid gap-4 md:grid-cols-2">
          {CATEGORIES.filter((c) => c.size === "lg").map((c) => (
            <Link key={c.slug} to="/jewellery" search={{ category: c.slug }} className="group relative overflow-hidden rounded-xl">
              <img src={c.image} alt={c.label} className="h-72 w-full object-cover transition duration-500 group-hover:scale-[1.03] sm:h-80" />
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
            <Link key={c.slug} to="/jewellery" search={{ category: c.slug }} className="group relative overflow-hidden rounded-xl">
              <img src={c.image} alt={c.label} className="h-48 w-full object-cover transition duration-500 group-hover:scale-[1.03] sm:h-56" />
              <div className="absolute inset-0 bg-gradient-to-t from-fg/45 to-transparent" />
              <p className="absolute bottom-4 left-4 font-display text-xl text-bg">{c.label}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="relative h-[70vh] min-h-[420px] overflow-hidden bg-ink">
        <video className="absolute inset-0 h-full w-full object-cover" autoPlay muted loop playsInline preload="metadata" poster="/images/hero-pendant.jpg">
          <source src="/videos/cover.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-fg/25" />
        <div className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center text-bg">
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
        <h2 className="text-center font-display text-4xl">Extraordinary Gifts for Every Occasion</h2>
        <p className="mt-2 text-center text-sm text-muted">Unique gifts crafted for every celebration.</p>
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
                <img src={o.image} alt={o.label} className="h-[420px] w-full object-cover" />
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
          <div className="overflow-hidden rounded-xl">
            <video className="aspect-[4/3] w-full object-cover" autoPlay muted loop playsInline preload="metadata" poster="/images/hero-pendant.jpg">
              <source src="/videos/cover.mp4" type="video/mp4" />
            </video>
          </div>
          <div>
            <p className="text-[0.7rem] tracking-[0.3em] text-accent uppercase">The Raakha Grace Promise</p>
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
              <footer className="mt-4 text-xs tracking-[0.16em] text-muted uppercase">{t.name}</footer>
            </blockquote>
          ))}
        </div>
      </section>
    </main>
  );
}

const TESTIMONIALS = [
  { name: "Ananya, Hyderabad", quote: "The mangalsutra is so light I forget I am wearing it — until someone asks." },
  { name: "Meera, Bengaluru", quote: "Gifted the triad pendant for a promotion. It felt personal, not ceremonial." },
  { name: "Kabir, Pune", quote: "Packaging, finish, and the way it sits on the skin. Quiet luxury, actually." },
  { name: "Sana, Delhi", quote: "Wore the swirl hoops from breakfast to a wedding. Still comfortable." },
];

import { useMemo } from "react";
import { Link } from "@tanstack/react-router";
import type { Product } from "@/lib/products";
import { PageHero } from "./PageHero";
import { ProductCard } from "./ProductCard";

type Chip = { label: string; href: string; active?: boolean };

/**
 * The band across the top of a collection page.
 *
 * Every photograph we have of a piece is portrait, so a full-width strip has to
 * cut the head off the model or slice through a necklace. Instead the band is a
 * square photo panel — 480 × 480 on desktop — beside the collection's own copy.
 * A square crop of a portrait keeps the face and the jewellery together, and
 * the text gets a calm column to sit in.
 */
export function CatalogPage({
  kicker,
  title,
  subtitle,
  products,
  chips,
  hero,
  heroAlt,
  heroFocus = "50% 42%",
}: {
  kicker?: string;
  title: string;
  subtitle: string;
  products: Product[];
  chips?: Chip[];
  hero?: string;
  heroAlt?: string;
  /** Where the photograph's subject sits: "50% 26%" keeps two faces in frame. */
  heroFocus?: string;
}) {
  const list = useMemo(() => products, [products]);
  return (
    <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
      {hero ? (
        <section className="mb-10 overflow-hidden rounded-xl border border-line bg-surface">
          <div className="grid md:grid-cols-[minmax(0,480px)_minmax(0,1fr)]">
            <img
              src={hero}
              alt={heroAlt ?? title}
              className="h-[300px] w-full object-cover sm:h-[380px] md:h-[480px]"
              style={{ objectPosition: heroFocus }}
            />
            <div className="flex flex-col justify-center gap-4 border-t border-line px-6 py-8 md:border-t-0 md:border-l md:px-10 md:py-10">
              {kicker ? (
                <p className="text-[0.68rem] tracking-[0.28em] text-subtle uppercase">{kicker}</p>
              ) : null}
              <h1 className="font-display text-4xl leading-tight sm:text-5xl">{title}</h1>
              <p className="max-w-xl text-base leading-relaxed text-muted">{subtitle}</p>
              <p className="mt-1 text-[0.68rem] tracking-[0.2em] text-subtle uppercase">
                {list.length} {list.length === 1 ? "piece" : "pieces"} at the bench
              </p>
              <div className="flex flex-wrap items-center gap-x-7 gap-y-2 pt-1">
                <a
                  href="#bench"
                  className="text-[0.68rem] tracking-[0.18em] text-fg uppercase border-b border-fg/25 transition-colors hover:border-accent hover:text-accent"
                >
                  See the pieces
                </a>
                <a
                  href="https://wa.me/916304837120"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[0.68rem] tracking-[0.18em] text-muted uppercase transition-colors hover:text-accent"
                >
                  Ask on WhatsApp
                </a>
              </div>
            </div>
          </div>
        </section>
      ) : (
        <PageHero kicker={kicker} title={title} subtitle={subtitle} />
      )}
      {chips && chips.length > 0 ? (
        <div className="mb-10 flex flex-wrap justify-center gap-2">
          {chips.map((c) => (
            <a
              key={c.label}
              href={c.href}
              className={`rounded-full border px-4 py-2 text-[0.7rem] tracking-[0.14em] uppercase ${
                c.active ? "border-fg bg-fg text-bg" : "border-line text-fg hover:border-fg"
              }`}
            >
              {c.label}
            </a>
          ))}
        </div>
      ) : null}
      <div id="bench" className="grid scroll-mt-24 gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
      {list.length === 0 && (
        <div className="mx-auto max-w-xl py-20 text-center">
          <p className="font-display text-3xl text-fg">Not strung yet</p>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            Nothing in this line is at the bench right now — but every piece here is made by
            hand, so we can cut one to your size, colour and budget. Tell us what you have in
            mind and we will confirm availability the same day.
          </p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <a
              href="https://wa.me/916304837120"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-sm bg-fg px-6 py-3 text-[0.68rem] tracking-[0.18em] text-bg uppercase transition hover:bg-accent"
            >
              Ask on WhatsApp
            </a>
            <Link
              to="/jewellery"
              className="rounded-sm border border-line px-6 py-3 text-[0.68rem] tracking-[0.18em] text-fg uppercase transition hover:border-fg"
            >
              See everything in the atelier
            </Link>
          </div>
        </div>
      )}
    </main>
  );
}

import { useMemo } from "react";
import type { Product } from "@/lib/products";
import { PageHero } from "./PageHero";
import { ProductCard } from "./ProductCard";

type Chip = { label: string; href: string; active?: boolean };

export function CatalogPage({
  kicker,
  title,
  subtitle,
  products,
  chips,
  hero,
}: {
  kicker?: string;
  title: string;
  subtitle: string;
  products: Product[];
  chips?: Chip[];
  hero?: string;
}) {
  const list = useMemo(() => products, [products]);
  return (
    <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
      <PageHero kicker={kicker} title={title} subtitle={subtitle} />
      {hero ? (
        <div className="mb-10 overflow-hidden rounded-xl bg-paper">
          <img src={hero} alt="" className="h-[min(420px,50vh)] w-full object-cover" />
        </div>
      ) : null}
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
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
      {list.length === 0 && <p className="py-20 text-center text-muted">Nothing in this collection yet.</p>}
    </main>
  );
}

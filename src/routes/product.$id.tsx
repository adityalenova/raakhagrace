import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Heart, Minus, Plus, Shield, Truck } from "lucide-react";
import { useState } from "react";
import { ProductCard } from "@/components/ProductCard";
import { SiteShell } from "@/components/SiteShell";
import { useProduct, useProductList } from "@/lib/catalog-store";
import { useCart } from "@/lib/cart-store";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { useWishlist } from "@/lib/wishlist-store";
import { formatInr } from "@/lib/utils";

export const Route = createFileRoute("/product/$id")({ component: Page });

function Page() {
  const { id } = Route.useParams();
  const product = useProduct(id);
  const catalog = useProductList();
  const add = useCart((s) => s.add);
  const wish = useWishlist((s) => s.ids.includes(id));
  const toggleWish = useWishlist((s) => s.toggle);
  const { user } = useCurrentUserState();
  const navigate = useNavigate();
  function onToggleWish() {
    toggleWish(id);
  }
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [tab, setTab] = useState<"story" | "specs" | "care">("story");

  if (!product) {
    return (
      <SiteShell>
        <main className="px-6 py-24 text-center">
          <p>This piece is no longer in the atelier.</p>
          <Link to="/jewellery" className="mt-4 inline-block underline">
            Shop jewellery
          </Link>
        </main>
      </SiteShell>
    );
  }

  const related = catalog
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 3);
  const inStock = product.stock > 0;

  function addBag() {
    add(product!.id, qty);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1800);
  }

  function goCheckout() {
    window.location.href = `/checkout?product=${encodeURIComponent(product!.id)}`;
  }

  return (
    <SiteShell>
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14">
        <p className="text-[0.65rem] tracking-[0.2em] text-subtle uppercase">
          <Link to="/jewellery" className="hover:text-fg">
            Jewellery
          </Link>{" "}
          / {product.category} / {product.sku}
        </p>
        <div className="mt-6 grid gap-10 lg:grid-cols-2">
          <div className="overflow-hidden rounded-xl bg-paper">
            <img src={product.image} alt={product.name} className="w-full object-cover" />
          </div>
          <div>
            <p className="text-xs tracking-[0.2em] text-muted uppercase">
              {product.wear} · {product.metal}
            </p>
            <h1 className="mt-2 font-display text-4xl sm:text-5xl">{product.name}</h1>
            <p className="mt-4 text-2xl tabular-nums">
              {formatInr(product.price)}
              {product.compareAt ? (
                <span className="ml-3 text-base text-subtle line-through">
                  {formatInr(product.compareAt)}
                </span>
              ) : null}
            </p>
            <p className="mt-2 text-sm text-muted">
              {inStock ? `${product.stock} in the atelier` : "Made to order — 10–16 days"}
            </p>
            <p className="mt-6 max-w-md leading-relaxed text-muted">{product.description}</p>

            <ul className="mt-6 grid gap-2 text-sm text-muted sm:grid-cols-2">
              {product.details.map((d) => (
                <li key={d} className="flex gap-2">
                  <span className="text-accent">·</span>
                  {d}
                </li>
              ))}
            </ul>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <div className="flex items-center rounded-md border border-line">
                <button
                  type="button"
                  className="grid h-12 w-12 place-items-center"
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  aria-label="Decrease"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-8 text-center tabular-nums">{qty}</span>
                <button
                  type="button"
                  className="grid h-12 w-12 place-items-center"
                  onClick={() => setQty((q) => Math.min(Math.max(1, product.stock || 1), q + 1))}
                  aria-label="Increase"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              <button
                type="button"
                disabled={!inStock}
                className="h-12 flex-1 rounded-md bg-fg px-6 text-sm tracking-[0.16em] text-bg uppercase disabled:opacity-40"
                onClick={addBag}
              >
                {added ? "Added" : inStock ? "Add to cart" : "Out of stock"}
              </button>
              <button
                type="button"
                className="grid h-12 w-12 place-items-center rounded-md border border-line"
                aria-label={wish ? "Remove from saved" : "Save"}
                onClick={() => toggleWish(product.id)}
              >
                <Heart className={`h-5 w-5 ${wish ? "fill-fg text-fg" : ""}`} />
              </button>
            </div>
            <button
              type="button"
              disabled={!inStock}
              className="mt-3 h-12 w-full rounded-md border border-fg text-sm tracking-[0.16em] uppercase disabled:opacity-40"
              onClick={goCheckout}
            >
              Book on WhatsApp
            </button>

            <div className="mt-6 grid gap-3 text-sm text-muted sm:grid-cols-2">
              <p className="flex items-start gap-2">
                <Truck className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                Insured shipping across India
              </p>
              <p className="flex items-start gap-2">
                <Shield className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                1-year atelier warranty
              </p>
            </div>
          </div>
        </div>

        <div className="mt-14">
          <div className="flex gap-6 border-b border-line text-[0.7rem] tracking-[0.18em] uppercase">
            {(["story", "specs", "care"] as const).map((t) => (
              <button
                key={t}
                type="button"
                className={`border-b-2 pb-3 ${tab === t ? "border-fg text-fg" : "border-transparent text-muted"}`}
                onClick={() => setTab(t)}
              >
                {t === "story" ? "The piece" : t === "specs" ? "Specifications" : "Care & shipping"}
              </button>
            ))}
          </div>
          {tab === "story" && (
            <div className="mt-6 max-w-3xl space-y-4 text-sm leading-relaxed text-muted">
              <p>{product.story}</p>
              <p>
                SKU {product.sku}. {product.hallmark}. {product.certification}.
              </p>
            </div>
          )}
          {tab === "specs" && (
            <dl className="mt-6 grid max-w-3xl gap-x-8 gap-y-3 text-sm sm:grid-cols-2">
              {[
                ["SKU", product.sku],
                ["Metal", product.metal],
                ["Purity", product.purity],
                ["Weight", product.weight],
                ["Stones", product.stones],
                ["Size", product.size],
                ["Hallmark", product.hallmark],
                ["Certification", product.certification],
                ["Collection", product.collection],
                ["Occasion", product.occasion ?? "—"],
              ].map(([k, v]) => (
                <div key={k} className="border-b border-line py-2">
                  <dt className="text-[0.65rem] tracking-[0.16em] text-subtle uppercase">{k}</dt>
                  <dd className="mt-1 text-fg">{v}</dd>
                </div>
              ))}
            </dl>
          )}
          {tab === "care" && (
            <div className="mt-6 grid max-w-4xl gap-6 text-sm leading-relaxed text-muted sm:grid-cols-3">
              <div>
                <h3 className="font-medium text-fg">Care</h3>
                <p className="mt-2">{product.care}</p>
              </div>
              <div>
                <h3 className="font-medium text-fg">Warranty</h3>
                <p className="mt-2">{product.warranty}</p>
              </div>
              <div>
                <h3 className="font-medium text-fg">Shipping & returns</h3>
                <p className="mt-2">{product.shipping}</p>
                <p className="mt-2">
                  Unused pieces in original packaging may be returned within 7 days.
                </p>
              </div>
            </div>
          )}
        </div>

        {related.length > 0 && (
          <section className="mt-16">
            <h2 className="font-display text-3xl">You may also like</h2>
            <div className="mt-8 grid gap-8 sm:grid-cols-3">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </main>
    </SiteShell>
  );
}

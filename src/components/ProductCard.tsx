import { Link } from "@tanstack/react-router";
import { useCart } from "@/lib/cart-store";
import type { Product } from "@/lib/products";
import { formatInr } from "@/lib/utils";

export function ProductCard({ product }: { product: Product }) {
  const add = useCart((s) => s.add);
  return (
    <article className="group">
      <Link to="/product/$id" params={{ id: product.id }} className="block overflow-hidden rounded-lg bg-paper">
        <img
          src={product.image}
          alt={product.name}
          className="aspect-square w-full object-cover transition duration-500 group-hover:scale-[1.03]"
        />
      </Link>
      <div className="mt-3 flex items-start justify-between gap-3">
        <div>
          <Link to="/product/$id" params={{ id: product.id }} className="font-display text-lg leading-tight">
            {product.name}
          </Link>
          <p className="mt-1 text-sm tabular-nums text-muted">
            {formatInr(product.price)}
            {product.compareAt ? (
              <span className="ml-2 text-subtle line-through">{formatInr(product.compareAt)}</span>
            ) : null}
          </p>
        </div>
        <button
          type="button"
          className="shrink-0 rounded-full border border-line px-3 py-2 text-[0.65rem] tracking-[0.14em] uppercase hover:border-fg"
          onClick={() => add(product.id)}
        >
          Add
        </button>
      </div>
    </article>
  );
}

import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import { SiteShell } from "@/components/SiteShell";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { useCart } from "@/lib/cart-store";
import { useCatalog } from "@/lib/catalog-store";
import { formatInr } from "@/lib/utils";

export const Route = createFileRoute("/cart")({ component: Page });

function Page() {
  const items = useCart((s) => s.items);
  const setQty = useCart((s) => s.setQty);
  const remove = useCart((s) => s.remove);
  const clear = useCart((s) => s.clear);
  const get = useCatalog((s) => s.get);
  const { user, isPending } = useCurrentUserState();
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  const lines = items
    .map((i) => {
      const p = get(i.productId);
      return p ? { ...i, product: p } : null;
    })
    .filter(Boolean);
  const total = lines.reduce((s, l) => s + (l ? l.product.price * l.qty : 0), 0);

  function checkout() {
    const first = items[0];
    if (!first) return;
    window.location.href = `/checkout?product=${encodeURIComponent(first.productId)}`;
  }

  return (
    <SiteShell>
      <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
        <h1 className="font-display text-4xl">Your cart</h1>
        {lines.length === 0 ? (
          <p className="mt-8 text-muted">
            Nothing here yet.{" "}
            <Link to="/jewellery" className="underline">
              Shop jewellery
            </Link>
          </p>
        ) : (
          <>
            <ul className="mt-8 divide-y divide-line">
              {lines.map((l) =>
                l ? (
                  <li key={l.productId} className="flex gap-4 py-5">
                    <Link to="/product/$id" params={{ id: l.product.id }}>
                      <img
                        src={l.product.image}
                        alt=""
                        className="h-24 w-24 rounded-md object-cover"
                      />
                    </Link>
                    <div className="flex-1">
                      <Link
                        to="/product/$id"
                        params={{ id: l.product.id }}
                        className="font-display text-xl"
                      >
                        {l.product.name}
                      </Link>
                      <p className="mt-1 text-xs tracking-[0.12em] text-subtle uppercase">
                        {l.product.sku}
                      </p>
                      <p className="mt-1 tabular-nums text-sm text-muted">
                        {formatInr(l.product.price)}
                      </p>
                      <div className="mt-3 flex items-center gap-3">
                        <button
                          type="button"
                          className="h-10 w-10 rounded border border-line"
                          onClick={() => setQty(l.productId, l.qty - 1)}
                        >
                          −
                        </button>
                        <span className="tabular-nums">{l.qty}</span>
                        <button
                          type="button"
                          className="h-10 w-10 rounded border border-line"
                          onClick={() => setQty(l.productId, l.qty + 1)}
                        >
                          +
                        </button>
                        <button
                          type="button"
                          className="ml-2 grid h-10 w-10 place-items-center text-muted"
                          aria-label="Remove"
                          onClick={() => remove(l.productId)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    <p className="tabular-nums">{formatInr(l.product.price * l.qty)}</p>
                  </li>
                ) : null,
              )}
            </ul>
            <div className="mt-8 space-y-2 border-t border-line pt-6 text-sm text-muted">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="tabular-nums text-fg">{formatInr(total)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>Calculated at confirmation</span>
              </div>
              <div className="flex justify-between text-base text-fg">
                <span>Total</span>
                <span className="tabular-nums">{formatInr(total)}</span>
              </div>
            </div>
            <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
              <button type="button" className="text-sm underline" onClick={() => clear()}>
                Empty cart
              </button>
              <button
                type="button"
                disabled={busy || isPending}
                onClick={checkout}
                className="h-12 rounded-md bg-fg px-8 text-sm tracking-[0.16em] text-bg uppercase"
              >
                "Book on WhatsApp"
              </button>
            </div>
            {msg && <p className="mt-4 text-sm text-muted">{msg}</p>}
          </>
        )}
      </main>
    </SiteShell>
  );
}

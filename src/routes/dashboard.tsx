import { createFileRoute, Link } from "@tanstack/react-router";
import { Heart, Package, ShoppingBag, User } from "lucide-react";
import { useEffect, useState } from "react";
import { SiteShell } from "@/components/SiteShell";
import { UserButton } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { useCart } from "@/lib/cart-store";
import { useCatalog } from "@/lib/catalog-store";
import { listOrders, type OrderRow } from "@/lib/shop";
import { formatInr } from "@/lib/utils";
import { useWishlist } from "@/lib/wishlist-store";

export const Route = createFileRoute("/dashboard")({ component: Page });

function Page() {
  const { user, isPending } = useCurrentUserState();
  const items = useCart((s) => s.items);
  const mergeGuestToServer = useCart((s) => s.mergeGuestToServer);
  const wishIds = useWishlist((s) => s.ids);
  const removeWish = useWishlist((s) => s.remove);
  const add = useCart((s) => s.add);
  const get = useCatalog((s) => s.get);
  const [orders, setOrders] = useState<OrderRow[] | null>(null);

  useEffect(() => {
    if (!user) return;
    void mergeGuestToServer();
    void listOrders()
      .then(setOrders)
      .catch(() => setOrders([]));
  }, [user, mergeGuestToServer]);

  if (isPending) {
    return (
      <SiteShell>
        <main className="mx-auto max-w-5xl px-4 py-16">
          <div className="h-8 w-48 animate-pulse rounded bg-paper" />
        </main>
      </SiteShell>
    );
  }
  if (!user) {
    return (
      <SiteShell>
        <main className="mx-auto max-w-lg px-4 py-24 text-center">
          <h1 className="font-display text-3xl">Your atelier</h1>
          <p className="mt-3 text-sm text-muted">Account features are coming soon. Browse and book pieces on WhatsApp.</p>
          <Link to="/jewellery" className="mt-6 inline-block underline">Shop jewellery</Link>
        </main>
      </SiteShell>
    );
  }

  const cartLines = items
    .map((i) => {
      const p = get(i.productId);
      return p ? { ...i, product: p } : null;
    })
    .filter(Boolean);
  const cartTotal = cartLines.reduce((s, l) => s + (l ? l.product.price * l.qty : 0), 0);
  const saved = wishIds.map((id) => get(id)).filter(Boolean);

  return (
    <SiteShell>
      <main className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs tracking-[0.2em] text-muted uppercase">Atelier account</p>
            <h1 className="font-display text-4xl">Hello, {user.displayName ?? "there"}</h1>
            <p className="mt-2 text-sm text-muted">
              {user.isGuest
                ? "Guest session — temporary in this browser"
                : user.primaryEmail}
            </p>
          </div>
          <UserButton />
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {[
            [ShoppingBag, "In cart", String(items.reduce((n, i) => n + i.qty, 0))],
            [Heart, "Saved", String(wishIds.length)],
            [Package, "Orders", orders ? String(orders.length) : "—"],
          ].map(([Icon, label, value]) => (
            <div key={String(label)} className="rounded-xl border border-line bg-surface p-5">
              <Icon className="h-5 w-5 text-accent" />
              <p className="mt-3 font-display text-3xl">{value as string}</p>
              <p className="text-sm text-muted">{label as string}</p>
            </div>
          ))}
        </div>

        <section className="mt-12">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-accent" />
            <h2 className="font-display text-2xl">Profile</h2>
          </div>
          <div className="mt-4 rounded-xl border border-line bg-paper p-5 text-sm text-muted">
            <p>
              <span className="text-fg">Name</span> — {user.displayName ?? "—"}
            </p>
            <p className="mt-2">
              <span className="text-fg">Email</span> — {user.primaryEmail ?? "—"}
            </p>
            <p className="mt-2">Orders, cart, and saved pieces stay with this account when you sign in on another device.</p>
          </div>
        </section>

        <section className="mt-12">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-2xl">Cart</h2>
            <Link to="/cart" className="text-sm underline">
              Open cart
            </Link>
          </div>
          {cartLines.length === 0 ? (
            <p className="mt-4 text-sm text-muted">Your cart is empty.</p>
          ) : (
            <ul className="mt-4 divide-y divide-line">
              {cartLines.map((i) =>
                i ? (
                  <li key={i.productId} className="flex items-center gap-4 py-3">
                    <img src={i.product.image} alt="" className="h-16 w-16 rounded object-cover" />
                    <div className="flex-1">
                      <Link to="/product/$id" params={{ id: i.product.id }}>
                        {i.product.name}
                      </Link>
                      <p className="text-sm text-muted">Qty {i.qty}</p>
                    </div>
                    <p className="tabular-nums text-sm">{formatInr(i.product.price * i.qty)}</p>
                  </li>
                ) : null,
              )}
            </ul>
          )}
          {cartLines.length > 0 && <p className="mt-3 text-sm tabular-nums">Subtotal {formatInr(cartTotal)}</p>}
        </section>

        <section className="mt-12">
          <h2 className="font-display text-2xl">Saved pieces</h2>
          {saved.length === 0 ? (
            <p className="mt-4 text-sm text-muted">Tap the heart on a product to save it here.</p>
          ) : (
            <ul className="mt-4 divide-y divide-line">
              {saved.map((p) =>
                p ? (
                  <li key={p.id} className="flex items-center gap-4 py-3">
                    <img src={p.image} alt="" className="h-16 w-16 rounded object-cover" />
                    <div className="flex-1">
                      <Link to="/product/$id" params={{ id: p.id }}>
                        {p.name}
                      </Link>
                      <p className="text-sm tabular-nums text-muted">{formatInr(p.price)}</p>
                    </div>
                    <button type="button" className="text-sm underline" onClick={() => add(p.id)}>
                      Add
                    </button>
                    <button type="button" className="text-sm text-muted underline" onClick={() => removeWish(p.id)}>
                      Remove
                    </button>
                  </li>
                ) : null,
              )}
            </ul>
          )}
        </section>

        <section className="mt-12">
          <h2 className="font-display text-2xl">Orders</h2>
          {orders === null ? (
            <p className="mt-4 text-sm text-muted">Loading orders…</p>
          ) : orders.length === 0 ? (
            <p className="mt-4 text-sm text-muted">No orders yet. When you check out, they will live here.</p>
          ) : (
            <ul className="mt-4 space-y-4">
              {orders.map((o) => (
                <li key={o.id} className="rounded-xl border border-line bg-surface p-4">
                  <div className="flex justify-between text-sm">
                    <span>Order #{o.id}</span>
                    <span className="tracking-[0.14em] text-muted uppercase">{o.status}</span>
                  </div>
                  <p className="mt-1 text-xs text-subtle">{new Date(o.createdAt).toLocaleString("en-IN")}</p>
                  <ul className="mt-3 text-sm text-muted">
                    {o.items.map((it) => (
                      <li key={it.productId}>
                        {it.name} × {it.qty}
                      </li>
                    ))}
                  </ul>
                  <p className="mt-3 tabular-nums">{formatInr(o.total)}</p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </SiteShell>
  );
}

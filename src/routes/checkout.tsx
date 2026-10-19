import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, MapPin, Phone, User, Mail, X } from "lucide-react";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { SiteShell } from "@/components/SiteShell";
import { useCatalog } from "@/lib/catalog-store";
import { useCart } from "@/lib/cart-store";
import { formatInr } from "@/lib/utils";

const WA_NUMBER = "916304837120";

export const Route = createFileRoute("/checkout")({
  component: CheckoutPage,
});

function CheckoutPage() {
  const get = useCatalog((s) => s.get);
  const cartItems = useCart((s) => s.items);
  const navigate = useNavigate();
  const [productId, setProductId] = useState<string | undefined>(undefined);

  useEffect(() => {
    try {
      const q = new URLSearchParams(window.location.search);
      const id = q.get("product") || undefined;
      setProductId(id || undefined);
    } catch {
      setProductId(undefined);
    }
  }, []);

  const product = productId ? get(productId) : null;

  const line = useMemo(() => {
    if (product) return { product, qty: 1 };
    const first = cartItems[0];
    if (!first) return null;
    const p = get(first.productId);
    return p ? { product: p, qty: first.qty } : null;
  }, [product, cartItems, get]);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");

  if (!line) {
    return (
      <SiteShell>
        <main className="mx-auto max-w-lg px-4 py-24 text-center">
          <p className="text-muted">No product selected for checkout.</p>
          <Link to="/jewellery" className="mt-4 inline-block underline">
            Shop jewellery
          </Link>
        </main>
      </SiteShell>
    );
  }

  const { product: p, qty } = line;
  const total = p.price * qty;

  function bookOnWhatsApp(e: FormEvent) {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !address.trim()) return;
    const msg = [
      `Namaste! I would like to book this piece from Raakha Grace.`,
      ``,
      `*Product:* ${p.name}`,
      `*SKU:* ${p.sku}`,
      `*Price:* ${formatInr(total)}${qty > 1 ? ` (qty ${qty})` : ""}`,
      ``,
      `*Name:* ${name.trim()}`,
      `*Phone:* ${phone.trim()}`,
      email.trim() ? `*Email:* ${email.trim()}` : null,
      `*Address:* ${address.trim()}`,
    ]
      .filter(Boolean)
      .join("\n");
    window.open(`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`, "_blank", "noopener,noreferrer");
  }

  return (
    <SiteShell>
      <main className="min-h-[calc(100vh-8rem)] bg-bg px-3 py-8 sm:px-6 sm:py-12">
        <div className="mx-auto flex max-w-5xl flex-col overflow-hidden rounded-2xl border border-line bg-surface shadow-xl sm:flex-row">
          <div className="relative min-h-[280px] w-full sm:min-h-[520px] sm:w-[42%]">
            <img
              src="/images/checkout-model.jpg"
              alt="Raakha Grace jewellery"
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-fg/55 via-transparent to-transparent" />
            <div className="absolute bottom-5 left-5 right-5">
              <p className="text-[0.65rem] tracking-[0.2em] text-bg/80 uppercase">Raakha Grace</p>
              <p className="mt-1 font-display text-2xl text-bg">{p.name}</p>
              <p className="mt-1 tabular-nums text-sm text-bg/90">{formatInr(total)}</p>
            </div>
          </div>

          <div className="relative flex flex-1 flex-col p-6 sm:p-8">
            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => navigate({ to: "/product/$id", params: { id: p.id } })}
                className="grid h-10 w-10 place-items-center rounded-full text-muted hover:bg-paper hover:text-fg"
                aria-label="Back"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <p className="text-[0.7rem] tracking-[0.2em] text-subtle uppercase">Checkout</p>
              <button
                type="button"
                onClick={() => navigate({ to: "/" })}
                className="grid h-10 w-10 place-items-center rounded-full text-muted hover:bg-paper hover:text-fg"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <h1 className="mt-4 font-display text-3xl">Booking details</h1>
            <p className="mt-1 text-sm text-muted">Share your details and we will confirm on WhatsApp.</p>

            <div className="mt-5 rounded-lg border border-line bg-paper/60 px-4 py-3">
              <p className="text-[0.65rem] tracking-[0.16em] text-subtle uppercase">Product</p>
              <div className="mt-1 flex items-baseline justify-between gap-3">
                <p className="font-medium text-fg">{p.name}</p>
                <p className="tabular-nums text-sm text-fg">{formatInr(total)}</p>
              </div>
              <p className="text-xs text-muted">
                {p.sku}
                {qty > 1 ? ` · Qty ${qty}` : ""}
              </p>
            </div>

            <form onSubmit={bookOnWhatsApp} className="mt-6 flex flex-1 flex-col gap-3">
              <label className="block">
                <span className="mb-1.5 flex items-center gap-1.5 text-[0.65rem] tracking-[0.14em] text-subtle uppercase">
                  <User className="h-3.5 w-3.5" /> Name
                </span>
                <input
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your full name"
                  className="h-12 w-full rounded-md border border-line bg-bg px-4 text-sm outline-none focus:border-accent"
                />
              </label>
              <label className="block">
                <span className="mb-1.5 flex items-center gap-1.5 text-[0.65rem] tracking-[0.14em] text-subtle uppercase">
                  <Phone className="h-3.5 w-3.5" /> Phone number
                </span>
                <input
                  required
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="10-digit mobile"
                  className="h-12 w-full rounded-md border border-line bg-bg px-4 text-sm outline-none focus:border-accent"
                />
              </label>
              <label className="block">
                <span className="mb-1.5 flex items-center gap-1.5 text-[0.65rem] tracking-[0.14em] text-subtle uppercase">
                  <Mail className="h-3.5 w-3.5" /> Email address
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Optional"
                  className="h-12 w-full rounded-md border border-line bg-bg px-4 text-sm outline-none focus:border-accent"
                />
              </label>
              <label className="block">
                <span className="mb-1.5 flex items-center gap-1.5 text-[0.65rem] tracking-[0.14em] text-subtle uppercase">
                  <MapPin className="h-3.5 w-3.5" /> Address
                </span>
                <textarea
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Full delivery address"
                  rows={3}
                  className="w-full resize-none rounded-md border border-line bg-bg px-4 py-3 text-sm outline-none focus:border-accent"
                />
              </label>

              <button
                type="submit"
                className="mt-auto h-12 w-full rounded-md bg-fg text-sm tracking-[0.14em] text-bg uppercase transition hover:opacity-90"
              >
                Book on WhatsApp
              </button>
              <p className="text-center text-[0.7rem] text-subtle">Opens WhatsApp chat with +91 63048 37120</p>
            </form>
          </div>
        </div>
      </main>
    </SiteShell>
  );
}

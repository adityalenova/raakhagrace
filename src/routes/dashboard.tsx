import { createFileRoute, Link } from "@tanstack/react-router";
import {
  BadgeCheck,
  Heart,
  Inbox,
  MailWarning,
  MessageCircle,
  Package,
  RotateCcw,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Truck,
} from "lucide-react";
import { useEffect, useState } from "react";
import { LotusMark } from "@/components/LotusMark";
import { SiteShell } from "@/components/SiteShell";
import { UserButton } from "@/lib/auth/gates";
import { resendVerificationEmail } from "@/lib/auth/client";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { useCart } from "@/lib/cart-store";
import { useCatalog } from "@/lib/catalog-store";
import { listOrders, type OrderRow } from "@/lib/shop";
import { formatInr } from "@/lib/utils";
import { useWishlist } from "@/lib/wishlist-store";
import type { Product } from "@/lib/products";

export const Route = createFileRoute("/dashboard")({ component: Page });

const WA = "https://wa.me/916304837120";

function Page() {
  const { user, isPending } = useCurrentUserState();
  const items = useCart((s) => s.items);
  const mergeGuestToServer = useCart((s) => s.mergeGuestToServer);
  const wishIds = useWishlist((s) => s.ids);
  const removeWish = useWishlist((s) => s.remove);
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
          <div className="h-40 animate-pulse rounded-2xl bg-paper" />
          <div className="mt-6 grid gap-4 sm:grid-cols-4">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="h-28 animate-pulse rounded-xl bg-paper" />
            ))}
          </div>
        </main>
      </SiteShell>
    );
  }

  if (!user) {
    return (
      <SiteShell>
        <main className="mx-auto max-w-lg px-4 py-24 text-center">
          <LotusMark className="mx-auto h-12" />
          <h1 className="mt-5 font-display text-4xl">Your atelier</h1>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            Sign in to keep your saved pieces and booking history in one place — or write to us on
            WhatsApp and we will take care of it from there.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              to="/login"
              className="h-12 rounded-md bg-fg px-6 text-sm tracking-[0.16em] text-bg uppercase leading-[3rem]"
            >
              Sign in
            </Link>
            <Link
              to="/jewellery"
              className="h-12 rounded-md border border-line px-6 text-sm tracking-[0.16em] uppercase leading-[3rem]"
            >
              Shop jewellery
            </Link>
          </div>
        </main>
      </SiteShell>
    );
  }

  const cartLines = items
    .map((i) => {
      const p = get(i.productId);
      return p ? { ...i, product: p } : null;
    })
    .filter((l): l is { productId: string; qty: number; product: Product } => Boolean(l));
  const cartTotal = cartLines.reduce((s, l) => s + l.product.price * l.qty, 0);
  const saved = wishIds.map((id) => get(id)).filter((p): p is Product => Boolean(p));
  const spend = (orders ?? []).reduce((s, o) => s + o.total, 0);
  const needsVerification = Boolean(
    user.primaryEmail && !user.isGuest && user.emailVerified === false,
  );

  return (
    <SiteShell>
      <main className="pb-20">
      <section className="relative overflow-hidden bg-ink">
        <div className="mx-auto flex max-w-6xl flex-wrap items-end justify-between gap-6 px-4 pt-12 pb-24 sm:px-6 sm:pt-14">
          <div className="min-w-0">
            <p className="text-[0.65rem] tracking-[0.3em] text-ink-muted uppercase">
              Atelier account
            </p>
            <h1 className="mt-3 font-display text-4xl text-ink-fg sm:text-5xl">
              Hello, {user.displayName?.split(" ")[0] || "there"}
            </h1>
            <p className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-ink-muted">
              <span className="break-all">{user.primaryEmail ?? "Guest session"}</span>
              {user.emailVerified && (
                <span className="inline-flex items-center gap-1 rounded-full border border-ink-muted/40 px-2 py-0.5 text-[0.62rem] tracking-[0.14em] uppercase">
                  <BadgeCheck className="h-3.5 w-3.5" /> Verified
                </span>
              )}
            </p>
          </div>
          <div className="text-ink-fg [&_span]:text-ink-fg">
            <UserButton />
          </div>
        </div>
        <LotusMark className="pointer-events-none absolute -right-6 -top-8 h-44 opacity-[0.07]" />
      </section>

      <div className="relative z-10 mx-auto -mt-12 max-w-6xl px-4 sm:px-6">
        {needsVerification && <VerifyBanner email={user.primaryEmail ?? ""} />}

        <section
          className={`grid gap-4 sm:grid-cols-2 lg:grid-cols-4 ${needsVerification ? "mt-8" : ""}`}
        >
          {[
            { icon: ShoppingBag, label: "In cart", value: String(cartLines.reduce((n, l) => n + l.qty, 0)) },
            { icon: Heart, label: "Saved pieces", value: String(saved.length) },
            { icon: Package, label: "Bookings", value: orders ? String(orders.length) : "—" },
            { icon: Sparkles, label: "Lifetime", value: orders ? formatInr(spend) : "—" },
          ].map((c) => (
            <div
              key={c.label}
              className="rounded-xl border border-line bg-surface p-5 shadow-[0_18px_36px_-32px_rgba(91,54,35,0.5)]"
            >
              <c.icon className="h-5 w-5 text-accent" />
              <p className="mt-4 font-display text-3xl leading-none tabular-nums">{c.value}</p>
              <p className="mt-2 text-[0.68rem] tracking-[0.16em] text-muted uppercase">
                {c.label}
              </p>
            </div>
          ))}
        </section>

        <div className="mt-12 grid gap-10 lg:grid-cols-[1.55fr_1fr]">
          <div className="min-w-0 space-y-12">
            <section>
              <SectionTitle icon={Package} title="Your bookings" />
              <p className="mt-2 text-sm leading-relaxed text-muted">
                Orders are confirmed by hand on WhatsApp, so a booking appears here once the atelier
                records it.
              </p>
              {orders === null ? (
                <ul className="mt-6 space-y-4">
                  {[0, 1].map((i) => (
                    <li key={i} className="h-28 animate-pulse rounded-xl bg-paper" />
                  ))}
                </ul>
              ) : orders.length === 0 ? (
                <div className="mt-6 rounded-xl border border-dashed border-line bg-surface px-6 py-10 text-center">
                  <Inbox className="mx-auto h-6 w-6 text-subtle" />
                  <p className="mt-3 text-sm text-muted">
                    Nothing booked yet. Find a piece you love, or ask us for something specific.
                  </p>
                  <div className="mt-5 flex flex-wrap justify-center gap-3">
                    <Link
                      to="/jewellery"
                      className="h-11 rounded-md bg-fg px-5 text-[0.7rem] tracking-[0.16em] text-bg uppercase leading-[2.75rem]"
                    >
                      Shop the collection
                    </Link>
                    <a
                      href={WA}
                      target="_blank"
                      rel="noreferrer"
                      className="h-11 rounded-md border border-line px-5 text-[0.7rem] tracking-[0.16em] uppercase leading-[2.75rem]"
                    >
                      Ask on WhatsApp
                    </a>
                  </div>
                </div>
              ) : (
                <ul className="mt-6 space-y-4">
                  {orders.map((o) => (
                    <li
                      key={o.id}
                      className="rounded-xl border border-line bg-surface p-5 transition hover:border-accent/50"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <p className="font-display text-xl">Booking #{o.id}</p>
                          <p className="mt-1 text-xs tracking-[0.1em] text-subtle uppercase">
                            {new Date(o.createdAt).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            })}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="inline-block rounded-full bg-paper px-3 py-1 text-[0.62rem] tracking-[0.16em] text-fg uppercase">
                            {o.status}
                          </span>
                          <p className="mt-2 text-sm tabular-nums">{formatInr(o.total)}</p>
                        </div>
                      </div>
                      <ul className="mt-4 space-y-1 border-t border-line pt-4 text-sm text-muted">
                        {o.items.map((it) => (
                          <li key={it.productId} className="flex justify-between gap-4">
                            <span>{it.name}</span>
                            <span className="tabular-nums">× {it.qty}</span>
                          </li>
                        ))}
                      </ul>
                      <a
                        href={`${WA}?text=${encodeURIComponent(`Namaste! Following up on booking #${o.id} from Raakha Grace.`)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-4 inline-flex items-center gap-1.5 text-[0.68rem] tracking-[0.16em] text-accent uppercase"
                      >
                        <MessageCircle className="h-3.5 w-3.5" /> Message the atelier
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section>
              <SectionTitle icon={Heart} title="Saved pieces" />
              {saved.length === 0 ? (
                <p className="mt-4 text-sm text-muted">
                  Tap the heart on any piece to keep it here.
                </p>
              ) : (
                <ul className="mt-6 grid gap-4 sm:grid-cols-2">
                  {saved.map((p) => (
                    <li
                      key={p.id}
                      className="group flex gap-4 rounded-xl border border-line bg-surface p-3"
                    >
                      <Link to="/product/$id" params={{ id: p.id }} className="shrink-0">
                        <img
                          src={p.image}
                          alt=""
                          className="h-24 w-20 rounded-md object-cover transition duration-500 group-hover:scale-[1.03]"
                        />
                      </Link>
                      <div className="min-w-0 flex-1">
                        <Link
                          to="/product/$id"
                          params={{ id: p.id }}
                          className="line-clamp-2 font-display text-lg leading-snug"
                        >
                          {p.name}
                        </Link>
                        <p className="mt-1 text-sm tabular-nums text-muted">{formatInr(p.price)}</p>
                        <div className="mt-3 flex gap-4 text-[0.66rem] tracking-[0.14em] text-accent uppercase">
                          <a href={`${WA}?text=${encodeURIComponent(`I am interested in ${p.name} (${p.sku}).`)}`} target="_blank" rel="noreferrer">
                            Enquire
                          </a>
                          <button type="button" className="underline" onClick={() => removeWish(p.id)}>
                            Remove
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>

          <aside className="space-y-8 lg:pt-2">
            <section className="rounded-xl border border-line bg-surface p-6">
              <SectionTitle icon={ShoppingBag} title="Cart" small />
              {cartLines.length === 0 ? (
                <p className="mt-3 text-sm text-muted">Your cart is empty.</p>
              ) : (
                <>
                  <ul className="mt-4 space-y-3">
                    {cartLines.slice(0, 4).map((l) => (
                      <li key={l.productId} className="flex items-center gap-3">
                        <img src={l.product.image} alt="" className="h-12 w-12 rounded object-cover" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm">{l.product.name}</p>
                          <p className="text-xs text-subtle">Qty {l.qty}</p>
                        </div>
                        <p className="text-sm tabular-nums">{formatInr(l.product.price * l.qty)}</p>
                      </li>
                    ))}
                  </ul>
                  {cartLines.length > 4 && (
                    <p className="mt-3 text-xs text-subtle">
                      + {cartLines.length - 4} more in your cart
                    </p>
                  )}
                  <p className="mt-4 flex justify-between border-t border-line pt-4 text-sm">
                    <span className="text-muted">Subtotal</span>
                    <span className="tabular-nums">{formatInr(cartTotal)}</span>
                  </p>
                </>
              )}
              <Link
                to="/cart"
                className="mt-5 block h-11 rounded-md bg-fg text-center text-[0.7rem] tracking-[0.16em] text-bg uppercase leading-[2.75rem]"
              >
                Open cart
              </Link>
            </section>

            <section className="rounded-xl border border-line bg-paper p-6">
              <SectionTitle icon={Truck} title="How ordering works" small />
              <ol className="mt-4 space-y-3 text-sm leading-relaxed text-muted">
                {[
                  "Send the piece you want on WhatsApp — we check it is in stock.",
                  "Confirm the price and shipping, then pay. Nothing is held before payment.",
                  "Your parcel ships in gift-ready packaging. Record the unboxing on video.",
                ].map((step, i) => (
                  <li key={step} className="flex gap-3">
                    <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-surface text-[0.7rem] tabular-nums">
                      {i + 1}
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
              <a
                href={WA}
                target="_blank"
                rel="noreferrer"
                className="mt-5 flex h-11 items-center justify-center gap-2 rounded-md border border-fg text-[0.7rem] tracking-[0.16em] uppercase transition hover:bg-fg hover:text-bg"
              >
                <MessageCircle className="h-4 w-4" /> +91 63048 37120
              </a>
            </section>

            <section className="rounded-xl border border-line bg-surface p-6">
              <SectionTitle icon={ShieldCheck} title="Good to know" small />
              <ul className="mt-4 space-y-2 text-sm text-muted">
                <li>
                  <Link to="/terms" className="underline decoration-line hover:decoration-accent">
                    Terms of service
                  </Link>{" "}
                  — payments, shipping and returns
                </li>
                <li>
                  <Link to="/privacy" className="underline decoration-line hover:decoration-accent">
                    Privacy
                  </Link>{" "}
                  — what we keep about you
                </li>
                <li>
                  <Link to="/about" className="underline decoration-line hover:decoration-accent">
                    The atelier
                  </Link>{" "}
                  — who makes your piece
                </li>
              </ul>
            </section>
          </aside>
        </div>
      </div>
      </main>
    </SiteShell>
  );
}

function SectionTitle({
  icon: Icon,
  title,
  small,
}: {
  icon: typeof Package;
  title: string;
  small?: boolean;
}) {
  return (
    <h2 className="flex items-center gap-2.5">
      <Icon className={`text-accent ${small ? "h-4 w-4" : "h-5 w-5"}`} />
      <span className={small ? "font-display text-xl" : "font-display text-3xl"}>{title}</span>
    </h2>
  );
}

/** Shown until the address on an email/password account is confirmed. */
function VerifyBanner({ email }: { email: string }) {
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [note, setNote] = useState("");

  async function resend() {
    setState("sending");
    const res = await resendVerificationEmail(email);
    if (res.ok) {
      setState("sent");
      setNote(`A fresh confirmation link is on its way to ${email}.`);
    } else {
      setState("error");
      setNote(res.error);
    }
  }

  return (
    <section className="relative z-10 mt-10 overflow-hidden rounded-xl border border-accent/40 bg-surface p-6 sm:p-7">
      <div className="flex flex-wrap items-start justify-between gap-5">
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-2 text-[0.65rem] tracking-[0.2em] text-accent uppercase">
            <MailWarning className="h-4 w-4" /> One more step
          </p>
          <h2 className="mt-3 font-display text-2xl">Confirm your email address</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            We sent a confirmation link to <span className="text-fg">{email}</span>. Until you tap
            it, booking confirmations and product enquiries may land in the spam folder — and the
            link expires 72 hours after it was sent.
          </p>
        </div>
        <div className="shrink-0">
          <button
            type="button"
            onClick={() => void resend()}
            disabled={state === "sending"}
            className="flex h-11 items-center gap-2 rounded-md bg-fg px-5 text-[0.7rem] tracking-[0.16em] text-bg uppercase transition hover:opacity-90 disabled:opacity-60"
          >
            <RotateCcw className={`h-4 w-4 ${state === "sending" ? "animate-spin" : ""}`} />
            {state === "sending" ? "Sending…" : "Resend link"}
          </button>
          {note && (
            <p
              role="status"
              className={`mt-2 max-w-56 text-right text-xs ${state === "error" ? "text-danger" : "text-muted"}`}
            >
              {note}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

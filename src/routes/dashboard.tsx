import { createFileRoute, Link } from "@tanstack/react-router";
import {
  BadgeCheck,
  Heart,
  Inbox,
  Link2,
  MailWarning,
  MessageCircle,
  Package,
  RotateCcw,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Truck,
} from "lucide-react";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import { LotusMark } from "@/components/LotusMark";
import { SiteShell } from "@/components/SiteShell";
import { UserButton } from "@/lib/auth/gates";
import { resendVerificationEmail } from "@/lib/auth/client";
import { REQUIRE_EMAIL_VERIFICATION } from "@/lib/auth/verify-gate";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { useCart } from "@/lib/cart-store";
import { useCatalog } from "@/lib/catalog-store";
import {
  claimBooking,
  listMyBookings,
  STATUS_LABEL,
  type Booking,
  type BookingStatus,
} from "@/lib/bookings";
import { WHATSAPP_DISPLAY, whatsappLink } from "@/lib/contact";
import { formatInr } from "@/lib/utils";
import { useWishlist } from "@/lib/wishlist-store";
import type { Product } from "@/lib/products";

export const Route = createFileRoute("/dashboard")({ component: Page });

/**
 * The pill a booking wears. "new" is deliberately not alarming — the atelier
 * confirms by hand on WhatsApp, so the first state reads as "in the queue".
 */
const STATUS_TONE: Record<BookingStatus, string> = {
  new: "bg-paper text-fg",
  confirmed: "bg-accent/12 text-accent",
  packed: "bg-accent/12 text-accent",
  shipped: "bg-ink text-ink-fg",
  delivered: "bg-fg/10 text-fg",
  cancelled: "bg-danger/10 text-danger",
};

function Page() {
  const { user, isPending } = useCurrentUserState();
  const items = useCart((s) => s.items);
  const mergeGuestToServer = useCart((s) => s.mergeGuestToServer);
  const wishIds = useWishlist((s) => s.ids);
  const removeWish = useWishlist((s) => s.remove);
  const get = useCatalog((s) => s.get);
  const [bookings, setBookings] = useState<Booking[] | null>(null);

  const reloadBookings = useCallback(() => {
    void listMyBookings()
      .then(setBookings)
      .catch(() => setBookings([]));
  }, []);

  useEffect(() => {
    if (!user) return;
    void mergeGuestToServer();
    reloadBookings();
  }, [user, mergeGuestToServer, reloadBookings]);

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
  const spend = (bookings ?? [])
    .filter((o) => o.status !== "cancelled")
    .reduce((s, o) => s + o.total, 0);
  const needsVerification = Boolean(
    user.primaryEmail && !user.isGuest && user.emailVerified === false,
  );

  // Stopped at the door rather than nudged inside: see `verify-gate.ts` for why
  // this is a flag and not unconditional.
  if (REQUIRE_EMAIL_VERIFICATION && needsVerification) {
    return (
      <SiteShell>
        <main className="mx-auto max-w-2xl px-4 py-16 sm:py-24">
          <LotusMark className="h-10" />
          <h1 className="mt-5 font-display text-4xl sm:text-5xl">Confirm your email first</h1>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            Your atelier opens as soon as you tap the link we sent. Nothing is lost in the meantime
            — your cart and saved pieces are held on this device.
          </p>
          <VerifyBanner email={user.primaryEmail ?? ""} />
          {/*
            The door has to have a second handle. Confirmation mail only reaches a
            customer once the sender domain is verified in Resend; until then the
            "Resend link" button above cannot succeed, and a gate with no way
            through is just a wall. Orders run over WhatsApp regardless of whether
            an account exists, so this is a real alternative and not a consolation.
          */}
          <div className="mt-8 rounded-xl border border-line bg-paper/60 p-6">
            <h2 className="font-display text-2xl">Link never arrived?</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              It happens — a filter, a typo, or our mailer still warming up on a new address. You do
              not need an account to order: send us the piece you want and we will book it by hand.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <a
                href={whatsappLink("Namaste! I could not confirm my email on the Raakha Grace site.")}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-11 items-center gap-2 rounded-md bg-fg px-5 text-[0.7rem] tracking-[0.16em] text-bg uppercase transition hover:opacity-90"
              >
                <MessageCircle className="h-4 w-4" />
                Write to us on WhatsApp
              </a>
              <Link
                to="/login"
                className="flex h-11 items-center rounded-md border border-line px-5 text-[0.7rem] tracking-[0.16em] uppercase transition hover:border-fg"
              >
                Sign in another way
              </Link>
            </div>
          </div>
        </main>
      </SiteShell>
    );
  }

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
              {
                icon: ShoppingBag,
                label: "In cart",
                value: String(cartLines.reduce((n, l) => n + l.qty, 0)),
              },
              { icon: Heart, label: "Saved pieces", value: String(saved.length) },
              { icon: Package, label: "Bookings", value: bookings ? String(bookings.length) : "—" },
              { icon: Sparkles, label: "Lifetime", value: bookings ? formatInr(spend) : "—" },
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
                  Every booking you start on WhatsApp gets a reference code. The atelier moves it
                  through confirmed, packed and shipped from their desk, and this page shows the
                  same status — no need to ask “has my order gone out?”.
                </p>
                {bookings === null ? (
                  <ul className="mt-6 space-y-4">
                    {[0, 1].map((i) => (
                      <li key={i} className="h-28 animate-pulse rounded-xl bg-paper" />
                    ))}
                  </ul>
                ) : bookings.length === 0 ? (
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
                        href={whatsappLink(
                          "Namaste! I would like to know more about Raakha Grace pieces.",
                        )}
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
                    {bookings.map((o) => (
                      <li
                        key={o.id}
                        className="rounded-xl border border-line bg-surface p-5 transition hover:border-accent/50"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div>
                            <p className="font-display text-xl tracking-[0.06em] tabular-nums">
                              {o.ref}
                            </p>
                            <p className="mt-1 text-xs tracking-[0.1em] text-subtle uppercase">
                              {new Date(o.createdAt).toLocaleDateString("en-IN", {
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                              })}
                              {o.channel === "whatsapp" ? " · via WhatsApp" : ""}
                            </p>
                          </div>
                          <div className="text-right">
                            <span
                              className={`inline-block rounded-full px-3 py-1 text-[0.62rem] tracking-[0.16em] uppercase ${STATUS_TONE[o.status]}`}
                            >
                              {STATUS_LABEL[o.status]}
                            </span>
                            <p className="mt-2 text-sm tabular-nums">{formatInr(o.total)}</p>
                          </div>
                        </div>

                        {o.tracking && (o.status === "shipped" || o.status === "delivered") ? (
                          <p className="mt-4 flex flex-wrap items-center gap-x-2 rounded-lg bg-paper/70 px-4 py-2.5 text-xs text-fg">
                            <Truck className="h-4 w-4 shrink-0 text-accent" />
                            <span className="tracking-[0.12em] text-subtle uppercase">
                              Tracking
                            </span>
                            <span className="tabular-nums">{o.tracking}</span>
                            <span className="text-muted">
                              — DTDC needs 2–3 working days to update.
                            </span>
                          </p>
                        ) : null}

                        <ul className="mt-4 space-y-1 border-t border-line pt-4 text-sm text-muted">
                          {o.items.map((it) => (
                            <li key={it.productId} className="flex justify-between gap-4">
                              <span>{it.name}</span>
                              <span className="tabular-nums">× {it.qty}</span>
                            </li>
                          ))}
                        </ul>
                        <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2">
                          <a
                            href={whatsappLink(
                              `Namaste! Following up on booking ${o.ref} from Raakha Grace.`,
                            )}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 text-[0.68rem] tracking-[0.16em] text-accent uppercase"
                          >
                            <MessageCircle className="h-3.5 w-3.5" /> Reopen this chat
                          </a>
                          {o.status === "new" ? (
                            <p className="text-[0.68rem] text-subtle">
                              Payment and confirmation happen on WhatsApp — nothing is held until
                              then.
                            </p>
                          ) : null}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}

                <LinkBookingForm onLinked={reloadBookings} />
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
                          <p className="mt-1 text-sm tabular-nums text-muted">
                            {formatInr(p.price)}
                          </p>
                          <div className="mt-3 flex gap-4 text-[0.66rem] tracking-[0.14em] text-accent uppercase">
                            <a
                              href={whatsappLink(`I am interested in ${p.name} (${p.sku}).`)}
                              target="_blank"
                              rel="noreferrer"
                            >
                              Enquire
                            </a>
                            <button
                              type="button"
                              className="underline"
                              onClick={() => removeWish(p.id)}
                            >
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
                          <img
                            src={l.product.image}
                            alt=""
                            className="h-12 w-12 rounded object-cover"
                          />
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm">{l.product.name}</p>
                            <p className="text-xs text-subtle">Qty {l.qty}</p>
                          </div>
                          <p className="text-sm tabular-nums">
                            {formatInr(l.product.price * l.qty)}
                          </p>
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
                    "Book from any product page — you get a reference code and the WhatsApp chat opens with your details already typed.",
                    "Confirm the price and shipping on WhatsApp, then pay. Nothing is held before payment.",
                    "The atelier updates the booking here as it is confirmed, packed and shipped — record the unboxing on video.",
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
                  href={whatsappLink("Namaste! I would like to book a piece from Raakha Grace.")}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-5 flex h-11 items-center justify-center gap-2 rounded-md border border-fg text-[0.7rem] tracking-[0.16em] uppercase transition hover:bg-fg hover:text-bg"
                >
                  <MessageCircle className="h-4 w-4" /> {WHATSAPP_DISPLAY}
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
                    <Link
                      to="/privacy"
                      className="underline decoration-line hover:decoration-accent"
                    >
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
      // `res.error` is the upstream text — a Resend status line and a JSON body.
      // It is worth logging, not worth showing: a customer cannot act on
      // `Resend 422: {"name":"validation_error"}`, and it reads as the site
      // breaking rather than as a mailer that has not been given a domain yet.
      console.warn("[verify] resend failed", res.error);
      setState("error");
      setNote("That link could not be sent just now. Message us on WhatsApp and we will sort it out.");
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

/**
 * Most WhatsApp bookings start before anyone signs in, so the row carries no
 * account. Reference + the phone it was booked on is enough to attach it here —
 * the phone matters because a reference alone would let anyone read a stranger's
 * order by guessing codes.
 */
function LinkBookingForm({ onLinked }: { onLinked: () => void }) {
  const [ref, setRef] = useState("");
  const [phone, setPhone] = useState("");
  const [state, setState] = useState<"idle" | "saving" | "done" | "error">("idle");
  const [note, setNote] = useState("");

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!ref.trim() || !phone.trim()) return;
    setState("saving");
    try {
      const res = await claimBooking({ data: { ref: ref.trim(), phone: phone.trim() } });
      if (res.ok) {
        setState("done");
        setNote(`Booking ${ref.trim().toUpperCase()} is now in your list.`);
        setRef("");
        setPhone("");
        onLinked();
      } else {
        setState("error");
        setNote(res.error);
      }
    } catch {
      setState("error");
      setNote("Could not link that booking. Check the code and number.");
    }
  }

  return (
    <form onSubmit={submit} className="mt-8 rounded-xl border border-line bg-paper/50 p-5 sm:p-6">
      <p className="flex items-center gap-2 text-[0.65rem] tracking-[0.2em] text-fg uppercase">
        <Link2 className="h-4 w-4 text-accent" /> Booked without signing in?
      </p>
      <p className="mt-2 text-sm leading-relaxed text-muted">
        Paste the reference from your WhatsApp message and the mobile number you booked on, and the
        order joins this list.
      </p>
      <div className="mt-4 flex flex-wrap items-start gap-3">
        <input
          value={ref}
          onChange={(e) => setRef(e.target.value)}
          placeholder="RG-7K4MQP"
          aria-label="Booking reference"
          className="h-11 w-36 rounded-md border border-line bg-bg px-3 text-sm tracking-[0.1em] uppercase outline-none focus:border-accent"
        />
        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          type="tel"
          placeholder="Mobile number"
          aria-label="Mobile number used on the booking"
          className="h-11 w-40 rounded-md border border-line bg-bg px-3 text-sm outline-none focus:border-accent"
        />
        <button
          type="submit"
          disabled={state === "saving"}
          className="h-11 rounded-md bg-fg px-5 text-[0.7rem] tracking-[0.16em] text-bg uppercase transition hover:opacity-90 disabled:opacity-60"
        >
          {state === "saving" ? "Linking…" : "Link booking"}
        </button>
      </div>
      {note && (
        <p
          role="status"
          className={`mt-3 text-xs ${state === "error" ? "text-danger" : "text-muted"}`}
        >
          {note}
        </p>
      )}
    </form>
  );
}

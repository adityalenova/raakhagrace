import { createFileRoute, Link } from "@tanstack/react-router";
import {
  BadgeCheck,
  Check,
  Copy,
  Heart,
  Inbox,
  KeyRound,
  Link2,
  MessageCircle,
  Package,
  RotateCcw,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Truck,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { LotusMark } from "@/components/LotusMark";
import { SiteShell } from "@/components/SiteShell";
import { UserButton } from "@/lib/auth/gates";
import {
  resendVerificationEmail,
  sendEmailCode,
  verifyEmailCode,
  type OtpResult,
} from "@/lib/auth/client";
import { adminStatus } from "@/lib/auth-status";
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

export const Route = createFileRoute("/dashboard")({
  // Asked on the server, from the session, before the first paint — because the
  // answer decides whether this page shows the verification gate at all, and a
  // gate that appears for one frame and then disappears is worse than no gate.
  loader: () => adminStatus(),
  component: Page,
});

/**
 * Shape of `adminStatus()` — derived rather than imported from
 * `admin.server.ts`, which a client route must not import statically.
 */
type AdminStatus = Awaited<ReturnType<typeof adminStatus>>;

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
  /**
   * Server's verdict on this session for `/admin`, from the route loader: it
   * both decides the gate below and mounts the owner's card.
   */
  const admin: AdminStatus = Route.useLoaderData();

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
  /*
   * The code step is for customers. The atelier's own address is on the admin
   * allowlist, which is a stronger claim on the account than a confirmation
   * mail: it already decides who may open `/admin`, it is set by hand in the
   * deployment's environment, and no code can be mailed to it while the sender
   * is still Resend's test address. So the owner signs in with email and
   * password and goes straight through — the same way they did before the gate
   * existed.
   */
  const isOwner = Boolean(admin.allowed);
  const needsVerification = Boolean(
    !isOwner && user.primaryEmail && !user.isGuest && user.emailVerified === false,
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
            Your atelier opens the moment the code you type matches the one we mailed. Nothing is
            lost in the meantime — your cart and saved pieces are held on this device.
          </p>
          <VerifyBanner email={user.primaryEmail ?? ""} />
          {/*
            The door has to have a second handle. Confirmation mail only reaches a
            customer once the sender domain is verified in Resend; until then no
            code can be delivered, and a gate with no way through is just a wall.
            Orders run over WhatsApp regardless of whether an account exists, so
            this is a real alternative and not a consolation.
          */}
          <div className="mt-8 rounded-xl border border-line bg-paper/60 p-6">
            <h2 className="font-display text-2xl">Code never arrived?</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              It happens — a filter, a typo, or our mailer still warming up on a new address. You do
              not need an account to order: send us the piece you want and we will book it by hand.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <a
                href={whatsappLink(
                  "Namaste! I could not confirm my email on the Raakha Grace site.",
                )}
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

          {/*
            The owner's memo, printed only for a session the server allowlisted —
            which is what makes it safe to show the desk's address and the email
            that opens it on a page a customer can also be on.
          */}
          {isOwner && <OwnerDesk email={admin.email ?? user.primaryEmail ?? ""} />}

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

/**
 * The owner's memo: where the admin desk is, which address opens it, and what to
 * expect when the desk opens.
 *
 * Rendered only when the server says this session is on the `ADMIN_EMAILS`
 * allowlist, so the URL and the address never appear on a customer's dashboard.
 * There is no separate admin password to print — access follows the Google
 * address, which is the point worth writing down.
 */
function OwnerDesk({ email }: { email: string }) {
  const [url, setUrl] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setUrl(`${window.location.origin}/admin`);
  }, []);

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      // The clipboard API needs a secure context and a user gesture. Both are
      // normally true here; if the browser still refuses, the address is printed
      // on the card, so a long-press selection works.
      console.warn("[admin] clipboard blocked");
    }
  }

  return (
    <section className="mt-6 overflow-hidden rounded-xl border border-ink/25 bg-ink p-6 text-ink-fg sm:p-7">
      <p className="flex items-center gap-2 text-[0.65rem] tracking-[0.2em] text-ink-muted uppercase">
        <ShieldCheck className="h-4 w-4" /> Owner&rsquo;s desk
      </p>
      <h2 className="mt-3 font-display text-2xl text-ink-fg">Atelier admin</h2>

      <dl className="mt-5 grid gap-x-8 gap-y-4 sm:grid-cols-2">
        <div>
          <dt className="text-[0.62rem] tracking-[0.16em] text-ink-muted uppercase">Sign in with</dt>
          <dd className="mt-1.5 break-all text-sm">{email}</dd>
          <dd className="mt-1 text-xs leading-relaxed text-ink-muted">
            The address on the ADMIN_EMAILS allowlist, plus the password you set when you made that
            account. There is no separate admin password — and no confirmation code either, so the
            door opens on the password alone.
          </dd>
        </div>
        <div>
          <dt className="text-[0.62rem] tracking-[0.16em] text-ink-muted uppercase">Admin desk</dt>
          <dd className="mt-1.5 break-all text-sm">{url || "/admin"}</dd>
          <dd className="mt-1 text-xs leading-relaxed text-ink-muted">
            Reachable at that address from any signed-in browser. If the account for this email does
            not exist yet, create it at {"/login"} with the same address first.
          </dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="text-[0.62rem] tracking-[0.16em] text-ink-muted uppercase">Desks</dt>
          <dd className="mt-1.5 text-sm">
            Products · Order desk · Insights · People · Analytics
          </dd>
          <dd className="mt-1 text-xs leading-relaxed text-ink-muted">
            Product edits save to the browser you make them in. Everything else — bookings, the
            counted figures, customers and analytics — reads the shared database, so it looks the
            same from any device. Orders are answered on WhatsApp at {WHATSAPP_DISPLAY}.
          </dd>
        </div>
      </dl>

      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          to="/admin"
          className="flex h-11 items-center rounded-md bg-ink-fg px-5 text-[0.7rem] tracking-[0.16em] text-ink uppercase transition hover:opacity-90"
        >
          Open the admin desk
        </Link>
        {url && (
          <button
            type="button"
            onClick={() => void copy()}
            className="flex h-11 items-center gap-2 rounded-md border border-ink-muted/40 px-5 text-[0.7rem] tracking-[0.16em] text-ink-fg uppercase transition hover:bg-white/10"
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied ? "Copied" : "Copy link"}
          </button>
        )}
      </div>
    </section>
  );
}

/** Six digits — the length every Indian transaction SMS uses, so nobody has to count. */
const CODE_LENGTH = 6;
/** Mirrors `OTP_MINUTES` in `src/lib/auth/server.ts`, which is what the code expires in. */
const CODE_MINUTES = 10;
/** Seconds a customer waits before another code can be mailed to the same address. */
const RESEND_COOLDOWN = 30;

const blankCode = () => Array.from({ length: CODE_LENGTH }, () => "");

/** Where the code panel is: nothing sent, mail in flight, typed, checked, done. */
type VerifyState = "idle" | "sending" | "awaiting" | "checking" | "confirmed" | "problem";

/**
 * Turn an upstream OTP failure into something a customer can act on. `res.code`
 * is Better Auth's error code; `res.error` is the raw text — worth logging, not
 * worth showing, since "Resend 422: validation_error" reads as the site breaking
 * rather than as a mailer still waiting on its domain.
 */
function codeProblem(res: OtpResult): string {
  if (res.ok) return "";
  switch (res.code) {
    case "OTP_EXPIRED":
      return "That code has expired. Send yourself a fresh one.";
    case "TOO_MANY_ATTEMPTS":
      return "Too many tries with that code. Ask for a new one.";
    case "INVALID_OTP":
      return "That is not the code we sent. Check all six digits and try again.";
    default:
      return "The code could not be checked just now. Message us on WhatsApp and we will confirm the address by hand.";
  }
}

/**
 * The confirmation step, in the shape customers expect from a shop: we mail a
 * six-digit code, they type it, the dashboard opens.
 *
 * The old link mail still exists — `/verify-email` answers to anything sent
 * before this change — but a code is the offer here because a link only pays for
 * itself when the inbox is warm, and it puts the whole confirmation behind a
 * message a customer has to hunt for.
 */
function VerifyBanner({ email }: { email: string }) {
  const [digits, setDigits] = useState<string[]>(blankCode);
  const [state, setState] = useState<VerifyState>("idle");
  const [note, setNote] = useState("");
  const [seconds, setSeconds] = useState(0);
  /** The code already POSTed, so the sixth digit cannot fire it twice. */
  const tried = useRef("");
  const boxes = useRef<Array<HTMLInputElement | null>>([]);

  const code = digits.join("");
  const busy = state === "checking" || state === "sending" || state === "confirmed";

  useEffect(() => {
    if (seconds <= 0) return;
    const t = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [seconds]);

  /**
   * No submit button: this panel is a small machine with one job, so the sixth
   * digit is what asks the server. A code that comes back wrong stays on screen
   * for correction, and clearing a digit re-arms the check so re-typing the same
   * number is not swallowed as "already tried".
   */
  useEffect(() => {
    if (code.length < CODE_LENGTH) tried.current = "";
  }, [code]);

  useEffect(() => {
    if (code.length !== CODE_LENGTH || tried.current === code || busy) return;
    tried.current = code;
    setState("checking");
    void verifyEmailCode(email, code).then((res) => {
      if (res.ok) {
        setState("confirmed");
        setNote("Confirmed — opening your atelier.");
        // These calls go through plain fetch, so nothing tells the client that
        // the session's `emailVerified` just flipped. Reloading is the honest
        // re-read: the gate above is evaluated from the session, not from here.
        setTimeout(() => window.location.reload(), 1100);
        return;
      }
      console.warn("[verify] code rejected", res.code, res.error);
      setState("problem");
      setNote(codeProblem(res));
    });
  }, [code, email, busy]);

  function fill(start: number, raw: string) {
    const chars = raw
      .replace(/\D/g, "")
      .slice(0, CODE_LENGTH - start)
      .split("");
    if (chars.length === 0) return;
    setDigits((prev) => {
      const next = [...prev];
      chars.forEach((c, i) => {
        next[start + i] = c;
      });
      return next;
    });
    boxes.current[Math.min(start + chars.length, CODE_LENGTH - 1)]?.focus();
  }

  async function send() {
    if (seconds > 0 || state === "sending" || state === "confirmed") return;
    setState("sending");
    const res = await sendEmailCode(email);
    if (res.ok) {
      tried.current = "";
      setDigits(blankCode());
      boxes.current[0]?.focus();
      setState("awaiting");
      setSeconds(RESEND_COOLDOWN);
      setNote(
        `A six-digit code is on its way to ${email}. It works once, for ${CODE_MINUTES} minutes. ` +
          "If it has not turned up in a minute, look in Spam or Junk first — a confirmation mail " +
          "from a shop this new is the first thing a mail provider sets aside.",
      );
      return;
    }
    console.warn("[verify] send failed", res.error);
    setState("problem");
    setNote(
      "That code could not be sent just now. Message us on WhatsApp and we will sort it out.",
    );
  }

  /**
   * The other handle on the door. Not a fallback for a broken mailer — both
   * paths use the same sender — but for a customer who already has the link in
   * their inbox from sign-up and would rather tap it than wait for a code.
   */
  async function sendLink() {
    const res = await resendVerificationEmail(email);
    setNote(
      res.ok
        ? "A confirmation link is on its way to your inbox, too."
        : "That link could not be sent just now — the code above is the faster way.",
    );
    if (!res.ok) console.warn("[verify] resend link failed", res.error);
  }

  const confirmed = state === "confirmed";

  return (
    <section className="relative z-10 mt-10 overflow-hidden rounded-xl border border-accent/40 bg-surface p-6 sm:p-7">
      <p className="flex items-center gap-2 text-[0.65rem] tracking-[0.2em] text-accent uppercase">
        {confirmed ? <BadgeCheck className="h-4 w-4" /> : <KeyRound className="h-4 w-4" />}
        {confirmed ? "Confirmed" : "One more step"}
      </p>
      <h2 className="mt-3 font-display text-2xl">
        {confirmed ? "Your address is confirmed" : "Enter the code we mailed you"}
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-muted">
        Six digits, sent to <span className="break-all text-fg">{email}</span>. Until it is
        confirmed, booking confirmations and product enquiries may land in the spam folder.
      </p>

      <div className="mt-6 flex flex-wrap items-start gap-x-6 gap-y-5">
        <div className="flex gap-2" role="group" aria-label="Six-digit confirmation code">
          {digits.map((d, i) => (
            <input
              key={`d${i}`}
              ref={(el) => {
                boxes.current[i] = el;
              }}
              value={d}
              onChange={(e) => {
                const v = e.target.value.replace(/\D/g, "");
                if (v.length > 1) return fill(i, v);
                setDigits((prev) => prev.map((c, j) => (j === i ? v : c)));
                if (v) boxes.current[Math.min(i + 1, CODE_LENGTH - 1)]?.focus();
              }}
              onKeyDown={(e) => {
                if (e.key === "Backspace" && !digits[i] && i > 0) {
                  e.preventDefault();
                  setDigits((prev) => prev.map((c, j) => (j === i - 1 ? "" : c)));
                  boxes.current[i - 1]?.focus();
                } else if (e.key === "ArrowLeft" && i > 0) {
                  boxes.current[i - 1]?.focus();
                } else if (e.key === "ArrowRight" && i < CODE_LENGTH - 1) {
                  boxes.current[i + 1]?.focus();
                }
              }}
              onPaste={(e) => {
                e.preventDefault();
                fill(i, e.clipboardData.getData("text"));
              }}
              inputMode="numeric"
              autoComplete={i === 0 ? "one-time-code" : "off"}
              aria-label={`Digit ${i + 1} of ${CODE_LENGTH}`}
              disabled={state === "idle" || busy}
              className="h-14 w-10 rounded-md border border-line bg-bg text-center font-display text-2xl tabular-nums transition focus:border-accent focus:outline-none disabled:opacity-40 sm:w-12"
            />
          ))}
        </div>

        <div className="min-w-0">
          <button
            type="button"
            onClick={() => void send()}
            disabled={state === "sending" || state === "confirmed" || seconds > 0}
            className="flex h-11 items-center gap-2 rounded-md bg-fg px-5 text-[0.7rem] tracking-[0.16em] text-bg uppercase transition hover:opacity-90 disabled:opacity-60"
          >
            <RotateCcw className={`h-4 w-4 ${state === "sending" ? "animate-spin" : ""}`} />
            {state === "sending"
              ? "Sending…"
              : state === "idle"
                ? "Send code"
                : seconds > 0
                  ? `Resend in ${seconds}s`
                  : "Resend code"}
          </button>
          {state !== "idle" && !confirmed && (
            <button
              type="button"
              onClick={() => void sendLink()}
              className="mt-3 block text-left text-xs text-muted underline decoration-line transition hover:text-fg"
            >
              Prefer a link? Email that instead
            </button>
          )}
        </div>
      </div>

      {note && (
        <p
          role="status"
          className={`mt-4 text-xs ${state === "problem" ? "text-danger" : "text-muted"}`}
        >
          {note}
        </p>
      )}

      {state === "checking" && (
        <p className="mt-4 flex items-center gap-2 text-xs text-muted">
          <RotateCcw className="h-3.5 w-3.5 animate-spin" /> Checking…
        </p>
      )}
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

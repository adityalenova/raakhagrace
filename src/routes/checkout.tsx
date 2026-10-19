import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, MapPin, Phone, User, Mail, X } from "lucide-react";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { SiteShell } from "@/components/SiteShell";
import { createWhatsAppBooking } from "@/lib/bookings";
import { useCurrentUser } from "@/lib/auth/use-current-user";
import { useCatalog } from "@/lib/catalog-store";
import { useCart } from "@/lib/cart-store";
import { WHATSAPP_DISPLAY, whatsappLink } from "@/lib/contact";
import { sendOrderEnquiry } from "@/lib/order-email";
import { formatInr } from "@/lib/utils";

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
  const [enquiry, setEnquiry] = useState<{
    state: "idle" | "sending" | "sent" | "error";
    note?: string;
  }>({ state: "idle" });
  /** The booking we recorded for this cart, once it exists. */
  const [booking, setBooking] = useState<{ state: "idle" | "saving" | "sent"; ref?: string }>({
    state: "idle",
  });
  const user = useCurrentUser();

  // A signed-in visitor's Google name + address fill the form for them; they can
  // still type over it (e.g. booking a gift to a different email).
  useEffect(() => {
    if (!user) return;
    setName((current) => current || user.displayName || "");
    setEmail((current) => current || user.primaryEmail || "");
  }, [user]);

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

  /**
   * Record the booking on the site first, then open WhatsApp with its
   * reference in the message. That order matters: the chat is where the deal
   * is struck, but the reference is what makes the order findable afterwards —
   * by the customer in their dashboard, and by us on the admin desk.
   */
  async function bookOnWhatsApp(e: FormEvent) {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !address.trim() || booking.state === "saving") return;
    setBooking({ state: "saving" });
    let res: Awaited<ReturnType<typeof createWhatsAppBooking>>;
    try {
      res = await createWhatsAppBooking({
        data: {
          items: [{ productId: p.id, qty }],
          name: name.trim(),
          phone: phone.trim(),
          email: email.trim() || undefined,
          address: address.trim(),
        },
      });
    } catch (err) {
      // A failed write must not strand the button on "Recording…" — the
      // WhatsApp route still works, so say what happened and let them send.
      setBooking({ state: "idle" });
      setEnquiry({
        state: "error",
        note:
          err instanceof Error
            ? `We could not save the reference (${err.message}). Your WhatsApp chat still opens — send the details and we will track it by phone number.`
            : "We could not save the reference. Your WhatsApp chat still opens.",
      });
      window.open(whatsappLink(msgFor(undefined)), "_blank", "noopener,noreferrer");
      return;
    }
    if (!res.ok) {
      setBooking({ state: "idle" });
      setEnquiry({ state: "error", note: res.error });
      return;
    }
    setBooking({ state: "sent", ref: res.ref });
    const msg = msgFor(res.ref);
    window.open(whatsappLink(msg), "_blank", "noopener,noreferrer");

    /** The chat text, with the reference on the first line when we have one. */
    function msgFor(ref: string | undefined) {
      return [
        `Namaste! I would like to book this piece from Raakha Grace.`,
        ``,
        ref ? `*Booking reference:* ${ref}` : null,
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
    }
  }

  /**
   * Parallel paper trail: posts the same enquiry to the atelier inbox by email
   * (and a courtesy confirmation to the customer) so a booking is recorded even
   * if the WhatsApp tab is dismissed.
   */
  async function bookByEmail() {
    const trimmedEmail = email.trim();
    if (!name.trim() || !phone.trim() || !address.trim()) return;
    if (!trimmedEmail) {
      setEnquiry({ state: "error", note: "Add an email address so we can reply." });
      return;
    }
    setEnquiry({ state: "sending" });
    try {
      const result = await sendOrderEnquiry({
        data: {
          customerName: name.trim(),
          customerEmail: trimmedEmail,
          phone: phone.trim(),
          address: address.trim(),
          items: [{ name: p.name, sku: p.sku, qty, price: p.price }],
        },
      });
      setEnquiry(
        result.ok
          ? { state: "sent", note: `Sent to ${trimmedEmail} — we will confirm on WhatsApp.` }
          : { state: "error", note: result.error },
      );
    } catch (err) {
      setEnquiry({
        state: "error",
        note: err instanceof Error ? err.message : "Could not send the enquiry.",
      });
    }
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
            <p className="mt-1 text-sm text-muted">
              Share your details and we will confirm on WhatsApp.
            </p>

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
                disabled={booking.state === "saving"}
                className="mt-auto h-12 w-full rounded-md bg-fg text-sm tracking-[0.14em] text-bg uppercase transition hover:opacity-90 disabled:opacity-60"
              >
                {booking.state === "saving" ? "Recording your booking…" : "Book on WhatsApp"}
              </button>
              <p className="text-center text-[0.7rem] text-subtle">
                Opens WhatsApp chat with {WHATSAPP_DISPLAY}
              </p>

              {booking.state === "sent" && booking.ref && (
                <div className="rounded-lg border border-accent/30 bg-paper/70 px-4 py-3 text-center">
                  <p className="text-[0.65rem] tracking-[0.16em] text-subtle uppercase">
                    Booking reference
                  </p>
                  <p className="mt-1 font-display text-2xl tracking-[0.12em] text-fg">
                    {booking.ref}
                  </p>
                  <p className="mt-2 text-[0.75rem] leading-relaxed text-muted">
                    Quote this in the chat — it is already saved on the site. Follow it from your{" "}
                    <Link to="/dashboard" className="text-accent underline underline-offset-4">
                      dashboard
                    </Link>
                    , or sign in there to attach it to your account.
                  </p>
                </div>
              )}

              <button
                type="button"
                onClick={bookByEmail}
                disabled={enquiry.state === "sending"}
                className="h-12 w-full rounded-md border border-fg text-sm tracking-[0.14em] uppercase transition hover:bg-fg hover:text-bg disabled:opacity-60"
              >
                {enquiry.state === "sending" ? "Sending…" : "Email me the product details"}
              </button>
              <p className="text-center text-[0.7rem] leading-relaxed text-subtle">
                Bookings are confirmed on WhatsApp only. The email route sends the piece and your
                details to the atelier as an enquiry — it does not hold stock.
              </p>
              {enquiry.note && (
                <p
                  role="status"
                  className={`text-center text-[0.7rem] ${enquiry.state === "error" ? "text-danger" : "text-muted"}`}
                >
                  {enquiry.note}
                </p>
              )}
            </form>
          </div>
        </div>
      </main>
    </SiteShell>
  );
}

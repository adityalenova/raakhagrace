import { createFileRoute, Link } from "@tanstack/react-router";
import { Clock, Instagram, MapPin, MessageCircle, ShieldCheck, ShoppingBag } from "lucide-react";
import { PageHero } from "@/components/PageHero";
import { SiteShell } from "@/components/SiteShell";
import { INSTAGRAM_LINK, WHATSAPP_DISPLAY, whatsappLink } from "@/lib/contact";
import { SITE } from "@/lib/site-knowledge";

export const Route = createFileRoute("/reach-information")({ component: Page });

/**
 * “Who are you, where are you, and how do I reach a person?”
 *
 * Because there is no storefront and no card checkout, this page does the job an
 * imprint would usually do — and the job of an anti-fraud notice, since a
 * customer's WhatsApp thread with us is the ordering channel. Everything here is
 * a fact about how the atelier is set up, not a promise about a service we do
 * not run: no showroom, no support email published, no phone line.
 */

const CHANNELS = [
  {
    icon: MessageCircle,
    name: "WhatsApp",
    detail: SITE.whatsapp,
    note: "Where orders actually close. Send a screenshot of the piece you like and we will tell you honestly whether it is still at the bench.",
    href: whatsappLink("Namaste! I would like to know more about Raakha Grace jewellery."),
    external: true,
  },
  {
    icon: Instagram,
    name: "Instagram DM",
    detail: "@raakhagrace",
    note: "Same people, slower queue. Good for styling questions and for seeing pieces on a person in the stories.",
    href: INSTAGRAM_LINK,
    external: true,
  },
  {
    icon: ShoppingBag,
    name: "The cart on this site",
    detail: "Build it, then book it",
    note: "Add pieces here, choose “Book on WhatsApp” and a reference like RG-7K4MQP is written before the chat opens — so the message that reaches us already identifies your order.",
    href: undefined,
    internal: { to: "/cart", label: "Open your cart" },
  },
  {
    icon: Clock,
    name: "Grace, the shop assistant",
    detail: "Any hour, from the corner of any page",
    note: "Answers from the live catalogue and these same pages — ordering, shipping, sizing, returns, what a piece is made of. When she would be guessing, she hands you to WhatsApp instead.",
    href: undefined,
    internal: { to: "/faq", label: "What Grace can answer" },
  },
];

const RESPONSE = [
  { ask: "A question about a piece", line: "Within one working day", detail: "Usually within a few hours during bench time." },
  { ask: "A booking you started", line: "Confirmed before payment", detail: "We check stock against the live count and reply with the amount and the shipping charge." },
  { ask: "A delivery that has gone quiet", line: "After 10–15 days", detail: "Before that the tracking page knows as much as we do — see the terms." },
  { ask: "A claim about your parcel", line: "Within 5–6 hours of receipt", detail: "With the continuous 360-degree unboxing video attached. That window is the rule, not a preference." },
  { ask: "A privacy or data request", line: "Acknowledged in one working day", detail: "Completed within thirty; see the data protection page." },
];

const SEND_THIS = [
  ["A screenshot of the piece", "The product page or the photo you liked. Names are easy to mis-type; a picture is not."],
  ["Your pin code, and the courier that reaches it", "DTDC, Blue Dart, India Post or otherwise — write it at the top of the address, above everything else."],
  ["The date you are buying for", "If it is for a function, say which day. We would rather tell you we cannot make it than take your money."],
  ["A measurement, from a piece you already wear", "For bangles especially — makers size differently, and your own bangle beats our chart."],
];

function Page() {
  return (
    <SiteShell>
      <main>
        <section className="mx-auto max-w-3xl px-4 pt-14 sm:px-6">
          <PageHero
            kicker="Reach & information"
            title="How to find us"
            subtitle="Raakha Grace is a bench, not a shopfront. There is no counter to walk up to and no call centre behind the number — there is a workshop in Hyderabad, a WhatsApp thread, and a small group of people who string, photograph and pack what you see here."
          />
        </section>

        <section className="mx-auto max-w-5xl px-4 pb-4 sm:px-6">
          <div className="overflow-hidden rounded-xl bg-paper">
            <img
              src="/images/atelier-still.jpg"
              alt="Beads, tools and gold work on the Raakha Grace bench"
              className="h-[min(400px,48vh)] w-full object-cover"
            />
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
          <div className="grid gap-4 sm:grid-cols-2">
            {CHANNELS.map((c) => {
              const Icon = c.icon;
              const body = (
                <>
                  <Icon className="h-5 w-5 text-accent" aria-hidden="true" />
                  <p className="mt-3 font-display text-xl text-fg">{c.name}</p>
                  <p className="mt-1 text-[0.7rem] tracking-[0.14em] text-subtle uppercase">
                    {c.detail}
                  </p>
                  <p className="mt-3 text-sm leading-relaxed text-muted">{c.note}</p>
                  {c.internal ? (
                    <span className="mt-4 inline-block text-[0.68rem] tracking-[0.16em] text-accent uppercase">
                      {c.internal.label} →
                    </span>
                  ) : null}
                </>
              );
              const cls =
                "rounded-xl border border-line bg-surface p-6 transition-colors hover:border-accent";
              return c.href ? (
                <a
                  key={c.name}
                  href={c.href}
                  target="_blank"
                  rel="noreferrer"
                  className={cls}
                >
                  {body}
                </a>
              ) : (
                <Link key={c.name} to={c.internal!.to} className={cls}>
                  {body}
                </Link>
              );
            })}
          </div>
        </section>

        <section className="border-y border-line bg-paper py-14">
          <div className="mx-auto max-w-5xl px-4 sm:px-6">
            <p className="text-[0.65rem] tracking-[0.24em] text-subtle uppercase">The atelier</p>
            <h2 className="mt-3 font-display text-3xl">Who is behind this</h2>
            <div className="mt-6 grid gap-8 text-sm leading-relaxed text-muted lg:grid-cols-2">
              <div className="space-y-4">
                <p>
                  Raakha Grace is an independent jewellery house operated from Hyderabad, Telangana,
                  India. Pieces are designed and hand-strung here, photographed here, and packed here
                  — we are not a reseller, a franchise, or a storefront on someone else's marketplace,
                  and the lotus mark and the name belong to this atelier. Our position on other
                  brands is stated plainly on the{" "}
                  <Link to="/affiliations" className="text-accent hover:underline">
                    affiliations page
                  </Link>
                  .
                </p>
                <p>
                  Orders are taken directly by us. Prices are in Indian rupees, payment is by UPI or
                  bank transfer, and every booking is confirmed against live stock before anything is
                  held. Terms, shipping, the unboxing rule and the returns position are on the{" "}
                  <Link to="/terms" className="text-accent hover:underline">
                    terms of service
                  </Link>{" "}
                  — please read them before paying, because they are the terms every order is sold on.
                </p>
                <p>
                  Invoices and the atelier's trade and tax details are issued with your order. If you
                  need a document for an expense claim or a customs form, ask for it on WhatsApp
                  before dispatch and we will send it.
                </p>
              </div>
              <div className="space-y-4">
                <div className="flex items-start gap-3 rounded-lg border border-line bg-surface p-5">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
                  <div>
                    <p className="font-medium text-fg">The workroom</p>
                    <p className="mt-1">
                      Hyderabad, Telangana, India. It is a working bench — stringing, photography and
                      packing — so there is no retail address to visit, no trial room, and no walk-in
                      collection. We will send close-up photographs and a video of the actual piece
                      before you pay; that is the substitute, and it works.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 rounded-lg border border-line bg-surface p-5">
                  <Clock className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
                  <div>
                    <p className="font-medium text-fg">Bench hours</p>
                    <p className="mt-1">
                      Monday to Saturday, through the working day, and dispatch goes out with the
                      courier collection. Messages that arrive on a Sunday are read on Monday. We
                      answer within one working day at the outside, and we do not use a bot queue or a
                      ticket number you have to wait for.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 rounded-lg border border-line bg-surface p-5">
                  <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
                  <div>
                    <p className="font-medium text-fg">Shipping across India</p>
                    <p className="mt-1">
                      Gift-ready packaging, tracked courier, and {SITE.deliveryWindow} after
                      dispatch. We do not ship outside India yet — if you have someone here who can
                      receive a parcel, we will happily send it to them.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-4 py-14 sm:px-6">
          <p className="text-[0.65rem] tracking-[0.24em] text-subtle uppercase">Response times</p>
          <h2 className="mt-3 font-display text-3xl">What happens when you write</h2>
          <div className="mt-6 overflow-hidden rounded-xl border border-line">
            <table className="w-full text-left text-sm">
              <caption className="sr-only">What you write to us about, and how fast it comes back</caption>
              <thead>
                <tr className="border-b border-line bg-surface">
                  <th scope="col" className="px-4 py-3 text-[0.62rem] tracking-[0.16em] text-subtle uppercase">
                    If you write about
                  </th>
                  <th scope="col" className="px-4 py-3 text-[0.62rem] tracking-[0.16em] text-subtle uppercase">
                    Expect a reply
                  </th>
                  <th
                    scope="col"
                    className="hidden px-4 py-3 text-[0.62rem] tracking-[0.16em] text-subtle uppercase sm:table-cell"
                  >
                    Why
                  </th>
                </tr>
              </thead>
              <tbody>
                {RESPONSE.map((r) => (
                  <tr key={r.ask} className="border-b border-line last:border-0">
                    <td className="px-4 py-3 text-fg">{r.ask}</td>
                    <td className="px-4 py-3 text-accent">{r.line}</td>
                    <td className="hidden px-4 py-3 text-muted sm:table-cell">{r.detail}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-12 grid gap-6 lg:grid-cols-2">
            <div>
              <p className="text-[0.65rem] tracking-[0.24em] text-subtle uppercase">
                Write it like this
              </p>
              <h3 className="mt-3 font-display text-2xl">Four things that save a day</h3>
              <ul className="mt-5 space-y-4">
                {SEND_THIS.map(([t, d]) => (
                  <li key={t} className="rounded-lg border border-line bg-surface p-5">
                    <p className="font-medium text-fg">{t}</p>
                    <p className="mt-1 text-sm leading-relaxed text-muted">{d}</p>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-[0.65rem] tracking-[0.24em] text-subtle uppercase">
                Please read before you pay
              </p>
              <h3 className="mt-3 font-display text-2xl">We will never ask you for</h3>
              <div className="mt-5 rounded-xl border border-accent/40 bg-accent/5 p-6">
                <ul className="space-y-3 text-sm leading-relaxed text-fg">
                  <li>Your UPI or banking password, or an OTP of any kind.</li>
                  <li>A card number, CVV, or a screenshot of the front of a card.</li>
                  <li>Money sent to any number other than the account we name in your booking.</li>
                  <li>A “courier fee” or “customs release” paid after dispatch.</li>
                </ul>
                <p className="mt-5 text-sm leading-relaxed text-muted">
                  Payment on this site is never taken through a form, so anything that looks like a
                  checkout link, a payment gateway asking for card details, or a refund “verification”
                  call is not us. The amount and the account come from us, in your booking thread —
                  and if a message ever differs from what is written there, do not pay it, send us the
                  screenshot and we will look immediately.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="border-t border-line bg-ink px-4 py-14 text-ink-fg sm:px-6">
          <div className="mx-auto flex max-w-5xl flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[0.65rem] tracking-[0.24em] text-ink-muted uppercase">
                Press, wholesale, collaborations
              </p>
              <h2 className="mt-3 font-display text-2xl">Say what you have in mind</h2>
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-ink-muted">
                Partnerships, photography and gifting runs are discussed the same way as an order —
                one message, answered by a person. Paid or gifted partnerships are disclosed on the
                affiliations page.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <a
                href={whatsappLink("Namaste! I'd like to discuss a collaboration with Raakha Grace.")}
                target="_blank"
                rel="noreferrer"
                className="rounded-full bg-accent px-5 py-3 text-[0.7rem] tracking-[0.16em] text-ink uppercase transition hover:opacity-90"
              >
                Start the conversation
              </a>
              <Link
                to="/affiliations"
                className="rounded-full border border-white/20 px-5 py-3 text-[0.7rem] tracking-[0.16em] uppercase transition hover:border-accent"
              >
                Affiliations
              </Link>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-4 py-14 sm:px-6">
          <p className="text-[0.65rem] tracking-[0.24em] text-subtle uppercase">Related</p>
          <ul className="mt-4 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-3">
            {[
              { to: "/faq", label: "Frequently asked questions" },
              { to: "/terms", label: "Terms of service" },
              { to: "/privacy", label: "Privacy policy" },
              { to: "/data-protection", label: "Data protection" },
              { to: "/code-of-conduct", label: "Code of conduct" },
              { to: "/about", label: "About the atelier" },
            ].map((l) => (
              <li key={l.to}>
                <Link
                  to={l.to}
                  className="block rounded-lg border border-line bg-surface px-4 py-3 transition-colors hover:border-accent hover:text-accent"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </SiteShell>
  );
}

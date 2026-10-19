import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHero } from "@/components/PageHero";
import { SiteShell } from "@/components/SiteShell";

export const Route = createFileRoute("/community")({ component: Page });

function Page() {
  return (
    <SiteShell>
      <main className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
        <PageHero
          kicker="Together"
          title="Community"
          subtitle="Follow the atelier, share your looks, and reach us when you need a hand with an order or a gift."
        />

        <section>
          <h2 className="font-display text-3xl">Our socials</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            See new drops, behind-the-scenes craft, and customer styling on Instagram. For quick
            order help, WhatsApp is the fastest path to a human reply.
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <a
              href="https://www.instagram.com/raakhagrace/"
              target="_blank"
              rel="noreferrer"
              className="rounded-xl border border-line bg-paper p-6 hover:border-accent"
            >
              <p className="text-[0.65rem] tracking-[0.2em] text-subtle uppercase">Instagram</p>
              <h3 className="mt-2 font-display text-2xl">@raakhagrace</h3>
              <p className="mt-2 text-sm text-muted">
                Daily inspiration, new arrivals, and real customer styling.
              </p>
              <p className="mt-4 text-[0.7rem] tracking-[0.14em] text-accent uppercase">
                Open Instagram →
              </p>
            </a>
            <a
              href="https://wa.me/916304837120"
              target="_blank"
              rel="noreferrer"
              className="rounded-xl border border-line bg-paper p-6 hover:border-accent"
            >
              <p className="text-[0.65rem] tracking-[0.2em] text-subtle uppercase">WhatsApp</p>
              <h3 className="mt-2 font-display text-2xl">+91 63048 37120</h3>
              <p className="mt-2 text-sm text-muted">
                Orders, sizing notes, gift advice, and delivery questions.
              </p>
              <p className="mt-4 text-[0.7rem] tracking-[0.14em] text-accent uppercase">
                Chat on WhatsApp →
              </p>
            </a>
          </div>
        </section>

        <section className="mt-12">
          <h2 className="font-display text-3xl">Share your Raakha Grace</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            Tag <strong className="text-fg">@raakhagrace</strong> or use{" "}
            <strong className="text-fg">#RaakhaGrace</strong> — we love featuring community looks
            (with credit) on our stories.
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-line p-5">
              <p className="text-[0.65rem] tracking-[0.2em] text-subtle uppercase">Tip</p>
              <p className="mt-2 text-sm text-muted">
                Natural light and a simple background make fine jewellery photograph beautifully.
              </p>
            </div>
            <div className="rounded-xl border border-line p-5">
              <p className="text-[0.65rem] tracking-[0.2em] text-subtle uppercase">Creators</p>
              <p className="mt-2 text-sm text-muted">
                For collaborations, message us on Instagram with your audience and style.
              </p>
            </div>
          </div>
        </section>

        <section id="contact" className="mt-12 scroll-mt-24">
          <h2 className="font-display text-3xl">Contact</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            We typically reply within one business day. For order status, include your name and
            order reference if you have one.
          </p>
          <div className="mt-6 space-y-4 rounded-xl border border-line bg-paper p-6 text-sm leading-relaxed text-muted">
            <p>
              <strong className="text-fg">WhatsApp</strong>
              <br />
              +91 63048 37120 ·{" "}
              <a
                className="text-accent underline"
                href="https://wa.me/916304837120"
                target="_blank"
                rel="noreferrer"
              >
                Chat now
              </a>
            </p>
            <p>
              <strong className="text-fg">Instagram DM</strong>
              <br />
              <a
                className="text-accent underline"
                href="https://www.instagram.com/raakhagrace/"
                target="_blank"
                rel="noreferrer"
              >
                @raakhagrace
              </a>
            </p>
            <p>
              <strong className="text-fg">Studio hours</strong>
              <br />
              Monday–Saturday, 10:00–18:00 IST
              <br />
              Sunday — messages answered next business day
            </p>
          </div>
          <p className="mt-8">
            <Link
              to="/about"
              className="rounded-full border border-line px-5 py-3 text-[0.7rem] tracking-[0.16em] uppercase hover:border-fg"
            >
              About the atelier
            </Link>
          </p>
        </section>
      </main>
    </SiteShell>
  );
}

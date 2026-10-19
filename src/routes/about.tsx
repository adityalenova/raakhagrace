import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHero } from "@/components/PageHero";
import { SiteShell } from "@/components/SiteShell";
import { LotusMark } from "@/components/LotusMark";

export const Route = createFileRoute("/about")({ component: Page });

function Page() {
  return (
    <SiteShell>
      <main>
        <section className="mx-auto max-w-3xl px-4 pt-14 sm:px-6">
          <PageHero
            kicker="Our story"
            title="About Raakha Grace"
            subtitle="An atelier devoted to light, handmade jewellery — made to be worn every day and remembered for years."
          />
        </section>
        <section className="mx-auto max-w-5xl px-4 pb-12 sm:px-6">
          <div className="overflow-hidden rounded-xl bg-paper">
            <img
              src="/images/hero-woman.jpg"
              alt="Raakha Grace jewellery"
              className="h-[min(420px,50vh)] w-full object-cover"
            />
          </div>
        </section>
        <section className="mx-auto max-w-3xl px-4 pb-16 sm:px-6">
          <div className="space-y-5 text-sm leading-relaxed text-muted">
            <p>
              Raakha Grace began with a simple idea: jewellery should feel as graceful as it looks.
              We design pieces that sit lightly on the skin, use carefully chosen materials, and
              suit both quiet mornings and celebration evenings.
            </p>
            <h2 className="pt-4 font-display text-3xl text-fg">Our craft</h2>
            <p>
              Every collection is developed with independent makers and small workshops. We favour
              refined silhouettes, premium beads and metals, and finishes that age with character
              rather than fuss. From first sketch to final polish, each piece is meant to move with
              you — not weigh you down.
            </p>
            <div className="grid gap-4 py-4 sm:grid-cols-2">
              {[
                ["Handmade attention", "Finished by hand. Never rushed off a line."],
                ["Daily comfort", "Lightweight silhouettes for all-day wear."],
                ["Thoughtful gifts", "Pieces for milestones that still work on a Tuesday."],
                ["Honest detail", "Clear metals, prices, and product notes."],
              ].map(([t, d]) => (
                <div key={t} className="rounded-lg border border-line bg-surface p-5">
                  <p className="font-medium text-fg">{t}</p>
                  <p className="mt-1">{d}</p>
                </div>
              ))}
            </div>
            <h2 className="pt-4 font-display text-3xl text-fg">The lotus</h2>
            <div className="flex items-start gap-4 rounded-lg border border-line bg-paper p-5">
              <LotusMark className="h-12" />
              <p>
                Our mark is a lotus in gold, cradling a single pearl — a symbol of grace rising,
                quietly, into the light. You will see it on our packaging, our site, and every piece
                that leaves the atelier.
              </p>
            </div>
            <h2 className="pt-4 font-display text-3xl text-fg">Visit & connect</h2>
            <p>
              We ship across India and love hearing how you style your pieces. For sizing help,
              gifts, or collaboration, reach us on WhatsApp or Instagram — real people, not a bot
              queue.
            </p>
            <div className="flex flex-wrap gap-3 pt-4">
              <Link
                to="/jewellery"
                className="rounded-full bg-fg px-5 py-3 text-[0.7rem] tracking-[0.16em] text-bg uppercase"
              >
                Shop jewellery
              </Link>
              <Link
                to="/community"
                hash="contact"
                className="rounded-full border border-line px-5 py-3 text-[0.7rem] tracking-[0.16em] uppercase hover:border-fg"
              >
                Get in touch
              </Link>
            </div>
          </div>
        </section>
      </main>
    </SiteShell>
  );
}

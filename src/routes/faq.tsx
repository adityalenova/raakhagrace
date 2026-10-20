import { createFileRoute, Link } from "@tanstack/react-router";
import { MessageCircle, Sparkles } from "lucide-react";
import { FaqList } from "@/components/FaqList";
import { PageHero } from "@/components/PageHero";
import { SiteShell } from "@/components/SiteShell";
import { FAQ_CATEGORIES, FAQ_GROUPS } from "@/lib/faqs";
import { SITE } from "@/lib/site-knowledge";
import { whatsappLink } from "@/lib/contact";

export const Route = createFileRoute("/faq")({ component: Page });

function Page() {
  return (
    <SiteShell>
      <main>
        <section className="mx-auto max-w-3xl px-4 pt-14 sm:px-6">
          <PageHero
            kicker="Questions"
            title="Frequently asked"
            subtitle="Everything this atelier will and will not do, in plain words — ordering, payment, delivery, the unboxing video, returns, sizing, and what happens to your data. If an answer here costs you a purchase, that is the answer we would rather you had before paying."
          />
        </section>

        <section className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="overflow-hidden rounded-xl bg-paper">
            <img
              src="/images/atelier-still.jpg"
              alt="Beads and gold work in progress at the Raakha Grace bench"
              loading="lazy"
              decoding="async"
              className="h-[min(320px,38vh)] w-full object-cover"
            />
          </div>
        </section>

        <nav aria-label="Question groups" className="mx-auto max-w-3xl px-4 pt-8 sm:px-6">
          <ul className="flex flex-wrap gap-2">
            {FAQ_CATEGORIES.map((c) => (
              <li key={c.id}>
                <a
                  href={`#${c.id}`}
                  className="inline-flex items-center gap-2 rounded-full border border-line px-4 py-2 text-[0.68rem] tracking-[0.14em] text-muted uppercase transition-colors hover:border-accent hover:text-accent"
                >
                  {c.label}
                  <span className="text-[0.62rem] text-subtle">{c.count}</span>
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <section className="mx-auto max-w-3xl px-4 pb-8 sm:px-6">
          <div className="mt-10 space-y-14">
            {FAQ_GROUPS.map((group) => (
              <section key={group.id} id={group.id} className="scroll-mt-24">
                <h2 className="font-display text-2xl sm:text-3xl">{group.label}</h2>
                <p className="mt-2 text-sm text-muted">{group.note}</p>
                <div className="mt-5">
                  <FaqList items={group.items} />
                </div>
              </section>
            ))}
          </div>
        </section>

        <section className="border-y border-line bg-paper py-14">
          <div className="mx-auto max-w-3xl px-4 sm:px-6">
            <p className="text-[0.65rem] tracking-[0.24em] text-subtle uppercase">
              Still not answered
            </p>
            <h2 className="mt-3 font-display text-3xl">Ask a person at the bench</h2>
            <p className="mt-4 text-sm leading-relaxed text-muted">
              These pages cover the rules. A specific piece, a date you are buying for, a size you
              are unsure of — those are answered by whoever is stringing that week, and they answer
              from what is actually in hand. Send a screenshot of the piece you like; it is the
              fastest way to a real reply.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <a
                href={whatsappLink("Namaste! I have a question about a Raakha Grace piece.")}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-fg px-5 py-3 text-[0.7rem] tracking-[0.16em] text-bg uppercase transition hover:opacity-90"
              >
                <MessageCircle className="h-4 w-4" aria-hidden="true" />
                WhatsApp {SITE.whatsapp}
              </a>
              <Link
                to="/terms"
                className="inline-flex items-center gap-2 rounded-full border border-line px-5 py-3 text-[0.7rem] tracking-[0.16em] uppercase hover:border-fg"
              >
                Full terms of service
              </Link>
            </div>
            <p className="mt-6 flex items-center gap-2 text-xs text-subtle">
              <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
              Or open “Shop with AI” in the corner — Grace answers from the catalogue and these same
              pages.
            </p>
          </div>
        </section>
      </main>
    </SiteShell>
  );
}

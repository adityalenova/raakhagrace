import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/LegalPage";
import { SiteShell } from "@/components/SiteShell";
import { TERMS_AT_A_GLANCE, TERMS_SECTIONS, TERMS_UPDATED } from "@/lib/terms";

export const Route = createFileRoute("/terms")({ component: Page });

function Page() {
  return (
    <SiteShell>
      <LegalPage title="Terms of Service" updated={TERMS_UPDATED}>
        <p>
          These terms govern every booking placed with Raakha Grace, whether the enquiry begins on
          WhatsApp, through this website, or by email. By placing an order you accept them in full.
          If you do not accept them, please do not place an order.
        </p>

        <div className="not-prose my-8 rounded-lg border border-line bg-paper px-5 py-4 text-fg">
          <p className="text-[0.65rem] tracking-[0.2em] text-subtle uppercase">Before you order</p>
          <ul className="mt-3 space-y-2 text-sm leading-relaxed">
            {TERMS_AT_A_GLANCE.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </div>

        {TERMS_SECTIONS.map((s) => (
          <section key={s.n}>
            <h2>
              {s.n}. {s.title}
            </h2>
            {s.body.map((para) => (
              <p key={para.slice(0, 32)}>{para}</p>
            ))}
          </section>
        ))}

        <p>
          Orders and enquiries: WhatsApp{" "}
          <a href="https://wa.me/916304837120">+91 63048 37120</a>.
        </p>
        <p>
          Thank you for believing in us. Every piece that leaves the atelier is packed with that in
          mind.
        </p>
      </LegalPage>
    </SiteShell>
  );
}

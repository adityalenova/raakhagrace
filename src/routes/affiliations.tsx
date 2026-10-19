import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/LegalPage";
import { SiteShell } from "@/components/SiteShell";

export const Route = createFileRoute("/affiliations")({ component: Page });

function Page() {
  return (
    <SiteShell>
      <LegalPage title="Affiliations" kicker="The house" updated="28 August 2026">
        <p>
          Raakha Grace is an independent jewellery house. We are not a subsidiary, franchise, or authorised retailer of any
          other brand. This page exists so you know who we are — and who we are not.
        </p>
        <h2>Independence</h2>
        <p>
          We are not affiliated with ORRA, Graff, or any other retailer whose visual language, photography, or category
          structure may have inspired this storefront. Names, marks, and collections on those sites remain theirs. Ours is
          the lotus, the name Raakha Grace, and the pieces listed here.
        </p>
        <h2>Makers and materials</h2>
        <p>
          We work with independent makers and small workshops. Hallmarking, diamond certification, and artisan credits are
          listed on each product invoice. If a stone is laboratory-grown or a metal is plated, the product page will say so.
        </p>
        <h2>Partnerships</h2>
        <p>
          From time to time we may collaborate with photographers, stylists, or charities. Paid or gifted partnerships will
          be disclosed here and on the relevant post. We do not run undisclosed affiliate programmes on this site today.
        </p>
        <h2>Press and wholesale</h2>
        <p>
          For press kits, wholesale, or collaboration, write on Instagram{" "}
          <a href="https://www.instagram.com/raakhagrace/">@raakhagrace</a> or WhatsApp{" "}
          <a href="https://wa.me/6304837120">6304837120</a>.
        </p>
        <h2>The mark</h2>
        <p>
          The lotus symbol and the words “Raakha Grace” identify this atelier. Please do not use them on packaging, social
          accounts, or another shop without our written consent.
        </p>
      </LegalPage>
    </SiteShell>
  );
}

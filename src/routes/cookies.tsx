import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/LegalPage";
import { SiteShell } from "@/components/SiteShell";

export const Route = createFileRoute("/cookies")({ component: Page });

function Page() {
  return (
    <SiteShell>
      <LegalPage title="Cookie Policy" updated="28 August 2026">
        <p>
          This page explains the small files and browser storage Raakha Grace uses so the shop can remember you, your cart,
          and a few preferences. We do not run advertising cookies.
        </p>
        <h2>What we use</h2>
        <ul>
          <li>
            <strong>Session / authentication cookies</strong> — keep you signed in after Google, X, or email login. Strictly
            necessary.
          </li>
          <li>
            <strong>Local storage (cart)</strong> — remembers pieces you add before checkout, including as a guest.
          </li>
          <li>
            <strong>Session storage (intro)</strong> — shows the opening overlay once per visit so it does not repeat on
            every click.
          </li>
          <li>
            <strong>Local storage (welcome)</strong> — remembers that you have seen the welcome note.
          </li>
        </ul>
        <h2>Optional tools</h2>
        <p>
          If we add aggregated analytics later, they will be listed here and will not be used to build an advertising
          profile. Today, none are active.
        </p>
        <h2>How to control them</h2>
        <p>
          You can clear cookies and site data in your browser settings. Doing so will sign you out, empty a guest cart, and
          show the intro and welcome again. Blocking all cookies may stop sign-in from working.
        </p>
        <h2>More</h2>
        <p>
          How we handle personal data is in the <a href="/privacy">Privacy Policy</a>. Questions: WhatsApp{" "}
          <a href="https://wa.me/6304837120">6304837120</a>.
        </p>
      </LegalPage>
    </SiteShell>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/LegalPage";
import { SiteShell } from "@/components/SiteShell";
import { SITE } from "@/lib/site-knowledge";

export const Route = createFileRoute("/cookie-information")({ component: Page });

/**
 * Every cookie and storage key this app actually writes, taken from the source
 * rather than from a template. The names live in `lib/auth/server.ts` (the four
 * `__Host-grok-auth.*` cookies) and in the three persisted zustand stores
 * (`raakha-cart`, `raakha-wish`, `raakha-catalog`) plus `lib/auth/guest.ts` and
 * `components/LaunchFlow.tsx`. The one exception is `__va_attribution`, written
 * by the page-view counter in `routes/__root.tsx` — checked against the script
 * it loads, which sets no cookie. If a new one appears, it belongs in this table.
 */
const COOKIES: { name: string; what: string; lasts: string }[] = [
  {
    name: "__Host-grok-auth.session_token",
    what: "Keeps you signed in after Google or email sign-in. HttpOnly, Secure, SameSite=Lax, path /, no domain attribute — a host-only cookie, so no other site can read it and no sibling site can write it.",
    lasts: "Until you sign out or close the browser",
  },
  {
    name: "__Host-grok-auth.session_data",
    what: "A short cache of your session, so a page load does not have to ask the database who you are every time. Contains no password and no card data.",
    lasts: "5 minutes, then refreshed",
  },
  {
    name: "__Host-grok-auth.account_data",
    what: "Remembers which sign-in method to offer you on the login page.",
    lasts: "Until you sign out",
  },
  {
    name: "__Host-grok-auth.dont_remember",
    what: "Set only if you choose not to be remembered, so the site stops trying.",
    lasts: "Until you clear it",
  },
  {
    name: "OAuth state cookie",
    what: "Exists for a few seconds during Google sign-in — it carries the state and PKCE values that prove the response coming back to us came from the sign-in you started. It is gone the moment you land back here.",
    lasts: "The length of the sign-in redirect",
  },
];

const STORAGE: { name: string; where: string; what: string }[] = [
  {
    name: "raakha-cart",
    where: "localStorage",
    what: "The pieces in your cart, including while you are browsing as a guest, so a reload does not empty it.",
  },
  {
    name: "raakha-wish",
    where: "localStorage",
    what: "Pieces you chose to save for later.",
  },
  {
    name: "raakha-catalog",
    where: "localStorage",
    what: "Working edits to the catalogue made from the atelier desk, kept in the browser until they are written to the shop database. A customer browsing the shop never writes to this key.",
  },
  {
    name: "rg-welcome",
    where: "sessionStorage",
    what: "Marks that you have already seen the opening note on this visit, so it does not repeat on every click.",
  },
  {
    name: "rg-guest-session",
    where: "sessionStorage",
    what: "A temporary, local-only id for “continue as guest”, so a cart and a booking reference can be tied to your visit without an account. Contains no name, email or phone number.",
  },
  {
    name: "grok-auth.bearer-token",
    where: "sessionStorage",
    what: "The sign-in token, used instead of a cookie when this site is opened inside an embedded frame where cookies are partitioned. Cleared when the tab closes.",
  },
  {
    name: "__va_attribution",
    where: "localStorage",
    what: "Written by the page-view counter, not by us. If you arrive from a search result or a link carrying campaign tags, it holds those tags for a short while so the visit can be counted against the right source. It stores no name, email, phone number or cart contents, and the key itself stays in your browser — what is sent away is the page view, counted anonymously to Vercel, which hosts the shop. The counter sets no cookie at all, which is why it does not appear in the table above.",
  },
];

/**
 * Both tables name things — a cookie, a storage key — and a name broken across
 * four lines is no longer a name. `.table-scroll` in styles.css keeps them on one
 * line and lets the table slide sideways on a phone instead of squeezing it.
 */
function CookieTable() {
  return (
    <div className="table-scroll">
      <table>
        <caption>Name · What it does · How long it stays</caption>
        <thead>
          <tr>
            <th scope="col">Cookie</th>
            <th scope="col">What it does</th>
            <th scope="col">Lifespan</th>
          </tr>
        </thead>
        <tbody>
          {COOKIES.map((c) => (
            <tr key={c.name}>
              <td>
                <code className="text-fg">{c.name}</code>
              </td>
              <td>{c.what}</td>
              <td className="whitespace-nowrap">{c.lasts}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function StorageTable() {
  return (
    <div className="table-scroll">
      <table>
        <caption>Key · Where it lives · What it holds</caption>
        <thead>
          <tr>
            <th scope="col">Storage key</th>
            <th scope="col">Where</th>
            <th scope="col">What it holds</th>
          </tr>
        </thead>
        <tbody>
          {STORAGE.map((s) => (
            <tr key={s.name}>
              <td>
                <code className="text-fg">{s.name}</code>
              </td>
              <td className="whitespace-nowrap">{s.where}</td>
              <td>{s.what}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Page() {
  return (
    <SiteShell>
      <LegalPage
        title="Cookie information"
        kicker="Your data"
        updated="20 October 2026"
        wide
        image="/images/nav-atelier.jpg"
        imageAlt="The Raakha Grace workroom"
        toc={[
          { href: "#summary", label: "The short version" },
          { href: "#categories", label: "Which categories we use" },
          { href: "#cookies-we-set", label: "The cookies we set" },
          { href: "#storage", label: "Browser storage we use" },
          { href: "#third-party", label: "Other sites' cookies" },
          { href: "#controlling", label: "How to control them" },
          { href: "#more", label: "Questions" },
        ]}
      >
        <h2 id="summary">The short version</h2>
        <p>
          This site sets a small number of cookies, all of them strictly necessary to sign you in,
          keep your cart, and show you the pages you asked for.{" "}
          <strong>There are no advertising cookies, no tracking cookies, and no profiling.</strong>{" "}
          We do not run a marketing pixel, we do not send your browsing to an ad network, and we do
          not build an advertising profile of you. If that ever changes, this page changes first and
          asks you before it happens.
        </p>
        <p>
          The tables below name every cookie and every browser storage key this application writes,
          taken from the code that writes them — not from a generic policy template.
        </p>

        <h2 id="categories">Which categories we use</h2>
        <p>Cookie law groups cookies by what they are for. Here is where this site sits:</p>
        <ul>
          <li>
            <strong>Strictly necessary — yes.</strong> Sign-in, session integrity, and the cart.
            Without these the shop cannot tell who is ordering, and your cart empties on every
            reload. These do not require your consent, and there is no switch for them.
          </li>
          <li>
            <strong>Functional / preferences — a little.</strong> The opening note and the guest
            session, both kept in browser storage rather than cookies, both cleared by you at any
            time.
          </li>
          <li>
            <strong>Analytics / performance — none.</strong> No measurement cookie is set by this
            site today. What we count about the shop is counted from orders and bookings in our own
            database, not from tracking visitors.
          </li>
          <li>
            <strong>Advertising / targeting — none, and not planned.</strong> We do not buy
            advertising audiences and we do not sell what you look at.
          </li>
        </ul>

        <h2 id="cookies-we-set">The cookies we set</h2>
        <CookieTable />
        <p className="mt-4">
          Two things worth naming plainly. The <code>__Host-</code> prefix is deliberate: it tells
          your browser to reject any cookie for these names that carries a domain attribute, which
          means no other website can plant or read a session cookie here. And{" "}
          <code>session_token</code> is HttpOnly — a script on this page, including ours, cannot
          read it.
        </p>

        <h2 id="storage">Browser storage we use</h2>
        <p>
          Cookies are not the only thing a browser keeps. These keys live in your own browser's
          storage, are never sent to us on every request, and are yours to delete.
        </p>
        <StorageTable />

        <h2 id="third-party">Cookies other sites set</h2>
        <p>
          When you sign in with Google, you visit Google's own pages for a moment, and Google sets
          cookies on its own domain to do that. We neither control nor read them; their handling is
          described by Google, and our{" "}
          <a href="/data-protection">data protection page</a> says what we receive back: your name,
          email, and profile picture.
        </p>
        <p>
          Images, fonts and scripts are served by us — this site does not pull in a third-party
          content widget, chat badge, or map embed, so there is nothing else writing to your browser
          from a partner's domain.
        </p>

        <h2 id="controlling">How to control them</h2>
        <p>
          Your browser settings let you block or delete cookies, and “clear site data” removes the
          storage keys above in one action. Doing so signs you out, empties a guest cart, forgets
          what you saved for later, and brings the opening note back. Blocking the session cookie
          altogether means sign-in cannot work, and an order you started while signed out will not
          appear in an account list.
        </p>
        <p>
          There is no consent banner on this site because there is nothing to consent to beyond the
          strictly necessary. That is a promise about this page being accurate, and we would rather
          keep it than earn a banner.
        </p>

        <h2 id="more">Questions</h2>
        <p>
          How personal data is handled is on the <a href="/privacy">privacy policy</a> and the{" "}
          <a href="/data-protection">data protection page</a>. To ask what we hold about you, or to
          ask us to delete it, write to us on WhatsApp at {SITE.whatsapp} — we answer within one
          working day.
        </p>
      </LegalPage>
    </SiteShell>
  );
}

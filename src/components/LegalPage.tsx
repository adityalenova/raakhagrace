import type { ReactNode } from "react";

/**
 * The house style for a page that explains something rather than sells it.
 *
 * `/privacy`, `/terms`, `/cookies` and the information pages all share it, so a
 * customer moving between policies sees one voice and one layout. Everything
 * past `title` is optional — the original three pages pass nothing new and are
 * unchanged.
 *
 * `children` are bare `<h2>/<h3>/<p>/<ul>/<ol>/<table>` elements; they are
 * styled by the `.prose-legal` rules in styles.css, not by utility classes, so
 * the copy reads like a document instead of a pile of divs.
 */
export function LegalPage({
  title,
  kicker = "Policies",
  updated,
  image,
  imageAlt,
  wide = false,
  toc,
  children,
}: {
  title: string;
  kicker?: string;
  updated?: string;
  /** Photograph across the top, for the pages that are read once and believed. */
  image?: string;
  imageAlt?: string;
  /** 4xl instead of 3xl — for pages with tables and figures. */
  wide?: boolean;
  /** Anchor list rendered as "On this page". Each `href` needs a matching `<h2 id>`. */
  toc?: { href: string; label: string }[];
  children: ReactNode;
}) {
  const shell = wide ? "mx-auto max-w-4xl" : "mx-auto max-w-3xl";

  return (
    <main className={`${shell} px-4 py-16 sm:px-6`}>
      <p className="text-[0.68rem] tracking-[0.28em] text-subtle uppercase">{kicker}</p>
      <h1 className="mt-3 font-display text-4xl sm:text-5xl">{title}</h1>
      {updated ? <p className="mt-3 text-sm text-muted">Last updated {updated}</p> : null}

      {image ? (
        <div className="mt-8 overflow-hidden rounded-xl border border-line bg-surface">
          <img
            src={image}
            alt={imageAlt ?? ""}
            loading="lazy"
            decoding="async"
            className="h-[min(320px,40vh)] w-full object-cover object-[50%_45%]"
          />
        </div>
      ) : null}

      {toc?.length ? (
        <nav
          aria-label="On this page"
          className="mt-8 rounded-lg border border-line bg-surface px-5 py-4"
        >
          <p className="text-[0.62rem] tracking-[0.2em] text-subtle uppercase">On this page</p>
          <ol className="mt-3 grid gap-x-6 gap-y-1.5 text-sm sm:grid-cols-2">
            {toc.map((s) => (
              <li key={s.href}>
                <a href={s.href} className="text-muted transition-colors hover:text-accent">
                  {s.label}
                </a>
              </li>
            ))}
          </ol>
        </nav>
      ) : null}

      <div className="prose-legal mt-8 space-y-4 text-sm leading-relaxed text-muted">
        {children}
      </div>
    </main>
  );
}

/**
 * The box for the three or four things a customer must not miss. Used by the
 * terms page and the conduct page; the `not-prose` class opts it out of the
 * `.prose-legal` list rules.
 */
export function LegalCallout({
  label,
  points,
  tone = "paper",
}: {
  label: string;
  points: string[];
  tone?: "paper" | "accent";
}) {
  return (
    <div
      className={`not-prose my-8 rounded-lg border px-5 py-4 text-fg ${
        tone === "accent" ? "border-accent/40 bg-accent/5" : "border-line bg-paper"
      }`}
    >
      <p className="text-[0.65rem] tracking-[0.2em] text-subtle uppercase">{label}</p>
      <ul className="mt-3 space-y-2 text-sm leading-relaxed">
        {points.map((p) => (
          <li key={p}>{p}</li>
        ))}
      </ul>
    </div>
  );
}

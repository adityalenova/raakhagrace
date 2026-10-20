import { Link } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import type { Faq } from "@/lib/faqs";

/**
 * Native `<details>`, not a state toggle.
 *
 * Nothing to hydrate, so the open/closed markup is identical on the server and
 * in the browser; it works before JS arrives and for a keyboard or screen-reader
 * user with no extra wiring. The chevron is a plus that turns into a cross in
 * CSS (`.faq-item` in styles.css), because `group-open:` is not something to
 * bet a build on.
 */
export function FaqItem({ item }: { item: Faq }) {
  return (
    <details className="faq-item border-b border-line py-1">
      <summary className="flex cursor-pointer list-none items-start gap-4 py-4 text-left font-display text-lg text-fg marker:hidden sm:text-xl">
        <span className="flex-1">{item.q}</span>
        <Plus className="mt-1 h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
      </summary>
      <div className="pb-5 pr-8 text-sm leading-relaxed text-muted">
        <p>{item.a}</p>
        {item.to ? (
          <Link
            to={item.to.href}
            className="mt-3 inline-block text-[0.7rem] tracking-[0.16em] text-accent uppercase hover:underline"
          >
            {item.to.label}
          </Link>
        ) : null}
      </div>
    </details>
  );
}

export function FaqList({ items }: { items: Faq[] }) {
  return (
    <div>
      {items.map((item) => (
        <FaqItem key={item.q} item={item} />
      ))}
    </div>
  );
}

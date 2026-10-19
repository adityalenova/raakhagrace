import type { ReactNode } from "react";

export function LegalPage({
  title,
  kicker = "Policies",
  updated,
  children,
}: {
  title: string;
  kicker?: string;
  updated?: string;
  children: ReactNode;
}) {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <p className="text-[0.68rem] tracking-[0.28em] text-subtle uppercase">{kicker}</p>
      <h1 className="mt-3 font-display text-4xl sm:text-5xl">{title}</h1>
      {updated ? <p className="mt-3 text-sm text-muted">Last updated {updated}</p> : null}
      <div className="prose-legal mt-8 space-y-4 text-sm leading-relaxed text-muted">{children}</div>
    </main>
  );
}

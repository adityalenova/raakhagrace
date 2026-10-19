import { createFileRoute } from "@tanstack/react-router";
import { CatalogPage } from "@/components/CatalogPage";
import { SiteShell } from "@/components/SiteShell";
import { useProductList } from "@/lib/catalog-store";
import { OCCASIONS, productsByOccasion } from "@/lib/products";

type Search = { occasion?: string };

export const Route = createFileRoute("/gifts")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    occasion: typeof s.occasion === "string" ? s.occasion : undefined,
  }),
  component: Page,
});

function Page() {
  const { occasion } = Route.useSearch();
  const catalog = useProductList();
  // No piece is "not a gift" — everything leaves the atelier in gift-ready
  // packaging — so the unfiltered Gifts page shows the whole bench rather than
  // a collection tag that no product carries.
  const match = OCCASIONS.find((o) => o.slug === occasion);
  const products = occasion ? productsByOccasion(occasion, catalog) : catalog;
  const title = match?.label ?? "Gifts";
  return (
    <SiteShell>
      <CatalogPage
        kicker="For someone"
        title={title}
        subtitle="Extraordinary gifts for birthdays, vows, and the days in between — wrapped as if they left our hands, not a warehouse."
        hero={match?.image ?? "/images/occ-birthday.jpg"}
        products={products}
        chips={[
          { label: "All gifts", href: "/gifts", active: !occasion },
          ...OCCASIONS.map((o) => ({
            label: o.label,
            href: `/gifts?occasion=${o.slug}`,
            active: occasion === o.slug,
          })),
        ]}
      />
    </SiteShell>
  );
}

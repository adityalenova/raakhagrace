import { createFileRoute } from "@tanstack/react-router";
import { CatalogPage } from "@/components/CatalogPage";
import { SiteShell } from "@/components/SiteShell";
import { useProductList } from "@/lib/catalog-store";
import { OCCASIONS, productsByCollection, productsByOccasion } from "@/lib/products";

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
  const filtered = occasion ? productsByOccasion(occasion, catalog) : productsByCollection("gifts", catalog);
  const products = filtered.length ? filtered : productsByCollection("gifts", catalog);
  const title = occasion ? occasion[0].toUpperCase() + occasion.slice(1) : "Gifts";
  return (
    <SiteShell>
      <CatalogPage
        kicker="For someone"
        title={title}
        subtitle="Extraordinary gifts for birthdays, vows, and the days in between — wrapped as if they left our hands, not a warehouse."
        hero="/images/occ-birthday.jpg"
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

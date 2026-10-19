import { createFileRoute } from "@tanstack/react-router";
import { CatalogPage } from "@/components/CatalogPage";
import { SiteShell } from "@/components/SiteShell";
import { useProductList } from "@/lib/catalog-store";
import { CATEGORIES, productsByCategory } from "@/lib/products";

type Search = { category?: string };

export const Route = createFileRoute("/jewellery")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    category: typeof s.category === "string" ? s.category : undefined,
  }),
  component: Page,
});

function Page() {
  const { category } = Route.useSearch();
  const catalog = useProductList();
  const products = category ? productsByCategory(category, catalog) : catalog;
  const title = category ? category[0].toUpperCase() + category.slice(1) : "Jewellery";
  return (
    <SiteShell>
      <CatalogPage
        kicker="The collection"
        title={title}
        subtitle="Certified craft, contemporary lines, and pieces that move with you — from a quiet Tuesday to a night you will remember."
        hero="/images/hero-woman.jpg"
        products={products}
        chips={[
          { label: "All", href: "/jewellery", active: !category },
          ...CATEGORIES.map((c) => ({
            label: c.label,
            href: `/jewellery?category=${c.slug}`,
            active: category === c.slug,
          })),
        ]}
      />
    </SiteShell>
  );
}

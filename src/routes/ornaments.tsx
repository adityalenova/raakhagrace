import { createFileRoute } from "@tanstack/react-router";
import { CatalogPage } from "@/components/CatalogPage";
import { SiteShell } from "@/components/SiteShell";
import { useProductList } from "@/lib/catalog-store";
import { CATEGORIES, productsByCategory, productsByCollection } from "@/lib/products";

type Search = { category?: string };

export const Route = createFileRoute("/ornaments")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    category: typeof s.category === "string" ? s.category : undefined,
  }),
  component: Page,
});

function Page() {
  const { category } = Route.useSearch();
  const catalog = useProductList();
  const collection = productsByCollection("ornaments", catalog);
  const filtered = category ? productsByCategory(category, collection) : collection;
  const products = filtered.length ? filtered : collection;
  const label = CATEGORIES.find((c) => c.slug === category)?.label;
  const title = category && label ? label : "Ornaments";

  return (
    <SiteShell>
      <CatalogPage
        kicker="Ceremony"
        title={title}
        subtitle="Ceremonial pieces with a lighter hand — mangalsutra, bridal sets, and heirloom gold designed to photograph well and still feel liveable."
        hero="/images/occ-wedding.jpg"
        heroAlt="A bride and groom at the mandap, her kundan set and bangles in light"
        heroFocus="50% 32%"
        products={products}
        chips={[
          { label: "All", href: "/ornaments", active: !category },
          ...CATEGORIES.map((c) => ({
            label: c.label,
            href: `/ornaments?category=${c.slug}`,
            active: category === c.slug,
          })),
        ]}
      />
    </SiteShell>
  );
}

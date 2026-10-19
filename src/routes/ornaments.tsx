import { createFileRoute } from "@tanstack/react-router";
import { CatalogPage } from "@/components/CatalogPage";
import { SiteShell } from "@/components/SiteShell";
import { useProductList } from "@/lib/catalog-store";
import { productsByCollection } from "@/lib/products";

export const Route = createFileRoute("/ornaments")({ component: Page });

function Page() {
  const catalog = useProductList();
  return (
    <SiteShell>
      <CatalogPage
        kicker="Ceremony"
        title="Ornaments"
        subtitle="Ceremonial pieces with a lighter hand — mangalsutra, bridal sets, and heirloom gold designed to photograph well and still feel liveable."
        hero="/images/occ-wedding.jpg"
        products={productsByCollection("ornaments", catalog)}
      />
    </SiteShell>
  );
}

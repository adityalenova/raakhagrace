import { createFileRoute } from "@tanstack/react-router";
import { CatalogPage } from "@/components/CatalogPage";
import { SiteShell } from "@/components/SiteShell";
import { useProductList } from "@/lib/catalog-store";
import { productsByWear } from "@/lib/products";

export const Route = createFileRoute("/specials")({ component: Page });

function Page() {
  const catalog = useProductList();
  return (
    <SiteShell>
      <CatalogPage
        kicker="This season"
        title="Specials"
        subtitle="Statement pieces and atelier offers — halos, cascades, and ceremonial gold with a lighter hand. Look for the struck-through price where a piece is on offer."
        hero="/images/hero-pendant.jpg"
        products={productsByWear("special", catalog)}
      />
    </SiteShell>
  );
}

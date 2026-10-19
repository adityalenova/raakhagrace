import { createFileRoute } from "@tanstack/react-router";
import { CatalogPage } from "@/components/CatalogPage";
import { SiteShell } from "@/components/SiteShell";
import { useProductList } from "@/lib/catalog-store";
import { productsByWear } from "@/lib/products";

export const Route = createFileRoute("/daily-wear")({ component: Page });

function Page() {
  const catalog = useProductList();
  return (
    <SiteShell>
      <CatalogPage
        kicker="Every day"
        title="Daily Wear"
        subtitle="Light enough to forget, fine enough to remember — hoops, pendants, and quiet rings made for Tuesdays as much as celebrations."
        hero="/images/cat-earrings.jpg"
        products={productsByWear("daily", catalog)}
      />
    </SiteShell>
  );
}

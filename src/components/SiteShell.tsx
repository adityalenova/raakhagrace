import type { ReactNode } from "react";
import { Footer } from "./Footer";
import { Header } from "./Header";
import { LaunchFlow } from "./LaunchFlow";
import { ShopAi } from "./ShopAi";

export function SiteShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-bg text-fg">
      <LaunchFlow />
      <Header />
      {children}
      <Footer />
      <ShopAi />
    </div>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { HomePage } from "@/components/HomePage";
import { SiteShell } from "@/components/SiteShell";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return (
    <SiteShell>
      <HomePage />
    </SiteShell>
  );
}

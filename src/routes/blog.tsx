import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHero } from "@/components/PageHero";
import { SiteShell } from "@/components/SiteShell";
import { JOURNAL } from "@/lib/journal";

export const Route = createFileRoute("/blog")({ component: Page });

function Page() {
  return (
    <SiteShell>
      <main className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <PageHero
          kicker="Journal"
          title="From the atelier"
          subtitle="Stories from the bench, styling notes, and quiet inspiration — written for the way you actually wear jewellery."
        />
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {JOURNAL.map((post) => (
            <Link
              key={post.slug}
              to="/blog/$slug"
              params={{ slug: post.slug }}
              className="group overflow-hidden rounded-xl border border-line bg-surface"
            >
              <img
                src={post.image}
                alt=""
                className="h-52 w-full object-cover transition duration-500 group-hover:scale-[1.03]"
              />
              <div className="p-5">
                <p className="text-[0.65rem] tracking-[0.2em] text-subtle uppercase">
                  {post.kicker} · {post.minutes} min read
                </p>
                <h2 className="mt-2 font-display text-2xl leading-tight">{post.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-muted">{post.excerpt}</p>
              </div>
            </Link>
          ))}
        </div>
        <p className="mt-12 text-center text-sm text-muted">
          More notes soon. Follow{" "}
          <a
            className="text-accent underline"
            href="https://www.instagram.com/raakhagrace/"
            target="_blank"
            rel="noreferrer"
          >
            @raakhagrace
          </a>{" "}
          for daily drops.
        </p>
      </main>
    </SiteShell>
  );
}

import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { SiteShell } from "@/components/SiteShell";
import { getPost } from "@/lib/journal";

export const Route = createFileRoute("/blog/$slug")({
  component: Page,
});

function Page() {
  const { slug } = Route.useParams();
  const post = getPost(slug);
  if (!post) throw notFound();

  return (
    <SiteShell>
      <article className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
        <p className="text-[0.65rem] tracking-[0.22em] text-subtle uppercase">
          {post.kicker} · {post.minutes} min read
        </p>
        <h1 className="mt-3 font-display text-4xl leading-tight sm:text-5xl">{post.title}</h1>
        <p className="mt-4 text-lg text-muted">{post.excerpt}</p>
        <img src={post.image} alt="" className="mt-8 h-[min(420px,50vh)] w-full rounded-xl object-cover" />
        <div className="mt-10 space-y-4 text-sm leading-relaxed text-muted">
          {post.body.map((p) => (
            <p key={p.slice(0, 24)}>{p}</p>
          ))}
        </div>
        <p className="mt-12">
          <Link to="/blog" className="text-sm tracking-[0.12em] text-accent uppercase">
            ← All journal notes
          </Link>
        </p>
      </article>
    </SiteShell>
  );
}

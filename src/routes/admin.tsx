import { createFileRoute, Link } from "@tanstack/react-router";
import {
  AlertTriangle,
  Boxes,
  CircleDollarSign,
  PencilLine,
  Search,
  Undo2,
} from "lucide-react";
import { useMemo, useState, type FormEvent } from "react";
import { LotusMark } from "@/components/LotusMark";
import { SiteShell } from "@/components/SiteShell";
import { adminStatus } from "@/lib/auth-status";
import { signOut } from "@/lib/auth/client";
import { useCatalog, useProductList } from "@/lib/catalog-store";
import { CATEGORIES, type Product } from "@/lib/products";
import { cn, formatInr } from "@/lib/utils";

export const Route = createFileRoute("/admin")({
  // Decided on the server from the session cookie, so the gate cannot be
  // bypassed by editing browser state.
  loader: () => adminStatus(),
  component: Page,
});

const COLLECTION_TABS = [
  { key: "all", label: "Everything" },
  { key: "jewellery", label: "Jewellery" },
  { key: "ornaments", label: "Ornaments" },
  { key: "gifts", label: "Gifts" },
] as const;

function Page() {
  const status = Route.useLoaderData();
  const [editing, setEditing] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<(typeof COLLECTION_TABS)[number]["key"]>("all");
  const list = useProductList();
  const overrides = useCatalog((s) => s.overrides);
  const upsert = useCatalog((s) => s.upsert);
  const reset = useCatalog((s) => s.reset);
  const resetAll = useCatalog((s) => s.resetAll);

  const stats = useMemo(() => {
    const low = list.filter((p) => p.stock > 0 && p.stock <= 5);
    const out = list.filter((p) => p.stock === 0);
    const value = list.reduce((sum, p) => sum + p.price * p.stock, 0);
    return {
      pieces: list.length,
      edited: Object.keys(overrides).length,
      low: low.length,
      out: out.length,
      value,
    };
  }, [list, overrides]);

  const shown = useMemo(() => {
    const t = query.trim().toLowerCase();
    return list.filter((p) => {
      if (tab !== "all" && p.collection !== tab) return false;
      if (!t) return true;
      return (
        p.name.toLowerCase().includes(t) ||
        p.sku.toLowerCase().includes(t) ||
        p.category.includes(t)
      );
    });
  }, [list, query, tab]);

  if (!status.allowed) {
    return (
      <SiteShell>
        <main className="mx-auto max-w-md px-4 py-16">
          <LotusMark className="h-10" />
          <h1 className="mt-4 font-display text-4xl">Atelier admin</h1>
          <p className="mt-2 text-sm text-muted">
            {status.email
              ? `${status.email} is not on the admin allowlist. Sign in with an address listed in ADMIN_EMAILS.`
              : status.configured
                ? "Sign in with Google using an address on the admin allowlist."
                : "Admin access is not configured yet — set ADMIN_EMAILS on the deployment to allow your Google address."}
          </p>
          <Link
            to="/login"
            className="mt-8 inline-flex h-12 items-center rounded-md bg-fg px-6 text-sm tracking-[0.16em] text-bg uppercase"
          >
            Sign in to continue
          </Link>
        </main>
      </SiteShell>
    );
  }

  const current = list.find((p) => p.id === editing);

  return (
    <SiteShell>
      <main className="pb-20">
        <section className="relative overflow-hidden bg-ink">
          <div className="mx-auto flex max-w-6xl flex-wrap items-end justify-between gap-6 px-4 py-10 sm:px-6 sm:py-12">
            <div>
              <p className="text-[0.65rem] tracking-[0.3em] text-ink-muted uppercase">
                Atelier control
              </p>
              <h1 className="mt-3 font-display text-4xl text-ink-fg sm:text-5xl">
                Product dashboard
              </h1>
              <p className="mt-2 text-sm text-ink-muted">
                {status.email ?? "Signed in"} · edits save to this browser
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => resetAll()}
                className="flex h-11 items-center gap-2 rounded-md border border-ink-muted/40 px-4 text-[0.68rem] tracking-[0.16em] text-ink-fg uppercase transition hover:border-ink-muted"
              >
                <Undo2 className="h-4 w-4" /> Reset to seed
              </button>
              <button
                type="button"
                onClick={() => void signOut("/")}
                className="h-11 rounded-md bg-ink-fg px-4 text-[0.68rem] tracking-[0.16em] text-ink uppercase"
              >
                Sign out
              </button>
            </div>
          </div>
          <LotusMark className="pointer-events-none absolute -right-8 -top-10 h-48 opacity-[0.07]" />
        </section>

        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <section className="-mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Stat icon={Boxes} label="Pieces listed" value={String(stats.pieces)} />
            <Stat
              icon={PencilLine}
              label="Edited from seed"
              value={String(stats.edited)}
              tone={stats.edited ? "warn" : "ok"}
            />
            <Stat
              icon={AlertTriangle}
              label="Low or out of stock"
              value={`${stats.low + stats.out}`}
              hint={stats.out ? `${stats.out} sold out` : "nothing sold out"}
              tone={stats.low + stats.out ? "warn" : "ok"}
            />
            <Stat
              icon={CircleDollarSign}
              label="Stock value"
              value={formatInr(stats.value)}
              hint="at listed prices"
            />
          </section>

          {current ? (
            <Editor
              product={current}
              onCancel={() => setEditing(null)}
              onSave={(patch) => {
                upsert(current.id, patch);
                setEditing(null);
              }}
              onReset={() => {
                reset(current.id);
                setEditing(null);
              }}
            />
          ) : (
            <>
              <div className="mt-10 flex flex-wrap items-center gap-3">
                <label className="relative flex-1 min-w-56">
                  <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-subtle" />
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search by name, SKU or category"
                    className="h-12 w-full rounded-md border border-line bg-surface pl-11 pr-4 text-sm outline-none focus:border-accent"
                  />
                </label>
                <div className="flex flex-wrap gap-2">
                  {COLLECTION_TABS.map((t) => (
                    <button
                      key={t.key}
                      type="button"
                      onClick={() => setTab(t.key)}
                      className={cn(
                        "h-10 rounded-full border px-4 text-[0.66rem] tracking-[0.14em] uppercase transition",
                        tab === t.key
                          ? "border-fg bg-fg text-bg"
                          : "border-line bg-surface hover:border-accent",
                      )}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {shown.length === 0 ? (
                <p className="mt-10 rounded-xl border border-dashed border-line px-6 py-12 text-center text-sm text-muted">
                  No pieces match that search.
                </p>
              ) : (
                <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {shown.map((p) => {
                    const edited = Boolean(overrides[p.id]);
                    const label = CATEGORIES.find((c) => c.slug === p.category)?.label ?? p.category;
                    return (
                      <li
                        key={p.id}
                        className="group overflow-hidden rounded-xl border border-line bg-surface transition hover:border-accent/50"
                      >
                        <div className="flex gap-4 p-4">
                          <img
                            src={p.image}
                            alt=""
                            className="h-24 w-20 shrink-0 rounded-md object-cover"
                          />
                          <div className="min-w-0 flex-1">
                            <p className="line-clamp-2 font-display text-lg leading-snug">
                              {p.name}
                            </p>
                            <p className="mt-1 truncate text-xs text-subtle">{p.sku}</p>
                            <p className="mt-2 text-sm tabular-nums">{formatInr(p.price)}</p>
                            <p className="mt-1 text-[0.66rem] tracking-[0.14em] text-muted uppercase">
                              {label} · {p.collection}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between gap-3 border-t border-line px-4 py-3">
                          <StockBadge stock={p.stock} edited={edited} />
                          <div className="flex items-center gap-2">
                            <Link
                              to="/product/$id"
                              params={{ id: p.id }}
                              className="text-[0.66rem] tracking-[0.14em] text-muted uppercase underline-offset-4 hover:underline"
                            >
                              View
                            </Link>
                            <button
                              type="button"
                              onClick={() => setEditing(p.id)}
                              className="rounded-full border border-line px-4 py-2 text-[0.66rem] tracking-[0.14em] uppercase transition hover:border-fg"
                            >
                              Edit
                            </button>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </>
          )}
        </div>
      </main>
    </SiteShell>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
  hint,
  tone = "ok",
}: {
  icon: typeof Boxes;
  label: string;
  value: string;
  hint?: string;
  tone?: "ok" | "warn";
}) {
  return (
    <div className="rounded-xl border border-line bg-surface p-5 shadow-[0_18px_36px_-32px_rgba(91,54,35,0.5)]">
      <div className="flex items-center justify-between">
        <Icon className={cn("h-5 w-5", tone === "warn" ? "text-accent" : "text-muted")} />
        {hint && <span className="text-[0.62rem] tracking-[0.12em] text-subtle uppercase">{hint}</span>}
      </div>
      <p className="mt-4 font-display text-3xl leading-none tabular-nums">{value}</p>
      <p className="mt-2 text-[0.68rem] tracking-[0.16em] text-muted uppercase">{label}</p>
    </div>
  );
}

function StockBadge({ stock, edited }: { stock: number; edited: boolean }) {
  const tone =
    stock === 0
      ? "border-danger/40 text-danger"
      : stock <= 5
        ? "border-accent/40 text-accent"
        : "border-line text-muted";
  return (
    <span className="flex items-center gap-2">
      <span className={cn("rounded-full border px-3 py-1 text-[0.62rem] tracking-[0.14em] uppercase", tone)}>
        {stock === 0 ? "Sold out" : `${stock} in stock`}
      </span>
      {edited && (
        <span className="text-[0.62rem] tracking-[0.14em] text-subtle uppercase">edited</span>
      )}
    </span>
  );
}

function Editor({
  product,
  onSave,
  onCancel,
  onReset,
}: {
  product: Product;
  onSave: (patch: Partial<Product>) => void;
  onCancel: () => void;
  onReset: () => void;
}) {
  const [form, setForm] = useState({
    name: product.name,
    sku: product.sku,
    price: String(product.price),
    compareAt: product.compareAt ? String(product.compareAt) : "",
    description: product.description,
    story: product.story,
    details: product.details.join("\n"),
    metal: product.metal,
    purity: product.purity,
    weight: product.weight,
    stones: product.stones,
    size: product.size,
    hallmark: product.hallmark,
    certification: product.certification,
    care: product.care,
    warranty: product.warranty,
    shipping: product.shipping,
    stock: String(product.stock),
    image: product.image,
    category: product.category,
    collection: product.collection,
    wear: product.wear,
    occasion: product.occasion ?? "",
  });

  const fields = useMemo(
    () =>
      [
        ["name", "Name"],
        ["sku", "SKU"],
        ["price", "Price (INR)"],
        ["compareAt", "Compare-at price"],
        ["stock", "Stock"],
        ["image", "Image path"],
        ["metal", "Metal"],
        ["purity", "Purity"],
        ["weight", "Weight"],
        ["stones", "Stones"],
        ["size", "Size"],
        ["hallmark", "Hallmark"],
        ["certification", "Certification"],
      ] as const,
    [],
  );

  function set(k: string, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function submit(e: FormEvent) {
    e.preventDefault();
    onSave({
      name: form.name,
      sku: form.sku,
      price: Number(form.price) || 0,
      compareAt: form.compareAt ? Number(form.compareAt) : undefined,
      description: form.description,
      story: form.story,
      details: form.details
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean),
      metal: form.metal,
      purity: form.purity,
      weight: form.weight,
      stones: form.stones,
      size: form.size,
      hallmark: form.hallmark,
      certification: form.certification,
      care: form.care,
      warranty: form.warranty,
      shipping: form.shipping,
      stock: Number(form.stock) || 0,
      image: form.image,
      category: form.category as Product["category"],
      collection: form.collection as Product["collection"],
      wear: form.wear as Product["wear"],
      occasion: (form.occasion || undefined) as Product["occasion"],
    });
  }

  return (
    <form onSubmit={submit} className="mt-8 space-y-4">
      <h2 className="font-display text-2xl">Edit {product.name}</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        {fields.map(([k, label]) => (
          <label key={k} className="block text-sm">
            <span className="text-muted">{label}</span>
            <input
              className="mt-1 h-11 w-full rounded-md border border-line bg-surface px-3"
              value={form[k]}
              onChange={(e) => set(k, e.target.value)}
            />
          </label>
        ))}
      </div>
      <label className="block text-sm">
        <span className="text-muted">Short description</span>
        <textarea
          className="mt-1 min-h-20 w-full rounded-md border border-line bg-surface p-3"
          value={form.description}
          onChange={(e) => set("description", e.target.value)}
        />
      </label>
      <label className="block text-sm">
        <span className="text-muted">Story</span>
        <textarea
          className="mt-1 min-h-28 w-full rounded-md border border-line bg-surface p-3"
          value={form.story}
          onChange={(e) => set("story", e.target.value)}
        />
      </label>
      <label className="block text-sm">
        <span className="text-muted">Details (one per line)</span>
        <textarea
          className="mt-1 min-h-24 w-full rounded-md border border-line bg-surface p-3"
          value={form.details}
          onChange={(e) => set("details", e.target.value)}
        />
      </label>
      <div className="grid gap-4 sm:grid-cols-3">
        <label className="block text-sm">
          <span className="text-muted">Care</span>
          <textarea
            className="mt-1 min-h-24 w-full rounded-md border border-line bg-surface p-3"
            value={form.care}
            onChange={(e) => set("care", e.target.value)}
          />
        </label>
        <label className="block text-sm">
          <span className="text-muted">Warranty</span>
          <textarea
            className="mt-1 min-h-24 w-full rounded-md border border-line bg-surface p-3"
            value={form.warranty}
            onChange={(e) => set("warranty", e.target.value)}
          />
        </label>
        <label className="block text-sm">
          <span className="text-muted">Shipping</span>
          <textarea
            className="mt-1 min-h-24 w-full rounded-md border border-line bg-surface p-3"
            value={form.shipping}
            onChange={(e) => set("shipping", e.target.value)}
          />
        </label>
      </div>
      <div className="flex flex-wrap gap-3 pt-2">
        <button
          type="submit"
          className="h-12 rounded-md bg-fg px-6 text-sm tracking-[0.16em] text-bg uppercase"
        >
          Save piece
        </button>
        <button
          type="button"
          className="h-12 rounded-md border border-line px-6 text-sm uppercase"
          onClick={onCancel}
        >
          Cancel
        </button>
        <button type="button" className="h-12 text-sm underline" onClick={onReset}>
          Revert this piece
        </button>
      </div>
    </form>
  );
}

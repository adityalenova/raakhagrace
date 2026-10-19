import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState, type FormEvent } from "react";
import { LotusMark } from "@/components/LotusMark";
import { SiteShell } from "@/components/SiteShell";
import { adminStatus } from "@/lib/auth-status";
import { signOut } from "@/lib/auth/client";
import { useCatalog, useProductList } from "@/lib/catalog-store";
import type { Product } from "@/lib/products";
import { formatInr } from "@/lib/utils";

export const Route = createFileRoute("/admin")({
  // Decided on the server from the session cookie, so the gate cannot be
  // bypassed by editing browser state.
  loader: () => adminStatus(),
  component: Page,
});

function Page() {
  const status = Route.useLoaderData();
  const [editing, setEditing] = useState<string | null>(null);
  const list = useProductList();
  const upsert = useCatalog((s) => s.upsert);
  const reset = useCatalog((s) => s.reset);
  const resetAll = useCatalog((s) => s.resetAll);

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
      <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-[0.65rem] tracking-[0.2em] text-subtle uppercase">Atelier</p>
            <h1 className="font-display text-4xl">Product admin</h1>
          </div>
          <div className="flex gap-3">
            <button type="button" className="text-sm underline" onClick={() => resetAll()}>
              Reset all to seed
            </button>
            <button type="button" className="text-sm underline" onClick={() => void signOut("/")}>
              Sign out admin
            </button>
          </div>
        </div>

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
          <ul className="mt-10 divide-y divide-line">
            {list.map((p) => (
              <li key={p.id} className="flex flex-wrap items-center gap-4 py-4">
                <img src={p.image} alt="" className="h-16 w-16 rounded object-cover" />
                <div className="min-w-0 flex-1">
                  <p className="font-display text-xl">{p.name}</p>
                  <p className="text-sm text-muted">
                    {p.sku} · {formatInr(p.price)} · stock {p.stock}
                  </p>
                </div>
                <Link to="/product/$id" params={{ id: p.id }} className="text-sm underline">
                  View
                </Link>
                <button
                  type="button"
                  className="rounded-full border border-line px-4 py-2 text-[0.7rem] tracking-[0.14em] uppercase"
                  onClick={() => setEditing(p.id)}
                >
                  Edit
                </button>
              </li>
            ))}
          </ul>
        )}
      </main>
    </SiteShell>
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

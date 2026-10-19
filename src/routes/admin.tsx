import { createFileRoute, Link } from "@tanstack/react-router";
import {
  AlertTriangle,
  Boxes,
  CircleDollarSign,
  ClipboardList,
  MessageCircle,
  Package,
  PencilLine,
  Plus,
  RefreshCw,
  Search,
  Undo2,
  X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { LotusMark } from "@/components/LotusMark";
import { SiteShell } from "@/components/SiteShell";
import { adminStatus } from "@/lib/auth-status";
import { signOut } from "@/lib/auth/client";
import { useCatalog, useProductList } from "@/lib/catalog-store";
import {
  BOOKING_STATUSES,
  listBookings,
  recordWhatsAppBooking,
  setBookingStatus,
  STATUS_LABEL,
  type Booking,
  type BookingStatus,
} from "@/lib/bookings";
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

const VIEWS = [
  { key: "products", label: "Products", icon: Boxes },
  { key: "bookings", label: "Order desk", icon: ClipboardList },
] as const;

type DeskRow = Booking & { contactEmail: string | null };

function Page() {
  const status = Route.useLoaderData();
  const [view, setView] = useState<(typeof VIEWS)[number]["key"]>("products");
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
                {view === "bookings" ? "Order desk" : "Product dashboard"}
              </h1>
              <p className="mt-2 text-sm text-ink-muted">
                {status.email ?? "Signed in"}
                {view === "bookings"
                  ? " · booking status you set here is what the customer sees"
                  : " · edits save to this browser"}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex rounded-full border border-ink-muted/40 p-1">
                {VIEWS.map((v) => (
                  <button
                    key={v.key}
                    type="button"
                    onClick={() => setView(v.key)}
                    aria-pressed={view === v.key}
                    className={cn(
                      "flex h-9 items-center gap-2 rounded-full px-4 text-[0.66rem] tracking-[0.14em] uppercase transition",
                      view === v.key ? "bg-ink-fg text-ink" : "text-ink-fg hover:bg-white/10",
                    )}
                  >
                    <v.icon className="h-4 w-4" /> {v.label}
                  </button>
                ))}
              </div>
              {view === "products" && (
                <button
                  type="button"
                  onClick={() => resetAll()}
                  className="flex h-11 items-center gap-2 rounded-md border border-ink-muted/40 px-4 text-[0.68rem] tracking-[0.16em] text-ink-fg uppercase transition hover:border-ink-muted"
                >
                  <Undo2 className="h-4 w-4" /> Reset to seed
                </button>
              )}
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
          {view === "bookings" ? (
            <BookingDesk />
          ) : (
            <>
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
                        const label =
                          CATEGORIES.find((c) => c.slug === p.category)?.label ?? p.category;
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
            </>
          )}
        </div>
      </main>
    </SiteShell>
  );
}

/**
 * The desk the atelier works from. A booking made on the site — or typed in
 * here when it arrived straight through WhatsApp — gets its status here, and
 * that status is exactly what the customer sees on their dashboard.
 */
function BookingDesk() {
  const [rows, setRows] = useState<DeskRow[] | null>(null);
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const [adding, setAdding] = useState(false);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let live = true;
    const t = setTimeout(
      () => {
        void listBookings({ data: { query: query.trim() || undefined } })
          .then((r) => {
            if (live) {
              setRows(r);
              setError("");
            }
          })
          .catch((err: unknown) => {
            if (live) {
              setRows([]);
              setError(err instanceof Error ? err.message : "Could not load bookings.");
            }
          });
      },
      query.trim() ? 300 : 0,
    );
    return () => {
      live = false;
      clearTimeout(t);
    };
  }, [query, tick]);

  const counts = useMemo(() => {
    const open = (rows ?? []).filter((r) => r.status === "new").length;
    const moving = (rows ?? []).filter(
      (r) => r.status === "confirmed" || r.status === "packed",
    ).length;
    const shipped = (rows ?? []).filter((r) => r.status === "shipped").length;
    const revenue = (rows ?? [])
      .filter((r) => r.status !== "cancelled")
      .reduce((sum, r) => sum + r.total, 0);
    return { open, moving, shipped, revenue };
  }, [rows]);

  const reload = useCallback(() => setTick((t) => t + 1), []);

  return (
    <div className="-mt-6">
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat
          icon={Package}
          label="Awaiting confirmation"
          value={String(counts.open)}
          tone={counts.open ? "warn" : "ok"}
        />
        <Stat
          icon={ClipboardList}
          label="In the pipeline"
          value={String(counts.moving)}
          hint="confirmed · packed"
        />
        <Stat
          icon={MessageCircle}
          label="Shipped"
          value={String(counts.shipped)}
          hint="awaiting delivery"
        />
        <Stat
          icon={CircleDollarSign}
          label="Booked value"
          value={formatInr(counts.revenue)}
          hint="excludes cancelled"
        />
      </section>

      <div className="mt-8 flex flex-wrap items-center gap-3">
        <label className="relative min-w-56 flex-1">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-subtle" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search reference, name, phone or email"
            className="h-12 w-full rounded-md border border-line bg-surface pl-11 pr-4 text-sm outline-none focus:border-accent"
          />
        </label>
        <button
          type="button"
          onClick={reload}
          className="flex h-12 items-center gap-2 rounded-md border border-line px-4 text-[0.68rem] tracking-[0.14em] uppercase transition hover:border-fg"
        >
          <RefreshCw className="h-4 w-4" /> Refresh
        </button>
        <button
          type="button"
          onClick={() => setAdding((v) => !v)}
          aria-expanded={adding}
          className="flex h-12 items-center gap-2 rounded-md bg-fg px-5 text-[0.68rem] tracking-[0.14em] text-bg uppercase transition hover:opacity-90"
        >
          {adding ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {adding ? "Close" : "Log a WhatsApp order"}
        </button>
      </div>

      {adding && (
        <NewBookingForm
          onSaved={() => {
            setAdding(false);
            reload();
          }}
          onCancel={() => setAdding(false)}
        />
      )}

      {error && <p className="mt-6 text-sm text-danger">{error}</p>}

      {rows === null ? (
        <ul className="mt-6 space-y-4">
          {[0, 1, 2].map((i) => (
            <li key={i} className="h-32 animate-pulse rounded-xl bg-paper" />
          ))}
        </ul>
      ) : rows.length === 0 ? (
        <p className="mt-10 rounded-xl border border-dashed border-line px-6 py-14 text-center text-sm text-muted">
          {query.trim()
            ? `Nothing matches “${query.trim()}”.`
            : "No bookings yet. Every order booked from a product page lands here the moment the WhatsApp chat opens."}
        </p>
      ) : (
        <ul className="mt-6 space-y-4">
          {rows.map((r) => (
            <BookingRow key={r.id} row={r} onSaved={reload} />
          ))}
        </ul>
      )}
    </div>
  );
}

function BookingRow({ row, onSaved }: { row: DeskRow; onSaved: () => void }) {
  const [status, setStatus] = useState<BookingStatus>(row.status);
  const [tracking, setTracking] = useState(row.tracking ?? "");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const dirty =
    status !== row.status || tracking !== (row.tracking ?? "") || note.trim().length > 0;

  async function save() {
    setSaving(true);
    try {
      await setBookingStatus({
        data: {
          id: row.id,
          status,
          tracking: tracking.trim() || undefined,
          note: note.trim() || undefined,
        },
      });
      setNote("");
      setSaved(true);
      onSaved();
      setTimeout(() => setSaved(false), 2500);
    } finally {
      setSaving(false);
    }
  }

  return (
    <li className="rounded-xl border border-line bg-surface p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="font-display text-xl tracking-[0.06em] tabular-nums">{row.ref}</p>
          <p className="mt-1 text-sm text-fg">
            {row.contactName ?? "No name given"}
            {row.contactPhone ? ` · ${row.contactPhone}` : ""}
          </p>
          <p className="mt-0.5 text-xs text-subtle">
            {new Date(row.createdAt).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
            {row.contactEmail ? ` · ${row.contactEmail}` : ""}
            {row.channel === "whatsapp" ? " · WhatsApp" : ""}
          </p>
        </div>
        <div className="text-right">
          <p className="font-display text-2xl tabular-nums">{formatInr(row.total)}</p>
          <p className="mt-1 text-[0.62rem] tracking-[0.14em] text-subtle uppercase">
            {row.items.length} {row.items.length === 1 ? "piece" : "pieces"}
          </p>
        </div>
      </div>

      <ul className="mt-4 grid gap-1 border-t border-line pt-4 text-sm text-muted sm:grid-cols-2">
        {row.items.map((it) => (
          <li key={it.productId} className="flex justify-between gap-4">
            <span className="truncate">
              {it.name} <span className="text-subtle">{it.sku}</span>
            </span>
            <span className="shrink-0 tabular-nums">× {it.qty}</span>
          </li>
        ))}
      </ul>

      <div className="mt-4 grid gap-3 sm:grid-cols-[11rem_1fr_1fr_auto] sm:items-end">
        <label className="block text-sm">
          <span className="text-[0.62rem] tracking-[0.14em] text-subtle uppercase">Status</span>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as BookingStatus)}
            className="mt-1 h-11 w-full rounded-md border border-line bg-bg px-3 text-sm outline-none focus:border-accent"
          >
            {BOOKING_STATUSES.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABEL[s]}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm">
          <span className="text-[0.62rem] tracking-[0.14em] text-subtle uppercase">
            Tracking number
          </span>
          <input
            value={tracking}
            onChange={(e) => setTracking(e.target.value)}
            placeholder="DTDC consignment no."
            className="mt-1 h-11 w-full rounded-md border border-line bg-bg px-3 text-sm outline-none focus:border-accent"
          />
        </label>
        <label className="block text-sm">
          <span className="text-[0.62rem] tracking-[0.14em] text-subtle uppercase">Add a note</span>
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Size confirmed, payment received…"
            className="mt-1 h-11 w-full rounded-md border border-line bg-bg px-3 text-sm outline-none focus:border-accent"
          />
        </label>
        <button
          type="button"
          onClick={() => void save()}
          disabled={!dirty || saving}
          className="h-11 rounded-md bg-fg px-5 text-[0.68rem] tracking-[0.14em] text-bg uppercase transition hover:opacity-90 disabled:opacity-40"
        >
          {saving ? "Saving…" : "Save"}
        </button>
      </div>
      {saved && <p className="mt-2 text-xs text-muted">Saved — the customer sees it now.</p>}
    </li>
  );
}

/** For the order that never touched the site: a screenshot in WhatsApp. */
function NewBookingForm({ onSaved, onCancel }: { onSaved: () => void; onCancel: () => void }) {
  const products = useProductList();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [note, setNote] = useState("");
  const [lines, setLines] = useState([{ productId: products[0]?.id ?? "", qty: 1 }]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const total = lines.reduce((sum, l) => {
    const p = products.find((x) => x.id === l.productId);
    return sum + (p ? p.price * l.qty : 0);
  }, 0);

  function setLine(i: number, patch: Partial<{ productId: string; qty: number }>) {
    setLines((ls) => ls.map((l, n) => (n === i ? { ...l, ...patch } : l)));
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !lines[0]?.productId) {
      setError("Add the customer name, number and at least one piece.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const res = await recordWhatsAppBooking({
        data: {
          name: name.trim(),
          phone: phone.trim(),
          items: lines
            .filter((l) => l.productId)
            .map((l) => ({ productId: l.productId, qty: l.qty })),
          note: note.trim() || undefined,
        },
      });
      if (res.ok) {
        onSaved();
      } else {
        setError(res.error);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save the booking.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={submit}
      className="mt-6 rounded-xl border border-accent/30 bg-paper/40 p-5 sm:p-6"
    >
      <p className="text-[0.65rem] tracking-[0.2em] text-accent uppercase">
        Log an order that came straight through WhatsApp
      </p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <label className="block text-sm">
          <span className="text-[0.62rem] tracking-[0.14em] text-subtle uppercase">
            Customer name
          </span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 h-11 w-full rounded-md border border-line bg-bg px-3 outline-none focus:border-accent"
          />
        </label>
        <label className="block text-sm">
          <span className="text-[0.62rem] tracking-[0.14em] text-subtle uppercase">
            Mobile number
          </span>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            type="tel"
            className="mt-1 h-11 w-full rounded-md border border-line bg-bg px-3 outline-none focus:border-accent"
          />
        </label>
      </div>

      <ul className="mt-3 space-y-2">
        {lines.map((l, i) => (
          <li key={i} className="flex flex-wrap items-center gap-2">
            <select
              value={l.productId}
              onChange={(e) => setLine(i, { productId: e.target.value })}
              aria-label={`Piece ${i + 1}`}
              className="h-11 min-w-0 flex-1 rounded-md border border-line bg-bg px-3 text-sm outline-none focus:border-accent"
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} — {formatInr(p.price)}
                </option>
              ))}
            </select>
            <input
              value={l.qty}
              onChange={(e) => setLine(i, { qty: Math.max(1, Number(e.target.value) || 1) })}
              type="number"
              min={1}
              max={20}
              aria-label="Quantity"
              className="h-11 w-20 rounded-md border border-line bg-bg px-3 text-sm outline-none focus:border-accent"
            />
            {lines.length > 1 && (
              <button
                type="button"
                onClick={() => setLines((ls) => ls.filter((_, n) => n !== i))}
                aria-label="Remove this piece"
                className="grid h-11 w-11 place-items-center rounded-md border border-line text-muted hover:border-danger hover:text-danger"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </li>
        ))}
      </ul>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => setLines((ls) => [...ls, { productId: ls[0]?.productId ?? "", qty: 1 }])}
          className="flex h-10 items-center gap-2 rounded-full border border-line px-4 text-[0.66rem] tracking-[0.14em] uppercase hover:border-fg"
        >
          <Plus className="h-4 w-4" /> Add a piece
        </button>
        <p className="text-sm tabular-nums text-fg">Total {formatInr(total)}</p>
      </div>

      <label className="mt-3 block text-sm">
        <span className="text-[0.62rem] tracking-[0.14em] text-subtle uppercase">
          Note (kept privately)
        </span>
        <input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="UPI received, bangle size 2-6, gift wrap…"
          className="mt-1 h-11 w-full rounded-md border border-line bg-bg px-3 outline-none focus:border-accent"
        />
      </label>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={saving}
          className="h-11 rounded-md bg-fg px-6 text-[0.68rem] tracking-[0.14em] text-bg uppercase transition hover:opacity-90 disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save booking"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="h-11 rounded-md border border-line px-5 text-[0.68rem] tracking-[0.14em] uppercase hover:border-fg"
        >
          Cancel
        </button>
        {error && <p className="text-xs text-danger">{error}</p>}
      </div>
    </form>
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
        {hint && (
          <span className="text-[0.62rem] tracking-[0.12em] text-subtle uppercase">{hint}</span>
        )}
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
      <span
        className={cn(
          "rounded-full border px-3 py-1 text-[0.62rem] tracking-[0.14em] uppercase",
          tone,
        )}
      >
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

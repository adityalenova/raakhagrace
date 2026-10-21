import { createFileRoute, Link } from "@tanstack/react-router";
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Boxes,
  CircleDollarSign,
  ClipboardList,
  Clock,
  Lightbulb,
  Mail,
  Users,
  MessageCircle,
  Package,
  Plus,
  RefreshCw,
  Search,
  Send,
  ShieldCheck,
  Sparkles,
  Undo2,
  X,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import { LotusMark } from "@/components/LotusMark";
import { SiteShell } from "@/components/SiteShell";
import { adminStatus } from "@/lib/auth-status";
import { signOut } from "@/lib/auth/client";
import {
  adminAnalytics,
  adminUsers,
  type Analytics,
  type MailReport,
  mailCheck,
  type UserRoster,
} from "@/lib/admin-insights";
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
import {
  adminAttribution,
  adminBenchPlan,
  adminBriefing,
  adminCustomers,
  adminVelocity,
  askTheNumbers,
  saveBenchSettings,
  sendBriefingMail,
  type Attribution,
  type BenchSettings,
  type Briefing,
  type CustomerTrends,
  type NumbersAnswer,
  type PlanRow,
  type Velocity,
} from "@/lib/insights";
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
] as const;

const VIEWS = [
  { key: "products", label: "Products", icon: Boxes },
  { key: "bookings", label: "Order desk", icon: ClipboardList },
  { key: "insights", label: "Insights", icon: Lightbulb },
  { key: "people", label: "People", icon: Users },
  { key: "analytics", label: "Analytics", icon: BarChart3 },
] as const;

type ViewKey = (typeof VIEWS)[number]["key"];

/** What each desk is, and one line on how to read it. */
const VIEW_META: Record<ViewKey, { title: string; note: string }> = {
  products: { title: "Product dashboard", note: "edits save to this browser" },
  bookings: {
    title: "Order desk",
    note: "booking status you set here is what the customer sees",
  },
  insights: {
    title: "What the bench sold",
    note: "every figure counted from booking rows — nothing here is a forecast",
  },
  people: {
    title: "People",
    note: "accounts and bookings, and what each address has asked for before",
  },
  analytics: {
    title: "Bench analytics",
    note: "counted from sign-ups and bookings in our own database — no visitor tracking",
  },
};

type DeskRow = Booking & { contactEmail: string | null };

function Page() {
  const status = Route.useLoaderData();
  const [view, setView] = useState<ViewKey>("products");
  const [editing, setEditing] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<(typeof COLLECTION_TABS)[number]["key"]>("all");
  const list = useProductList();
  const overrides = useCatalog((s) => s.overrides);
  const upsert = useCatalog((s) => s.upsert);
  const reset = useCatalog((s) => s.reset);
  const resetAll = useCatalog((s) => s.resetAll);

  // Two numbers, both true. Stock counts and a "stock value" used to sit here
  // too; they were derived from invented per-piece quantities, so they are gone
  // rather than estimated. `edited` is real but device-local — the note under
  // the strip says so, because it is the first thing an owner gets wrong.
  const stats = useMemo(
    () => ({ pieces: list.length, edited: Object.keys(overrides).length }),
    [list, overrides],
  );

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
                {VIEW_META[view].title}
              </h1>
              <p className="mt-2 text-sm text-ink-muted">
                {status.email ?? "Signed in"} · {VIEW_META[view].note}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              {/* Five labels do not fit a 390px screen in one row; the pill
                  breaks onto a second line instead of pushing the page wide. */}
              <div className="flex flex-wrap justify-end gap-1 rounded-full border border-ink-muted/40 p-1">
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
          {view === "insights" ? (
            <InsightsDesk />
          ) : view === "people" ? (
            <PeopleDesk />
          ) : view === "analytics" ? (
            <AnalyticsPanel />
          ) : view === "bookings" ? (
            <BookingDesk />
          ) : (
            <>
              {/* One quiet line instead of four big cards. Every number on it is
                  something the shop actually knows; the stock and value tiles that
                  used to sit here were computed from quantities nobody had entered. */}
              <section className="-mt-6 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-line bg-surface px-5 py-4">
                <div>
                  <p className="flex flex-wrap items-baseline gap-x-2 gap-y-1 text-sm">
                    <span className="font-display text-2xl tabular-nums">{stats.pieces}</span>
                    <span className="text-muted">pieces at the bench</span>
                    <span className="mx-1 text-line">·</span>
                    <span className="font-display text-2xl tabular-nums">{stats.edited}</span>
                    <span className="text-muted">
                      {stats.edited === 1 ? "edit" : "edits"} on this device
                    </span>
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-subtle">
                    No stock counts — availability is settled in the WhatsApp chat.
                  </p>
                </div>
                {stats.edited > 0 && (
                  <button
                    type="button"
                    onClick={() => resetAll()}
                    className="flex h-10 shrink-0 items-center gap-2 rounded-full border border-line px-4 text-[0.62rem] tracking-[0.14em] text-muted uppercase transition hover:border-accent hover:text-fg"
                    title="Discard the edits saved in this browser"
                  >
                    <Undo2 className="h-3.5 w-3.5" /> Reset {stats.edited}{" "}
                    {stats.edited === 1 ? "edit" : "edits"}
                  </button>
                )}
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
                              <span className="text-[0.62rem] tracking-[0.14em] text-accent uppercase">
                                {edited ? "Edited on this device" : ""}
                              </span>
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

      {/*
        How a booking gets here, printed on the desk itself. The pipeline is the
        one thing an owner should not have to remember from a chat transcript:
        every row below arrived by one of these two routes, and the status set
        here is the only thing the customer can read on the site.
      */}
      <section className="mt-6 rounded-xl border border-line bg-surface px-5 py-4">
        <p className="text-[0.62rem] tracking-[0.14em] text-subtle uppercase">
          How a booking starts
        </p>
        <ol className="mt-3 grid gap-3 text-xs leading-relaxed text-muted sm:grid-cols-3">
          <li className="rounded-lg bg-paper/50 px-3 py-2">
            <span className="font-display text-base text-fg">1</span> — The customer fills name,
            phone and address on <code className="text-[0.7rem]">/checkout</code> and presses{" "}
            <em>Book on WhatsApp</em>. The site prices the cart from the catalogue on the server —
            never from anything the browser sent — and writes the booking with status{" "}
            <em>Awaiting confirmation</em> and a reference like RG-7K4MQP.
          </li>
          <li className="rounded-lg bg-paper/50 px-3 py-2">
            <span className="font-display text-base text-fg">2</span> — Only after that row exists
            does the browser open WhatsApp, with the reference on the first line of the message. So
            the chat and the record are the same order; nothing is promised about payment here.
          </li>
          <li className="rounded-lg bg-paper/50 px-3 py-2">
            <span className="font-display text-base text-fg">3</span> — You move the status below.
            Each move is what the customer sees in their dashboard, and — when the booking carries
            an email — the customer is emailed the change. A booking that arrived in the chat with
            no site visit is added with <em>Log a WhatsApp order</em>.
          </li>
        </ol>
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

type StatusResult = Awaited<ReturnType<typeof setBookingStatus>>;

/**
 * What the mailer did with the status change, in the desk's own words.
 *
 * "Saved" and "saved but the customer was never told" used to look identical
 * here, which is how a refused mail becomes invisible until someone asks why a
 * customer is confused. Each outcome is named, including the boring ones.
 */
function mailNoteFor(result: StatusResult): string {
  switch (result.mail) {
    case "sent":
      return "The customer was emailed the new status.";
    case "refused":
      return `Saved, but the mail service refused the notice: ${"error" in result ? result.error : "unknown reason"}. Tell them on WhatsApp.`;
    case "not-configured":
      return `Saved, but nothing was emailed — this deployment has no sending address (${
        "error" in result ? result.error : "not configured"
      }). Tell them on WhatsApp.`;
    case "no-address":
      return "Saved. No email address on this booking, so nothing was sent.";
    case "silent":
      return "";
    case "no-row":
      return "That booking is not on file any more.";
  }
}

function BookingRow({ row, onSaved }: { row: DeskRow; onSaved: () => void }) {
  const [status, setStatus] = useState<BookingStatus>(row.status);
  const [tracking, setTracking] = useState(row.tracking ?? "");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [mailNote, setMailNote] = useState("");

  const dirty =
    status !== row.status || tracking !== (row.tracking ?? "") || note.trim().length > 0;

  async function save() {
    setSaving(true);
    try {
      const result = await setBookingStatus({
        data: {
          id: row.id,
          status,
          tracking: tracking.trim() || undefined,
          note: note.trim() || undefined,
        },
      });
      setNote("");
      setSaved(true);
      setMailNote(mailNoteFor(result));
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
          <li key={it.productId} className="flex min-w-0 justify-between gap-4">
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
      {saved && (
        <p className="mt-2 text-xs text-muted">
          Saved — the customer sees it now.
          {mailNote && <span className="mt-0.5 block text-subtle">{mailNote}</span>}
        </p>
      )}
    </li>
  );
}

/** For the order that never touched the site: a screenshot in WhatsApp. */
function NewBookingForm({ onSaved, onCancel }: { onSaved: () => void; onCancel: () => void }) {
  const products = useProductList();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [source, setSource] = useState("");
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
          email: email.trim() || undefined,
          source: source.trim() || undefined,
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

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <label className="block text-sm">
          <span className="text-[0.62rem] tracking-[0.14em] text-subtle uppercase">
            Email (optional)
          </span>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            placeholder="lets us email status updates"
            className="mt-1 h-11 w-full rounded-md border border-line bg-bg px-3 outline-none focus:border-accent"
          />
        </label>
        <label className="block text-sm">
          <span className="text-[0.62rem] tracking-[0.14em] text-subtle uppercase">
            Came from (optional)
          </span>
          <input
            value={source}
            onChange={(e) => setSource(e.target.value)}
            placeholder="Instagram DM, Google, referral"
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
    stones: product.stones,
    size: product.size,
    care: product.care,
    warranty: product.warranty,
    shipping: product.shipping,
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
        ["image", "Image path"],
        ["category", "Category"],
        ["collection", "Collection"],
        ["wear", "Wear"],
        ["occasion", "Occasion"],
        ["metal", "Metal"],
        ["stones", "Stones"],
        ["size", "Size"],
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
      stones: form.stones,
      size: form.size,
      care: form.care,
      warranty: form.warranty,
      shipping: form.shipping,
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
          <span className="text-muted">
            After-sales note — what the page says about returns and care
          </span>
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

/* ------------------------------------------------------------------ *
 * Analytics and sign-ups.
 *
 * Both read through a `requireAdmin()` server function, so the numbers are the
 * database's, not a browser's. Neither one pretends to be visitor analytics:
 * this site drops no tracking cookie, so what is counted here is who signed up
 * and what they booked — which is what a bench of this size decides with.
 * ------------------------------------------------------------------ */

function Panel({
  title,
  note,
  children,
}: {
  title: string;
  note?: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-xl border border-line bg-surface p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-xl">{title}</h2>
          {note ? <p className="mt-1 text-xs text-subtle">{note}</p> : null}
        </div>
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function PanelState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="-mt-6 rounded-xl border border-dashed border-line px-6 py-14 text-center">
      <AlertTriangle className="mx-auto h-6 w-6 text-accent" />
      <p className="mt-3 text-sm text-muted">{message}</p>
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="mt-5 inline-flex h-10 items-center gap-2 rounded-md border border-line px-4 text-[0.66rem] tracking-[0.14em] uppercase transition hover:border-fg"
        >
          <RefreshCw className="h-4 w-4" /> Try again
        </button>
      ) : null}
    </div>
  );
}

/** The last 30 UTC day-keys, oldest first, so a quiet day still gets a slot. */
function last30Days() {
  const days: string[] = [];
  const now = Date.now();
  for (let i = 29; i >= 0; i -= 1) {
    days.push(new Date(now - i * 86_400_000).toISOString().slice(0, 10));
  }
  return days;
}

function Bars({
  days,
  tone = "accent",
}: {
  days: { day: string; count: number }[];
  tone?: "accent" | "fg";
}) {
  const max = Math.max(1, ...days.map((d) => d.count));
  const total = days.reduce((s, d) => s + d.count, 0);
  return (
    <div>
      <div
        className="flex h-28 items-end gap-[3px]"
        role="img"
        aria-label={`${total} across the last ${days.length} days, highest day ${max}`}
      >
        {days.map((d) => (
          <div
            key={d.day}
            className="flex h-full flex-1 items-end"
            title={`${d.day}: ${d.count}`}
          >
            <div
              className={cn("w-full rounded-sm", tone === "accent" ? "bg-accent/70" : "bg-fg/35")}
              style={{ height: d.count ? `${Math.max(7, (d.count / max) * 100)}%` : "2px" }}
            />
          </div>
        ))}
      </div>
      <div className="mt-2 flex justify-between text-[0.6rem] tracking-[0.12em] text-subtle uppercase">
        <span>{days[0] ? days[0].day.slice(5) : ""}</span>
        <span>{total} in 30 days</span>
        <span>{days[days.length - 1] ? `${days[days.length - 1].day.slice(5)} · today` : ""}</span>
      </div>
    </div>
  );
}

function Delta({ now, before }: { now: number; before: number }) {
  if (!before) {
    return (
      <span className="text-[0.62rem] tracking-[0.12em] text-subtle uppercase">
        no prior 30 days
      </span>
    );
  }
  const pct = Math.round(((now - before) / before) * 100);
  const Icon = pct >= 0 ? ArrowUpRight : ArrowDownRight;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-[0.68rem] tabular-nums",
        pct >= 0 ? "text-accent" : "text-muted",
      )}
    >
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      {pct >= 0 ? `+${pct}` : pct}% vs prior 30
    </span>
  );
}

function Share({
  rows,
  total,
}: {
  rows: { label: string; count: number; value?: number }[];
  total: number;
}) {
  if (!rows.length) return <p className="text-sm text-subtle">Nothing recorded yet.</p>;
  return (
    <ul className="space-y-3">
      {rows.map((r) => {
        const pct = total ? Math.round((r.count / total) * 100) : 0;
        return (
          <li key={r.label}>
            <div className="flex items-baseline justify-between gap-3 text-sm">
              <span className="truncate">{r.label}</span>
              <span className="shrink-0 tabular-nums text-muted">
                {r.count}
                {r.value ? ` · ${formatInr(r.value)}` : ""}
                <span className="ml-2 text-[0.62rem] tracking-[0.12em] text-subtle uppercase">
                  {pct}%
                </span>
              </span>
            </div>
            <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-line">
              <div className="h-full rounded-full bg-accent/70" style={{ width: `${pct}%` }} />
            </div>
          </li>
        );
      })}
    </ul>
  );
}

const CHANNEL_LABEL: Record<string, string> = {
  whatsapp: "WhatsApp",
  site: "Placed on the site",
};

function AnalyticsPanel() {
  const [data, setData] = useState<Analytics | null>(null);
  const [error, setError] = useState("");
  const [tick, setTick] = useState(0);
  const reload = useCallback(() => setTick((t) => t + 1), []);

  useEffect(() => {
    let live = true;
    void adminAnalytics()
      .then((r) => {
        if (live) {
          setData(r);
          setError("");
        }
      })
      .catch((err: unknown) => {
        if (live) {
          setData(null);
          setError(err instanceof Error ? err.message : "Could not read the shop numbers.");
        }
      });
    return () => {
      live = false;
    };
  }, [tick]);

  if (error) return <PanelState message={error} onRetry={reload} />;
  if (!data) {
    return (
      <div className="-mt-6 rounded-xl border border-dashed border-line px-6 py-14 text-center text-sm text-muted">
        Reading sign-ups and bookings…
      </div>
    );
  }

  const axis = last30Days();
  const counts = (series: { day: string; count: number }[]) => {
    const byDay = new Map(series.map((s) => [s.day, s.count]));
    return axis.map((day) => ({ day, count: byDay.get(day) ?? 0 }));
  };
  const signupDays = counts(data.signupSeries);
  const orderDays = counts(data.orderSeries);
  const quiet = data.people.signups === 0 && data.orders.total === 0;

  const maxUnits = Math.max(1, ...data.pieces.map((p) => p.units));

  return (
    <div className="-mt-6 space-y-6">
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat
          icon={Users}
          label="Accounts"
          value={String(data.people.signups)}
          hint={`+${data.people.last7} this week`}
        />
        <Stat
          icon={ClipboardList}
          label="Bookings"
          value={String(data.orders.total)}
          hint={`${data.orders.open} still open`}
          tone={data.orders.open ? "warn" : "ok"}
        />
        <Stat
          icon={CircleDollarSign}
          label="Booked value"
          value={formatInr(data.orders.revenue)}
          hint="excludes cancelled"
        />
        <Stat
          icon={BarChart3}
          label="Average order"
          value={formatInr(data.orders.average)}
          hint={`${data.catalogue.pieces} pieces listed`}
        />
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Sign-ups, 30 days", now: data.growth.signups30, before: data.growth.signupsPrev30 },
          { label: "Bookings, 30 days", now: data.growth.orders30, before: data.growth.ordersPrev30 },
          { label: "Value, 30 days", now: data.growth.revenue30, before: data.growth.revenuePrev30, money: true },
        ].map((c) => (
          <div key={c.label} className="rounded-xl border border-line bg-surface p-5">
            <p className="text-[0.66rem] tracking-[0.16em] text-muted uppercase">{c.label}</p>
            <p className="mt-3 font-display text-3xl tabular-nums">
              {c.money ? formatInr(c.now) : c.now}
            </p>
            <div className="mt-2">
              <Delta now={c.now} before={c.before} />
            </div>
          </div>
        ))}
      </section>

      {quiet ? (
        <PanelState
          message={
            "Nothing counted yet. The moment someone signs up or a booking is made on the order desk, these panels fill in — there is no visitor tracking on this site to invent numbers before that."
          }
          onRetry={reload}
        />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          <Panel
            title="Sign-ups by day"
            note="Every account created in the last 30 days. Empty days are empty, not hidden."
          >
            <Bars days={signupDays} />
          </Panel>
          <Panel title="Bookings by day" note="Paid or booked orders, cancellations left out.">
            <Bars days={orderDays} tone="fg" />
          </Panel>

          <Panel title="Where bookings came from" note="Channel recorded on the order row.">
            <Share
              total={data.orders.total}
              rows={data.orders.byChannel.map((c) => ({
                label: CHANNEL_LABEL[c.channel] ?? c.channel,
                count: c.count,
                value: c.value,
              }))}
            />
          </Panel>

          <Panel title="Booking pipeline" note="What the order desk is holding right now.">
            <Share
              total={data.orders.total}
              rows={data.orders.byStatus.map((s) => ({
                label: STATUS_LABEL[s.status as BookingStatus] ?? s.status,
                count: s.count,
                value: s.value,
              }))}
            />
          </Panel>

          <Panel
            title="Pieces booked"
            note="Units across every non-cancelled booking, top ten."
          >
            {data.pieces.length ? (
              <ul className="space-y-3">
                {data.pieces.map((p) => (
                  <li key={p.name}>
                    <div className="flex items-baseline justify-between gap-3 text-sm">
                      <span className="truncate">{p.name}</span>
                      <span className="shrink-0 tabular-nums text-muted">
                        {p.units} {p.units === 1 ? "unit" : "units"} · {formatInr(p.value)}
                      </span>
                    </div>
                    <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-line">
                      <div
                        className="h-full rounded-full bg-accent/70"
                        style={{ width: `${Math.round((p.units / maxUnits) * 100)}%` }}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-subtle">
                No pieces booked yet. This list builds itself from the item lines on each booking.
              </p>
            )}
          </Panel>

          <Panel
            title="How people get in"
            note="Sign-in providers on file, and what is still active."
          >
            <Share
              total={data.people.signups}
              rows={[
                ...data.providers.map((p) => ({
                  label: p.provider === "google" ? "Google" : p.provider,
                  count: p.accounts,
                })),
                { label: "Email verified", count: data.people.verified },
                { label: "Active in 30 days", count: data.people.active30 },
              ]}
            />
          </Panel>
        </div>
      )}

      <p className="text-[0.68rem] leading-relaxed text-subtle">
        These counts come from the accounts, sessions and bookings in our own database. This site
        sets no advertising or tracking cookie, so there is no page-view series to show — see{" "}
        <Link to="/cookie-information" className="text-accent hover:underline">
          cookie information
        </Link>{" "}
        and{" "}
        <Link to="/data-protection" className="text-accent hover:underline">
          data protection
        </Link>
        .
      </p>
    </div>
  );
}

function dateOf(ms: number) {
  return new Date(ms).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function since(ms: number | null) {
  if (!ms) return "never";
  const days = Math.floor((Date.now() - ms) / 86_400_000);
  if (days <= 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 30) return `${days} days ago`;
  const months = Math.round(days / 30);
  return months <= 1 ? "a month ago" : `${months} months ago`;
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

function UsersPanel() {
  const [roster, setRoster] = useState<UserRoster | null>(null);
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const [tick, setTick] = useState(0);
  const reload = useCallback(() => setTick((t) => t + 1), []);

  useEffect(() => {
    let live = true;
    const t = setTimeout(
      () => {
        void adminUsers({ data: { query: query.trim() || undefined } })
          .then((r) => {
            if (live) {
              setRoster(r);
              setError("");
            }
          })
          .catch((err: unknown) => {
            if (live) {
              setRoster(null);
              setError(err instanceof Error ? err.message : "Could not load sign-ups.");
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

  if (error) return <PanelState message={error} onRetry={reload} />;
  if (!roster) {
    return (
      <div className="-mt-6 rounded-xl border border-dashed border-line px-6 py-14 text-center text-sm text-muted">
        Reading accounts…
      </div>
    );
  }

  return (
    <div className="-mt-6 space-y-6">
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat icon={Users} label="Signed up" value={String(roster.total)} />
        <Stat
          icon={Clock}
          label="New this week"
          value={String(roster.thisWeek)}
          tone={roster.thisWeek ? "warn" : "ok"}
        />
        <Stat
          icon={ShieldCheck}
          label="Email verified"
          value={`${roster.verified}/${roster.total}`}
          tone={roster.verified < roster.total ? "warn" : "ok"}
        />
        <Stat
          icon={Package}
          label="Have booked"
          value={String(roster.withOrders)}
          hint="at least one order"
        />
      </section>

      <div className="flex flex-wrap items-center gap-3">
        <label className="relative min-w-56 flex-1">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-subtle" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name or email"
            className="h-12 w-full rounded-md border border-line bg-surface pl-11 pr-4 text-sm outline-none focus:border-accent"
          />
        </label>
        <button
          type="button"
          onClick={reload}
          className="flex h-12 items-center gap-2 rounded-md border border-line px-4 text-[0.66rem] tracking-[0.14em] uppercase transition hover:border-fg"
        >
          <RefreshCw className="h-4 w-4" /> Refresh
        </button>
      </div>

      {roster.rows.length === 0 ? (
        <p className="rounded-xl border border-dashed border-line px-6 py-12 text-center text-sm text-muted">
          {query.trim()
            ? `No account matches “${query.trim()}”. A booking made without signing in lives on the order desk, not here.`
            : "Nobody has signed up yet. Accounts appear here the moment a customer signs in with Google."}
        </p>
      ) : (
        <ul className="overflow-hidden rounded-xl border border-line">
          {roster.rows.map((u, i) => (
            <li
              key={u.id}
              className={cn(
                "flex flex-wrap items-center gap-4 bg-surface px-4 py-4 sm:gap-5",
                i > 0 && "border-t border-line",
              )}
            >
              {u.image ? (
                <img
                  src={u.image}
                  alt=""
                  className="h-10 w-10 shrink-0 rounded-full object-cover"
                  loading="lazy"
                />
              ) : (
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-line bg-paper font-display text-sm">
                  {initials(u.name) || "—"}
                </span>
              )}
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-2 truncate text-sm text-fg">
                  {u.name}
                  {u.verified ? (
                    <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-accent" aria-hidden="true" />
                  ) : null}
                </p>
                <p className="mt-0.5 truncate text-xs text-subtle">{u.email}</p>
              </div>
              <span className="rounded-full border border-line px-3 py-1 text-[0.6rem] tracking-[0.14em] text-muted uppercase">
                {u.providers === "google" ? "Google" : u.providers}
              </span>
              <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-xs text-muted sm:grid-cols-3">
                <span className="col-span-2 sm:col-span-1">
                  Joined <span className="text-fg">{dateOf(u.createdMs)}</span>
                </span>
                <span>
                  Seen <span className="text-fg">{since(u.lastSeenMs)}</span>
                </span>
                <span>
                  Bookings <span className="text-fg tabular-nums">{u.bookings}</span>
                </span>
              </div>
              <p className="w-20 shrink-0 text-right text-sm tabular-nums">
                {formatInr(u.spent)}
              </p>
            </li>
          ))}
        </ul>
      )}

      <p className="text-[0.68rem] leading-relaxed text-subtle">
        Accounts appear here only when someone signs in. A customer who books straight from the cart
        without an account is a row on the{" "}
        <Link to="/admin" className="text-accent hover:underline">
          order desk
        </Link>
        , not a sign-up — and this roster is readable only by an address on the admin allowlist. What
        is held about each person, and for how long, is on the{" "}
        <Link to="/data-protection" className="text-accent hover:underline">
          data protection page
        </Link>
        .
      </p>

      <MailPanel />
    </div>
  );
}

/**
 * Mail delivery, stated plainly.
 *
 * The roster above counts unverified accounts; this says why they are
 * unverified. The distinction matters because the two failures look identical
 * from the storefront — Resend accepts a sandbox send for the shop's own inbox
 * and refuses it for a customer's, so enquiries keep arriving while
 * verification mails quietly never do.
 */
function MailPanel() {
  const [report, setReport] = useState<MailReport | null>(null);
  const [probing, setProbing] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let live = true;
    mailCheck({ data: {} })
      .then((r) => {
        if (live) setReport(r);
      })
      .catch((err: unknown) => {
        if (live) setError(err instanceof Error ? err.message : "Could not read mail settings.");
      });
    return () => {
      live = false;
    };
  }, []);

  async function probe() {
    setProbing(true);
    setError("");
    try {
      setReport(await mailCheck({ data: { probe: true } }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "The probe did not run.");
    } finally {
      setProbing(false);
    }
  }

  const rows = report
    ? [
        { label: "Sender", value: report.from ?? "not set (RESEND_FROM)" },
        { label: "Atelier inbox", value: report.inbox ?? "not set (ORDER_NOTIFY_EMAIL)" },
        {
          label: "API key",
          value: report.configured ? "present" : "missing (RESEND_API_KEY)",
        },
      ]
    : [];

  return (
    <Panel
      title="Mail delivery"
      note="Verification and welcome mails leave through here; bookings leave through WhatsApp."
    >
      {error ? (
        <p className="text-sm text-accent">{error}</p>
      ) : !report ? (
        <p className="text-sm text-muted">Reading mail settings…</p>
      ) : (
        <div className="space-y-4">
          <dl className="grid gap-x-6 gap-y-2 sm:grid-cols-3">
            {rows.map((r) => (
              <div key={r.label}>
                <dt className="text-[0.6rem] tracking-[0.14em] text-subtle uppercase">{r.label}</dt>
                <dd className="mt-1 truncate text-sm text-fg">{r.value}</dd>
              </div>
            ))}
          </dl>

          {report.testSender ? (
            <div className="flex gap-3 rounded-lg border border-accent/40 bg-accent/5 px-4 py-3">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
              <p className="text-sm leading-relaxed">
                <span className="text-fg">This sender is Resend&apos;s test address.</span> It
                delivers to the account holder&apos;s own inbox and refuses every other recipient,
                so verification and welcome mails to customers cannot arrive — no code change fixes
                that. Verify a domain you own at resend.com/domains, then point{" "}
                <code className="rounded bg-paper px-1 py-0.5 text-[0.8em]">RESEND_FROM</code> at an
                address on it.
              </p>
            </div>
          ) : null}

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={probe}
              disabled={probing}
              className="inline-flex h-10 items-center gap-2 rounded-md border border-line px-4 text-[0.66rem] tracking-[0.14em] uppercase transition hover:border-fg disabled:opacity-50"
            >
              <Send className="h-4 w-4" aria-hidden="true" />
              {probing ? "Sending…" : "Send a test mail"}
            </button>
            {report.probe ? (
              <p
                className={cn(
                  "flex items-center gap-2 text-sm",
                  report.probe.ok ? "text-fg" : "text-accent",
                )}
              >
                {report.probe.ok ? (
                  <ShieldCheck className="h-4 w-4 text-accent" aria-hidden="true" />
                ) : (
                  <Mail className="h-4 w-4" aria-hidden="true" />
                )}
                {report.probe.ok
                  ? `Accepted for ${report.probe.to}.`
                  : `Refused: ${report.probe.error ?? "unknown reason"}`}
              </p>
            ) : (
              <p className="text-xs text-subtle">
                Sends one message to the atelier inbox — it never mails a customer.
              </p>
            )}
          </div>

          <MailTail report={report} />
        </div>
      )}
    </Panel>
  );
}

/**
 * The outbox: every message this deployment tried to send and what the mail
 * service said. Ordered newest first, and the refusal text is Resend's own,
 * which is the part that names the cause — an unverified sender, a bad key, a
 * mailbox that does not exist.
 */
function MailTail({ report }: { report: MailReport }) {
  const status = {
    sent: { tone: "text-fg", icon: ShieldCheck, word: "Accepted" },
    refused: { tone: "text-accent", icon: AlertTriangle, word: "Refused" },
    skipped: { tone: "text-subtle", icon: Mail, word: "Not sent" },
  } as const;

  return (
    <div className="border-t border-line pt-4">
      <h3 className="text-[0.6rem] tracking-[0.16em] text-subtle uppercase">Recent mail</h3>
      {report.recentFailed ? (
        <p className="mt-2 text-sm text-accent">
          The outbox log could not be read on this deployment. Runtime logs from the last half hour
          are the next place to look.
        </p>
      ) : report.recent.length === 0 ? (
        <p className="mt-2 text-sm text-muted">
          Nothing has been mailed since this log began. Every confirmation code, welcome mail and
          enquiry copy the site sends from now on is listed here, with the reason if it failed.
        </p>
      ) : (
        <ul className="mt-3 space-y-2">
          {report.recent.map((m) => {
            const s = status[m.status] ?? status.skipped;
            const Icon = s.icon;
            return (
              <li key={m.id} className="flex items-start gap-3">
                <Icon className={cn("mt-0.5 h-4 w-4 shrink-0", s.tone)} aria-hidden="true" />
                <div className="min-w-0">
                  <p className="truncate text-sm text-fg">
                    <span className="capitalize">{m.kind}</span> · {m.recipient} ·{" "}
                    <span className={s.tone}>{s.word}</span>
                  </p>
                  <p className="mt-0.5 truncate text-xs text-subtle">
                    {new Date(m.createdAt).toLocaleString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: false,
                    })}
                    {m.detail ? ` — ${m.detail}` : ""}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      )}
      <p className="mt-3 text-xs text-subtle">
        Addresses are stored masked — first letter and domain only — and every line is dropped after
        90 days. This records what the mail service answered, not what was in the message.
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Insights.
 *
 * Four questions an atelier of this size actually asks, in the order it asks
 * them: what happened today, what has not sold, what should be at the bench,
 * and where the bookings came from. Each one is a `select` over the booking
 * rows, and where the answer needs a fact the database does not hold — how
 * long a piece takes to make — the number is asked for rather than assumed.
 * ------------------------------------------------------------------ */

function InsightsDesk() {
  const [tick, setTick] = useState(0);
  const [velocity, setVelocity] = useState<Velocity[] | null>(null);
  const [attribution, setAttribution] = useState<Attribution | null>(null);
  const [plan, setPlan] = useState<{ settings: BenchSettings; rows: PlanRow[] } | null>(null);
  const [briefing, setBriefing] = useState<Briefing | null>(null);
  // One panel's query failing must not blank the others: the briefing is still
  // true even if the bench plan table has not been created yet, so each panel
  // keeps its own complaint and only a total failure takes the desk down.
  const [failed, setFailed] = useState<Record<string, string>>({});

  const reload = useCallback(() => setTick((t) => t + 1), []);

  useEffect(() => {
    let live = true;
    Promise.allSettled([
      adminVelocity(),
      adminAttribution(),
      adminBenchPlan(),
      adminBriefing(),
    ]).then(([v, a, p, b]) => {
      if (!live) return;
      const errs: Record<string, string> = {};
      const why = (r: PromiseRejectedResult) =>
        r.reason instanceof Error ? r.reason.message : "Could not read the booking rows.";
      if (v.status === "fulfilled") setVelocity(v.value);
      else errs.velocity = why(v);
      if (a.status === "fulfilled") setAttribution(a.value);
      else errs.attribution = why(a);
      if (p.status === "fulfilled") setPlan(p.value);
      else errs.plan = why(p);
      if (b.status === "fulfilled") setBriefing(b.value);
      else errs.briefing = why(b);
      setFailed(errs);
    });
    return () => {
      live = false;
    };
  }, [tick]);

  // Nothing has come back and nothing has complained: the desk is still reading.
  if (!velocity && !attribution && !plan && !briefing && Object.keys(failed).length === 0) {
    return (
      <div className="-mt-6 rounded-xl border border-dashed border-line px-6 py-14 text-center text-sm text-muted">
        Reading bookings…
      </div>
    );
  }

  const sold = (velocity ?? []).filter((v) => !v.neverSold);
  const never = (velocity ?? []).filter((v) => v.neverSold);
  const stale = sold.filter((s) => (s.daysSinceSold ?? 0) > 90);
  const loading = (label: string) => (
    <div className="rounded-xl border border-dashed border-line px-6 py-10 text-center text-sm text-muted">
      Reading {label}…
    </div>
  );

  return (
    <div className="-mt-6 space-y-6">
      {briefing ? (
        <BriefingCard briefing={briefing} onReload={reload} />
      ) : failed.briefing ? (
        <PanelState message={failed.briefing} onRetry={reload} />
      ) : (
        loading("the briefing")
      )}
      <AskNumbers />

      {velocity ? (
        <Panel
          title="Designs that have not sold"
          note={`${never.length} of ${velocity.length} have never had a booking; ${stale.length} booked once and then nothing for three months.`}
        >
          <p className="-mt-2 text-xs leading-relaxed text-subtle">
            "Never" means no non-cancelled booking on this site. A piece sold purely inside the
            WhatsApp chat, with nothing recorded here, cannot show up — that is the limit of this
            list, not of the bench.
          </p>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[...never, ...stale].slice(0, 12).map((v) => (
              <li
                key={v.sku}
                className="flex gap-3 rounded-lg border border-line bg-paper/50 p-3"
              >
                <img
                  src={v.image}
                  alt=""
                  className="h-14 w-14 shrink-0 rounded-md object-cover"
                />
                <div className="min-w-0">
                  <p className="truncate text-sm">{v.name}</p>
                  <p className="mt-0.5 truncate text-[0.66rem] tracking-[0.12em] text-subtle uppercase">
                    {v.sku}
                  </p>
                  <p className="mt-1 text-xs text-muted">
                    {v.neverSold
                      ? "No booking recorded"
                      : `Last booked ${v.daysSinceSold} days ago`}{" "}
                    · {formatInr(v.price)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </Panel>
      ) : failed.velocity ? (
        <PanelState message={failed.velocity} onRetry={reload} />
      ) : (
        loading("the designs")
      )}

      {plan ? (
        <BenchPlanCard initial={plan} />
      ) : failed.plan ? (
        <PanelState message={failed.plan} onRetry={reload} />
      ) : (
        loading("the bench plan")
      )}

      {attribution ? (
        <Panel
          title="Where bookings came from"
          note="Rupees that are not cancelled, grouped by how the booking reached us."
        >
          <div className="overflow-x-auto">
            <table className="w-full min-w-[34rem] text-sm">
              <thead>
                <tr className="border-b border-line text-left text-[0.62rem] tracking-[0.14em] text-subtle uppercase">
                  <th className="py-2 pr-3 font-medium">Kind</th>
                  <th className="py-2 pr-3 font-medium">As recorded</th>
                  <th className="py-2 pr-3 text-right font-medium">Bookings</th>
                  <th className="py-2 pr-3 text-right font-medium">Rupees</th>
                  <th className="py-2 text-right font-medium">Per booking</th>
                </tr>
              </thead>
              <tbody>
                {attribution.rows.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-muted">
                      Nothing to attribute yet.
                    </td>
                  </tr>
                ) : (
                  attribution.rows.map((r) => (
                    <tr key={`${r.kind}-${r.key}`} className="border-b border-line/70">
                      <td className="py-2 pr-3 text-[0.62rem] tracking-[0.14em] text-subtle uppercase">
                        {r.kind}
                      </td>
                      <td className="py-2 pr-3">{r.key}</td>
                      <td className="py-2 pr-3 text-right tabular-nums">{r.bookings}</td>
                      <td className="py-2 pr-3 text-right tabular-nums">{formatInr(r.value)}</td>
                      <td className="py-2 text-right tabular-nums">{formatInr(r.perBooking)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs leading-relaxed text-subtle">
            {attribution.unrecorded} bookings predate the site recording a link tag, and
            {" "}
            {attribution.firstTaggedAt
              ? `tagged bookings exist only from ${new Date(attribution.firstTaggedAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })} onwards.`
              : "no booking has arrived through a tagged link yet."}{" "}
            To measure a campaign, share the page with{" "}
            <code className="rounded bg-paper px-1.5 py-0.5 text-[0.7rem]">
              ?utm_source=instagram&amp;utm_campaign=name
            </code>{" "}
            on the end — the tags are stored with the booking, nothing is installed for it.
          </p>
        </Panel>
      ) : failed.attribution ? (
        <PanelState message={failed.attribution} onRetry={reload} />
      ) : (
        loading("where bookings came from")
      )}
    </div>
  );
}

/**
 * The morning screen: six counted lines and the bookings that have been sitting.
 * The mail button sends exactly this, on press — there is no scheduler in the
 * deployment, and a silent cron failure would look identical to a quiet day.
 */
function BriefingCard({ briefing, onReload }: { briefing: Briefing; onReload: () => void }) {
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [note, setNote] = useState("");

  async function mail() {
    setState("sending");
    try {
      const r = await sendBriefingMail();
      setState(r.ok ? "sent" : "error");
      setNote(r.ok ? `Sent to ${r.to}` : (r.error ?? "The mail service refused it."));
    } catch (err) {
      setState("error");
      setNote(err instanceof Error ? err.message : "Could not send.");
    }
  }

  return (
    <Panel
      title={`Today — ${briefing.day}`}
      note="Counted from the booking rows as they stand at this moment."
    >
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {briefing.lines.map((l) => (
          <li
            key={l.label}
            className={cn(
              "rounded-lg border px-4 py-3",
              l.flag ? "border-accent/50 bg-accent/5" : "border-line bg-paper/50",
            )}
          >
            <p className="text-[0.62rem] tracking-[0.14em] text-subtle uppercase">{l.label}</p>
            <p className="mt-1 text-sm tabular-nums">{l.value}</p>
          </li>
        ))}
      </ul>

      {briefing.attention.length > 0 && (
        <div className="mt-4 rounded-lg border border-line bg-paper/40 px-4 py-3">
          <p className="text-[0.62rem] tracking-[0.14em] text-subtle uppercase">
            Waiting on the desk
          </p>
          <ul className="mt-2 space-y-1">
            {briefing.attention.map((a) => (
              <li key={a.ref} className="flex flex-wrap items-baseline gap-x-2 text-sm">
                <span className="font-display tracking-[0.08em]">{a.ref}</span>
                <span className="text-muted">{STATUS_LABEL[a.status as BookingStatus] ?? a.status}</span>
                <span className="text-subtle">· {a.days} days since anything changed</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => void mail()}
          disabled={state === "sending"}
          className="flex h-10 items-center gap-2 rounded-full border border-line px-4 text-[0.62rem] tracking-[0.14em] uppercase transition hover:border-fg disabled:opacity-60"
        >
          <Send className="h-3.5 w-3.5" />
          {state === "sending" ? "Sending…" : "Mail me this"}
        </button>
        <button
          type="button"
          onClick={onReload}
          className="flex h-10 items-center gap-2 rounded-full border border-line px-4 text-[0.62rem] tracking-[0.14em] text-muted uppercase transition hover:border-fg hover:text-fg"
        >
          <RefreshCw className="h-3.5 w-3.5" /> Recount
        </button>
        {note && (
          <p
            role="status"
            className={cn("text-xs", state === "error" ? "text-danger" : "text-muted")}
          >
            {note}
          </p>
        )}
      </div>
    </Panel>
  );
}

const PRESET_QUESTIONS = [
  "Why did sales drop this month?",
  "Which designs should I promote?",
  "Who is likely to order again?",
  "Where did this month's bookings come from?",
  "What should the bench have ready?",
];

/**
 * Ask the numbers. The counted sentences are the answer; when a language model
 * is configured it is given only those sentences to re-voice, and any digit it
 * produces that was not in them throws the rephrase away.
 */
function AskNumbers() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState<NumbersAnswer | null>(null);
  const [state, setState] = useState<"idle" | "asking" | "error">("idle");
  const [error, setError] = useState("");

  async function ask(text: string) {
    const q = text.trim();
    if (q.length < 3) return;
    setState("asking");
    setError("");
    try {
      setAnswer(await askTheNumbers({ data: { question: q } }));
      setState("idle");
    } catch (err) {
      setAnswer(null);
      setState("error");
      setError(err instanceof Error ? err.message : "Could not read the numbers.");
    }
  }

  return (
    <Panel
      title="Ask the numbers"
      note="It can only say what the booking rows show — the sentences under the answer are the ones it was given."
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void ask(question);
        }}
        className="flex flex-wrap gap-3"
      >
        <label className="relative min-w-56 flex-1">
          <Sparkles className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-subtle" />
          <input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Why did sales drop this month?"
            className="h-12 w-full rounded-md border border-line bg-surface pl-11 pr-4 text-sm outline-none focus:border-accent"
          />
        </label>
        <button
          type="submit"
          disabled={state === "asking"}
          className="h-12 rounded-md bg-fg px-6 text-[0.68rem] tracking-[0.16em] text-bg uppercase disabled:opacity-60"
        >
          {state === "asking" ? "Reading…" : "Ask"}
        </button>
      </form>

      <div className="mt-3 flex flex-wrap gap-2">
        {PRESET_QUESTIONS.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => {
              setQuestion(p);
              void ask(p);
            }}
            className="rounded-full border border-line bg-paper/50 px-3 py-1.5 text-[0.62rem] tracking-[0.1em] text-muted uppercase transition hover:border-accent hover:text-fg"
          >
            {p}
          </button>
        ))}
      </div>

      {state === "error" && <p className="mt-4 text-sm text-danger">{error}</p>}

      {answer && (
        <div className="mt-5 rounded-lg border border-line bg-paper/40 px-4 py-4">
          <p className="text-sm leading-relaxed">{answer.answer}</p>
          <p className="mt-3 text-[0.62rem] tracking-[0.14em] text-subtle uppercase">
            Counted from the rows
          </p>
          <ul className="mt-2 space-y-1.5">
            {answer.facts.map((f) => (
              <li key={f} className="text-xs leading-relaxed text-muted">
                {f}
              </li>
            ))}
          </ul>
          <p className="mt-3 text-[0.7rem] text-subtle">
            {answer.voiced
              ? "Wording re-phrased by the model from the sentences above; no figure was added."
              : "Answered from the counted sentences directly — no language model involved."}
          </p>
        </div>
      )}
    </Panel>
  );
}

/**
 * Demand measured here, lead time typed in by whoever runs the bench. With no
 * lead time on file the card declines to suggest a quantity, because a made-up
 * one is how the old stock numbers got here.
 */
function BenchPlanCard({
  initial,
}: {
  initial: { settings: BenchSettings; rows: PlanRow[] };
}) {
  const [plan, setPlan] = useState(initial);
  const [lead, setLead] = useState(String(initial.settings.leadDays || ""));
  const [review, setReview] = useState(String(initial.settings.reviewDays || ""));
  const [state, setState] = useState<"idle" | "saving" | "error">("idle");
  const [note, setNote] = useState("");

  async function save(e: FormEvent) {
    e.preventDefault();
    setState("saving");
    setNote("");
    try {
      const saved = await saveBenchSettings({
        data: { leadDays: Number(lead) || 0, reviewDays: Number(review) || 0 },
      });
      setPlan((p) => ({
        settings: saved,
        rows: p.rows.map((r) => ({
          ...r,
          horizonDays: saved.leadDays + saved.reviewDays,
          suggested:
            saved.leadDays + saved.reviewDays > 0
              ? Math.ceil(
                  (r.perDay > 0 ? r.perDay : r.perDay90) * (saved.leadDays + saved.reviewDays),
                )
              : 0,
        })),
      }));
      setState("idle");
      setNote("Saved on the server — this is shared by every device, not just this browser.");
    } catch (err) {
      setState("error");
      setNote(err instanceof Error ? err.message : "Could not save.");
    }
  }

  const horizon = plan.settings.leadDays + plan.settings.reviewDays;

  return (
    <Panel
      title="What to have at the bench"
      note="Booked units per day, measured over 30 days, or over 90 for the designs too quiet to read on 30."
    >
      <form onSubmit={save} className="flex flex-wrap items-end gap-3">
        <label className="block text-sm">
          <span className="text-muted">Days to make one piece</span>
          <input
            type="number"
            min={0}
            max={180}
            value={lead}
            onChange={(e) => setLead(e.target.value)}
            placeholder="e.g. 12"
            className="mt-1 h-11 w-40 rounded-md border border-line bg-surface px-3 tabular-nums"
          />
        </label>
        <label className="block text-sm">
          <span className="text-muted">Days between looks at this plan</span>
          <input
            type="number"
            min={0}
            max={180}
            value={review}
            onChange={(e) => setReview(e.target.value)}
            placeholder="e.g. 7"
            className="mt-1 h-11 w-40 rounded-md border border-line bg-surface px-3 tabular-nums"
          />
        </label>
        <button
          type="submit"
          disabled={state === "saving"}
          className="h-11 rounded-md bg-fg px-5 text-[0.66rem] tracking-[0.16em] text-bg uppercase disabled:opacity-60"
        >
          {state === "saving" ? "Saving…" : "Save"}
        </button>
        {note && (
          <p
            role="status"
            className={cn("text-xs", state === "error" ? "text-danger" : "text-muted")}
          >
            {note}
          </p>
        )}
      </form>

      {horizon <= 0 ? (
        <p className="mt-4 rounded-lg border border-dashed border-line px-4 py-6 text-sm leading-relaxed text-muted">
          Enter how long the bench needs and this will show how many pieces that rate says to have
          ready. Until then it shows only the measured demand below, because a suggested quantity
          built on a lead time we made up would be the same kind of number this dashboard just
          stopped showing.
        </p>
      ) : (
        <ul className="mt-4 space-y-2">
          {plan.rows.map((r) => (
            <li
              key={r.sku}
              className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 rounded-lg border border-line bg-paper/40 px-4 py-3"
            >
              <span className="min-w-0 flex-1 truncate text-sm">{r.name}</span>
              <span className="text-[0.66rem] tracking-[0.12em] text-subtle uppercase tabular-nums">
                {r.perDay > 0 ? `${r.perDay} a day (30d)` : `${r.perDay90} a day (90d)`}
              </span>
              <span className="text-sm tabular-nums">
                {r.suggested === 0
                  ? "nothing extra"
                  : `make ${r.suggested} for ${r.horizonDays} days`}
              </span>
            </li>
          ))}
        </ul>
      )}
      <p className="mt-3 text-xs leading-relaxed text-subtle">
        The horizon is lead time plus the review gap, so the suggestion covers the pieces expected
        to be asked for before the next look at this page. It is a count of bookings, not of what
        exists — this site keeps no stock figures.
      </p>
    </Panel>
  );
}

/* ------------------------------------------------------------------ *
 * People.
 *
 * The account list, and next to it the one judgement the rows support: who has
 * ordered more than once, and what in their own category they have not taken
 * yet. "Likely to purchase again" is the rule that produced the row, spelled
 * out — not a score.
 * ------------------------------------------------------------------ */

function PeopleDesk() {
  const [data, setData] = useState<CustomerTrends | null>(null);
  const [error, setError] = useState("");
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let live = true;
    void adminCustomers()
      .then((r) => live && (setData(r), setError("")))
      .catch((err: unknown) => {
        if (!live) return;
        setData(null);
        setError(err instanceof Error ? err.message : "Could not read the customer rows.");
      });
    return () => {
      live = false;
    };
  }, [tick]);

  return (
    <div className="-mt-6 space-y-6">
      {error ? (
        <PanelState message={error} onRetry={() => setTick((t) => t + 1)} />
      ) : !data ? (
        <div className="rounded-xl border border-dashed border-line px-6 py-14 text-center text-sm text-muted">
          Reading bookings…
        </div>
      ) : (
        <Panel
          title="Who is likely to order again"
          note={`${data.totals.repeat} of ${data.totals.customers} addresses with a booking have ordered more than once; ${data.totals.browsers} accounts have signed up without booking.`}
        >
          <p className="-mt-2 text-xs leading-relaxed text-subtle">
            A customer is on this list because they booked twice or more, or booked once and the
            shop has a design in the same category they have not taken. That is the whole rule —
            with a few dozen orders there is nothing here for a model to have learned from, so no
            score is pretended at.
          </p>
          {data.rows.length === 0 ? (
            <p className="mt-4 text-sm text-muted">
              No booking on file carries an email address yet, so there is nobody to list.
            </p>
          ) : (
            <ul className="mt-4 space-y-3">
              {data.rows.map((c) => (
                <li
                  key={c.email}
                  className="rounded-lg border border-line bg-paper/40 px-4 py-3"
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                    <p className="min-w-0 truncate text-sm">
                      {c.name || initials(c.email)}{" "}
                      <span className="text-xs text-subtle">{c.email}</span>
                    </p>
                    <p className="text-xs tabular-nums text-muted">
                      {c.bookings} {c.bookings === 1 ? "booking" : "bookings"} ·{" "}
                      {formatInr(c.value)}
                    </p>
                  </div>
                  <p className="mt-1 text-xs text-muted">{c.why}</p>
                  {c.suggestions.length > 0 && (
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <span className="text-[0.6rem] tracking-[0.14em] text-subtle uppercase">
                        {c.topCategory}, not yet taken
                      </span>
                      {c.suggestions.map((s) => (
                        <span
                          key={s.sku}
                          className="flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1 text-[0.66rem]"
                        >
                          <img src={s.image} alt="" className="h-5 w-5 rounded-full object-cover" />
                          {s.name} · {formatInr(s.price)}
                        </span>
                      ))}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </Panel>
      )}

      <UsersPanel />
    </div>
  );
}

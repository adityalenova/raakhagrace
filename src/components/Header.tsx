import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { ChevronDown, Menu, Search, ShoppingBag, User, X } from "lucide-react";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { useCart } from "@/lib/cart-store";
import { useProductList } from "@/lib/catalog-store";
import { NAV_MENUS, type NavMenu } from "@/lib/nav";
import { LotusMark } from "./LotusMark";

export function Header() {
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [q, setQ] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);
  /** Which top-level mega panel is open on desktop (null = closed). */
  const [menu, setMenu] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const count = useCart((s) => s.items.reduce((n, i) => n + i.qty, 0));
  const { user, isPending } = useCurrentUserState();
  const catalog = useProductList();

  const results = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (t.length < 2) return [];
    return catalog
      .filter(
        (p) =>
          p.name.toLowerCase().includes(t) ||
          p.category.includes(t) ||
          p.sku.toLowerCase().includes(t),
      )
      .slice(0, 6);
  }, [q, catalog]);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    setOpen(false);
    setExpanded(null);
    setMenu(null);
  }, [pathname]);

  // Escape closes the mega panel, and focus returns to the button that opened it.
  useEffect(() => {
    if (!menu) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenu(null);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [menu]);

  const isActive = (to: string) => pathname === to || pathname.startsWith(`${to}/`);

  const brand = (
    <Link
      to="/"
      className="flex min-w-0 items-center gap-2.5 text-fg"
      aria-label="Raakha Grace home"
      onClick={() => setOpen(false)}
    >
      <LotusMark className="h-9" />
      <span className="font-display text-lg tracking-[0.16em] sm:text-[1.35rem]">RAAKHA GRACE</span>
    </Link>
  );

  const account = (
    <div className="flex items-center gap-0.5 sm:gap-1">
      <button
        type="button"
        className="hidden h-11 w-11 place-items-center text-fg sm:grid"
        aria-label="Search"
        onClick={() => {
          setOpen(false);
          setMenu(null);
          setSearchOpen((v) => !v);
        }}
      >
        <Search className="h-5 w-5" />
      </button>
      {isPending ? (
        <div className="h-8 w-8 animate-pulse rounded-full bg-paper" />
      ) : (
        <Link
          to={user ? "/dashboard" : "/login"}
          className="grid h-11 w-11 place-items-center text-fg"
          aria-label={user ? "Account" : "Sign in"}
          onClick={() => setOpen(false)}
        >
          <User className="h-5 w-5" />
        </Link>
      )}
      <Link
        to="/cart"
        className="relative grid h-11 w-11 place-items-center text-fg"
        aria-label="Cart"
        onClick={() => setOpen(false)}
      >
        <ShoppingBag className="h-5 w-5" />
        {count > 0 && (
          <span className="absolute right-1 top-1 grid h-4 min-w-4 place-items-center rounded-full bg-fg px-1 text-[10px] text-bg">
            {count}
          </span>
        )}
      </Link>
    </div>
  );

  const mega = NAV_MENUS.find((m) => m.label === menu) ?? null;

  const mobileMenu =
    open && mounted
      ? createPortal(
          <div className="fixed inset-0 z-[60] flex flex-col bg-surface xl:hidden">
            <p className="bg-ink px-3 py-2 text-center text-[0.62rem] leading-snug tracking-[0.22em] text-ink-fg uppercase">
              Handmade with heart · Free shipping across India
            </p>
            <div className="flex h-16 items-center justify-between gap-3 border-b border-line px-4 sm:h-[4.5rem] sm:px-6">
              <button
                type="button"
                className="grid h-11 w-11 place-items-center text-fg"
                aria-label="Close menu"
                onClick={() => setOpen(false)}
              >
                <X className="h-5 w-5" />
              </button>
              {brand}
              {account}
            </div>
            <nav className="min-h-0 flex-1 overflow-y-auto px-6 pb-10 pt-2">
              {NAV_MENUS.map((m) => (
                <Accordion
                  key={m.label}
                  label={m.label}
                  open={expanded === m.label}
                  onToggle={() =>
                    setExpanded((v) => (v === m.label ? null : m.label))
                  }
                >
                  <TileRail tiles={m.tiles} onNavigate={() => setOpen(false)} />
                  <Link
                    to={m.to}
                    className="mt-4 inline-block text-[0.65rem] tracking-[0.18em] text-accent uppercase underline underline-offset-4"
                    onClick={() => setOpen(false)}
                  >
                    View all {m.label}
                  </Link>
                </Accordion>
              ))}
            </nav>
          </div>,
          document.body,
        )
      : null;

  return (
    <header className="sticky top-0 z-40 bg-surface/95 backdrop-blur-md">
      <p className="bg-ink px-3 py-2 text-center text-[0.62rem] leading-snug tracking-[0.22em] text-ink-fg uppercase">
        Handmade with heart · Free shipping across India
      </p>
      <div className="border-b border-line" onMouseLeave={() => setMenu(null)}>
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:h-[4.5rem] sm:px-6">
          <button
            type="button"
            className="grid h-11 w-11 place-items-center text-fg xl:hidden"
            aria-label="Open menu"
            onClick={() => setOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </button>

          {brand}

          <nav className="hidden items-center gap-7 text-[0.65rem] font-medium tracking-[0.18em] uppercase text-fg xl:flex">
            {NAV_MENUS.map((n) => {
              const shown = isActive(n.to) || menu === n.label;
              return (
                <button
                  key={n.label}
                  type="button"
                  aria-expanded={menu === n.label}
                  aria-controls={menu === n.label ? "mega-panel" : undefined}
                  className={`relative inline-flex items-center gap-1 py-2 transition ${
                    shown ? "text-accent" : "hover:text-accent"
                  }`}
                  onClick={() => setMenu((v) => (v === n.label ? null : n.label))}
                  // Once a panel is open, sliding across the row previews the others.
                  onMouseEnter={() => menu && setMenu(n.label)}
                >
                  {n.label}
                  <ChevronDown
                    className={`h-3 w-3 transition-transform ${menu === n.label ? "rotate-180" : ""}`}
                  />
                  <span
                    className={`absolute inset-x-0 -bottom-px h-[2px] origin-left bg-accent transition-transform duration-200 ${
                      shown ? "scale-x-100" : "scale-x-0"
                    }`}
                  />
                </button>
              );
            })}
          </nav>

          {account}
        </div>

        {mega && (
          <div
            id="mega-panel"
            className="absolute inset-x-0 top-full hidden border-b border-line bg-surface shadow-[0_24px_48px_-28px_rgba(91,54,35,0.35)] xl:block"
          >
            <div className="mx-auto flex max-w-7xl gap-10 px-6 py-10">
              <div className="w-56 shrink-0">
                <p className="font-display text-2xl text-fg">{mega.label}</p>
                <p className="mt-2 text-sm leading-relaxed text-muted">{mega.blurb}</p>
                <Link
                  to={mega.to}
                  className="mt-5 inline-block text-[0.65rem] tracking-[0.18em] text-accent uppercase underline underline-offset-4"
                  onClick={() => setMenu(null)}
                >
                  View all
                </Link>
              </div>
              {/* One row, tiles share the space up to a cap — a fixed width left
                  the sixth tile stranded on its own line. */}
              <div className="flex flex-1 gap-4">
                {mega.tiles.map((t) => (
                  <Link
                    key={`${t.label}-${t.search ? JSON.stringify(t.search) : ""}`}
                    to={t.to}
                    // TanStack types the search param per route; the panel data is
                    // authored against the same filters each catalog page reads.
                    search={t.search as never}
                    className="group min-w-0 max-w-[200px] flex-1"
                    onClick={() => setMenu(null)}
                  >
                    <span className="block overflow-hidden rounded-md bg-paper">
                      <img
                        src={t.image}
                        alt=""
                        loading="lazy"
                        className="aspect-[3/4] w-full object-cover transition duration-500 group-hover:scale-[1.04]"
                      />
                    </span>
                    <span className="mt-3 block text-center text-[0.62rem] leading-snug tracking-[0.16em] text-fg uppercase group-hover:text-accent">
                      {t.label}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {searchOpen && (
        <div className="border-b border-line bg-surface px-4 py-4 sm:px-6">
          <div className="mx-auto max-w-2xl">
            <input
              autoFocus
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search jewellery"
              className="h-12 w-full rounded-md border border-line bg-bg px-4 text-sm outline-none focus:border-accent"
            />
            {results.length > 0 && (
              <ul className="mt-2 divide-y divide-line">
                {results.map((p) => (
                  <li key={p.id}>
                    <button
                      type="button"
                      className="flex w-full items-center gap-3 py-3 text-left"
                      onClick={() => {
                        setSearchOpen(false);
                        setQ("");
                        void navigate({ to: "/product/$id", params: { id: p.id } });
                      }}
                    >
                      <img src={p.image} alt="" className="h-12 w-12 rounded-sm object-cover" />
                      <span className="text-sm">{p.name}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
      {mobileMenu}
    </header>
  );
}

function Accordion({
  label,
  open,
  onToggle,
  children,
}: {
  label: string;
  open: boolean;
  onToggle: () => void;
  children: ReactNode;
}) {
  return (
    <div className="border-b border-line/70">
      <button
        type="button"
        className="flex w-full items-center justify-between py-4 font-display text-[1.65rem] tracking-[0.14em] uppercase"
        onClick={onToggle}
        aria-expanded={open}
      >
        {label}
        <ChevronDown className={`h-5 w-5 text-muted transition ${open ? "rotate-180" : ""}`} />
      </button>
      {open ? <div className="pb-5">{children}</div> : null}
    </div>
  );
}

/** The same tiles as the desktop panel, as a swipeable rail on mobile. */
function TileRail({ tiles, onNavigate }: { tiles: NavMenu["tiles"]; onNavigate: () => void }) {
  return (
    <div className="-mx-1 flex gap-3 overflow-x-auto pb-1">
      {tiles.map((t) => (
        <Link
          key={`${t.label}-${t.search ? JSON.stringify(t.search) : ""}`}
          to={t.to}
          search={t.search as never}
          className="w-[108px] shrink-0"
          onClick={onNavigate}
        >
          <span className="block overflow-hidden rounded-md bg-paper">
            <img src={t.image} alt="" loading="lazy" className="aspect-[3/4] w-full object-cover" />
          </span>
          <span className="mt-2 block text-center text-[0.58rem] leading-snug tracking-[0.14em] text-muted uppercase">
            {t.label}
          </span>
        </Link>
      ))}
    </div>
  );
}

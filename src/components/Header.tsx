import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { ChevronDown, Menu, Search, ShoppingBag, User, X } from "lucide-react";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { useCart } from "@/lib/cart-store";
import { useProductList } from "@/lib/catalog-store";
import { LotusMark } from "./LotusMark";

const SHOP = [
  { to: "/jewellery" as const, label: "Jewellery" },
  { to: "/ornaments" as const, label: "Ornaments" },
  { to: "/gifts" as const, label: "Gifts" },
];

const COLLECTIONS = [
  { to: "/specials" as const, label: "Specials" },
  { to: "/daily-wear" as const, label: "Daily Wear" },
];

const HOUSE = [
  { to: "/about" as const, label: "About us" },
  { to: "/blog" as const, label: "Blog" },
  { to: "/community" as const, label: "Community" },
];

export function Header() {
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [q, setQ] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);
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
  }, [pathname]);

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

  const menu =
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
              {SHOP.map((n) => (
                <Link
                  key={n.label}
                  to={n.to}
                  className="block border-b border-line/70 py-4 font-display text-[1.65rem] tracking-[0.14em] uppercase"
                  onClick={() => setOpen(false)}
                >
                  {n.label}
                </Link>
              ))}
              <Accordion
                label="Collections"
                open={expanded === "collections"}
                onToggle={() => setExpanded((v) => (v === "collections" ? null : "collections"))}
              >
                {COLLECTIONS.map((n) => (
                  <Link
                    key={n.label}
                    to={n.to}
                    className="block py-2 text-sm tracking-[0.16em] text-muted uppercase"
                    onClick={() => setOpen(false)}
                  >
                    {n.label}
                  </Link>
                ))}
              </Accordion>
              <Accordion
                label="The House"
                open={expanded === "house"}
                onToggle={() => setExpanded((v) => (v === "house" ? null : "house"))}
              >
                {HOUSE.map((n) => (
                  <Link
                    key={n.label}
                    to={n.to}
                    className="block py-2 text-sm tracking-[0.16em] text-muted uppercase"
                    onClick={() => setOpen(false)}
                  >
                    {n.label}
                  </Link>
                ))}
              </Accordion>
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
      <div className="border-b border-line">
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

          <nav className="hidden items-center gap-6 text-[0.65rem] font-medium tracking-[0.18em] uppercase text-fg xl:flex">
            {SHOP.map((n) => (
              <Link
                key={n.label}
                to={n.to}
                className={isActive(n.to) ? "text-accent" : "hover:text-accent"}
              >
                {n.label}
              </Link>
            ))}
            <DesktopGroup
              label="Collections"
              items={COLLECTIONS}
              active={COLLECTIONS.some((i) => isActive(i.to))}
            />
            <DesktopGroup
              label="The House"
              items={HOUSE}
              active={HOUSE.some((i) => isActive(i.to))}
            />
          </nav>

          {account}
        </div>
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
      {menu}
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
      {open ? <div className="pb-4">{children}</div> : null}
    </div>
  );
}

function DesktopGroup({
  label,
  items,
  active,
}: {
  label: string;
  items: { to: "/specials" | "/daily-wear" | "/about" | "/blog" | "/community"; label: string }[];
  active: boolean;
}) {
  return (
    <div className="group relative">
      <span
        className={`inline-flex cursor-default items-center gap-1 ${active ? "text-accent" : "hover:text-accent"}`}
      >
        {label}
        <ChevronDown className="h-3 w-3" />
      </span>
      <div className="invisible absolute left-1/2 top-full z-50 min-w-44 -translate-x-1/2 pt-3 opacity-0 transition group-hover:visible group-hover:opacity-100">
        <div className="rounded-md border border-line bg-surface py-2 shadow-lg">
          {items.map((n) => (
            <Link
              key={n.label}
              to={n.to}
              className="block px-4 py-2 text-[0.65rem] tracking-[0.16em] uppercase hover:text-accent"
            >
              {n.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

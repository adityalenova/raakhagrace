import { Link } from "@tanstack/react-router";
import { MessageCircle, ShoppingBag, Sparkles, X } from "lucide-react";
import { useMemo, useState } from "react";
import { askShopAi } from "@/lib/ai";
import { useCart } from "@/lib/cart-store";
import { useCatalog } from "@/lib/catalog-store";
import { formatInr } from "@/lib/utils";

type Msg = { role: "user" | "assistant"; content: string };

function extractIds(text: string) {
  const ids = [...text.matchAll(/\[([a-z0-9-]+)\]/g)].map((m) => m[1]);
  return [...new Set(ids)].map((id) => useCatalog.getState().get(id)).filter(Boolean);
}

export function ShopAi() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "assistant",
      content:
        "I am Grace AI. Tell me an occasion, metal, or budget and I will pull pieces from the Raakha Grace atelier.",
    },
  ]);
  const add = useCart((s) => s.add);
  const featured = useCatalog((s) => s.list()[0]);

  async function send(text?: string) {
    const message = (text ?? input).trim();
    if (!message || busy) return;
    setInput("");
    const history = [...messages, { role: "user" as const, content: message }];
    setMessages(history);
    setBusy(true);
    const res = await askShopAi({
      data: {
        message,
        history: history.slice(-6).map((m) => ({ role: m.role, content: m.content })),
      },
    });
    setBusy(false);
    setMessages((m) => [...m, { role: "assistant", content: res.ok ? res.text : res.error }]);
  }

  const lastRecs = extractIds(messages.filter((m) => m.role === "assistant").at(-1)?.content ?? "");

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-5 right-5 z-40 flex h-12 items-center gap-2 rounded-full bg-ink px-4 text-xs tracking-[0.14em] text-ink-fg uppercase shadow-lg"
      >
        <Sparkles className="h-4 w-4" />
        Shop with AI
      </button>

      {open && (
        <div className="fixed bottom-4 right-4 z-50 flex h-[min(640px,86vh)] w-[min(380px,calc(100vw-1.5rem))] flex-col overflow-hidden rounded-2xl bg-ink text-ink-fg shadow-2xl">
          <div className="flex items-center gap-2 border-b border-white/10 px-3 py-3">
            <div className="grid h-8 w-8 place-items-center rounded-full bg-white/10">
              <Sparkles className="h-4 w-4" />
            </div>
            <div className="flex-1 text-sm font-medium">Grace AI</div>
            <Link
              to="/cart"
              className="grid h-9 w-9 place-items-center rounded-md border border-white/15"
              aria-label="Cart"
            >
              <ShoppingBag className="h-4 w-4" />
            </Link>
            <button
              type="button"
              className="grid h-9 w-9 place-items-center"
              onClick={() => setOpen(false)}
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto p-3">
            <div className="overflow-hidden rounded-xl bg-white/5">
              <img src={featured.image} alt="" className="h-28 w-full object-cover" />
              <div className="p-3">
                {featured.compareAt ? (
                  <span className="rounded bg-white/10 px-2 py-0.5 text-[10px] uppercase">
                    {Math.round((1 - featured.price / featured.compareAt) * 100)}% off
                  </span>
                ) : null}
                <h3 className="mt-2 text-sm font-medium underline decoration-white/30">
                  {featured.name}
                </h3>
                <p className="mt-1 text-sm tabular-nums text-emerald-300">
                  {formatInr(featured.price)}{" "}
                  {featured.compareAt ? (
                    <span className="text-ink-muted line-through">
                      {formatInr(featured.compareAt)}
                    </span>
                  ) : null}
                </p>
                <ul className="mt-3 space-y-1 text-xs text-ink-muted">
                  {featured.details.map((d) => (
                    <li key={d}>· {d}</li>
                  ))}
                </ul>
                <button
                  type="button"
                  className="mt-4 h-11 w-full rounded-full bg-surface text-sm text-fg"
                  onClick={() => add(featured.id)}
                >
                  + Add to cart
                </button>
              </div>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                className="rounded-full border border-white/15 px-3 py-2 text-xs"
                onClick={() => add(featured.id)}
              >
                Add to cart
              </button>
              <Link
                to="/jewellery"
                className="rounded-full border border-white/15 px-3 py-2 text-xs"
              >
                Shop bracelets
              </Link>
              <Link
                to="/jewellery"
                className="rounded-full border border-white/15 px-3 py-2 text-xs"
              >
                Browse jewellery sets
              </Link>
            </div>

            <div className="mt-4 space-y-3 text-sm">
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={m.role === "user" ? "text-right text-ink-muted" : "text-ink-fg"}
                >
                  {m.content.replace(/\[[a-z0-9-]+\]/g, "").trim()}
                </div>
              ))}
              {busy && (
                <p className="text-xs text-ink-muted">Grace is looking through the atelier…</p>
              )}
              {lastRecs.map((p) =>
                p ? (
                  <div key={p.id} className="flex items-center gap-3 rounded-lg bg-white/5 p-2">
                    <img src={p.image} alt="" className="h-12 w-12 rounded object-cover" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs">{p.name}</p>
                      <p className="text-xs tabular-nums text-ink-muted">{formatInr(p.price)}</p>
                    </div>
                    <button type="button" className="text-xs underline" onClick={() => add(p.id)}>
                      Add
                    </button>
                  </div>
                ) : null,
              )}
            </div>
          </div>

          <form
            className="border-t border-white/10 p-3"
            onSubmit={(e) => {
              e.preventDefault();
              void send();
            }}
          >
            <div className="flex items-center gap-2 rounded-full border border-white/15 px-3">
              <MessageCircle className="h-4 w-4 text-ink-muted" />
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Message Grace AI"
                className="h-11 flex-1 bg-transparent text-sm outline-none placeholder:text-ink-muted"
              />
            </div>
          </form>
        </div>
      )}
    </>
  );
}

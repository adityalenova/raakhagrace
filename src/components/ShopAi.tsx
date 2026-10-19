import { Link } from "@tanstack/react-router";
import { ArrowUp, MessageCircle, Sparkles, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { askShopAi } from "@/lib/ai";
import { useCart } from "@/lib/cart-store";
import { useCatalog } from "@/lib/catalog-store";
import { whatsappLink } from "@/lib/contact";
import { formatInr } from "@/lib/utils";

type Msg = { role: "user" | "assistant"; content: string; ids?: string[] };

const OPENING: Msg = {
  role: "assistant",
  content:
    "Hello — I am Grace, I know every piece in the atelier. Tell me who it is for, the occasion, or a budget, and I will bring out a few strands. You can also ask me about sizing, shipping or how ordering works.",
};

const STARTERS = [
  "Anniversary gift under ₹1,500",
  "Something light for daily wear",
  "Pearl necklace",
  "How does ordering work?",
];

/** `**bold**` and newlines only — the model is told to keep it plain. */
function RichText({ text }: { text: string }) {
  return (
    <>
      {text.split("\n").map((ln, i) => (
        <p key={i} className={i > 0 ? "mt-1.5" : undefined}>
          {ln
            .split(/\*\*(.+?)\*\*/g)
            .map((part, j) => (j % 2 ? <strong key={j}>{part}</strong> : <span key={j}>{part}</span>))}
        </p>
      ))}
    </>
  );
}

export function ShopAi() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([OPENING]);
  const add = useCart((s) => s.add);
  const get = useCatalog((s) => s.get);
  const scroller = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scroller.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, busy, open]);

  async function send(text?: string) {
    const message = (text ?? input).trim();
    if (!message || busy) return;
    setInput("");
    setMessages((m) => [...m, { role: "user", content: message }]);
    setBusy(true);
    let reply: Msg = {
      role: "assistant",
      content: "Give me a moment — I am walking to the bench.",
    };
    try {
      const res = await askShopAi({
        data: {
          message,
          history: messages
            .slice(-6)
            .map((m) => ({ role: m.role, content: m.content })),
        },
      });
      reply = { role: "assistant", content: res.text, ids: res.ids };
    } finally {
      setBusy(false);
      setMessages((m) => [...m, reply]);
    }
  }

  const last = messages.at(-1);
  const askedSomething = messages.length > 1;
  const handoff = () => {
    const asks = messages.filter((m) => m.role === "user").map((m) => m.content);
    const recs = (last?.ids ?? []).map((id) => get(id)?.name).filter(Boolean);
    const lines = [
      "Hi Raakha Grace, from your website chat:",
      asks.length ? `I asked: ${asks[asks.length - 1]}` : "",
      recs.length ? `You suggested: ${recs.join(", ")}` : "",
    ].filter(Boolean);
    window.open(whatsappLink(lines.join("\n")), "_blank", "noopener,noreferrer");
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="fixed bottom-5 right-5 z-40 flex h-12 items-center gap-2 rounded-full bg-ink px-4 text-[0.72rem] font-medium tracking-[0.14em] text-ink-fg uppercase shadow-lg transition hover:bg-fg"
      >
        {open ? <X className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
        {open ? "Close" : "Ask Grace"}
      </button>

      {/* Kept mounted so the thread survives opening and closing the panel. */}
      <div
        className={`fixed bottom-20 right-4 z-40 flex h-[min(620px,80vh)] w-[min(390px,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl bg-ink text-ink-fg shadow-2xl ring-1 ring-white/10 transition xl:bottom-24 xl:right-5 ${
          open ? "pointer-events-auto translate-y-0 opacity-100" : "pointer-events-none translate-y-3 opacity-0"
        }`}
        aria-hidden={!open}
      >
        <div className="flex items-center gap-3 border-b border-white/10 px-4 py-3">
          <span className="relative grid h-9 w-9 place-items-center rounded-full bg-white/10">
            <Sparkles className="h-4 w-4" />
            <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-400 ring-2 ring-ink" />
          </span>
          <div className="flex-1">
            <p className="text-sm font-medium">Grace</p>
            <p className="text-[0.7rem] text-ink-muted">Atelier stylist · replies at once</p>
          </div>
          <button
            type="button"
            className="grid h-9 w-9 place-items-center rounded-md text-ink-muted hover:text-ink-fg"
            onClick={() => setOpen(false)}
            aria-label="Close chat"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div ref={scroller} className="min-h-0 flex-1 space-y-3 overflow-y-auto px-3.5 py-4">
          {messages.map((m, i) => (
            <div key={i} className={m.role === "user" ? "flex justify-end" : ""}>
              <div
                className={
                  m.role === "user"
                    ? "max-w-[80%] rounded-2xl rounded-br-sm bg-accent px-3.5 py-2.5 text-sm leading-relaxed text-white"
                    : "max-w-[92%] rounded-2xl rounded-bl-sm bg-white/8 px-3.5 py-2.5 text-sm leading-relaxed"
                }
              >
                <RichText text={m.content.replace(/\[[a-z0-9-]+\]/g, "").trim()} />
              </div>
            </div>
          ))}

          {busy && (
            <div className="flex">
              <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-sm bg-white/8 px-4 py-3">
                {[0, 1, 2].map((d) => (
                  <span
                    key={d}
                    className="h-1.5 w-1.5 animate-bounce rounded-full bg-ink-muted"
                    style={{ animationDelay: `${d * 120}ms` }}
                  />
                ))}
              </div>
            </div>
          )}

          {last?.role === "assistant" && last.ids?.length
            ? last.ids.map((id) => {
                const p = get(id);
                if (!p) return null;
                return (
                  <div key={id} className="flex items-center gap-3 rounded-xl bg-white/6 p-2.5">
                    <Link
                      to="/product/$id"
                      params={{ id: p.id }}
                      onClick={() => setOpen(false)}
                      className="shrink-0 overflow-hidden rounded-lg"
                    >
                      <img
                        src={p.image}
                        alt={p.name}
                        loading="lazy"
                        className="h-14 w-14 object-cover"
                      />
                    </Link>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[0.83rem]">{p.name}</p>
                      <p className="text-xs tabular-nums text-ink-muted">
                        {formatInr(p.price)} · {p.stock > 0 ? `${p.stock} at the bench` : "made to order"}
                      </p>
                    </div>
                    <button
                      type="button"
                      className="shrink-0 rounded-full border border-white/20 px-2.5 py-1.5 text-[0.68rem] tracking-[0.1em] uppercase hover:border-ink-fg"
                      onClick={() => add(p.id)}
                    >
                      Add
                    </button>
                  </div>
                );
              })
            : null}

          {!askedSomething && (
            <div className="flex flex-wrap gap-2 pt-1">
              {STARTERS.map((s) => (
                <button
                  key={s}
                  type="button"
                  className="rounded-full border border-white/15 px-3 py-1.5 text-xs text-ink-muted hover:border-ink-fg hover:text-ink-fg"
                  onClick={() => void send(s)}
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>

        {askedSomething && (
          <button
            type="button"
            onClick={handoff}
            className="mx-3 mb-1 flex items-center justify-center gap-2 rounded-xl border border-white/10 py-2.5 text-[0.7rem] tracking-[0.14em] text-ink-muted uppercase hover:border-white/30 hover:text-ink-fg"
          >
            <MessageCircle className="h-3.5 w-3.5" />
            Send this to the atelier on WhatsApp
          </button>
        )}

        <form
          className="border-t border-white/10 p-3"
          onSubmit={(e) => {
            e.preventDefault();
            void send();
          }}
        >
          <div className="flex items-end gap-2 rounded-2xl border border-white/15 bg-white/5 px-3 py-2 focus-within:border-white/35">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  void send();
                }
              }}
              rows={1}
              placeholder="Ask about a piece, an occasion, or ordering"
              className="max-h-24 min-h-8 flex-1 resize-none bg-transparent text-sm leading-6 outline-none placeholder:text-ink-muted"
            />
            <button
              type="submit"
              disabled={!input.trim() || busy}
              aria-label="Send message"
              className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-accent text-white disabled:opacity-40"
            >
              <ArrowUp className="h-4 w-4" />
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

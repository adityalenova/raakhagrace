import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { LotusMark } from "@/components/LotusMark";

export const Route = createFileRoute("/login")({ component: Login });

/**
 * Auth page — UI only. Google / email / guest buttons are presentational
 * until real providers are connected later.
 */
function Login() {
  const [mode, setMode] = useState<"in" | "up">("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [note, setNote] = useState<string | null>(null);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    setNote("Sign-in will be available soon. For orders, use Book on WhatsApp at checkout.");
  }

  function onGoogle() {
    setNote("Google sign-in will be available soon. For orders, use Book on WhatsApp at checkout.");
  }

  function onGuest() {
    setNote("Guest access will be available soon. Browse freely and book pieces on WhatsApp.");
  }

  return (
    <main className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden min-h-screen bg-[#1A1714] lg:block">
        <img src="/images/hero-woman.jpg" alt="" className="absolute inset-0 h-full w-full object-cover opacity-80" />
        <div className="absolute inset-0 bg-gradient-to-t from-fg/70 via-fg/20 to-transparent" />
        <div className="absolute bottom-12 left-10 right-10 max-w-md text-bg">
          <p className="font-display text-3xl italic leading-snug">A little gold, a little light — and you, more yourself.</p>
          <p className="mt-4 text-sm text-bg/70">Your cart and favourites will live here when accounts go live.</p>
        </div>
      </div>

      <div className="flex flex-col justify-center bg-bg px-6 py-14 sm:px-12 lg:px-16">
        <Link to="/" className="mb-8 flex items-center gap-2.5 text-fg">
          <LotusMark className="h-9 w-9" />
          <span className="font-display text-xl tracking-[0.16em]">RAAKHA GRACE</span>
        </Link>

        <h1 className="font-display text-4xl sm:text-5xl">Welcome back</h1>
        <p className="mt-2 max-w-md text-sm text-muted">
          Sign in to the atelier. For now this screen is a preview — orders are confirmed on WhatsApp.
        </p>

        <div className="mt-8 space-y-3">
          <button
            type="button"
            onClick={onGoogle}
            className="flex h-12 w-full items-center justify-center gap-3 rounded-md bg-fg text-sm tracking-[0.08em] text-bg transition hover:opacity-90"
          >
            <GoogleMark />
            Sign in with Google
          </button>
        </div>

        <div className="my-7 flex items-center gap-4 text-[0.65rem] tracking-[0.22em] text-subtle uppercase">
          <span className="h-px flex-1 bg-line" />
          or email
          <span className="h-px flex-1 bg-line" />
        </div>

        <form onSubmit={onSubmit} className="space-y-3">
          {mode === "up" && (
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className="h-12 w-full rounded-md border border-line bg-surface px-4 text-sm outline-none focus:border-accent"
            />
          )}
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email address"
            className="h-12 w-full rounded-md border border-line bg-surface px-4 text-sm outline-none focus:border-accent"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password (min 8 characters)"
            className="h-12 w-full rounded-md border border-line bg-surface px-4 text-sm outline-none focus:border-accent"
          />
          {note && <p className="text-sm text-muted">{note}</p>}
          <button
            type="submit"
            className="h-12 w-full rounded-md border border-fg text-sm tracking-[0.16em] uppercase transition hover:bg-fg hover:text-bg"
          >
            {mode === "up" ? "Create account" : "Sign in with email"}
          </button>
        </form>

        <button
          type="button"
          className="mt-4 text-sm text-muted underline underline-offset-4"
          onClick={() => {
            setMode(mode === "in" ? "up" : "in");
            setNote(null);
          }}
        >
          {mode === "in" ? "Need an account? Create one" : "Already with us? Sign in"}
        </button>

        <div className="my-7 flex items-center gap-4 text-[0.65rem] tracking-[0.22em] text-subtle uppercase">
          <span className="h-px flex-1 bg-line" />
          or continue lightly
          <span className="h-px flex-1 bg-line" />
        </div>

        <button
          type="button"
          onClick={onGuest}
          className="h-12 w-full rounded-md border border-line bg-surface text-sm tracking-[0.12em] text-fg transition hover:border-fg"
        >
          Sign in as Guest
        </button>

        <Link to="/" className="mt-8 text-center text-sm text-muted underline underline-offset-4">
          Back to store
        </Link>
      </div>
    </main>
  );
}

function GoogleMark() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}

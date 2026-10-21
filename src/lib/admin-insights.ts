import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getSql } from "@/lib/db";
import type { MailLogEntry } from "./email/mail-log.server";
import { PRODUCTS } from "./products";

/**
 * The atelier's own numbers, read off the rows the shop already writes.
 *
 * Two things this deliberately is not:
 *
 * 1. It is not visitor analytics. Nothing on this site drops a tracking cookie
 *    (see `/cookie-information`), so there is no page-view series to draw. The
 *    honest version counts bookings, sign-ups and pieces sold — which is what a
 *    bench of this size actually decides with.
 * 2. It is not a client-side illusion. Both callables sit behind
 *    `requireAdmin()`, so the SQL runs against the verified session's address on
 *    the allowlist and a browser cannot ask for these rows by hand.
 *
 * Every count is cast `::int8` on purpose: `db.ts` normalises int8 to a number,
 * while `numeric` — what `sum()` and `avg()` return — would arrive as a string
 * and silently turn `₹4,200` into `NaN`. Timestamps go out as epoch
 * milliseconds for the same reason: no Date object crossing the server-function
 * boundary and arriving differently on the other side.
 */

const OPEN_STATUSES = ["new", "confirmed", "packed", "shipped"];

export type Analytics = {
  catalogue: { pieces: number; soldOut: number; value: number };
  people: {
    signups: number;
    verified: number;
    last7: number;
    last30: number;
    active30: number;
    sessions30: number;
  };
  growth: {
    signups30: number;
    signupsPrev30: number;
    orders30: number;
    ordersPrev30: number;
    revenue30: number;
    revenuePrev30: number;
  };
  orders: {
    total: number;
    open: number;
    delivered: number;
    cancelled: number;
    revenue: number;
    average: number;
    byStatus: { status: string; count: number; value: number }[];
    byChannel: { channel: string; count: number; value: number }[];
  };
  signupSeries: { day: string; count: number }[];
  orderSeries: { day: string; count: number; value: number }[];
  pieces: { name: string; units: number; value: number; bookings: number }[];
  providers: { provider: string; accounts: number }[];
};

function n(value: unknown): number {
  const asNumber = typeof value === "number" ? value : Number(value);
  return Number.isFinite(asNumber) ? asNumber : 0;
}

/**
 * Day key for a chart axis, pinned to UTC. `date_trunc` on a timestamptz truncates
 * in the session time zone, which is UTC on the deployed functions and local under
 * the PGLite fallback — so without `at time zone 'UTC'` the same day's bookings can
 * land on two different keys, and the client builds its axis from
 * `toISOString().slice(0, 10)`, which is UTC.
 */
const DAY = (col: string) => `to_char(date_trunc('day', ${col} at time zone 'UTC'), 'YYYY-MM-DD')`;
/** Epoch milliseconds as an int8 — a number on both Neon and the PGLite fallback. */
const MS = (col: string) => `floor(extract(epoch from ${col}) * 1000)::bigint`;

export const adminAnalytics = createServerFn({ method: "GET" }).handler(async (): Promise<Analytics> => {
  const { requireAdmin } = await import("@/lib/admin.server");
  await requireAdmin();
  const sql = await getSql();

  const openList = OPEN_STATUSES.map((s) => `'${s}'`).join(", ");

  // Postgres folds an unquoted column alias to lower case, so a camelCase alias
  // comes back as `signupsprev` and the camelCase read in JavaScript is silently
  // `undefined` — which `n()` then turns into a plausible-looking zero. Every
  // alias below is therefore one lowercase word, or an explicit snake_case name
  // matched by the same snake_case key on this side.

  // One query per shape rather than one giant one: these tables are tiny, and a
  // readable SQL string is worth more here than saving four round trips.
  const [people, active, totals, growth, status, channel, signups, orders, pieces, providers] =
    await Promise.all([
      sql.query<{ signups: unknown; verified: unknown; last7: unknown; last30: unknown }>(
        `select count(*)::int8 as signups,
                count(*) filter (where "emailVerified")::int8 as verified,
                count(*) filter (where "createdAt" >= now() - interval '7 days')::int8 as last7,
                count(*) filter (where "createdAt" >= now() - interval '30 days')::int8 as last30
         from "user"`,
      ),
      sql.query<{ users: unknown; sessions: unknown }>(
        `select count(distinct "userId") filter (where "updatedAt" >= now() - interval '30 days')::int8 as users,
                count(*) filter (where "updatedAt" >= now() - interval '30 days')::int8 as sessions
         from "session"`,
      ),
      sql.query<{
        total: unknown;
        open: unknown;
        delivered: unknown;
        cancelled: unknown;
        revenue: unknown;
        average: unknown;
      }>(
        `select count(*)::int8 as total,
                count(*) filter (where status in (${openList}))::int8 as open,
                count(*) filter (where status = 'delivered')::int8 as delivered,
                count(*) filter (where status = 'cancelled')::int8 as cancelled,
                coalesce(sum(total) filter (where status <> 'cancelled'), 0)::int8 as revenue,
                coalesce(avg(total) filter (where status <> 'cancelled'), 0)::int8 as average
         from orders`,
      ),
      sql.query<{
        signups30: unknown;
        signups_prev: unknown;
        orders30: unknown;
        orders_prev: unknown;
        revenue30: unknown;
        revenue_prev: unknown;
      }>(
        `select
           (select count(*) from "user"   where "createdAt" >= now() - interval '30 days')::int8 as signups30,
           (select count(*) from "user"   where "createdAt" >= now() - interval '60 days'
                                             and "createdAt" <  now() - interval '30 days')::int8 as signups_prev,
           (select count(*) from orders   where created_at  >= now() - interval '30 days')::int8 as orders30,
           (select count(*) from orders   where created_at  >= now() - interval '60 days'
                                             and created_at  <  now() - interval '30 days')::int8 as orders_prev,
           (select coalesce(sum(total), 0) from orders where created_at >= now() - interval '30 days'
                                                          and status <> 'cancelled')::int8 as revenue30,
           (select coalesce(sum(total), 0) from orders where created_at >= now() - interval '60 days'
                                                          and created_at < now() - interval '30 days'
                                                          and status <> 'cancelled')::int8 as revenue_prev`,
      ),
      sql.query<{ status: string; count: unknown; value: unknown }>(
        `select status, count(*)::int8 as count, coalesce(sum(total), 0)::int8 as value
         from orders group by status order by count(*) desc`,
      ),
      sql.query<{ channel: string; count: unknown; value: unknown }>(
        `select coalesce(channel, 'site') as channel, count(*)::int8 as count,
                coalesce(sum(total), 0)::int8 as value
         from orders group by 1 order by count(*) desc`,
      ),
      sql.query<{ day: string; count: unknown }>(
        `select ${DAY('"createdAt"')} as day, count(*)::int8 as count
         from "user" where "createdAt" >= now() - interval '30 days'
         group by 1 order by 1`,
      ),
      sql.query<{ day: string; count: unknown; value: unknown }>(
        `select ${DAY("created_at")} as day, count(*)::int8 as count,
                coalesce(sum(total), 0)::int8 as value
         from orders
         where created_at >= now() - interval '30 days' and status <> 'cancelled'
         group by 1 order by 1`,
      ),
      // `items` is the jsonb array a booking was made of. The typeof guard keeps a
      // hand-written row that is not an array from erroring the whole panel.
      sql.query<{ name: string | null; units: unknown; value: unknown; bookings: unknown }>(
        `select i->>'name' as name,
                coalesce(sum(((i->>'qty')::int)), 0)::int8 as units,
                coalesce(sum(((i->>'qty')::int) * ((i->>'price')::int)), 0)::int8 as value,
                count(distinct o.id)::int8 as bookings
         from orders o
         cross join lateral jsonb_array_elements(o.items) as i
         where o.status <> 'cancelled' and jsonb_typeof(o.items) = 'array'
         group by 1
         order by units desc, value desc
         limit 10`,
      ),
      sql.query<{ provider: string; accounts: unknown }>(
        `select "providerId" as provider, count(distinct "userId")::int8 as accounts
         from "account" group by 1 order by count(distinct "userId") desc`,
      ),
    ]);

  const catalogueValue = PRODUCTS.reduce((sum, p) => sum + p.price * p.stock, 0);

  return {
    catalogue: {
      pieces: PRODUCTS.length,
      soldOut: PRODUCTS.filter((p) => p.stock === 0).length,
      value: n(catalogueValue),
    },
    people: {
      signups: n(people[0]?.signups),
      verified: n(people[0]?.verified),
      last7: n(people[0]?.last7),
      last30: n(people[0]?.last30),
      active30: n(active[0]?.users),
      sessions30: n(active[0]?.sessions),
    },
    growth: {
      signups30: n(growth[0]?.signups30),
      signupsPrev30: n(growth[0]?.signups_prev),
      orders30: n(growth[0]?.orders30),
      ordersPrev30: n(growth[0]?.orders_prev),
      revenue30: n(growth[0]?.revenue30),
      revenuePrev30: n(growth[0]?.revenue_prev),
    },
    orders: {
      total: n(totals[0]?.total),
      open: n(totals[0]?.open),
      delivered: n(totals[0]?.delivered),
      cancelled: n(totals[0]?.cancelled),
      revenue: n(totals[0]?.revenue),
      average: n(totals[0]?.average),
      byStatus: status.map((r) => ({ status: r.status, count: n(r.count), value: n(r.value) })),
      byChannel: channel.map((r) => ({ channel: r.channel, count: n(r.count), value: n(r.value) })),
    },
    signupSeries: signups.map((r) => ({ day: r.day, count: n(r.count) })),
    orderSeries: orders.map((r) => ({ day: r.day, count: n(r.count), value: n(r.value) })),
    pieces: pieces
      .filter((r) => r.name)
      .map((r) => ({
        name: r.name as string,
        units: n(r.units),
        value: n(r.value),
        bookings: n(r.bookings),
      })),
    providers: providers.map((r) => ({ provider: r.provider, accounts: n(r.accounts) })),
  };
});

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  verified: boolean;
  image: string | null;
  providers: string;
  createdMs: number;
  lastSeenMs: number | null;
  bookings: number;
  spent: number;
};

export type UserRoster = {
  rows: AdminUser[];
  total: number;
  verified: number;
  withOrders: number;
  thisWeek: number;
};

/**
 * Everyone who has signed up, newest first, with what they have ordered.
 *
 * Reads the Better Auth tables (`"user"`, `"account"`, `"session"`) exactly as
 * migration 0001 wrote them — camelCase, so double-quoted throughout — joined
 * against the bookings the customer made. A name or email never leaves this
 * callable unfiltered: it runs only after `requireAdmin()`.
 */
export const adminUsers = createServerFn({ method: "GET" })
  .validator((input: unknown) =>
    z.object({ query: z.string().max(80).optional() }).parse((input ?? {}) as object),
  )
  .handler(async ({ data }): Promise<UserRoster> => {
    const { requireAdmin } = await import("@/lib/admin.server");
    await requireAdmin();
    const sql = await getSql();
    const q = data.query?.trim();
    const like = q ? `%${q.replace(/\s+/g, "%")}%` : null;

    const where = like ? `where u."name" ilike $1 or u."email" ilike $1` : "";
    const rows = await sql.query<{
      id: string;
      name: string;
      email: string;
      emailVerified: boolean;
      image: string | null;
      providers: string | null;
      created_ms: unknown;
      last_seen_ms: unknown;
      bookings: unknown;
      spent: unknown;
    }>(
      `select u."id", u."name", u."email", u."emailVerified", u."image",
              (select string_agg(distinct a."providerId", ', ')
                 from "account" a where a."userId" = u."id") as providers,
              ${MS('u."createdAt"')} as created_ms,
              (select ${MS('max(s."updatedAt")')} from "session" s
                where s."userId" = u."id") as last_seen_ms,
              (select count(*) from orders o
                where o.user_id = u."id" and o.status <> 'cancelled')::int8 as bookings,
              (select coalesce(sum(o.total), 0) from orders o
                where o.user_id = u."id" and o.status <> 'cancelled')::int8 as spent
       from "user" u
       ${where}
       order by u."createdAt" desc
       limit 60`,
      like ? [like] : [],
    );

    const summary = await sql.query<{
      total: unknown;
      verified: unknown;
      with_orders: unknown;
      this_week: unknown;
    }>(
      `select count(*)::int8 as total,
              count(*) filter (where "emailVerified")::int8 as verified,
              count(*) filter (where exists (
                select 1 from orders o where o.user_id = "user"."id" and o.status <> 'cancelled'
              ))::int8 as with_orders,
              count(*) filter (where "createdAt" >= now() - interval '7 days')::int8 as this_week
       from "user"`,
    );

    return {
      rows: rows.map((r) => ({
        id: r.id,
        name: r.name,
        email: r.email,
        verified: Boolean(r.emailVerified),
        image: r.image,
        providers: r.providers ?? "unknown",
        createdMs: n(r.created_ms),
        lastSeenMs: n(r.last_seen_ms) || null,
        bookings: n(r.bookings),
        spent: n(r.spent),
      })),
      total: n(summary[0]?.total),
      verified: n(summary[0]?.verified),
      withOrders: n(summary[0]?.with_orders),
      thisWeek: n(summary[0]?.this_week),
    };
  });

export type MailReport = {
  /** Key and sender both set, so the mailer will attempt a send at all. */
  configured: boolean;
  from: string | null;
  inbox: string | null;
  /**
   * Resend's sandbox sender. It answers 403 for every recipient except the
   * address the Resend account itself was opened with — which is exactly the
   * shape of "verification mails never arrive": the send looks like it happened
   * in the app, and Resend refuses it on the way out.
   */
  testSender: boolean;
  /** Present only when the caller asked for a live probe. */
  probe?: { ok: boolean; to: string; error?: string };
  /**
   * The tail of `mail_log`: every code, welcome mail, link, enquiry and probe
   * this deployment tried to send, newest first, with what Resend said. Empty on
   * a store that has never mailed anything.
   */
  recent: MailLogEntry[];
  /** True when reading that tail failed, so the panel can say so honestly. */
  recentFailed: boolean;
};

/**
 * Can this deployment actually mail a customer?
 *
 * The probe sends to the atelier's own inbox — a recipient the sandbox sender
 * does accept — so a green probe with a red `testSender` flag reads precisely:
 * the key works, the code works, and only a verified domain stands between this
 * shop and a verification mail that arrives.
 */
export const mailCheck = createServerFn({ method: "GET" })
  .validator((input: unknown) =>
    z.object({ probe: z.boolean().optional() }).parse((input ?? {}) as object),
  )
  .handler(async ({ data }): Promise<MailReport> => {
    const { requireAdmin } = await import("@/lib/admin.server");
    await requireAdmin();
    const { notifyInbox, resendConfigured, resendFrom, sendEmail } = await import(
      "@/lib/email/sender.server"
    );

    const from = resendFrom() ?? null;
    const inbox = notifyInbox() ?? null;
    const report: MailReport = {
      configured: resendConfigured(),
      from,
      inbox,
      testSender: /@resend\.dev>?\s*$/i.test(from ?? ""),
      recent: [],
      recentFailed: false,
    };

    if (data.probe) {
      if (!inbox) {
        report.probe = { ok: false, to: "(no ORDER_NOTIFY_EMAIL set)" };
        return withRecentMail(report);
      }
      const result = await sendEmail({
        to: inbox,
        subject: "Raakha Grace — mail delivery check",
        html:
          "<p>This is the atelier's own delivery probe. If it arrived, the API key and the " +
          "sender address both work; anything that still fails is a recipient problem, not a " +
          "code problem.</p>",
        kind: "probe",
      });
      report.probe = result.ok
        ? { ok: true, to: inbox }
        : { ok: false, to: inbox, error: result.error };
    }
    // Read last so the probe the caller may have just sent shows up in the tail.
    return withRecentMail(report);
  });

/**
 * Attach the outbox tail. A failure here is reported rather than swallowed:
 * the panel is the one place the owner comes to find out why mail did not
 * arrive, and "the log table is missing" is a different answer from "nothing
 * was ever sent" — the new table only exists after a deploy that ran
 * migrations, so an older deployment legitimately has none.
 */
async function withRecentMail(report: MailReport): Promise<MailReport> {
  try {
    const { recentMail } = await import("@/lib/email/mail-log.server");
    report.recent = await recentMail(25);
  } catch (err) {
    report.recentFailed = true;
    console.error("[mail] could not read the outbox log:", err);
  }
  return report;
}

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getSql } from "@/lib/db";
import { CATEGORIES, PRODUCTS } from "@/lib/products";

/**
 * What the bench sold, what it did not, and who bought it.
 *
 * Every number here is a `select` over rows the shop already writes. Nothing in
 * this file estimates demand, forecasts a trend or scores a customer: each
 * figure is counted, and the two places a human supplies a fact the database
 * cannot know — how long a piece takes to make, and how often the plan is
 * revisited — are typed into the desk and stored, not defaulted.
 *
 * Same conventions as `admin-insights.ts`: int8 casts, lowercase aliases,
 * timestamps as epoch milliseconds, and `requireAdmin()` on every callable.
 */

/** Epoch milliseconds as an int8 — a number on both Neon and the PGLite fallback. */
const MS = (col: string) => `floor(extract(epoch from ${col}) * 1000)::bigint`;

function n(value: unknown): number {
  const asNumber = typeof value === "number" ? value : Number(value);
  return Number.isFinite(asNumber) ? asNumber : 0;
}

/* ------------------------------------------------------------------ *
 * 1. Velocity — how often each design is actually booked.
 * ------------------------------------------------------------------ */

export type Velocity = {
  sku: string;
  name: string;
  category: string;
  price: number;
  image: string;
  /** Units booked in the last 30 / 90 days, and ever. */
  units30: number;
  units90: number;
  unitsAll: number;
  valueAll: number;
  /** Epoch ms of the last non-cancelled booking that included it; 0 when none. */
  lastSoldAt: number;
  /** Days since that booking. `null` when the design has never been booked. */
  daysSinceSold: number | null;
  /** True when the design is in the catalogue but no order row mentions it. */
  neverSold: boolean;
};

/**
 * The `items` jsonb array is the only place a booking says what it contained, so
 * the join is a lateral element over it. A row whose `items` is not an array (a
 * hand-written row) is skipped rather than erroring the whole panel.
 */
const velocitySql = `
  with sold as (
    select i->>'sku' as sku,
           coalesce(sum(((i->>'qty')::int)), 0) as units,
           coalesce(sum(((i->>'qty')::int) * ((i->>'price')::int)), 0) as value,
           coalesce(sum(((i->>'qty')::int)) filter (where o.created_at >= now() - interval '30 days'), 0) as units30,
           coalesce(sum(((i->>'qty')::int)) filter (where o.created_at >= now() - interval '90 days'), 0) as units90,
           max(o.created_at) as last_sold
    from orders o
    cross join lateral jsonb_array_elements(o.items) as i
    where o.status <> 'cancelled' and jsonb_typeof(o.items) = 'array'
    group by 1
  )
  select sku, units, value, units30, units90, ${MS("last_sold")} as last_sold
  from sold`;

async function computeVelocity(): Promise<Velocity[]> {
  const { requireAdmin } = await import("@/lib/admin.server");
  await requireAdmin();
  const sql = await getSql();
  const rows = await sql.query<{
    sku: string | null;
    units: unknown;
    value: unknown;
    units30: unknown;
    units90: unknown;
    last_sold: unknown;
  }>(velocitySql);

  const bySku = new Map(rows.map((r) => [r.sku ?? "", r]));
  const now = Date.now();

  return PRODUCTS.map((p) => {
    const r = bySku.get(p.sku);
    const lastSoldAt = n(r?.last_sold);
    return {
      sku: p.sku,
      name: p.name,
      category: p.category,
      price: p.price,
      image: p.image,
      units30: n(r?.units30),
      units90: n(r?.units90),
      unitsAll: n(r?.units),
      valueAll: n(r?.value),
      lastSoldAt,
      daysSinceSold: lastSoldAt ? Math.floor((now - lastSoldAt) / 86_400_000) : null,
      neverSold: !r,
    };
  });
}

export const adminVelocity = createServerFn({ method: "GET" }).handler(
  async (): Promise<Velocity[]> => computeVelocity(),
);

/* ------------------------------------------------------------------ *
 * 2. Bench plan — "how many should I have ready?"
 *
 * There is no stock count and no supplier feed on this site, so a reorder
 * quantity can only be arithmetic on two honest inputs: how fast a design
 * books (measured above) and how long the bench needs to make one, which is
 * typed in by the person who runs it.
 * ------------------------------------------------------------------ */

export type BenchSettings = {
  /** Days from ordering findings to a finished piece. Owner-supplied. */
  leadDays: number;
  /** How often the plan is looked at again, in days. Owner-supplied. */
  reviewDays: number;
};

/**
 * Until the owner sets these, the panel shows demand and says it cannot suggest
 * a quantity — a made-up lead time would turn a real count into a fake plan.
 */
const DEFAULTS: BenchSettings = { leadDays: 0, reviewDays: 0 };

export const adminBenchSettings = createServerFn({ method: "GET" }).handler(
  async (): Promise<BenchSettings> => {
    const { requireAdmin } = await import("@/lib/admin.server");
    await requireAdmin();
    const sql = await getSql();
    const rows = await sql.query<{ lead_days: unknown; review_days: unknown }>(
      `select lead_days, review_days from bench_settings where id = 1`,
    );
    if (!rows.length) return DEFAULTS;
    return { leadDays: n(rows[0].lead_days), reviewDays: n(rows[0].review_days) };
  },
);

export const saveBenchSettings = createServerFn({ method: "POST" })
  .validator((input: unknown) =>
    z
      .object({
        leadDays: z.number().int().min(0).max(180),
        reviewDays: z.number().int().min(0).max(180),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const { requireAdmin } = await import("@/lib/admin.server");
    await requireAdmin();
    const sql = await getSql();
    await sql.query(
      `insert into bench_settings (id, lead_days, review_days, updated_at)
       values (1, $1, $2, now())
       on conflict (id) do update
         set lead_days = excluded.lead_days,
             review_days = excluded.review_days,
             updated_at = now()`,
      [data.leadDays, data.reviewDays],
    );
    return data;
  });

/** One design's place in the plan. */
export type PlanRow = {
  sku: string;
  name: string;
  category: string;
  price: number;
  /** Units booked per day over the last 30 days, rounded to two places. */
  perDay: number;
  /** Units booked per day over 90 days, for the designs too quiet to read on 30. */
  perDay90: number;
  /** What the measured rate says to have made for lead + review. */
  suggested: number;
  /** The horizon the suggestion covers, in days. */
  horizonDays: number;
};

export const adminBenchPlan = createServerFn({ method: "GET" }).handler(
  async (): Promise<{ settings: BenchSettings; rows: PlanRow[] }> => {
    const { requireAdmin } = await import("@/lib/admin.server");
    await requireAdmin();
    const sql = await getSql();
    const [settings, sold] = await Promise.all([
      sql.query<{ lead_days: unknown; review_days: unknown }>(
        `select lead_days, review_days from bench_settings where id = 1`,
      ),
      sql.query<{ sku: string | null; units30: unknown; units90: unknown }>(velocitySql),
    ]);
    const cfg = settings.length
      ? { leadDays: n(settings[0].lead_days), reviewDays: n(settings[0].review_days) }
      : DEFAULTS;
    const horizon = cfg.leadDays + cfg.reviewDays;
    const bySku = new Map(sold.map((r) => [r.sku ?? "", r]));

    const rows = PRODUCTS.flatMap<PlanRow>((p) => {
      const r = bySku.get(p.sku);
      const perDay = n(r?.units30) / 30;
      const perDay90 = n(r?.units90) / 90;
      // Use whichever window the design is loud enough to support: a piece that
      // booked twice in 90 days is not "zero this month, so make nothing".
      const rate = perDay > 0 ? perDay : perDay90;
      return [
        {
          sku: p.sku,
          name: p.name,
          category: p.category,
          price: p.price,
          perDay: Math.round(rate * 100) / 100,
          perDay90: Math.round(perDay90 * 100) / 100,
          suggested: horizon > 0 ? Math.ceil(rate * horizon) : 0,
          horizonDays: horizon,
        },
      ];
    })
      .filter((r) => r.perDay > 0 || r.perDay90 > 0)
      .sort((a, b) => b.perDay - a.perDay || b.perDay90 - a.perDay90);

    return { settings: cfg, rows };
  },
);

/* ------------------------------------------------------------------ *
 * 3. Attribution — which channel and which link the money came from.
 * ------------------------------------------------------------------ */

export type AttributionRow = {
  /** The tag as it arrived, or the two honest fallbacks. */
  key: string;
  kind: "channel" | "source" | "campaign";
  bookings: number;
  /** Non-cancelled rupees attributed to it. */
  value: number;
  delivered: number;
  /** Rupees per booking, so a cheap-and-many channel is not mistaken for the best. */
  perBooking: number;
};

export type Attribution = {
  rows: AttributionRow[];
  /** Bookings made before the site recorded tags, which no query can attribute. */
  unrecorded: number;
  /** First day a tagged booking exists — the series does not reach before it. */
  firstTaggedAt: number;
};

function build(
  kind: AttributionRow["kind"],
  rows: { col: string | null; bookings: unknown; value: unknown; delivered: unknown }[],
): AttributionRow[] {
  return rows.map((r) => {
    const bookings = n(r.bookings);
    const value = n(r.value);
    return {
      kind,
      key: r.col && r.col.trim() ? r.col.trim() : "direct",
      bookings,
      value,
      delivered: n(r.delivered),
      perBooking: bookings ? Math.round(value / bookings) : 0,
    };
  });
}

export const adminAttribution = createServerFn({ method: "GET" }).handler(
  async (): Promise<Attribution> => {
    const { requireAdmin } = await import("@/lib/admin.server");
    await requireAdmin();
    const sql = await getSql();
    // One shape per column: `channel` is always set, `source` and `campaign`
    // only when the visitor arrived through a tagged link.
    const [channels, sources, campaigns, tagged, unrecorded] = await Promise.all([
      sql.query<{ col: string | null; bookings: unknown; value: unknown; delivered: unknown }>(
        `select channel as col, count(*)::int8 as bookings,
                coalesce(sum(total) filter (where status <> 'cancelled'), 0)::int8 as value,
                count(*) filter (where status = 'delivered')::int8 as delivered
         from orders group by 1 order by value desc limit 12`,
      ),
      sql.query<{ col: string | null; bookings: unknown; value: unknown; delivered: unknown }>(
        `select source as col, count(*)::int8 as bookings,
                coalesce(sum(total) filter (where status <> 'cancelled'), 0)::int8 as value,
                count(*) filter (where status = 'delivered')::int8 as delivered
         from orders where source is not null and source <> ''
         group by 1 order by value desc limit 12`,
      ),
      sql.query<{ col: string | null; bookings: unknown; value: unknown; delivered: unknown }>(
        `select campaign as col, count(*)::int8 as bookings,
                coalesce(sum(total) filter (where status <> 'cancelled'), 0)::int8 as value,
                count(*) filter (where status = 'delivered')::int8 as delivered
         from orders where campaign is not null and campaign <> ''
         group by 1 order by value desc limit 12`,
      ),
      sql.query<{ first: unknown }>(
        `select ${MS("min(created_at)")} as first from orders
         where (source is not null and source <> '') or (campaign is not null and campaign <> '')`,
      ),
      sql.query<{ c: unknown }>(
        `select count(*)::int8 as c from orders
         where (source is null or source = '') and (campaign is null or campaign = '')`,
      ),
    ]);
    return {
      rows: [...build("channel", channels), ...build("source", sources), ...build("campaign", campaigns)],
      unrecorded: n(unrecorded[0]?.c),
      firstTaggedAt: n(tagged[0]?.first),
    };
  },
);

/* ------------------------------------------------------------------ *
 * 4. Customers — who came back, and what to show them next.
 * ------------------------------------------------------------------ */

export type CustomerInsight = {
  email: string;
  name: string;
  bookings: number;
  value: number;
  /** Most-bought category label; empty when nothing is known. */
  topCategory: string;
  /** Designs from that category the customer has not bought yet. */
  suggestions: { sku: string; name: string; price: number; image: string }[];
  lastOrderedAt: number;
  daysSinceOrder: number;
  /** True when more than one non-cancelled booking is on file. */
  repeat: boolean;
  /**
   * A plain-language reason the row is on this list. It is a rule, not a score:
   * "two or more orders" and "quiet for a while" are counts of rows.
   */
  why: string;
};

export type CustomerTrends = {
  rows: CustomerInsight[];
  totals: {
    customers: number;
    repeat: number;
    /** Signed-in addresses with no booking at all. */
    browsers: number;
  };
};

const CAT_LABEL: Map<string, string> = new Map(CATEGORIES.map((c) => [c.slug, c.label]));
const PRODUCT_BY_SKU = new Map(PRODUCTS.map((p) => [p.sku, p]));

/**
 * "Likely to purchase again", stated as the rule that produced it.
 *
 * A shop this size has too few orders for a model to have anything to learn
 * from, and an unreadable score would be a guess with a decimal point. So the
 * list is: bought more than once (proven behaviour), or bought once recently
 * and matched to a design in the same category they have not taken yet.
 */
export const adminCustomers = createServerFn({ method: "GET" }).handler(
  async (): Promise<CustomerTrends> => {
    const { requireAdmin } = await import("@/lib/admin.server");
    await requireAdmin();
    const sql = await getSql();

    const [perCustomer, perCategory, browsers] = await Promise.all([
      sql.query<{
        email: string;
        name: string | null;
        bookings: unknown;
        value: unknown;
        last: unknown;
      }>(
        `select contact_email as email, max(contact_name) as name,
                count(*)::int8 as bookings,
                coalesce(sum(total) filter (where status <> 'cancelled'), 0)::int8 as value,
                ${MS("max(created_at)")} as last
         from orders
         where contact_email is not null and contact_email <> ''
         group by 1
         order by value desc limit 60`,
      ),
      sql.query<{ email: string; sku: string | null; units: unknown }>(
        `select o.contact_email as email, i->>'sku' as sku,
                coalesce(sum(((i->>'qty')::int)), 0) as units
         from orders o
         cross join lateral jsonb_array_elements(o.items) as i
         where o.status <> 'cancelled' and jsonb_typeof(o.items) = 'array'
           and o.contact_email is not null and o.contact_email <> ''
         group by 1, 2`,
      ),
      sql.query<{ c: unknown }>(
        `select count(*)::int8 as c from "user" u
         where u."email" is not null
           and not exists (select 1 from orders o
                           where o.contact_email = u."email" and o.status <> 'cancelled')`,
      ),
    ]);

    // Category per customer, from the skus they actually booked.
    const bought = new Map<string, Set<string>>();
    const catUnits = new Map<string, Map<string, number>>();
    for (const r of perCategory) {
      const p = PRODUCT_BY_SKU.get(r.sku ?? "");
      if (!p) continue;
      const email = r.email.toLowerCase();
      bought.set(email, new Set([...(bought.get(email) ?? []), p.sku]));
      const cats = catUnits.get(email) ?? new Map<string, number>();
      cats.set(p.category, n(cats.get(p.category)) + n(r.units));
      catUnits.set(email, cats);
    }

    const rows = perCustomer.map<CustomerInsight>((r) => {
      const email = r.email.toLowerCase();
      const bookings = n(r.bookings);
      const lastOrderedAt = n(r.last);
      const daysSinceOrder = lastOrderedAt
        ? Math.max(0, Math.floor((Date.now() - lastOrderedAt) / 86_400_000))
        : 0;
      const cats = catUnits.get(email);
      const top = cats
        ? [...cats.entries()].sort((a, b) => n(b[1]) - n(a[1]))[0]?.[0]
        : undefined;
      const owned = bought.get(email) ?? new Set<string>();
      const suggestions = (top ? PRODUCTS.filter((p) => p.category === top) : [])
        .filter((p) => !owned.has(p.sku))
        .slice(0, 3)
        .map((p) => ({ sku: p.sku, name: p.name, price: p.price, image: p.image }));

      const repeat = bookings > 1;
      const why = repeat
        ? `Booked ${bookings} times, ${formatAge(daysSinceOrder)}`
        : lastOrderedAt
          ? `One booking ${formatAge(daysSinceOrder)} ago — nothing since`
          : "A booking with no date the site could read";

      return {
        email: r.email,
        name: r.name ?? "",
        bookings,
        value: n(r.value),
        topCategory: top ? (CAT_LABEL.get(top) ?? top) : "",
        suggestions,
        lastOrderedAt,
        daysSinceOrder,
        repeat,
        why,
      };
    });

    return {
      rows: rows.sort(
        (a, b) => Number(b.repeat) - Number(a.repeat) || a.daysSinceOrder - b.daysSinceOrder,
      ),
      totals: {
        customers: rows.length,
        repeat: rows.filter((r) => r.repeat).length,
        browsers: n(browsers[0]?.c),
      },
    };
  },
);

function formatAge(days: number): string {
  if (days <= 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 30) return `${days} days ago`;
  const months = Math.round(days / 30);
  return `${months} ${months === 1 ? "month" : "months"} ago`;
}

/* ------------------------------------------------------------------ *
 * 5. The daily briefing.
 *
 * Built from the same counted rows, with the date window on the page so nobody
 * reads "the last 30 days" as "this month". Sent to the owner's inbox only when
 * they press the button — there is no scheduler in the deployment to send it on
 * its own, and a cron that silently failed would look exactly like a quiet day.
 * ------------------------------------------------------------------ */

export type Briefing = {
  /** The UTC day these counts cover. */
  day: string;
  lines: { label: string; value: string; flag: boolean }[];
  /** Bookings with no movement for a week or more — the "needs attention" set. */
  attention: { ref: string; name: string; status: string; days: number }[];
};

/**
 * The whole briefing, computed once and reused: the dashboard shows it, and the
 * mailed version sends the same object it just read. Keeping it a plain function
 * (rather than calling the server function from inside another one) means both
 * paths run the same SQL against the same session.
 */
async function computeBriefing(): Promise<Briefing> {
  const { requireAdmin } = await import("@/lib/admin.server");
  await requireAdmin();
  const sql = await getSql();

  const [today, week, open, stalled, refused] = await Promise.all([
    sql.query<{ c: unknown; v: unknown }>(
      `select count(*)::int8 as c,
              coalesce(sum(total) filter (where status <> 'cancelled'), 0)::int8 as v
       from orders
       where created_at >= (date_trunc('day', now() at time zone 'UTC') at time zone 'UTC')`,
    ),
    sql.query<{ c: unknown; v: unknown }>(
      `select count(*)::int8 as c,
              coalesce(sum(total) filter (where status <> 'cancelled'), 0)::int8 as v
       from orders where created_at >= now() - interval '7 days'`,
    ),
    sql.query<{ newc: unknown; conf: unknown; pack: unknown; ship: unknown }>(
      `select count(*) filter (where status = 'new')::int8 as newc,
              count(*) filter (where status = 'confirmed')::int8 as conf,
              count(*) filter (where status = 'packed')::int8 as pack,
              count(*) filter (where status = 'shipped')::int8 as ship
       from orders`,
    ),
    // "Haven't been touched in a week" is a statement about the desk, not the
    // customer: `updated_at` only moves when someone changes the booking here.
    sql.query<{ ref: string | null; name: string | null; status: string; days: unknown }>(
      `select ref, contact_name as name, status,
              floor(extract(epoch from (now() - updated_at)) / 86400)::int8 as days
       from orders
       where status in ('new','confirmed','packed') and updated_at < now() - interval '7 days'
       order by updated_at limit 8`,
    ),
    sql.query<{ c: unknown }>(
      `select count(*)::int8 as c from mail_log
       where status <> 'sent' and created_at >= now() - interval '7 days'`,
    ),
  ]);

  const inr = (rupees: number) => `₹${rupees.toLocaleString("en-IN")}`;
  const o = open[0] ?? { newc: 0, conf: 0, pack: 0, ship: 0 };

  return {
    day: new Date().toISOString().slice(0, 10),
    lines: [
      {
        label: "Booked today",
        value: `${n(today[0]?.c)} ${n(today[0]?.c) === 1 ? "booking" : "bookings"} · ${inr(n(today[0]?.v))}`,
        flag: false,
      },
      {
        label: "Last 7 days",
        value: `${n(week[0]?.c)} · ${inr(n(week[0]?.v))}`,
        flag: false,
      },
      {
        label: "Awaiting the desk",
        value: `${n(o.newc)} new · ${n(o.conf)} confirmed · ${n(o.pack)} packed`,
        flag: n(o.newc) > 0,
      },
      { label: "Shipped, not yet delivered", value: `${n(o.ship)}`, flag: false },
      {
        // 'refused' means Resend said no; 'skipped' means the message never left
        // this server. Both are a customer who did not hear from us.
        label: "Mail not sent this week",
        value: `${n(refused[0]?.c)}`,
        flag: n(refused[0]?.c) > 0,
      },
    ],
    attention: stalled.map((r) => ({
      ref: r.ref ?? "—",
      name: r.name ?? "",
      status: r.status,
      days: n(r.days),
    })),
  };
}

export const adminBriefing = createServerFn({ method: "GET" }).handler(
  async (): Promise<Briefing> => computeBriefing(),
);

/**
 * Send the briefing to the owner's inbox.
 *
 * There is no scheduler in this deployment, so this is a button and not a
 * timer: an automated mail that silently failed would be indistinguishable from
 * a quiet day, and the whole reason `mail_log` exists is that the shop has been
 * burned by exactly that. Pressing it sends what is on the screen.
 */
export const sendBriefingMail = createServerFn({ method: "POST" }).handler(
  async (): Promise<{ ok: boolean; error?: string; to?: string }> => {
    const { requireAdmin } = await import("@/lib/admin.server");
    const { notifyInbox, resendConfigured, sendEmail } = await import("@/lib/email/sender.server");
    const admin = await requireAdmin();
    if (!resendConfigured()) {
      return {
        ok: false,
        error:
          "Mail is not sending yet on this deployment — no verified sender address is configured.",
      };
    }
    const to = notifyInbox() ?? admin.email;
    const briefing = await computeBriefing();
    const { brandMail } = await import("@/lib/email/brand.server");
    const html = brandMail({
      headline: "Your day at the bench",
      paragraphs: [
        `Dear friend,<br/>&nbsp;`,
        `Raakha Grace, ${briefing.day}. These are the counted figures from the bookings on file — no forecast in them.`,
        briefing.lines.map((l) => `<strong>${l.label}</strong> &mdash; ${l.value}`).join("<br/>"),
        briefing.attention.length
          ? `${briefing.attention.length} ${briefing.attention.length === 1 ? "booking has" : "bookings have"} had no movement here for a week or more: ${briefing.attention
              .map((a) => a.ref)
              .join(", ")}.`
          : "Nothing on the desk has been waiting a week or more.",
      ],
      note: "You are receiving this because you asked for it from the admin desk.",
      closing: "Yours sincerely,",
    });
    const result = await sendEmail({
      to,
      subject: `Raakha Grace briefing — ${briefing.day}`,
      html,
      kind: "order",
    });
    return result.ok ? { ok: true, to } : { ok: false, error: result.error, to };
  },
);

/* ------------------------------------------------------------------ *
 * 6. Ask the numbers.
 *
 * The same two layers the storefront chat uses, and for the same reason: the
 * counted answer is the product, the model is only a voice. `answerFromFacts`
 * never sends a figure it did not compute from a row, and the model is given
 * those sentences to rephrase — it is not given the table, so it cannot pick a
 * number that was not in front of it. With no key configured the panel still
 * answers; that is the difference between this and a chat that says "unavailable".
 * ------------------------------------------------------------------ */

export type Numbers = {
  /** Rupees booked, excluding cancelled, this 30 days and the 30 before it. */
  revenue30: number;
  revenuePrev30: number;
  bookings30: number;
  bookingsPrev30: number;
  /** Delivered, excluding cancelled — what actually left the bench. */
  revenue30Shipped: number;
  velocity: Velocity[];
  channels: { channel: string; bookings: number; value: number }[];
  briefing: Briefing;
  customers: { total: number; repeat: number };
};

async function computeNumbers(): Promise<Numbers> {
  const { requireAdmin } = await import("@/lib/admin.server");
  await requireAdmin();
  const sql = await getSql();
  const [growth, channels, shipped] = await Promise.all([
    sql.query<{ rev: unknown; rev_prev: unknown; cnt: unknown; cnt_prev: unknown }>(
      `select
         (select coalesce(sum(total), 0) from orders
            where created_at >= now() - interval '30 days' and status <> 'cancelled')::int8 as rev,
         (select coalesce(sum(total), 0) from orders
            where created_at >= now() - interval '60 days'
              and created_at <  now() - interval '30 days' and status <> 'cancelled')::int8 as rev_prev,
         (select count(*) from orders
            where created_at >= now() - interval '30 days')::int8 as cnt,
         (select count(*) from orders
            where created_at >= now() - interval '60 days'
              and created_at <  now() - interval '30 days')::int8 as cnt_prev`,
    ),
    sql.query<{ channel: string | null; bookings: unknown; value: unknown }>(
      `select channel, count(*)::int8 as bookings,
              coalesce(sum(total) filter (where status <> 'cancelled'), 0)::int8 as value
       from orders group by 1 order by value desc limit 8`,
    ),
    sql.query<{ v: unknown }>(
      `select coalesce(sum(total), 0)::int8 as v from orders
       where created_at >= now() - interval '30 days' and status in ('shipped','delivered')`,
    ),
  ]);
  const people = await sql.query<{ c: unknown; r: unknown }>(
    `select count(*)::int8 as c,
            count(*) filter (where b > 1)::int8 as r
     from (select contact_email, count(*) as b from orders
           where contact_email is not null and contact_email <> '' and status <> 'cancelled'
           group by 1) t`,
  );

  return {
    revenue30: n(growth[0]?.rev),
    revenuePrev30: n(growth[0]?.rev_prev),
    bookings30: n(growth[0]?.cnt),
    bookingsPrev30: n(growth[0]?.cnt_prev),
    revenue30Shipped: n(shipped[0]?.v),
    velocity: await computeVelocity(),
    channels: channels.map((c) => ({
      channel: c.channel ?? "site",
      bookings: n(c.bookings),
      value: n(c.value),
    })),
    briefing: await computeBriefing(),
    customers: { total: n(people[0]?.c), repeat: n(people[0]?.r) },
  };
}

const inr = (rupees: number) => `₹${rupees.toLocaleString("en-IN")}`;

/** Whole-percentage change, or null when there is nothing to compare against. */
function delta(now: number, before: number): number | null {
  if (!before) return null;
  return Math.round(((now - before) / before) * 100);
}

/**
 * The counted answer. Intent is chosen on keywords because there is no model
 * required to notice that "why did sales drop" is a comparison question; the
 * sentences it returns are the ones the model is then allowed to re-voice.
 */
export function answerFromFacts(question: string, d: Numbers): string[] {
  const q = question.toLowerCase();
  const out: string[] = [];
  const change = delta(d.revenue30, d.revenuePrev30);

  if (/sales|revenue|drop|fall|up|grow|month|week|trend/.test(q)) {
    out.push(
      `Booked value in the last 30 days is ${inr(d.revenue30)} across ${d.bookings30} bookings; the 30 days before that were ${inr(d.revenuePrev30)} across ${d.bookingsPrev30} bookings.`,
    );
    out.push(
      change === null
        ? "There is no earlier month to compare against, so the direction cannot be counted."
        : `That is ${change === 0 ? "flat" : `${change > 0 ? "up" : "down"} ${Math.abs(change)}%`} on the previous 30 days.`,
    );
    out.push(
      `Of the last 30 days, ${inr(d.revenue30Shipped)} is on bookings already shipped or delivered — the rest is still sitting at the desk.`,
    );
    if (d.bookings30 < d.bookingsPrev30) {
      out.push(
        `Fewer bookings, not smaller ones: the average went from ${inr(d.revenuePrev30 / Math.max(1, d.bookingsPrev30))} to ${inr(d.revenue30 / Math.max(1, d.bookings30))}.`,
      );
    }
  }

  if (/promote|push|advertise|which.*(product|piece|design)|market/.test(q)) {
    const top = [...d.velocity]
      .filter((v) => v.units90 > 0)
      .sort((a, b) => b.units90 - a.units90 || b.valueAll - a.valueAll)
      .slice(0, 5);
    out.push(
      top.length
        ? `The designs that have actually booked in 90 days: ${top
            .map((v) => `${v.name} (${v.units90} unit${v.units90 === 1 ? "" : "s"})`)
            .join(", ")}.`
        : "No design has a non-cancelled booking on file yet, so nothing here can be ranked by demand.",
    );
    const quiet = d.velocity.filter((v) => v.units90 === 0 && v.unitsAll > 0).length;
    out.push(
      `${d.velocity.filter((v) => v.neverSold).length} of ${d.velocity.length} designs have never been booked through the site${quiet ? `, and ${quiet} booked before 90 days ago but not since` : ""}. Those are the ones a promotion would be testing, not proving.`,
    );
  }

  if (/customer|repeat|who|buyer|audience|return/.test(q)) {
    out.push(
      `${d.customers.total} addresses have a non-cancelled booking; ${d.customers.repeat} of them have booked more than once.`,
    );
    out.push(
      `${d.briefing.attention.length} bookings have had no movement at the desk for a week or more — those customers are waiting on us, not the other way round.`,
    );
  }

  if (/channel|instagram|whatsapp|source|campaign|attribution|where/.test(q)) {
    out.push(
      d.channels.length
        ? `By how the booking was made: ${d.channels
            .map((c) => `${c.channel} ${inr(c.value)} (${c.bookings})`)
            .join(", ")}.`
        : "No bookings to attribute yet.",
    );
    out.push(
      "A booking records the link's utm tags only from the day this site started reading them, so an older booking shows no source rather than a guessed one.",
    );
  }

  if (/stock|ready|bench|make|lead time|plan/.test(q)) {
    out.push(
      `Nothing on this site counts stock. ${d.velocity.filter((v) => !v.neverSold).length} designs have been booked at least once; ${d.velocity.filter((v) => v.neverSold).length} never have.`,
    );
    out.push(
      "The plan tab turns that into a quantity once you enter how many days the bench needs per piece.",
    );
  }

  if (!out.length) {
    out.push(
      `Here is everything the site can count today: ${inr(d.revenue30)} booked in 30 days across ${d.bookings30} bookings, ${d.customers.repeat} repeat customers out of ${d.customers.total} with a booking, and ${d.briefing.attention.length} bookings waiting on the desk.`,
    );
    out.push(
      "Ask about sales, which designs to promote, customers, where bookings came from, or what the bench should have ready.",
    );
  }
  return out;
}

type Keyed = { name: string; url: string; key: string; model: string };

/**
 * The provider ladder, duplicated from `ai.ts` on purpose: that module is
 * client-importable and its key handling belongs to the storefront chat. This
 * one runs only inside a server function, on the same env vars.
 */
function key(): Keyed | null {
  const xai = process.env.XAI_API_KEY?.trim();
  if (xai) {
    return {
      name: "xai",
      url: "https://api.x.ai/v1/chat/completions",
      key: xai,
      model: process.env.XAI_MODEL?.trim() || "grok-4.5",
    };
  }
  const base = process.env.AI_API_BASE?.trim();
  const alt = process.env.AI_API_KEY?.trim();
  if (base && alt) {
    return { name: "openai-compatible", url: base, key: alt, model: process.env.AI_MODEL?.trim() || "gpt-4o-mini" };
  }
  return null;
}

export type NumbersAnswer = {
  answer: string;
  /** True when a language model rephrased the counted sentences. */
  voiced: boolean;
  /** The counted sentences, always shown so a model's wording is checkable. */
  facts: string[];
};

export const askTheNumbers = createServerFn({ method: "POST" })
  .validator((input: unknown) =>
    z.object({ question: z.string().trim().min(3).max(240) }).parse(input),
  )
  .handler(async ({ data }): Promise<NumbersAnswer> => {
    const numbers = await computeNumbers();
    const facts = answerFromFacts(data.question, numbers);
    const provider = key();
    if (!provider) return { answer: facts.join(" "), voiced: false, facts };

    try {
      const res = await fetch(provider.url, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: `Bearer ${provider.key}`,
        },
        body: JSON.stringify({
          model: provider.model,
          temperature: 0.3,
          max_tokens: 500,
          messages: [
            {
              role: "system",
              content: [
                "You speak for a small handmade-jewellery atelier's owner-facing dashboard.",
                "Use ONLY the sentences given as counted facts below. Do not add, round, infer or estimate any number, date or name.",
                "Rephrase them into one short paragraph of plain English. If a fact does not answer the question, say which counted figure does instead of inventing one.",
                "Never promise a delivery, a warranty, a discount or a stock count.",
              ].join(" "),
            },
            {
              role: "user",
              content: `Question: ${data.question}\n\nCounted facts:\n- ${facts.join("\n- ")}`,
            },
          ],
        }),
      });
      if (!res.ok) throw new Error(`model ${res.status}`);
      const body = (await res.json()) as {
        choices?: { message?: { content?: string } }[];
      };
      const text = body.choices?.[0]?.message?.content?.trim();
      if (!text) throw new Error("empty model answer");
      // Any digit sequence the model produced that is not in the facts is a
      // hallucinated number; drop the whole rephrase rather than show it.
      const factDigits = new Set((facts.join(" ").match(/\d[\d,]*/g) ?? []));
      const invented = (text.match(/₹?\d[\d,]*/g) ?? []).filter(
        (m) => !factDigits.has(m.replace(/^[₹]/, "")) && !factDigits.has(m),
      );
      if (invented.length) {
        console.warn("[insights] model added numbers, showing counted text instead:", invented);
        return { answer: facts.join(" "), voiced: false, facts };
      }
      return { answer: text, voiced: true, facts };
    } catch (err) {
      // The counted sentences are still the truth; a dead model is not a reason
      // to show nothing.
      console.error("[insights] model answer failed:", err);
      return { answer: facts.join(" "), voiced: false, facts };
    }
  });

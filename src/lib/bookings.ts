import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { authMiddleware } from "@/lib/auth/middleware";
import { getSql } from "@/lib/db";
import { getProduct } from "./products";

/**
 * WhatsApp bookings, kept on the server so both sides see one truth.
 *
 * The atelier takes payment on WhatsApp, not on the site. That used to mean the
 * website knew nothing about an order once the chat was open. Now the customer's
 * cart becomes a booking row with a short reference, the reference rides along
 * in the WhatsApp message, and the atelier updates its status from the admin
 * desk — so "is my order confirmed?" has an answer on the site.
 */

export const BOOKING_STATUSES = [
  "new",
  "confirmed",
  "packed",
  "shipped",
  "delivered",
  "cancelled",
] as const;
export type BookingStatus = (typeof BOOKING_STATUSES)[number];

export const STATUS_LABEL: Record<BookingStatus, string> = {
  new: "Awaiting confirmation",
  confirmed: "Confirmed",
  packed: "Packed",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export type BookingItem = { productId: string; name: string; sku: string; price: number; qty: number };

export type Booking = {
  id: number;
  ref: string;
  items: BookingItem[];
  total: number;
  status: BookingStatus;
  channel: string;
  createdAt: string;
  updatedAt: string;
  tracking: string | null;
  contactName: string | null;
  contactPhone: string | null;
};

const ITEMS = z
  .array(z.object({ productId: z.string().min(1).max(64), qty: z.number().int().min(1).max(20) }))
  .min(1)
  .max(20);

function parseItems(raw: BookingItem[] | string | unknown): BookingItem[] {
  const value = typeof raw === "string" ? (JSON.parse(raw) as unknown) : raw;
  return Array.isArray(value) ? (value as BookingItem[]) : [];
}

/**
 * RG-7K4MQP. Ambiguous glyphs are out because customers read these aloud on
 * WhatsApp; the alphabet is what they can type from a screenshot.
 */
export function newBookingRef(): string {
  const alphabet = "23456789HJKLMNPQRSTUVWXYZ";
  let out = "";
  for (let i = 0; i < 6; i += 1) {
    out += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return `RG-${out}`;
}

/** Digits only, so 098765 and 98765-43210 compare equal. */
function normalizePhone(phone: string) {
  const digits = phone.replace(/\D/g, "");
  return digits.slice(-10);
}

function toBooking(r: {
  id: number;
  ref: string | null;
  items: BookingItem[] | string;
  total: number;
  status: string;
  channel: string | null;
  created_at: string;
  updated_at: string;
  tracking: string | null;
  contact_name: string | null;
  contact_phone: string | null;
}): Booking {
  return {
    id: r.id,
    ref: r.ref ?? `#${r.id}`,
    items: parseItems(r.items),
    total: r.total,
    status: (BOOKING_STATUSES.includes(r.status as BookingStatus)
      ? r.status
      : "confirmed") as BookingStatus,
    channel: r.channel ?? "site",
    createdAt: r.created_at,
    updatedAt: r.updated_at,
    tracking: r.tracking,
    contactName: r.contact_name,
    contactPhone: r.contact_phone,
  };
}

const BOOKING_COLUMNS = `id, ref, items, total, status, channel, created_at, updated_at,
  tracking, contact_name, contact_phone`;

/**
 * Turn a cart into a booking and return the reference. Works signed-out — the
 * row is claimed to an account later by reference + phone, which is why both
 * are stored.
 */
export const createWhatsAppBooking = createServerFn({ method: "POST" })
  .validator((input: unknown) =>
    z
      .object({
        items: ITEMS,
        name: z.string().min(1).max(80),
        phone: z.string().min(8).max(20),
        email: z.string().email().max(160).optional().or(z.literal("")).transform((v) => v || undefined),
        address: z.string().max(400).optional(),
        note: z.string().max(400).optional(),
        // Copied from the visitor's URL by `readAttribution()` and treated as
        // untrusted text: trimmed, length-capped, and never interpreted.
        source: z.string().trim().max(60).optional(),
        campaign: z.string().trim().max(80).optional(),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const { getSessionUser } = await import("@/lib/auth/verify.server");
    const user = await getSessionUser().catch(() => null);
    const items: BookingItem[] = data.items.flatMap((line) => {
      const p = getProduct(line.productId);
      if (!p) return [];
      return [{ productId: p.id, name: p.name, sku: p.sku, price: p.price, qty: line.qty }];
    });
    if (!items.length) return { ok: false as const, error: "That piece is no longer at the bench." };
    const total = items.reduce((sum, i) => sum + i.price * i.qty, 0);

    const sql = await getSql();
    // One attempt per reference; a collision is ~1 in 32^6 but the unique index
    // means we must not simply swallow it.
    for (let attempt = 0; attempt < 3; attempt += 1) {
      const ref = newBookingRef();
      try {
        const inserted = await sql.query<{ id: number }>(
          `insert into orders (user_id, items, total, status, channel, ref,
             contact_name, contact_phone, contact_email, address, notes,
             source, campaign)
           values ($1, $2::jsonb, $3, 'new', 'whatsapp', $4, $5, $6, $7, $8, $9, $10, $11)
           returning id`,
          [
            user?.id ?? null,
            JSON.stringify(items),
            total,
            ref,
            data.name.trim(),
            normalizePhone(data.phone),
            data.email ?? null,
            data.address ?? null,
            data.note ?? null,
            data.source ?? null,
            data.campaign ?? null,
          ],
        );
        return { ok: true as const, id: inserted[0]?.id, ref };
      } catch (err) {
        if (attempt === 2) {
          console.error("[bookings] could not create a booking", err);
          return { ok: false as const, error: "Could not record the booking. Try again." };
        }
      }
    }
    return { ok: false as const, error: "Could not record the booking." };
  });

/**
 * Bookings that belong to the signed-in account — either claimed to it
 * directly, or booked while signed out with the same email address.
 */
export const listMyBookings = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    const rows = await sql.query<Parameters<typeof toBooking>[0]>(
      `select ${BOOKING_COLUMNS} from orders
       where user_id = $1
          or (contact_email is not null and contact_email =
                (select "email" from "user" where id = $1))
       order by created_at desc limit 40`,
      [context.userId],
    );
    return rows.map(toBooking);
  });

/**
 * Attach a booking made while signed out to this account. Both the reference
 * and the phone it was booked on must match, so a reference alone cannot
 * expose someone else's order.
 */
export const claimBooking = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) =>
    z
      .object({
        ref: z.string().trim().min(4).max(12).transform((v) => v.toUpperCase()),
        phone: z.string().min(8).max(20),
      })
      .parse(input),
  )
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const rows = await sql.query<{ id: number }>(
      `update orders set user_id = $1, updated_at = now()
       where ref = $2 and contact_phone = $3 and user_id is null
       returning id`,
      [context.userId, data.ref, normalizePhone(data.phone)],
    );
    if (!rows.length) {
      const already = await sql.query<{ user_id: string | null }>(
        "select user_id from orders where ref = $1",
        [data.ref],
      );
      if (!already.length) return { ok: false as const, error: `No booking ${data.ref}.` };
      if (already[0].user_id !== context.userId) {
        return { ok: false as const, error: "That reference and phone do not match." };
      }
      return { ok: true as const };
    }
    return { ok: true as const };
  });

/** The atelier's desk: every booking, newest first, searchable. */
export const listBookings = createServerFn({ method: "GET" })
  .validator((input: unknown) =>
    z.object({ query: z.string().max(60).optional() }).parse((input ?? {}) as object),
  )
  .handler(async ({ data }) => {
    const { requireAdmin } = await import("@/lib/admin.server");
    await requireAdmin();
    const sql = await getSql();
    const q = data.query?.trim();
    const like = q ? `%${q.replace(/\s+/g, "%")}%` : null;
    const rows = await sql.query<Parameters<typeof toBooking>[0] & { contact_email: string | null }>(
      like
        ? `select ${BOOKING_COLUMNS}, contact_email from orders
           where ref ilike $1 or contact_name ilike $1 or contact_phone ilike $1 or contact_email ilike $1
           order by created_at desc limit 60`
        : `select ${BOOKING_COLUMNS}, contact_email from orders
           order by created_at desc limit 60`,
      like ? [like] : [],
    );
    return rows.map((r) => ({ ...toBooking(r), contactEmail: r.contact_email }));
  });

/** Move a booking along the pipeline; this is what the customer sees change. */
export const setBookingStatus = createServerFn({ method: "POST" })
  .validator((input: unknown) =>
    z
      .object({
        id: z.number().int().positive(),
        status: z.enum(BOOKING_STATUSES),
        tracking: z.string().max(60).optional(),
        note: z.string().max(400).optional(),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const { requireAdmin } = await import("@/lib/admin.server");
    await requireAdmin();
    const sql = await getSql();
    const rows = await sql.query<{ id: number }>(
      `update orders
       set status = $2,
           tracking = coalesce($3, tracking),
           notes = case
             when $4::text is null or $4 = '' then notes
             else trim(coalesce(notes, '') || ' ' || $4)
           end,
           updated_at = now()
       where id = $1 returning id`,
      [data.id, data.status, data.tracking ?? null, data.note ?? ""],
    );
    if (!rows.length) return { ok: false as const, mail: "no-row" as const };

    // The customer set nothing in motion here, so this is the moment they hear
    // about it. Read the contact details back from the row rather than trusting
    // whatever the desk had on screen when it clicked.
    const row = await sql.query<{
      ref: string | null;
      total: number;
      contact_email: string | null;
      contact_name: string | null;
      tracking: string | null;
    }>(
      `select ref, total, contact_email, contact_name, tracking
       from orders where id = $1`,
      [data.id],
    );
    const booking = row[0];
    if (!booking?.contact_email) {
      return { ok: true as const, mail: "no-address" as const };
    }

    const { sendBookingStatusMail } = await import("@/lib/email/booking-mail.server");
    const result = await sendBookingStatusMail({
      to: booking.contact_email,
      name: booking.contact_name,
      ref: booking.ref ?? `#${data.id}`,
      total: booking.total,
      status: data.status,
      tracking: booking.tracking,
    });
    if (result === "not-applicable") {
      return { ok: true as const, mail: "silent" as const };
    }
    if (result.ok) return { ok: true as const, mail: "sent" as const };
    // Nothing was asked of the mail service at all — the deployment has no
    // sender. Saying "the service refused it" would point the owner at Resend
    // when the thing to fix is the environment.
    if (result.skipped) {
      return { ok: true as const, mail: "not-configured" as const, error: result.error };
    }
    return { ok: true as const, mail: "refused" as const, error: result.error };
  });

/** Record a booking that arrived in WhatsApp with no prior site visit. */
export const recordWhatsAppBooking = createServerFn({ method: "POST" })
  .validator((input: unknown) =>
    z
      .object({
        name: z.string().min(1).max(80),
        phone: z.string().min(8).max(20),
        items: ITEMS,
        note: z.string().max(400).optional(),
        // Optional because a walk-in chat often has no email. Without it the
        // row has no address to notify when the status moves.
        email: z
          .string()
          .email()
          .max(160)
          .optional()
          .or(z.literal(""))
          .transform((v) => v || undefined),
        // Typed by whoever takes the call, so the attribution desk can count
        // walk-ins too instead of leaving them in the "not recorded" bucket.
        source: z.string().trim().max(60).optional(),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const { requireAdmin } = await import("@/lib/admin.server");
    await requireAdmin();
    const items: BookingItem[] = data.items.flatMap((line) => {
      const p = getProduct(line.productId);
      if (!p) return [];
      return [{ productId: p.id, name: p.name, sku: p.sku, price: p.price, qty: line.qty }];
    });
    if (!items.length) return { ok: false as const, error: "Pick at least one piece." };
    const total = items.reduce((sum, i) => sum + i.price * i.qty, 0);
    const sql = await getSql();
    const inserted = await sql.query<{ id: number }>(
      `insert into orders (items, total, status, channel, ref, contact_name,
         contact_phone, contact_email, notes, source)
       values ($1::jsonb, $2, 'confirmed', 'whatsapp', $3, $4, $5, $6, $7, $8) returning id`,
      [
        JSON.stringify(items),
        total,
        newBookingRef(),
        data.name.trim(),
        normalizePhone(data.phone),
        data.email ?? null,
        data.note ?? null,
        data.source?.trim() || null,
      ],
    );
    return { ok: true as const, id: inserted[0]?.id };
  });

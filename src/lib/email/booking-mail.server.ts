/**
 * The notice a customer gets when their booking moves along the pipeline.
 *
 * A booking is made on WhatsApp, so the customer's attention is in the chat —
 * but the status change itself happens here, at the admin desk, and until now
 * the only way they learned it was to open the site and look. This sends the
 * same news to the address they gave when the booking was made, in the house
 * style, and every attempt lands in `mail_log` like the account mail does.
 *
 * NEVER import this from client code.
 */
import { brandMail } from "./brand.server";
import { sendEmail, notifyInbox, type SendResult } from "./sender.server";
import type { BookingStatus } from "../bookings";

const escapeHtml = (value: string): string =>
  value.replace(
    /[&<>"']/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] ?? c,
  );

/** Rupees, whole — catalogue prices never carry paise. */
const inr = (rupees: number): string =>
  `₹${rupees.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

/**
 * Spelled out for the mail rather than imported from `../bookings`, because
 * that module pulls in `createServerFn` and the database — the same reason
 * `brand.server.ts` stays dependency-free.
 */
const STATUS_WORD: Record<BookingStatus, string> = {
  new: "Awaiting confirmation",
  confirmed: "Confirmed",
  packed: "Packed",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

type Notice = {
  subject: string;
  headline: string;
  paragraphs: string[];
  closing: string;
};

/**
 * One line per status, written to say only what is true at that moment: the
 * piece is at the bench, it is packed, it is with the courier. No delivery date
 * is promised, because nothing on this site holds one — dispatch depends on the
 * pin code and the courier, and the terms say so.
 */
function noticeFor(
  status: BookingStatus,
  input: { ref: string; total: number; tracking?: string | null; firstName: string },
): Notice | null {
  const greeting = (input.firstName ? `Dear ${escapeHtml(input.firstName)},` : "Dear customer,") +
    "<br/>&nbsp;";
  const about = `Booking <strong>${escapeHtml(input.ref)}</strong>, totalling ${inr(input.total)}.`;

  switch (status) {
    case "confirmed":
      return {
        subject: `Booking ${input.ref} is confirmed — Raakha Grace`,
        headline: "Your booking is confirmed",
        paragraphs: [
          greeting,
          `Thank you. ${about} The piece is set aside for you at the bench in Hyderabad and the details we agreed on WhatsApp stand.`,
          `We will write to you on WhatsApp before dispatch, and your account's Order history shows this status at any time.`,
        ],
        closing: "With thanks,",
      };
    case "packed":
      return {
        subject: `Booking ${input.ref} is packed — Raakha Grace`,
        headline: "Your parcel is packed",
        paragraphs: [
          greeting,
          `${about} It is wrapped in gift-ready packaging and handed to the courier shortly, in the order payments were received.`,
          `Tracking appears on the courier's site two to three working days after dispatch — that gap is the courier's, not ours.`,
        ],
        closing: "Yours sincerely,",
      };
    case "shipped":
      return {
        subject: `Booking ${input.ref} has shipped — Raakha Grace`,
        headline: "On its way to you",
        paragraphs: [
          greeting,
          `${about} has left the atelier with the courier${
            input.tracking ? ` and its tracking number is <strong>${escapeHtml(input.tracking)}</strong>` : ""
          }.`,
          `Please open the parcel on one continuous 360-degree video and keep the packaging. That recording is the only proof we can accept for transit damage, and the claim window closes with it.`,
        ],
        closing: "Yours sincerely,",
      };
    case "delivered":
      return {
        subject: `Booking ${input.ref} is delivered — Raakha Grace`,
        headline: "Delivered",
        paragraphs: [
          greeting,
          `${about} shows as delivered. Thank you for choosing a handmade piece.`,
          `If anything is wrong, write to us on WhatsApp right away with your unboxing recording — a claim made after the packaging is thrown away cannot be settled. Wear it with care: jewellery goes on after perfume and lotion, and comes off before water, sleep and the gym.`,
        ],
        closing: "With gratitude,",
      };
    case "cancelled":
      return {
        subject: `Booking ${input.ref} is cancelled — Raakha Grace`,
        headline: "Booking cancelled",
        paragraphs: [
          greeting,
          `${about} is marked cancelled here at the desk. If this is not what we agreed on WhatsApp, write to us there and we will look into it at once.`,
        ],
        closing: "Yours sincerely,",
      };
    default:
      // "new" is the state the customer themselves created; there is no news.
      return null;
  }
}

/**
 * Send the status notice. Returns the outcome rather than throwing so the
 * Order desk can show it next to the booking — a silent failure here is
 * exactly the thing the shop could not previously see.
 */
export async function sendBookingStatusMail(input: {
  to: string;
  name: string | null;
  ref: string;
  total: number;
  status: BookingStatus;
  tracking?: string | null;
}): Promise<SendResult | "not-applicable"> {
  const notice = noticeFor(input.status, {
    ref: input.ref,
    total: input.total,
    tracking: input.tracking,
    firstName: (input.name ?? "").trim().split(/\s+/)[0] ?? "",
  });
  if (!notice) return "not-applicable";

  const html = brandMail({
    headline: notice.headline,
    paragraphs: notice.paragraphs,
    details: [
      { label: "Booking reference", value: input.ref },
      { label: "Status", value: STATUS_WORD[input.status] },
    ],
    note: "You are receiving this because this address was given when the booking was made. Availability, payment and dispatch are settled with you on WhatsApp: +91 63048 37120.",
    closing: notice.closing,
  });

  const result = await sendEmail({
    to: input.to,
    subject: notice.subject,
    html,
    // Replies land in the atelier inbox, which is where the order actually
    // gets answered — this mail is a notice, not a no-reply.
    ...(notifyInbox() ? { replyTo: notifyInbox() } : {}),
    kind: "order",
  }).catch((err: unknown) => {
    // Resend threw before answering. The status change is already committed,
    // and it must not be undone or hidden over a notice.
    const detail = err instanceof Error ? err.message : String(err);
    console.error(`[mail] booking notice to ${input.to} threw — ${detail}`);
    return { ok: false as const, error: detail };
  });
  return result;
}

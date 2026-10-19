/**
 * Order-enquiry mail rendering + dispatch (server-only).
 *
 * Kept out of `createServerFn` so the callable wrapper in `@/lib/order-email`
 * can stay a plain module (TanStack's import protection denies a client-side
 * route that statically imports a `*.server.*` file).
 *
 * NEVER import this from a route or component directly.
 */
import { notifyInbox, resendConfigured, sendEmail } from "./sender.server";
import type { Enquiry, EnquiryResult } from "./enquiry-schema";

const escapeHtml = (value: string): string =>
  value.replace(
    /[&<>"']/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] ?? c,
  );

// Catalog prices are whole rupees (see `formatInr`), not paise.
const inr = (rupees: number): string =>
  `₹${rupees.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

function enquiryHtml(rows: { label: string; value: string }[]): string {
  return `<div style="font-family:ui-serif,Georgia,serif;color:#1A1714">
  <h2 style="margin:0 0 4px;font-weight:400;letter-spacing:.08em">RAAKHA GRACE</h2>
  <p style="margin:0 0 20px;color:#7a6f66;font-size:13px">New booking enquiry</p>
  <table role="presentation" cellpadding="8" cellspacing="0" style="border-collapse:collapse;font-size:14px">
    ${rows
      .map(
        (r) =>
          `<tr><td style="border-bottom:1px solid #eee;color:#7a6f66;vertical-align:top">${escapeHtml(r.label)}</td><td style="border-bottom:1px solid #eee">${escapeHtml(r.value)}</td></tr>`,
      )
      .join("")}
  </table>
</div>`;
}

/**
 * Email a checkout enquiry to the atelier inbox, and confirm to the customer.
 *
 * The customer still gets the WhatsApp flow in the UI; this is the parallel
 * paper trail so an enquiry is recorded even if that tab is dismissed.
 */
export async function sendEnquiry(data: Enquiry): Promise<EnquiryResult> {
  const inbox = notifyInbox();
  if (!resendConfigured()) {
    return { ok: false, error: "Email notifications are not configured yet." };
  }
  if (!inbox) {
    return { ok: false, error: "ORDER_NOTIFY_EMAIL is not set." };
  }

  const total = data.items.reduce((sum, i) => sum + i.price * i.qty, 0);
  const lines = data.items
    .map((i) => `${i.name} (${i.sku}) × ${i.qty} — ${inr(i.price * i.qty)}`)
    .join(", ");

  const rows = [
    { label: "Pieces", value: lines },
    { label: "Total", value: inr(total) },
    { label: "Name", value: data.customerName },
    { label: "Phone", value: data.phone },
    { label: "Email", value: data.customerEmail },
    { label: "Address", value: data.address },
    ...(data.notes ? [{ label: "Notes", value: data.notes }] : []),
  ];

  const [owner, customer] = await Promise.all([
    sendEmail({
      to: inbox,
      subject: `Booking enquiry — ${data.customerName} (${inr(total)})`,
      html: enquiryHtml(rows),
    }),
    sendEmail({
      to: data.customerEmail,
      replyTo: inbox,
      subject: "We received your enquiry — Raakha Grace",
      html: enquiryHtml([
        { label: "Pieces", value: lines },
        { label: "Total", value: inr(total) },
        {
          label: "Next step",
          value:
            "Our atelier will reach out on WhatsApp within one working day to confirm availability and payment.",
        },
      ]),
    }),
  ]);

  if (!owner.ok) console.error("[email] atelier notification failed:", owner.error);
  if (!customer.ok) console.error("[email] customer confirmation failed:", customer.error);

  // Report success when the atelier copy landed — the customer confirmation is
  // a courtesy, not the record of the enquiry.
  return owner.ok ? { ok: true } : { ok: false, error: owner.error };
}

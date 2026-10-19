/**
 * Order-enquiry payload shape.
 *
 * Deliberately free of server imports so the client-callable wrapper
 * (`@/lib/order-email`) can validate synchronously and infer its argument type,
 * while the server-only mailer reuses the exact same schema.
 */
import { z } from "zod";

export const enquirySchema = z.object({
  customerName: z.string().min(1).max(120),
  customerEmail: z.string().email().max(200),
  phone: z.string().min(3).max(30),
  address: z.string().min(3).max(600),
  notes: z.string().max(1000).optional(),
  items: z
    .array(
      z.object({
        name: z.string().max(200),
        sku: z.string().max(80),
        qty: z.number().int().positive(),
        price: z.number(),
      }),
    )
    .min(1)
    .max(50),
});

export type Enquiry = z.infer<typeof enquirySchema>;
export type EnquiryResult = { ok: true } | { ok: false; error: string };

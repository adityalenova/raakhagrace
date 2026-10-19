import { createServerFn } from "@tanstack/react-start";
import { enquirySchema, type Enquiry } from "./email/enquiry-schema";

/**
 * Client-callable wrapper over the server-only enquiry mailer.
 *
 * Lives in a plain (non-`.server`) module because TanStack Start's import
 * protection rejects a route that statically imports `*.server.*`; the mailer is
 * dynamically imported inside the handler, which only ever runs on the server.
 * Same shape as `@/lib/shop.ts` and `@/lib/ai.ts`.
 *
 * Validation is synchronous and shared with the server through
 * `./email/enquiry-schema`, so the argument type is inferred here too.
 */
export const sendOrderEnquiry = createServerFn({ method: "POST" })
  .validator((input: unknown) => enquirySchema.parse(input))
  .handler(async ({ data }) => {
    const { sendEnquiry } = await import("./email/enquiry.server");
    return sendEnquiry(data as Enquiry);
  });

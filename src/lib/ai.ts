import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { PRODUCTS, type Product } from "./products";
import { aiCatalogBrief, answerAboutShop, type AiReply } from "./shop-ai";

/**
 * The chat behind "Shop with AI".
 *
 * Two layers, deliberately in this order: `answerAboutShop` reads the live
 * catalogue and always returns something useful, and a model is asked to
 * rewrite that answer only when credentials exist. XAI_API_KEY is optional —
 * on a deploy without it the assistant still answers, instead of the "Grace AI
 * is unavailable" dead end it used to be.
 */
const SYSTEM = (catalog: Product[]) => `You are Grace, the stylist behind Raakha Grace, a small handmade jewellery atelier in Hyderabad. Speak warmly and plainly, never salesy, 2-5 short sentences.
Rules:
- Recommend only pieces from the catalogue below, by exact id. Cite each recommended id in square brackets, e.g. [coral-tulip-onyx].
- Prices are Indian rupees. Everything is fashion jewellery (gold polish, pearls, beads), not solid gold — never claim purity or hallmarking of real gold.
- Orders are taken on WhatsApp at +91 63048 37120, advance payment, shipping across India in 3-7 working days. No cash on delivery, all sales final, unboxing video required for any damage claim.
- If a piece is not in the catalogue, say it is between batches and offer what is closest.
- Answer shop questions (sizing, colour variation, care, returns, delivery) directly.
Catalogue (id | name | price | category | wear | occasion | stones | size):
${aiCatalogBrief(catalog)}`;

export const askShopAi = createServerFn({ method: "POST" })
  .validator((input: unknown) =>
    z
      .object({
        message: z.string().min(1).max(500),
        history: z
          .array(z.object({ role: z.enum(["user", "assistant"]), content: z.string() }))
          .max(8)
          .optional(),
      })
      .parse(input),
  )
  .handler(async ({ data }): Promise<AiReply> => {
    const catalog = PRODUCTS;
    const local = answerAboutShop(data.message, catalog);
    const apiKey = process.env.XAI_API_KEY?.trim();
    if (!apiKey) return local;

    try {
      const res = await fetch("https://api.x.ai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "grok-4.5",
          max_tokens: 400,
          temperature: 0.6,
          messages: [
            { role: "system", content: SYSTEM(catalog) },
            ...(data.history ?? []),
            {
              role: "user",
              content: `${data.message}\n\n(Internal shortlist from the catalogue, keep to these ids: ${local.ids.join(", ") || "none"}. Answer in your own words.)`,
            },
          ],
        }),
      });
      if (!res.ok) return local;
      const body = (await res.json()) as { choices?: { message?: { content?: string } }[] };
      const text = body.choices?.[0]?.message?.content?.trim();
      if (!text) return local;
      // Trust the ids the retrieval layer found; the model's own brackets are a
      // bonus, so a hallucinated id can never reach the product cards.
      return { text, ids: local.ids.length ? local.ids : extractIds(text) };
    } catch {
      return local;
    }
  });

/** Ids in [square-brackets] that actually exist in the catalogue. */
export function extractIds(text: string, catalog: Product[] = PRODUCTS) {
  const found = [...text.matchAll(/\[([a-z0-9-]+)\]/g)].map((m) => m[1]);
  return [...new Set(found)].filter((id) => catalog.some((p) => p.id === id));
}

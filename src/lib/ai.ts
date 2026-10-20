import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { PRODUCTS, type Product } from "./products";
import { siteBrief } from "./site-knowledge";
import { answerAboutShop, type AiReply, type Ask } from "./shop-ai";

/**
 * The chat behind "Shop with AI".
 *
 * Two layers, in this order:
 *
 * 1. `answerAboutShop` — the shopkeeper. It reads the live catalogue and
 *    `site-knowledge.ts` (what this site actually promises about ordering,
 *    payment, shipping, returns, sizing, care, gifting, the account) and
 *    returns an answer plus the product ids and page links it used. No network,
 *    no key, always something true.
 * 2. A language model, *optional*. If credentials exist it re-phrases layer 1's
 *    conclusion in Grace's own voice, grounded on `siteBrief()`. It never gets
 *    to invent a product or a policy: ids and links are taken from retrieval,
 *    and a bracket the model hallucinates is dropped by `extractIds`.
 *
 * Without a key the assistant still answers every question — which is the
 * difference between this and the old "Grace AI is unavailable" dead end.
 */

const MODEL_TIMEOUT_MS = 9000;

type Provider = {
  name: string;
  url: string;
  headers: Record<string, string>;
  model: string;
  /** Some gateways burn their token budget on hidden reasoning; ask them not to. */
  reasoningOff: boolean;
};

/**
 * First match wins. `AI_API_BASE` + `AI_API_KEY` is the generic door: any
 * OpenAI-compatible endpoint, including a hosted key you buy later, without
 * touching this file.
 */
function provider(): Provider | null {
  const xai = process.env.XAI_API_KEY?.trim();
  if (xai) {
    return {
      name: "xai",
      url: "https://api.x.ai/v1/chat/completions",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${xai}` },
      model: process.env.XAI_MODEL?.trim() || "grok-4.5",
      reasoningOff: false,
    };
  }
  const base = process.env.AI_API_BASE?.trim();
  const key = process.env.AI_API_KEY?.trim();
  if (base && key) {
    return {
      name: "openai-compatible",
      url: base,
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
      model: process.env.AI_MODEL?.trim() || "gpt-4o-mini",
      reasoningOff: true,
    };
  }
  return null;
}

const systemPrompt = (catalog: Product[]) => `You are Grace, the stylist and shopkeeper behind Raakha Grace, an independent handmade jewellery atelier in Hyderabad. Warm, plain, unhurried, never salesy. Two to five short sentences; a short bulleted list is fine when you show pieces.
Rules:
- You may only talk about the pieces in the CATALOGUE below and the promises in WHAT THE SITE PROMISES. Quote those facts; never soften, stretch or invent a policy, price, date or discount.
- When you recommend a piece, cite its exact id in square brackets, e.g. [coral-tulip-onyx]. Never invent an id. If nothing fits, say so and offer the closest.
- Everything is handmade fashion jewellery: gold polish or gold-plated metal with pearls, kundan, crystal and ruby-tone stones. It is not solid gold and is not hallmarked.
- Prices are Indian rupees. Orders close on WhatsApp; there is no card checkout and no cash on delivery.
- If the question is outside the catalogue and the site's own copy, say you would rather not guess and hand over WhatsApp.
${siteBrief(catalog)}`;

const askShopAi = createServerFn({ method: "POST" })
  .validator((input: unknown) => {
    const parsed = z
      .object({
        message: z.string().min(1).max(500),
        history: z
          .array(z.object({ role: z.enum(["user", "assistant"]), content: z.string().max(1200) }))
          .max(8)
          .optional(),
        /** Pieces Grace put on screen last, so "the second one" resolves. */
        focus: z.array(z.string().max(60)).max(6).optional(),
      })
      .parse(input);
    return parsed satisfies Ask;
  })
  .handler(async ({ data }): Promise<AiReply> => {
    const catalog = PRODUCTS;
    const local = answerAboutShop(data, catalog);
    const p = provider();
    if (!p) return local;

    const messages = [
      { role: "system", content: systemPrompt(catalog) },
      ...(data.history ?? []),
      {
        role: "user",
        content: `${data.message}\n\n(Retrieval already picked these catalogue ids: ${local.ids.join(", ") || "none"}. Stay within them, and answer in your own words.)`,
      },
    ];

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), MODEL_TIMEOUT_MS);
    try {
      const res = await fetch(p.url, {
        method: "POST",
        headers: p.headers,
        signal: controller.signal,
        body: JSON.stringify({
          model: p.model,
          messages,
          temperature: 0.6,
          max_tokens: 500,
          ...(p.reasoningOff ? { reasoning: false } : {}),
        }),
      });
      if (!res.ok) return local;
      const body = (await res.json()) as { choices?: { message?: { content?: string } }[] };
      const text = body.choices?.[0]?.message?.content?.trim();
      if (!text) return local;
      return { text: clean(text), ids: local.ids.length ? local.ids : extractIds(text, catalog), links: local.links };
    } catch {
      // Slow, rate-limited or a bad key — the shopkeeper's answer is the floor.
      return local;
    } finally {
      clearTimeout(timer);
    }
  });

export { askShopAi };

/** Models occasionally wrap the whole reply in stray markdown. */
function clean(text: string) {
  return text.replace(/^```(?:\w+)?\s*|\s*```$/g, "").trim();
}

/** Ids in [square-brackets] that actually exist in the catalogue. */
export function extractIds(text: string, catalog: Product[] = PRODUCTS) {
  const found = [...text.matchAll(/\[([a-z0-9-]+)\]/g)].map((m) => m[1]);
  return [...new Set(found)].filter((id) => catalog.some((p) => p.id === id));
}

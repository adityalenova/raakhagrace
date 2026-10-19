import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { catalogForAi } from "./products";

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
  .handler(async ({ data }) => {
    const apiKey = process.env.XAI_API_KEY;
    if (!apiKey) return { ok: false as const, error: "Grace AI is unavailable right now." };

    const catalog = JSON.stringify(catalogForAi());
    const res = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "grok-4.5",
        max_tokens: 420,
        messages: [
          {
            role: "system",
            content: `You are Grace AI, the in-store stylist for Raakha Grace jewellery. Be concise, warm, and specific. Recommend only products from this catalog (use exact id and name). Prices are INR. When you recommend, include the product id in square brackets like [astra-halo-ring]. Catalog: ${catalog}`,
          },
          ...(data.history ?? []),
          { role: "user", content: data.message },
        ],
      }),
    });
    if (!res.ok) return { ok: false as const, error: "Grace AI could not reply. Try again." };
    const body = (await res.json()) as { choices: { message: { content: string } }[] };
    return { ok: true as const, text: body.choices[0]?.message.content ?? "" };
  });

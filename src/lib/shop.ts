import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { authMiddleware } from "@/lib/auth/middleware";
import { getSql } from "@/lib/db";
import { getProduct } from "./products";

export type CartRow = { productId: string; qty: number };
export type OrderRow = {
  id: number;
  items: { productId: string; name: string; price: number; qty: number }[];
  total: number;
  status: string;
  createdAt: string;
};

export const getCart = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    const rows = await sql<{ product_id: string; qty: number }>`
      select product_id, qty from cart_items where user_id = ${context.userId} order by created_at
    `;
    return rows.map((r) => ({ productId: r.product_id, qty: r.qty }));
  });

export const setCartItem = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) =>
    z.object({ productId: z.string(), qty: z.number().int().min(0).max(20) }).parse(input),
  )
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    if (data.qty <= 0) {
      await sql`delete from cart_items where user_id = ${context.userId} and product_id = ${data.productId}`;
      return { ok: true as const };
    }
    await sql`
      insert into cart_items (user_id, product_id, qty)
      values (${context.userId}, ${data.productId}, ${data.qty})
      on conflict (user_id, product_id) do update set qty = ${data.qty}
    `;
    return { ok: true as const };
  });

export const mergeCart = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) =>
    z.array(z.object({ productId: z.string(), qty: z.number().int().min(1).max(20) })).parse(input),
  )
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    for (const item of data) {
      await sql`
        insert into cart_items (user_id, product_id, qty)
        values (${context.userId}, ${item.productId}, ${item.qty})
        on conflict (user_id, product_id) do update set qty = cart_items.qty + ${item.qty}
      `;
    }
    const rows = await sql<{ product_id: string; qty: number }>`
      select product_id, qty from cart_items where user_id = ${context.userId}
    `;
    return rows.map((r) => ({ productId: r.product_id, qty: r.qty }));
  });

export const placeOrder = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    const rows = await sql<{ product_id: string; qty: number }>`
      select product_id, qty from cart_items where user_id = ${context.userId}
    `;
    if (!rows.length) return { ok: false as const, error: "Your cart is empty." };
    const items = rows.map((r) => {
      const p = getProduct(r.product_id);
      return {
        productId: r.product_id,
        name: p?.name ?? r.product_id,
        price: p?.price ?? 0,
        qty: r.qty,
      };
    });
    const total = items.reduce((s, i) => s + i.price * i.qty, 0);
    const inserted = await sql.query<{ id: number }>(
      "insert into orders (user_id, items, total, status) values ($1, $2::jsonb, $3, 'confirmed') returning id",
      [context.userId, JSON.stringify(items), total],
    );
    await sql`delete from cart_items where user_id = ${context.userId}`;
    return { ok: true as const, id: inserted[0]?.id };
  });

export const listOrders = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    const rows = await sql<{
      id: number;
      items: OrderRow["items"] | string;
      total: number;
      status: string;
      created_at: string;
    }>`
      select id, items, total, status, created_at from orders
      where user_id = ${context.userId}
      order by created_at desc
    `;
    return rows.map((r) => ({
      id: r.id,
      items: typeof r.items === "string" ? (JSON.parse(r.items) as OrderRow["items"]) : r.items,
      total: r.total,
      status: r.status,
      createdAt: r.created_at,
    })) satisfies OrderRow[];
  });

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { getCart, mergeCart, setCartItem } from "./shop";

type Item = { productId: string; qty: number };

type CartState = {
  items: Item[];
  hydrated: boolean;
  setHydrated: () => void;
  add: (productId: string, qty?: number) => void;
  setQty: (productId: string, qty: number) => void;
  remove: (productId: string) => void;
  clear: () => void;
  count: () => number;
  syncFromServer: () => Promise<void>;
  mergeGuestToServer: () => Promise<void>;
};

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      hydrated: false,
      setHydrated: () => set({ hydrated: true }),
      add: (productId, qty = 1) => {
        const items = [...get().items];
        const i = items.findIndex((x) => x.productId === productId);
        if (i >= 0) items[i] = { ...items[i], qty: Math.min(20, items[i].qty + qty) };
        else items.push({ productId, qty });
        set({ items });
        void setCartItem({ data: { productId, qty: items.find((x) => x.productId === productId)?.qty ?? qty } }).catch(
          () => {},
        );
      },
      setQty: (productId, qty) => {
        const items = qty <= 0 ? get().items.filter((x) => x.productId !== productId) : get().items.map((x) => (x.productId === productId ? { ...x, qty } : x));
        set({ items });
        void setCartItem({ data: { productId, qty } }).catch(() => {});
      },
      remove: (productId) => {
        set({ items: get().items.filter((x) => x.productId !== productId) });
        void setCartItem({ data: { productId, qty: 0 } }).catch(() => {});
      },
      clear: () => set({ items: [] }),
      count: () => get().items.reduce((s, i) => s + i.qty, 0),
      syncFromServer: async () => {
        try {
          const rows = await getCart();
          set({ items: rows });
        } catch {
          /* guest */
        }
      },
      mergeGuestToServer: async () => {
        const guest = get().items;
        try {
          if (guest.length) {
            const rows = await mergeCart({ data: guest });
            set({ items: rows });
          } else {
            const rows = await getCart();
            set({ items: rows });
          }
        } catch {
          /* still guest */
        }
      },
    }),
    {
      name: "raakha-cart",
      partialize: (s) => ({ items: s.items }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated();
      },
    },
  ),
);

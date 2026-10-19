import { create } from "zustand";
import { persist } from "zustand/middleware";
import { mergeProduct, PRODUCTS, type Product } from "./products";

type CatalogState = {
  overrides: Record<string, Partial<Product>>;
  upsert: (id: string, patch: Partial<Product>) => void;
  reset: (id: string) => void;
  resetAll: () => void;
  list: () => Product[];
  get: (id: string) => Product | undefined;
};

export const useCatalog = create<CatalogState>()(
  persist(
    (set, get) => ({
      overrides: {},
      upsert: (id, patch) =>
        set({
          overrides: {
            ...get().overrides,
            [id]: { ...get().overrides[id], ...patch, id },
          },
        }),
      reset: (id) => {
        const next = { ...get().overrides };
        delete next[id];
        set({ overrides: next });
      },
      resetAll: () => set({ overrides: {} }),
      list: () => PRODUCTS.map((p) => mergeProduct(p, get().overrides[p.id])),
      get: (id) => {
        const base = PRODUCTS.find((p) => p.id === id);
        if (!base) return undefined;
        return mergeProduct(base, get().overrides[id]);
      },
    }),
    { name: "raakha-catalog" },
  ),
);

export function useProductList() {
  const overrides = useCatalog((s) => s.overrides);
  return PRODUCTS.map((p) => mergeProduct(p, overrides[p.id]));
}

export function useProduct(id: string) {
  const overrides = useCatalog((s) => s.overrides);
  const base = PRODUCTS.find((p) => p.id === id);
  if (!base) return undefined;
  return mergeProduct(base, overrides[id]);
}

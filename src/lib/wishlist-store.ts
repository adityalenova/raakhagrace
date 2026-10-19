import { create } from "zustand";
import { persist } from "zustand/middleware";

type WishState = {
  ids: string[];
  toggle: (id: string) => void;
  has: (id: string) => boolean;
  remove: (id: string) => void;
};

export const useWishlist = create<WishState>()(
  persist(
    (set, get) => ({
      ids: [],
      toggle: (id) => {
        const ids = get().ids.includes(id) ? get().ids.filter((x) => x !== id) : [...get().ids, id];
        set({ ids });
      },
      has: (id) => get().ids.includes(id),
      remove: (id) => set({ ids: get().ids.filter((x) => x !== id) }),
    }),
    { name: "raakha-wish" },
  ),
);

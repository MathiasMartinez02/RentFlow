import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { RecentItem } from "../types";

interface CommandPaletteState {
  isOpen: boolean;
  query: string;
  recentItems: RecentItem[];

  open: () => void;
  close: () => void;
  toggle: () => void;
  setQuery: (q: string) => void;
  pushRecentItem: (item: RecentItem) => void;
  clearRecent: () => void;
}

export const useCommandPaletteStore = create<CommandPaletteState>()(
  persist(
    (set) => ({
      isOpen: false,
      query: "",
      recentItems: [],

      open: () => set({ isOpen: true, query: "" }),
      close: () => set({ isOpen: false }),
      toggle: () => set((s) => ({ isOpen: !s.isOpen, query: s.isOpen ? s.query : "" })),
      setQuery: (q) => set({ query: q }),

      pushRecentItem: (item) =>
        set((s) => ({
          recentItems: [
            item,
            ...s.recentItems.filter(
              (r) => !(r.type === item.type && r.id === item.id)
            ),
          ].slice(0, 8),
        })),

      clearRecent: () => set({ recentItems: [] }),
    }),
    {
      name: "rentflow-command-palette",
      partialize: (s) => ({ recentItems: s.recentItems }),
    }
  )
);

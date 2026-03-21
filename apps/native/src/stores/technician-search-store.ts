import { create } from "zustand";
import type { SortKey } from "@/src/components/user/browse/TechnicianSortBar";

interface TechnicianSearchStore {
  searchText: string;
  activeSort: SortKey;
  setSearchText: (text: string) => void;
  setActiveSort: (sort: SortKey) => void;
  reset: () => void;
}

export const useTechnicianSearchStore = create<TechnicianSearchStore>(
  (set) => ({
    searchText: "",
    activeSort: "Top Rated",
    setSearchText: (text) => set({ searchText: text }),
    setActiveSort: (sort) => set({ activeSort: sort }),
    reset: () => set({ searchText: "", activeSort: "Top Rated" }),
  }),
);

import { create } from "zustand";
import type { SortKey } from "@/src/features/technicians/types/sort";

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
    activeSort: "Recommended",
    setSearchText: (text) => set({ searchText: text }),
    setActiveSort: (sort) => set({ activeSort: sort }),
    reset: () => set({ searchText: "", activeSort: "Recommended" }),
  }),
);

export type TechnicianSortFilter =
  | "top_rated"
  | "nearest"
  | "most_reviews"
  | "recommended";
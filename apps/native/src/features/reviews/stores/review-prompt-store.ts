import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface ReviewPromptStore {
  skippedOrderIds: Set<string>;
  submittedOrderIds: Set<string>;
  markSkipped: (orderId: string) => void;
  markSubmitted: (orderId: string) => void;
  hasSkipped: (orderId: string) => boolean;
  hasSubmitted: (orderId: string) => boolean;
  reset: () => void;
}

interface PersistedReviewPromptStore {
  skippedOrderIds: string[];
  submittedOrderIds: string[];
}

export const useReviewPromptStore = create<ReviewPromptStore>()(
  persist<ReviewPromptStore, [], [], PersistedReviewPromptStore>(
    (set, get) => ({
      skippedOrderIds: new Set(),
      submittedOrderIds: new Set(),
      markSkipped: (orderId) =>
        set((state) => ({
          skippedOrderIds: new Set(state.skippedOrderIds).add(orderId),
        })),
      markSubmitted: (orderId) =>
        set((state) => ({
          submittedOrderIds: new Set(state.submittedOrderIds).add(orderId),
        })),
      hasSkipped: (orderId) => get().skippedOrderIds.has(orderId),
      hasSubmitted: (orderId) => get().submittedOrderIds.has(orderId),
      reset: () =>
        set({ skippedOrderIds: new Set(), submittedOrderIds: new Set() }),
    }),
    {
      name: "fixit-review-prompt",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        skippedOrderIds: Array.from(state.skippedOrderIds),
        submittedOrderIds: Array.from(state.submittedOrderIds),
      }),
      merge: (persistedState, currentState) => {
        const persisted = persistedState as Partial<PersistedReviewPromptStore>;
        return {
          ...currentState,
          skippedOrderIds: new Set(persisted.skippedOrderIds ?? []),
          submittedOrderIds: new Set(persisted.submittedOrderIds ?? []),
        };
      },
    },
  ),
);

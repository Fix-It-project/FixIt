// Lifecycle mutation barrel.
//
// The hooks were split by role to keep each file readable:
//   • `_lifecycle-mutation-factory` — shared useMutation wrapper + invalidators
//   • `useUserLifecycleMutations`   — 9 user-side hooks
//   • `useTechLifecycleMutations`   — 13 technician-side hooks
//
// Consumers keep importing from this module (or `hooks/index.ts`) unchanged.

export * from "./useUserLifecycleMutations";
export * from "./useTechLifecycleMutations";

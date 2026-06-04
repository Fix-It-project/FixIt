import { create } from "zustand";
import { ACTIVE_TECHS, PENDING_TECHS } from "@/data/mockData";
import type { ActiveTech, PendingTech } from "@/types";

interface TechStore {
	activeTechs: ActiveTech[];
	blockedTechs: ActiveTech[];
	pendingTechs: PendingTech[];
	blockTech: (id: string, reason: string) => void;
	unblockTech: (id: string) => void;
	approveTech: (id: string) => void;
	rejectTech: (id: string) => void;
}

/**
 * Module-level store (mock data, not yet backend-wired). Lives at module scope so
 * the list and the detail page share one source of truth: blocking on the detail
 * page is reflected when you navigate back to the list.
 */
export const useTechStore = create<TechStore>((set) => ({
	activeTechs: ACTIVE_TECHS.filter((t) => !t.blocked),
	blockedTechs: ACTIVE_TECHS.filter((t) => t.blocked),
	pendingTechs: PENDING_TECHS,

	blockTech: (id, reason) =>
		set((state) => {
			const tech = state.activeTechs.find((t) => t.id === id);
			if (!tech) return state;
			const blocked: ActiveTech = {
				...tech,
				blocked: true,
				availability: "offline",
				blockedReason: reason,
				blockedAt: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
				blockedBy: "Ahmed Refaat",
			};
			return {
				activeTechs: state.activeTechs.filter((t) => t.id !== id),
				blockedTechs: [blocked, ...state.blockedTechs],
			};
		}),

	unblockTech: (id) =>
		set((state) => {
			const tech = state.blockedTechs.find((t) => t.id === id);
			if (!tech) return state;
			const unblocked: ActiveTech = { ...tech, blocked: false, blockedReason: undefined, blockedAt: undefined, blockedBy: undefined };
			return {
				blockedTechs: state.blockedTechs.filter((t) => t.id !== id),
				activeTechs: [...state.activeTechs, unblocked],
			};
		}),

	approveTech: (id) => set((state) => ({ pendingTechs: state.pendingTechs.filter((t) => t.id !== id) })),
	rejectTech: (id) => set((state) => ({ pendingTechs: state.pendingTechs.filter((t) => t.id !== id) })),
}));

/** Back-compat hook: same shape the page consumed before the store refactor. */
export function useTechState() {
	return useTechStore();
}

/** Look up a single technician (active or blocked) by id, for the detail page. */
export function useTechById(id: string): ActiveTech | undefined {
	return useTechStore((s) => s.activeTechs.find((t) => t.id === id) ?? s.blockedTechs.find((t) => t.id === id));
}

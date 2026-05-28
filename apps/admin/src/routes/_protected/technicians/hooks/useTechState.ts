import { useState } from "react";
import { ACTIVE_TECHS, PENDING_TECHS } from "@/data/mockData";
import type { ActiveTech, PendingTech } from "@/types";

export function useTechState() {
	const [activeTechs, setActiveTechs] = useState<ActiveTech[]>(
		ACTIVE_TECHS.filter((t) => !t.blocked),
	);
	const [blockedTechs, setBlockedTechs] = useState<ActiveTech[]>(
		ACTIVE_TECHS.filter((t) => t.blocked),
	);
	const [pendingTechs, setPendingTechs] = useState<PendingTech[]>(PENDING_TECHS);

	function blockTech(id: string, reason: string) {
		setActiveTechs((prev) => {
			const tech = prev.find((t) => t.id === id);
			if (!tech) return prev;
			const blocked: ActiveTech = {
				...tech,
				blocked: true,
				availability: "offline",
				blockedReason: reason,
				blockedAt: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
				blockedBy: "Ahmed Refaat",
			};
			setBlockedTechs((b) => [blocked, ...b]);
			return prev.filter((t) => t.id !== id);
		});
	}

	function unblockTech(id: string) {
		setBlockedTechs((prev) => {
			const tech = prev.find((t) => t.id === id);
			if (!tech) return prev;
			const unblocked: ActiveTech = { ...tech, blocked: false, blockedReason: undefined, blockedAt: undefined, blockedBy: undefined };
			setActiveTechs((a) => [...a, unblocked]);
			return prev.filter((t) => t.id !== id);
		});
	}

	function approveTech(id: string) {
		setPendingTechs((prev) => prev.filter((t) => t.id !== id));
	}

	function rejectTech(id: string) {
		setPendingTechs((prev) => prev.filter((t) => t.id !== id));
	}

	return { activeTechs, blockedTechs, pendingTechs, blockTech, unblockTech, approveTech, rejectTech };
}

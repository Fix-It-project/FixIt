import { useState } from "react";
import { HOMEOWNERS } from "@/data/mockData";
import type { Homeowner } from "@/types/domain";

export function useHomeownerState() {
	const [activeHomeowners, setActiveHomeowners] = useState<Homeowner[]>(
		HOMEOWNERS.filter((h) => !h.blocked),
	);
	const [blockedHomeowners, setBlockedHomeowners] = useState<Homeowner[]>(
		HOMEOWNERS.filter((h) => h.blocked),
	);

	function blockHomeowner(id: string, reason: string) {
		setActiveHomeowners((prev) => {
			const homeowner = prev.find((h) => h.id === id);
			if (!homeowner) return prev;
			const blocked: Homeowner = {
				...homeowner,
				blocked: true,
				blockedReason: reason,
				blockedAt: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
				blockedBy: "Ahmed Refaat",
			};
			setBlockedHomeowners((b) => [blocked, ...b]);
			return prev.filter((h) => h.id !== id);
		});
	}

	function unblockHomeowner(id: string) {
		setBlockedHomeowners((prev) => {
			const homeowner = prev.find((h) => h.id === id);
			if (!homeowner) return prev;
			const unblocked: Homeowner = {
				...homeowner,
				blocked: false,
				blockedReason: undefined,
				blockedAt: undefined,
				blockedBy: undefined,
			};
			setActiveHomeowners((a) => [...a, unblocked]);
			return prev.filter((h) => h.id !== id);
		});
	}

	return { activeHomeowners, blockedHomeowners, blockHomeowner, unblockHomeowner };
}

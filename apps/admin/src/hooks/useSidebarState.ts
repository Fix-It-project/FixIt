import { useCallback, useEffect, useState } from "react";

type SidebarState = "expanded" | "collapsed";

const STORAGE_KEY = "fixit_admin_sidebar";

export function useSidebarState() {
	const [state, setState] = useState<SidebarState>(() => {
		try {
			const stored = localStorage.getItem(STORAGE_KEY);
			if (stored === "collapsed" || stored === "expanded") return stored;
		} catch {
			// ignore
		}
		return "expanded";
	});

	const [mobileOpen, setMobileOpen] = useState(false);

	const toggle = useCallback(() => {
		setState((prev) => {
			const next = prev === "expanded" ? "collapsed" : "expanded";
			try { localStorage.setItem(STORAGE_KEY, next); } catch { /* ignore */ }
			return next;
		});
	}, []);

	const toggleMobile = useCallback(() => setMobileOpen((p) => !p), []);
	const closeMobile = useCallback(() => setMobileOpen(false), []);

	useEffect(() => {
		if (!mobileOpen) return;
		const handler = (e: KeyboardEvent) => { if (e.key === "Escape") setMobileOpen(false); };
		document.addEventListener("keydown", handler);
		return () => document.removeEventListener("keydown", handler);
	}, [mobileOpen]);

	return { state, mobileOpen, toggle, toggleMobile, closeMobile };
}

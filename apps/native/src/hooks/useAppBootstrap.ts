import { useEffect, useRef, useState } from "react";
import { useAuthStore } from "@/src/stores/auth-store";
import { useThemeStore } from "@/src/stores/theme-store";

interface AppBootstrapState {
	isReady: boolean;
}

export function useAppBootstrap(fontsLoaded: boolean): AppBootstrapState {
	const [hasMounted, setHasMounted] = useState(false);
	const hasStartedRef = useRef(false);

	const isAuthLoading = useAuthStore((state) => state.isLoading);
	const loadStoredSession = useAuthStore((state) => state.loadStoredSession);
	const isThemeLoaded = useThemeStore((state) => state.isLoaded);
	const loadThemePreference = useThemeStore(
		(state) => state.loadThemePreference,
	);

	useEffect(() => {
		if (hasStartedRef.current) {
			return;
		}

		hasStartedRef.current = true;
		setHasMounted(true);

		void loadStoredSession();
		void loadThemePreference();
	}, [loadStoredSession, loadThemePreference]);

	const isReady = hasMounted && fontsLoaded && !isAuthLoading && isThemeLoaded;

	return { isReady };
}

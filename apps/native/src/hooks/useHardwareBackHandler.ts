import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useEffect, useRef } from "react";
import { BackHandler } from "react-native";

/**
 * Registers a hardware back button listener while `enabled` is true.
 * `handler` should return `true` to consume the event (prevents default back action).
 * Suited for non-screen components (e.g. bottom sheets) — active as long as mounted + enabled.
 */
export function useHardwareBackHandler(
	enabled: boolean,
	handler: () => boolean,
): void {
	const handlerRef = useRef(handler);
	handlerRef.current = handler;

	useEffect(() => {
		if (!enabled) return;
		const sub = BackHandler.addEventListener("hardwareBackPress", () =>
			handlerRef.current(),
		);
		return () => sub.remove();
	}, [enabled]);
}

/**
 * Registers a hardware back button listener that is active only when the screen is focused.
 * `handler` should return `true` to consume the event (prevents default back action).
 * Suited for navigation screens — uses `useFocusEffect`.
 */
export function useFocusBackHandler(handler: () => boolean): void {
	const handlerRef = useRef(handler);
	handlerRef.current = handler;

	useFocusEffect(
		useCallback(() => {
			const sub = BackHandler.addEventListener("hardwareBackPress", () =>
				handlerRef.current(),
			);
			return () => sub.remove();
		}, []),
	);
}

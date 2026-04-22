import { useCallback, useRef } from "react";

export function useDebounce<
	T extends (...args: Parameters<T>) => ReturnType<T>,
>(fn: T, delay = 800): T {
	const blocked = useRef(false);

	return useCallback(
		(...args: Parameters<T>) => {
			if (blocked.current) return;
			blocked.current = true;
			fn(...args);
			setTimeout(() => {
				blocked.current = false;
			}, delay);
		},
		[fn, delay],
	) as T;
}

import { useCallback, useRef } from "react";

export function useDebounce<
	T extends (...args: Parameters<T>) => ReturnType<T>,
>(fn: T, delay = 500): T {
	const blocked = useRef(false);
	const fnRef = useRef(fn);
	fnRef.current = fn;

	return useCallback(
		(...args: Parameters<T>) => {
			if (blocked.current) return;
			blocked.current = true;
			fnRef.current(...args);
			setTimeout(() => {
				blocked.current = false;
			}, delay);
		},
		[delay],
	) as T;
}

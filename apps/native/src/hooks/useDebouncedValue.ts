import { useEffect, useState } from "react";

/**
 * Returns a debounced copy of `value` that only updates after `delay` ms
 * of no further changes. Use it to keep an input controlled and instant
 * while throttling derived work (e.g. network queries) behind the change.
 */
export function useDebouncedValue<T>(value: T, delay = 350): T {
	const [debounced, setDebounced] = useState(value);

	useEffect(() => {
		const timer = setTimeout(() => setDebounced(value), delay);
		return () => clearTimeout(timer);
	}, [value, delay]);

	return debounced;
}

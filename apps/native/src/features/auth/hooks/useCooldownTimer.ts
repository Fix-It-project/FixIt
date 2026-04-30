import { useCallback, useEffect, useRef, useState } from "react";

export function useCooldownTimer(seconds: number) {
	const [cooldown, setCooldown] = useState(0);
	const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

	const startCooldown = useCallback(() => {
		setCooldown(seconds);
		intervalRef.current = setInterval(() => {
			setCooldown((prev) => {
				if (prev <= 1) {
					if (intervalRef.current) clearInterval(intervalRef.current);
					return 0;
				}
				return prev - 1;
			});
		}, 1000);
	}, [seconds]);

	useEffect(() => {
		return () => {
			if (intervalRef.current) clearInterval(intervalRef.current);
		};
	}, []);

	return { cooldown, startCooldown, isActive: cooldown > 0 };
}

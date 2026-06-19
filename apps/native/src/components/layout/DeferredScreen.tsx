import type { ReactNode } from "react";
import { View } from "react-native";
import { Skeleton } from "@/src/components/ui/skeleton";
import { useDeferredMount } from "@/src/hooks/useDeferredMount";

function DefaultScreenSkeleton() {
	return (
		<View className="flex-1 gap-stack-md bg-surface p-card">
			<Skeleton className="h-36 w-full rounded-card" />
			<Skeleton className="h-24 w-full rounded-card" />
			<Skeleton className="h-24 w-full rounded-card" />
			<Skeleton className="h-24 w-full rounded-card" />
		</View>
	);
}

interface DeferredScreenProps {
	readonly children: ReactNode;
	readonly fallback?: ReactNode;
}

// Renders a lightweight fallback (skeleton) immediately and mounts the heavy
// `children` only after the navigation transition settles (see useDeferredMount),
// so tab switches / pushes commit instantly instead of stalling on the
// destination's first render. Wrap a heavy screen's body at the route level.
export function DeferredScreen({ children, fallback }: DeferredScreenProps) {
	const ready = useDeferredMount();
	return <>{ready ? children : (fallback ?? <DefaultScreenSkeleton />)}</>;
}

import { View } from "react-native";
import { Skeleton } from "@/src/components/ui/skeleton";

/** Loading placeholder mirroring the dashboard layout below the hero. */
export function TechHomeSkeleton() {
	return (
		<View className="px-screen-x pt-stack-lg" testID="techhome-skeleton">
			{/* earnings card */}
			<Skeleton className="h-48 w-full rounded-card" />
			{/* section header + card */}
			<Skeleton className="mt-stack-lg h-5 w-40 rounded-md" />
			<Skeleton className="mt-stack-sm h-36 w-full rounded-card" />
			{/* stats grid */}
			<Skeleton className="mt-stack-lg h-5 w-32 rounded-md" />
			<View className="mt-stack-sm flex-row gap-stack-sm">
				<Skeleton className="h-28 flex-1 rounded-card" />
				<Skeleton className="h-28 flex-1 rounded-card" />
			</View>
		</View>
	);
}

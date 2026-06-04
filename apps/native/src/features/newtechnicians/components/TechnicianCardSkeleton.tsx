import { View } from "react-native";
import { Skeleton } from "@/src/components/ui/skeleton";

/** Card-shaped placeholder shown while the technician list loads / refetches. */
export function TechnicianCardSkeleton() {
	return (
		<View className="mx-screen-x mb-stack-md rounded-compact border border-edge bg-card p-card-compact">
			<View className="flex-row gap-stack-md">
				<Skeleton className="h-avatar-lg w-avatar-lg rounded-pill" />
				<View className="flex-1 gap-stack-xs">
					<Skeleton className="h-4 w-1/2 rounded-input" />
					<Skeleton className="h-3 w-2/3 rounded-input" />
					<Skeleton className="h-3 w-4/5 rounded-input" />
				</View>
			</View>
			<Skeleton className="mt-stack-md h-btn-sm w-full rounded-button" />
		</View>
	);
}

const SKELETON_KEYS = ["s1", "s2", "s3", "s4"] as const;

export function TechnicianListSkeleton() {
	return (
		<View className="pt-stack-xs">
			{SKELETON_KEYS.map((key) => (
				<TechnicianCardSkeleton key={key} />
			))}
		</View>
	);
}

import { View } from "react-native";
import { Separator } from "@/src/components/ui/separator";
import { Skeleton } from "@/src/components/ui/skeleton";
import { spacing } from "@/src/constants/design-tokens";

const BOOK_BUTTON_WIDTH =
	spacing.avatar.hero + spacing.stack.xl + spacing.stack.lg;

/** Card-shaped placeholder shown while the technician list loads / refetches. */
export function TechnicianCardSkeleton() {
	return (
		<View className="mx-screen-x mb-stack-md rounded-compact bg-card px-card-compact py-stack-md">
			<View className="flex-row items-start gap-stack-md">
				<Skeleton className="h-avatar-lg w-avatar-lg rounded-pill" />
				<View className="flex-1 gap-stack-xs">
					<Skeleton className="h-4 w-1/2 rounded-input" />
					<Skeleton className="h-3 w-2/3 rounded-input" />
					<Skeleton className="h-3 w-4/5 rounded-input" />
				</View>
			</View>
			<Separator className="my-stack-md" />
			<View className="gap-stack-sm">
				<Skeleton className="h-3 w-4/5 rounded-input" />
				<Skeleton className="h-3 w-3/4 rounded-input" />
				<View className="flex-row items-center justify-between gap-stack-sm">
					<Skeleton className="h-3 flex-1 rounded-input" />
					<Skeleton
						className="h-btn-sm rounded-button"
						style={{ width: BOOK_BUTTON_WIDTH }}
					/>
				</View>
			</View>
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

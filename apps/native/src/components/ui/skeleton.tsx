import { View } from "react-native";
import { cn } from "@/src/lib/utils";

function Skeleton({
	className,
	...props
}: React.ComponentProps<typeof View> & React.RefAttributes<View>) {
	return (
		<View
			className={cn(
				"animate-pulse rounded-input bg-surface-elevated",
				className,
			)}
			{...props}
		/>
	);
}

export { Skeleton };

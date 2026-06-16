import type { ReactNode } from "react";
import { View } from "react-native";
import { Separator } from "@/src/components/ui/separator";
import { Text } from "@/src/components/ui/text";
import { cn } from "@/src/lib/utils";

interface ProfileSectionProps {
	readonly title: string;
	/** Hide the leading separator (e.g. the first section under the hero). */
	readonly topSeparator?: boolean;
	readonly children?: ReactNode;
}

/**
 * A flat, card-less profile section: a leading separator, a small-caps section
 * title, then its rows sitting directly on the surface. Sections are divided by
 * the separators — no boxes, following the modern settings/profile pattern.
 */
export default function ProfileSection({
	title,
	topSeparator = true,
	children,
}: ProfileSectionProps) {
	return (
		<View>
			{topSeparator ? <Separator className="my-stack-md" /> : null}
			<Text
				variant="caption"
				className={cn(
					"px-screen-x pb-stack-xs font-semibold text-content-secondary uppercase",
					topSeparator ? "pt-stack-sm" : "pt-stack-lg",
				)}
			>
				{title}
			</Text>
			{children}
		</View>
	);
}

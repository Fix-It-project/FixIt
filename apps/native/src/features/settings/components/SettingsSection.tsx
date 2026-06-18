import type { ReactNode } from "react";
import { View } from "react-native";
import { Separator } from "@/src/components/ui/separator";
import { Text } from "@/src/components/ui/text";

interface SettingsSectionProps {
	readonly title: string;
	readonly children: ReactNode;
	readonly bottomSeparator?: boolean;
}

/**
 * A flat, card-less settings section: a small-caps title then its rows sitting
 * directly on the surface, divided from the next section by a separator. No
 * boxes — the modern minimal settings pattern (YouTube-style).
 */
export function SettingsSection({
	title,
	children,
	bottomSeparator = true,
}: SettingsSectionProps) {
	return (
		<View>
			<Text
				variant="caption"
				className="px-screen-x pt-stack-md pb-stack-xs font-semibold text-content-secondary uppercase"
			>
				{title}
			</Text>
			<View className="px-screen-x">{children}</View>
			{bottomSeparator ? <Separator className="my-stack-sm" /> : null}
		</View>
	);
}

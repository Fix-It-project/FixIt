import { MapPinOff } from "lucide-react-native";
import { Pressable, View } from "react-native";
import { Text } from "@/src/components/ui/text";
import { spacing, useThemeColors } from "@/src/constants/design-tokens";

interface Props {
	readonly onRequestPermission: () => void;
	readonly ctaLabel?: string;
}

export default function LocationPermissionBanner({
	onRequestPermission,
	ctaLabel = "Grant access",
}: Props) {
	const themeColors = useThemeColors();

	return (
		<View
			className="flex-row items-center gap-stack-md rounded-card border p-card"
			style={{
				backgroundColor: themeColors.warningLight,
				borderColor: `${themeColors.warning}20`,
			}}
		>
			<MapPinOff size={spacing.icon.sm} color={themeColors.warning} strokeWidth={2} />
			<View className="flex-1">
				<Text variant="buttonMd" style={{ color: themeColors.textPrimary }}>
					Location access needed
				</Text>
				<Text variant="caption" style={{ color: themeColors.textMuted }}>
					Customer won't see your ETA until you grant access.
				</Text>
			</View>
			<Pressable
				onPress={onRequestPermission}
				className="rounded-card px-card py-stack-sm"
				style={{ backgroundColor: themeColors.primary }}
			>
				<Text variant="buttonMd" style={{ color: themeColors.surfaceBase }}>
					{ctaLabel}
				</Text>
			</Pressable>
		</View>
	);
}

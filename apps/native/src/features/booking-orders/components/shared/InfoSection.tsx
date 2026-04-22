import type { LucideIcon } from "lucide-react-native";
import { TouchableOpacity, View } from "react-native";
import { Text } from "@/src/components/ui/text";
import { useThemeColors } from "@/src/lib/theme";

export interface InfoSectionRow {
	readonly icon: LucideIcon;
	readonly label: string;
	readonly onPress?: () => void;
	readonly value: string;
}

interface Props {
	readonly rows: readonly InfoSectionRow[];
}

function InfoRow({ icon: Icon, label, onPress, value }: InfoSectionRow) {
	const themeColors = useThemeColors();
	const content = (
		<>
			<View
				className="h-control-icon-box-md w-control-icon-box-md items-center justify-center rounded-button"
				style={{ backgroundColor: `${themeColors.primary}12` }}
			>
				<Icon size={18} color={themeColors.primary} strokeWidth={2} />
			</View>
			<View className="min-w-0 flex-1">
				<Text
					variant="caption"
					style={{
						color: themeColors.textMuted,
						textTransform: "uppercase",
						letterSpacing: 0.5,
					}}
				>
					{label}
				</Text>
				<Text
					variant="buttonMd"
					className="mt-0.5"
					style={{ color: themeColors.textPrimary }}
				>
					{value}
				</Text>
			</View>
		</>
	);

	if (onPress) {
		return (
			<TouchableOpacity
				className="flex-row items-start gap-3"
				activeOpacity={0.7}
				onPress={onPress}
			>
				{content}
			</TouchableOpacity>
		);
	}

	return <View className="flex-row items-start gap-3">{content}</View>;
}

export default function InfoSection({ rows }: Props) {
	const themeColors = useThemeColors();

	return (
		<View
			className="mb-4 gap-4 rounded-card bg-surface p-card"
			style={{
				borderWidth: 1,
				borderColor: themeColors.borderDefault,
			}}
		>
			{rows.map((row) => (
				<InfoRow
					key={`${row.label}:${row.value}`}
					icon={row.icon}
					label={row.label}
					value={row.value}
					onPress={row.onPress}
				/>
			))}
		</View>
	);
}

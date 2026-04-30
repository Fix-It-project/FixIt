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
					className="text-content-muted uppercase tracking-wider"
					style={{
						textTransform: "uppercase",
					}}
				>
					{label}
				</Text>
				<Text
					variant="buttonMd"
					className="mt-stack-xs"
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
				className="flex-row items-start gap-stack-md"
				activeOpacity={0.7}
				onPress={onPress}
			>
				{content}
			</TouchableOpacity>
		);
	}

	return <View className="flex-row items-start gap-stack-md">{content}</View>;
}

export default function InfoSection({ rows }: Props) {
	const themeColors = useThemeColors();

	return (
		<View className="mb-stack-lg gap-stack-lg rounded-card border border-edge bg-surface p-card">
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

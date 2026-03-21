import { TouchableOpacity, View } from "react-native";
import { Text } from "@/src/components/ui/text";

interface SectionHeaderProps {
	title: string;
	actionLabel?: string;
	onActionPress?: () => void;
}

export default function SectionHeader({
	title,
	actionLabel,
	onActionPress,
}: SectionHeaderProps) {
	return (
		<View className="mb-3 flex-row items-center justify-between px-5">
			<Text
				className="font-bold text-[22px] text-content"
				style={{ fontFamily: "GoogleSans_700Bold" }}
			>
				{title}
			</Text>
			{actionLabel && (
				<TouchableOpacity onPress={onActionPress} activeOpacity={0.6}>
					<Text className="font-medium text-[13px] text-surface-muted">
						{actionLabel}
					</Text>
				</TouchableOpacity>
			)}
		</View>
	);
}

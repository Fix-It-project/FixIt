import { Search } from "lucide-react-native";
import { TextInput, View } from "react-native";
import { Colors, spacing, typography, useThemeColors } from "@/src/lib/theme";

export default function HomeSearchBar() {
	const themeColors = useThemeColors();

	return (
		<View className="px-5 pt-1 pb-4">
			<View
				className="h-control-search flex-row items-center gap-control-search rounded-input px-control-search"
				style={{ backgroundColor: Colors.overlayWhite }}
			>
				<Search
					size={spacing.icon.sm}
					color={Colors.overlaySub}
					strokeWidth={2}
				/>
				<TextInput
					placeholder="Search services & technicians"
					placeholderTextColor={Colors.overlaySub}
					editable={false}
					className="flex-1 p-0 text-white"
					style={[typography.body, { color: themeColors.onPrimaryHeader }]}
				/>
			</View>
		</View>
	);
}

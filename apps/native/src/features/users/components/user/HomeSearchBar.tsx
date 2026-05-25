import { Search } from "lucide-react-native";
import { View } from "react-native";
import { Input } from "@/src/components/ui/input";
import { spacing, useThemeColors } from "@/src/lib/theme";

export default function HomeSearchBar() {
	const themeColors = useThemeColors();

	return (
		<View className="px-screen-x pt-stack-xs pb-card">
			<View
				className="h-control-search flex-row items-center gap-control-search rounded-input px-control-search"
				style={{ backgroundColor: themeColors.overlayWhite }}
			>
				<Search
					size={spacing.icon.sm}
					color={themeColors.overlaySub}
					strokeWidth={2}
				/>
				<Input
					variant="filled"
					placeholder="Search services & technicians"
					placeholderTextColor={themeColors.overlaySub}
					editable={false}
					className="h-full flex-1 rounded-none bg-transparent p-0"
					style={{ color: themeColors.onPrimaryHeader }}
				/>
			</View>
		</View>
	);
}

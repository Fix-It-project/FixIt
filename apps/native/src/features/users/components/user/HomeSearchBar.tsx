import { Search } from "lucide-react-native";
import { View } from "react-native";
import { Input } from "@/src/components/ui/input";
import { spacing, useThemeColors } from "@/src/constants/design-tokens";

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
					variant="outline"
					placeholder="Search services & technicians"
					placeholderTextColor={themeColors.overlaySub}
					caretHidden
					showSoftInputOnFocus={false}
					className="h-full flex-1 rounded-none border-0 bg-transparent p-0 shadow-none"
					style={{ color: themeColors.onPrimaryHeader }}
				/>
			</View>
		</View>
	);
}

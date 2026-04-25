import { Bell } from "lucide-react-native";
import { TouchableOpacity, View } from "react-native";
import { Colors, useThemeColors } from "@/src/lib/theme";

interface NotificationBellProps {
	/** Background color of the circular button. Defaults to `Colors.overlayMd`. */
	readonly bgColor?: string;
	/** Icon color for header contexts that should always stay bright. */
	readonly iconColor?: string;
}

export default function NotificationBell({
	bgColor = Colors.overlayMd,
	iconColor,
}: NotificationBellProps) {
	const themeColors = useThemeColors();
	const resolvedIconColor = iconColor ?? themeColors.onPrimaryHeader;

	return (
		<TouchableOpacity
			className="h-control-icon-box-md w-control-icon-box-md items-center justify-center rounded-pill"
			style={{ backgroundColor: bgColor }}
			activeOpacity={0.7}
		>
			<Bell size={20} color={resolvedIconColor} strokeWidth={1.8} />
			<View
				className="absolute top-stack-sm right-2 h-status-dot-sm w-status-dot-sm rounded-pill"
				style={{ backgroundColor: Colors.danger }}
			/>
		</TouchableOpacity>
	);
}

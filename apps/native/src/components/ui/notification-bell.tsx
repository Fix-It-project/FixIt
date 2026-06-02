import { router } from "expo-router";
import { Bell } from "lucide-react-native";
import { TouchableOpacity, View } from "react-native";
import { Colors, useThemeColors } from "@/src/constants/design-tokens";
import { useNotificationUnreadCountQuery } from "@/src/features/notifications/hooks/useNotificationUnreadCountQuery";
import { useDebounce } from "@/src/hooks/useDebounce";
import { ROUTES } from "@/src/lib/navigation";
import { useAuthStore } from "@/src/stores/auth-store";

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
	const userType = useAuthStore((state) => state.userType);
	const { data: unreadCount } = useNotificationUnreadCountQuery(userType);
	const hasUnread = (unreadCount ?? 0) > 0;
	const openNotifications = useDebounce(() => {
		if (userType === "technician") {
			router.push(ROUTES.technician.notifications as never);
			return;
		}
		router.push(ROUTES.user.notifications as never);
	});

	return (
		<TouchableOpacity
			onPress={openNotifications}
			className="h-control-icon-box-md w-control-icon-box-md items-center justify-center rounded-pill"
			style={{ backgroundColor: bgColor }}
			activeOpacity={0.7}
		>
			<Bell size={20} color={resolvedIconColor} strokeWidth={1.8} />
			{hasUnread ? (
				<View
					className="absolute top-stack-sm right-2 h-status-dot-sm w-status-dot-sm rounded-pill"
					style={{ backgroundColor: Colors.danger }}
				/>
			) : null}
		</TouchableOpacity>
	);
}

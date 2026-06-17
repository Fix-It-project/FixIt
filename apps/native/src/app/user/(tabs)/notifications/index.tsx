import { useTranslation } from "react-i18next";
import { ScreenStatusBar } from "@/src/components/layout/ScreenStatusBar";
import NotificationLogContent from "@/src/features/notifications/components/NotificationLogContent";

export default function UserNotificationsTabScreen() {
	const { t } = useTranslation("notifications");
	return (
		<>
			<ScreenStatusBar variant="surface" />
			<NotificationLogContent
				notificationRole="user"
				title={t("title")}
				showBackButton={false}
			/>
		</>
	);
}

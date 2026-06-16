import { useTranslation } from "react-i18next";
import NotificationLogContent from "@/src/features/notifications/components/NotificationLogContent";

export default function UserNotificationsTabScreen() {
	const { t } = useTranslation("notifications");
	return (
		<NotificationLogContent
			notificationRole="user"
			title={t("title")}
			showBackButton={false}
		/>
	);
}

import { useTranslation } from "react-i18next";
import NotificationLogContent from "@/src/features/notifications/components/NotificationLogContent";

export default function TechnicianNotificationsTabScreen() {
	const { t } = useTranslation("notifications");

	return (
		<NotificationLogContent
			notificationRole="technician"
			title={t("title")}
			showBackButton={false}
		/>
	);
}

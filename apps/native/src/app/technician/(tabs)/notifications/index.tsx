import NotificationLogContent from "@/src/features/notifications/components/NotificationLogContent";

export default function TechnicianNotificationsTabScreen() {
  return (
    <NotificationLogContent
      role="technician"
      title="Notifications"
      showBackButton={false}
    />
  );
}

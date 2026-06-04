import NotificationLogContent from "@/src/features/notifications/components/NotificationLogContent";

export default function UserNotificationsTabScreen() {
  return (
    <NotificationLogContent
      role="user"
      title="Notifications"
      showBackButton={false}
    />
  );
}

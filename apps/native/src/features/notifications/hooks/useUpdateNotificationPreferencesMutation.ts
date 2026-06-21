import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateNotificationPreferences } from "@/src/features/notifications/api/notifications";
import { configureAndroidNotificationChannel } from "@/src/features/notifications/utils/configureAndroidNotificationChannel";
import type {
  NotificationPreferences,
  NotificationViewerRole,
} from "@/src/features/notifications/types";

export function useUpdateNotificationPreferencesMutation(
  role: NotificationViewerRole,
) {
  const queryClient = useQueryClient();
  const queryKey = ["notification-preferences", role] as const;

  return useMutation({
    mutationFn: async (preferences: NotificationPreferences) => {
      const updated = await updateNotificationPreferences(role, preferences);
      return updated;
    },
    onMutate: async (preferences) => {
      await queryClient.cancelQueries({ queryKey });
      const previous =
        queryClient.getQueryData<NotificationPreferences>(queryKey);

      queryClient.setQueryData(queryKey, preferences);
      void configureAndroidNotificationChannel(preferences);

      return { previous };
    },
    onError: (_error, _preferences, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKey, context.previous);
        void configureAndroidNotificationChannel(context.previous);
      }
    },
    onSuccess: (preferences) => {
      queryClient.setQueryData(queryKey, preferences);
      void configureAndroidNotificationChannel(preferences);
    },
  });
}

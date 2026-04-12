import { View, TouchableOpacity, ActivityIndicator } from "react-native";
import { Text } from "@/src/components/ui/text";
import { ClipboardList } from "lucide-react-native";
import { useThemeColors, type ThemePalette } from "@/src/lib/theme";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useRouter } from "expo-router";
import { useDebounce } from "@/src/hooks/useDebounce";
import { useTodaysAcceptedOrders } from "@/src/hooks/tech/useTechOrders";
import { useTechnicianOrdersQuery } from "@/src/hooks/tech/useCalendar";
import type { TechnicianOrder } from "@/src/features/schedule/schemas/response.schema";

function ScheduleCard({
  item,
  index,
  isLast,
  themeColors,
}: Readonly<{
  item: TechnicianOrder;
  index: number;
  isLast: boolean;
  themeColors: ThemePalette;
}>) {
  const isInProgress = index === 0;

  return (
    <Animated.View
      entering={FadeInDown.delay(index * 120).duration(400)}
      className="flex-row"
    >
      {/* Timeline column */}
      <View className="mr-3 items-center" style={{ width: 24 }}>
        <View
          className="h-6 w-6 rounded-full border-4"
          style={{
            backgroundColor: isInProgress
              ? themeColors.primary
              : themeColors.borderDefault,
            borderColor: themeColors.surfaceElevated,
          }}
        />
        {!isLast && (
          <View
            className="flex-1"
            style={{
              width: 2,
              backgroundColor: themeColors.borderDefault,
              marginTop: -2,
            }}
          />
        )}
      </View>

      {/* Card */}
      <View
        className="mb-4 flex-1 rounded-2xl bg-surface p-4"
        style={{
          borderWidth: 1,
          borderColor: isInProgress
            ? `${themeColors.primary}30`
            : themeColors.borderDefault,
          opacity: isInProgress ? 1 : 0.85,
          shadowColor: themeColors.shadow,
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.04,
          shadowRadius: 4,
          elevation: 1,
        }}
      >
        <View className="mb-2 flex-row items-start justify-between">
          <View className="flex-1 mr-2">
            <Text
              className="mb-0.5 text-[10px] font-bold uppercase"
              style={{
                color: isInProgress
                  ? themeColors.primary
                  : themeColors.textMuted,
              }}
            >
              {isInProgress ? "In Progress" : "Upcoming"}
            </Text>
            <Text
              className="font-bold text-content"
              style={{ fontFamily: "GoogleSans_600SemiBold" }}
              numberOfLines={2}
            >
              {item.problem_description ?? "Service Request"}
            </Text>
          </View>
          <ClipboardList
            size={20}
            color={isInProgress ? themeColors.primary : themeColors.textMuted}
            strokeWidth={1.8}
          />
        </View>

        <Text className="text-xs text-content-muted">Scheduled for today</Text>
      </View>
    </Animated.View>
  );
}

export default function TodayScheduleSection() {
  const router = useRouter();
  const themeColors = useThemeColors();
  const todaysOrders = useTodaysAcceptedOrders();
  const { isLoading } = useTechnicianOrdersQuery();
  const goToBookings = useDebounce(() =>
    router.push("/(tech-app)/(schedule)?view=bookings"),
  );
  let content = (
    <View>
      {todaysOrders.map((item, index) => (
        <ScheduleCard
          key={item.id}
          item={item}
          index={index}
          isLast={index === todaysOrders.length - 1}
          themeColors={themeColors}
        />
      ))}
    </View>
  );

  if (isLoading) {
    content = (
      <View className="items-center py-6">
        <ActivityIndicator color={themeColors.primary} />
      </View>
    );
  } else if (todaysOrders.length === 0) {
    content = (
      <View
        className="items-center rounded-2xl bg-surface px-4 py-6"
        style={{ borderWidth: 1, borderColor: themeColors.borderDefault }}
      >
        <Text className="text-sm text-content-muted">
          No bookings for today
        </Text>
      </View>
    );
  }

  return (
    <View className="mt-6 px-4">
      <View className="mb-4 flex-row items-center justify-between">
        <Text className="text-xs font-bold uppercase tracking-widest text-content-muted">
          Today's Schedule
        </Text>
        <TouchableOpacity onPress={goToBookings} activeOpacity={0.7}>
          <Text
            style={{
              fontFamily: "GoogleSans_600SemiBold",
              fontSize: 12,
              color: themeColors.primary,
            }}
          >
            View All
          </Text>
        </TouchableOpacity>
      </View>

      {content}
    </View>
  );
}

import { View, TouchableOpacity, ActivityIndicator } from "react-native";
import { Text } from "@/src/components/ui/text";
import { ClipboardList } from "lucide-react-native";
import { Colors } from "@/src/lib/colors";
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
}: {
  item: TechnicianOrder;
  index: number;
  isLast: boolean;
}) {
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
            backgroundColor: isInProgress ? Colors.primary : Colors.borderDefault,
            borderColor: Colors.surfaceElevated,
          }}
        />
        {!isLast && (
          <View
            className="flex-1"
            style={{ width: 2, backgroundColor: Colors.borderDefault, marginTop: -2 }}
          />
        )}
      </View>

      {/* Card */}
      <View
        className="mb-4 flex-1 rounded-2xl bg-white p-4"
        style={{
          borderWidth: 1,
          borderColor: isInProgress ? `${Colors.primary}30` : Colors.borderDefault,
          opacity: isInProgress ? 1 : 0.85,
          shadowColor: Colors.shadow,
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
              style={{ color: isInProgress ? Colors.primary : Colors.textMuted }}
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
            color={isInProgress ? Colors.primary : Colors.textMuted}
            strokeWidth={1.8}
          />
        </View>

        <Text className="text-xs text-content-muted">
          Scheduled for today
        </Text>
      </View>
    </Animated.View>
  );
}

export default function TodayScheduleSection() {
  const router = useRouter();
  const todaysOrders = useTodaysAcceptedOrders();
  const { isLoading } = useTechnicianOrdersQuery();
  const goToBookings = useDebounce(() => router.push("/(tech-app)/(schedule)?view=bookings"));

  return (
    <View className="mt-6 px-4">
      <View className="mb-4 flex-row items-center justify-between">
        <Text className="text-xs font-bold uppercase tracking-widest text-content-muted">
          Today's Schedule
        </Text>
        <TouchableOpacity onPress={goToBookings} activeOpacity={0.7}>
          <Text
            style={{ fontFamily: "GoogleSans_600SemiBold", fontSize: 12, color: Colors.primary }}
          >
            View All
          </Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View className="items-center py-6">
          <ActivityIndicator color={Colors.primary} />
        </View>
      ) : todaysOrders.length === 0 ? (
        <View
          className="items-center rounded-2xl bg-white px-4 py-6"
          style={{ borderWidth: 1, borderColor: Colors.borderDefault }}
        >
          <Text className="text-sm text-content-muted">No bookings for today</Text>
        </View>
      ) : (
        <View>
          {todaysOrders.map((item, index) => (
            <ScheduleCard
              key={item.id}
              item={item}
              index={index}
              isLast={index === todaysOrders.length - 1}
            />
          ))}
        </View>
      )}
    </View>
  );
}

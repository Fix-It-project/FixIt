import { View } from "react-native";
import { Text } from "@/src/components/ui/text";
import {
  Zap,
  Hammer,
  Sparkles,
  MapPin,
} from "lucide-react-native";
import { Colors } from "@/src/lib/colors";
import { TODAY_SCHEDULE } from "@/src/lib/tech-mock-data";
import type { ScheduleItem } from "@/src/lib/tech-mock-data";
import Animated, { FadeInDown } from "react-native-reanimated";

/** Map icon name strings to actual lucide components */
const ICON_MAP: Record<string, React.ComponentType<any>> = {
  Zap,
  Hammer,
  Sparkles,
};

function ScheduleCard({
  item,
  index,
  isLast,
}: {
  item: ScheduleItem;
  index: number;
  isLast: boolean;
}) {
  const isInProgress = item.status === "in-progress";
  const IconComponent = ICON_MAP[item.icon] || Zap;

  return (
    <Animated.View
      entering={FadeInDown.delay(index * 120).duration(400)}
      className="flex-row"
    >
      {/* Timeline column */}
      <View className="mr-3 items-center" style={{ width: 24 }}>
        {/* Dot */}
        <View
          className="h-6 w-6 rounded-full border-4"
          style={{
            backgroundColor: isInProgress ? Colors.brand : Colors.borderLight,
            borderColor: Colors.surfaceGray,
          }}
        />
        {/* Line */}
        {!isLast && (
          <View
            className="flex-1"
            style={{
              width: 2,
              backgroundColor: Colors.borderLight,
              marginTop: -2,
            }}
          />
        )}
      </View>

      {/* Card */}
      <View
        className="mb-4 flex-1 rounded-2xl bg-white p-4"
        style={{
          borderWidth: 1,
          borderColor: isInProgress ? `${Colors.brand}30` : Colors.borderLight,
          opacity: isInProgress ? 1 : 0.85,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.04,
          shadowRadius: 4,
          elevation: 1,
        }}
      >
        <View className="mb-2 flex-row items-start justify-between">
          <View>
            <Text
              className="mb-0.5 text-[10px] font-bold uppercase"
              style={{
                color: isInProgress ? Colors.brand : Colors.textMuted,
              }}
            >
              {isInProgress ? "In Progress" : "Upcoming"}
            </Text>
            <Text
              className="font-bold text-content"
              style={{ fontFamily: "GoogleSans_600SemiBold" }}
            >
              {item.clientName}
            </Text>
          </View>
          <IconComponent
            size={20}
            color={isInProgress ? Colors.brand : Colors.textMuted}
            strokeWidth={1.8}
          />
        </View>

        <Text className="mb-2 text-xs text-content-muted">
          {item.serviceType} • {item.time}
        </Text>

        <View className="flex-row items-center gap-1.5">
          <MapPin size={10} color={Colors.textMuted} strokeWidth={2} />
          <Text className="text-[10px] text-content-muted">{item.location}</Text>
        </View>
      </View>
    </Animated.View>
  );
}

export default function TodaySchedule() {
  return (
    <View className="mt-6 px-4">
      <Text className="mb-4 text-xs font-bold uppercase tracking-widest text-content-muted">
        Today's Schedule
      </Text>

      <View>
        {TODAY_SCHEDULE.map((item, index) => (
          <ScheduleCard
            key={item.id}
            item={item}
            index={index}
            isLast={index === TODAY_SCHEDULE.length - 1}
          />
        ))}
      </View>
    </View>
  );
}

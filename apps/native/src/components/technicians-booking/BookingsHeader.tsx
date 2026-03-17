import { View, TouchableOpacity } from "react-native";
import { Text } from "@/src/components/ui/text";
import { Bell, ChevronLeft } from "lucide-react-native";
import { Colors } from "@/src/lib/colors";
import { TECH_PROFILE } from "@/src/lib/tech-mock-data";
import { useRouter } from "expo-router";
import Animated, { FadeInDown } from "react-native-reanimated";
import BookingsWeekStrip from "./BookingsWeekStrip";
import BookingsCalendarSheet from "./BookingsCalendarSheet";

/**
 * Bookings page header.
 *
 * Contains: back button, title bar, online badge, bell icon,
 * schedule/bookings toggle (bookings active, schedule no-op),
 * the week strip, and the "Jump" button.
 */
export default function BookingsHeader() {
  const router = useRouter();
  const profile = TECH_PROFILE;

  return (
    <View
      style={{
        backgroundColor: Colors.brandDark,
        paddingHorizontal: 16,
        paddingBottom: 16,
        paddingTop: 8,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.18,
        shadowRadius: 10,
        elevation: 6,
      }}
    >
      {/* ── Top bar: back + title + online + bell ── */}
      <Animated.View
        entering={FadeInDown.duration(400)}
        className="mb-4 flex-row items-center justify-between"
      >
        <View className="flex-row items-center gap-2">
          {/* Back */}
          <TouchableOpacity
            onPress={() => router.back()}
            className="h-9 w-9 items-center justify-center rounded-full"
            style={{ backgroundColor: "rgba(255,255,255,0.2)" }}
            activeOpacity={0.7}
          >
            <ChevronLeft size={20} color={Colors.white} strokeWidth={2} />
          </TouchableOpacity>

          {/* Title */}
          <Text
            style={{
              fontFamily: "GoogleSans_700Bold",
              fontSize: 22,
              color: Colors.white,
            }}
          >
            Fix
            <Text
              style={{
                fontFamily: "GoogleSans_700Bold",
                fontSize: 26,
                color: "#7dd3fc",
              }}
            >
              IT
            </Text>
            {"  "}
            <Text
              style={{
                fontFamily: "GoogleSans_700Bold",
                fontSize: 22,
                color: "rgba(255,255,255,0.85)",
              }}
            >
              Technicians
            </Text>
          </Text>
        </View>

        <View className="flex-row items-center gap-3">
          {/* Online badge */}
          <View className="flex-row items-center gap-1.5">
            <Text
              className="text-xs font-bold uppercase"
              style={{
                color: profile.isOnline ? "#86efac" : "rgba(255,255,255,0.5)",
              }}
            >
              {profile.isOnline ? "Online" : "Offline"}
            </Text>
            <View
              className="h-2 w-2 rounded-full"
              style={{
                backgroundColor: profile.isOnline
                  ? "#86efac"
                  : "rgba(255,255,255,0.4)",
              }}
            />
          </View>

          {/* Bell */}
          <TouchableOpacity
            className="h-10 w-10 items-center justify-center rounded-full"
            style={{ backgroundColor: "rgba(255,255,255,0.2)" }}
            activeOpacity={0.7}
          >
            <Bell size={20} color={Colors.white} strokeWidth={1.8} />
            <View
              className="absolute right-2 top-2 h-2 w-2 rounded-full"
              style={{ backgroundColor: Colors.error }}
            />
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* ── Schedule / Bookings toggle ── */}
      <Animated.View
        entering={FadeInDown.delay(80).duration(400)}
        className="mb-4 flex-row rounded-xl p-1"
        style={{ backgroundColor: "rgba(255,255,255,0.15)" }}
      >
        {/* Schedule (no-op) */}
        <TouchableOpacity
          className="flex-1 flex-row items-center justify-center gap-1.5 rounded-lg py-2.5"
          activeOpacity={0.7}
        >
          <Text
            style={{
              fontFamily: "GoogleSans_600SemiBold",
              fontSize: 14,
              color: "rgba(255,255,255,0.55)",
            }}
          >
            Schedule
          </Text>
        </TouchableOpacity>

        {/* Bookings (active) */}
        <View
          className="flex-1 flex-row items-center justify-center gap-1.5 rounded-lg py-2.5"
          style={{
            backgroundColor: Colors.white,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 3,
          }}
        >
          <Text
            style={{
              fontFamily: "GoogleSans_600SemiBold",
              fontSize: 14,
              color: Colors.brand,
            }}
          >
            Bookings
          </Text>
        </View>
      </Animated.View>

      {/* ── Week strip ── */}
      <Animated.View entering={FadeInDown.delay(160).duration(400)}>
        <BookingsWeekStrip />
      </Animated.View>

      {/* ── Jump button ── */}
      <Animated.View
        entering={FadeInDown.delay(240).duration(400)}
        className="mt-2.5 flex-row justify-end"
      >
        <BookingsCalendarSheet />
      </Animated.View>
    </View>
  );
}

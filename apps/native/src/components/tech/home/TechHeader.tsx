import { View, TouchableOpacity, Dimensions } from "react-native";
import { Text } from "@/src/components/ui/text";
import { Bell, Star } from "lucide-react-native";
import { Colors } from "@/src/lib/colors";
import { TECH_PROFILE } from "@/src/lib/mock-data/tech";
import Animated, { FadeInDown } from "react-native-reanimated";
import Svg, { Polygon, Defs, LinearGradient, Stop } from "react-native-svg";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const HEADER_HEIGHT = 160;

/** Decorative polygon background — same faceted style as the user home page */
function TechHeaderPolygons() {
  return (
    <Svg
      width={SCREEN_WIDTH}
      height={HEADER_HEIGHT}
      style={{ position: "absolute", top: 0, left: 0 }}
    >
      <Defs>
        <LinearGradient id="tg1" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor="#0284c7" stopOpacity="0.35" />
          <Stop offset="1" stopColor="#0369a1" stopOpacity="0.2" />
        </LinearGradient>
        <LinearGradient id="tg2" x1="1" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#38bdf8" stopOpacity="0.18" />
          <Stop offset="1" stopColor="#0ea5e9" stopOpacity="0.12" />
        </LinearGradient>
      </Defs>

      {/* Large bottom-left shard */}
      <Polygon
        points={`0,${HEADER_HEIGHT * 0.35} ${SCREEN_WIDTH * 0.45},${HEADER_HEIGHT * 0.1} ${SCREEN_WIDTH * 0.38},${HEADER_HEIGHT} 0,${HEADER_HEIGHT}`}
        fill="url(#tg1)"
      />

      {/* Top-right triangle */}
      <Polygon
        points={`${SCREEN_WIDTH * 0.55},0 ${SCREEN_WIDTH},0 ${SCREEN_WIDTH},${HEADER_HEIGHT * 0.55} ${SCREEN_WIDTH * 0.7},${HEADER_HEIGHT * 0.3}`}
        fill="#0284c7"
        opacity={0.15}
      />

      {/* Center diamond */}
      <Polygon
        points={`${SCREEN_WIDTH * 0.3},${HEADER_HEIGHT * 0.05} ${SCREEN_WIDTH * 0.65},${HEADER_HEIGHT * 0.2} ${SCREEN_WIDTH * 0.5},${HEADER_HEIGHT * 0.7} ${SCREEN_WIDTH * 0.15},${HEADER_HEIGHT * 0.45}`}
        fill="url(#tg2)"
      />

      {/* Small top-left accent */}
      <Polygon
        points={`0,0 ${SCREEN_WIDTH * 0.28},0 ${SCREEN_WIDTH * 0.15},${HEADER_HEIGHT * 0.35} 0,${HEADER_HEIGHT * 0.2}`}
        fill={Colors.brandAccentText}
        opacity={0.1}
      />

      {/* Bottom-right wedge */}
      <Polygon
        points={`${SCREEN_WIDTH * 0.6},${HEADER_HEIGHT * 0.5} ${SCREEN_WIDTH},${HEADER_HEIGHT * 0.35} ${SCREEN_WIDTH},${HEADER_HEIGHT} ${SCREEN_WIDTH * 0.5},${HEADER_HEIGHT}`}
        fill="#0369a1"
        opacity={0.18}
      />

      {/* Thin mid-right sliver */}
      <Polygon
        points={`${SCREEN_WIDTH * 0.7},0 ${SCREEN_WIDTH * 0.85},0 ${SCREEN_WIDTH * 0.95},${HEADER_HEIGHT * 0.45} ${SCREEN_WIDTH * 0.75},${HEADER_HEIGHT * 0.25}`}
        fill="#38bdf8"
        opacity={0.12}
      />
    </Svg>
  );
}

export default function TechHeader() {
  const profile = TECH_PROFILE;

  return (
    <View
      style={{
        backgroundColor: Colors.brandDark,
        paddingHorizontal: 16,
        paddingBottom: 16,
        paddingTop: 8,
        overflow: "hidden",
        shadowColor: Colors.shadow,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.18,
        shadowRadius: 10,
        elevation: 6,
      }}
    >
      {/* Polygon decorations */}
      <TechHeaderPolygons />

      {/* Title row */}
      <Animated.View
        entering={FadeInDown.duration(400)}
        className="mb-4 flex-row items-center justify-between"
      >
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
              color: Colors.brandAccentText,
            }}
          >
            IT
          </Text>
          {"  "}
          <Text
            style={{
              fontFamily: "GoogleSans_700Bold",
              fontSize: 22,
              color: "rgba(255,255,255,0.85)", // no exact token — intentionally brighter than overlayBright
            }}
          >
            Technicians
          </Text>
        </Text>

        <View className="flex-row items-center gap-3">
          {/* Online status */}
          <View className="flex-row items-center gap-1.5">
            <Text
              className="font-bold uppercase text-xs"
              style={{ color: profile.isOnline ? Colors.onlineGreen : "rgba(255,255,255,0.5)" }}
            >
              {profile.isOnline ? "Online" : "Offline"}
            </Text>
            <View
              className="h-2 w-2 rounded-full"
              style={{
                backgroundColor: profile.isOnline ? Colors.onlineGreen : Colors.overlayDim,
              }}
            />
          </View>

          {/* Notification bell */}
          <TouchableOpacity
            className="h-10 w-10 items-center justify-center rounded-full"
            style={{ backgroundColor: Colors.overlayMd }}
            activeOpacity={0.7}
          >
            <Bell size={20} color={Colors.white} strokeWidth={1.8} />
            {/* Notification dot */}
            <View
              className="absolute right-2 top-2 h-2 w-2 rounded-full"
              style={{ backgroundColor: Colors.error }}
            />
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* Profile card */}
      <Animated.View
        entering={FadeInDown.delay(100).duration(400)}
        className="flex-row items-center justify-between rounded-2xl p-4"
        style={{ backgroundColor: Colors.overlaySm }}
      >
        <View className="flex-row items-center gap-3">
          {/* Avatar — amber so it stands out on the blue background */}
          <View className="relative">
            <View
              className="h-12 w-12 items-center justify-center rounded-full"
              style={{ backgroundColor: Colors.star }}
            >
              <Text
                className="font-bold text-base"
                style={{ color: Colors.white }}
              >
                {profile.avatarInitials}
              </Text>
            </View>
            {/* Online dot on avatar */}
            <View
              className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2"
              style={{
                borderColor: Colors.brandDark,
                backgroundColor: profile.isOnline ? Colors.onlineGreen : Colors.overlayDim,
              }}
            />
          </View>

          <View>
            <Text
              style={{
                fontFamily: "GoogleSans_600SemiBold",
                color: Colors.white,
                fontWeight: "700",
              }}
            >
              {profile.name}
            </Text>
            <Text style={{ fontSize: 12, color: Colors.overlayBright }}>
              {profile.specialty}
            </Text>
          </View>
        </View>

        {/* Rating */}
        <View className="items-end">
          <View className="flex-row items-center gap-1">
            <Star size={14} color={Colors.starLight} fill={Colors.starLight} strokeWidth={0} />
            <Text
              className="text-sm font-bold"
              style={{ color: Colors.white }}
            >
              {profile.rating}
            </Text>
          </View>
          <Text style={{ fontSize: 10, color: Colors.overlaySub }}>
            {profile.reviewCount} reviews
          </Text>
        </View>
      </Animated.View>
    </View>
  );
}

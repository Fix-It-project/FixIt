import {
  View,
  TouchableOpacity,
  useWindowDimensions,
  Image,
} from "react-native";
import { Text } from "@/src/components/ui/text";
import { Bell, Star, ClipboardList } from "lucide-react-native";
import { useThemeColors, useThemeMeta } from "@/src/lib/theme";
import { useTechSelfProfileQuery } from "@/src/hooks/tech/useTechSelfProfileQuery";
import { getInitials } from "@/src/lib/helpers/booking-helpers";
import Animated, { FadeInDown } from "react-native-reanimated";
import Svg, { Polygon, Defs, LinearGradient, Stop } from "react-native-svg";
import { getHeaderPolygonPalette } from "@/src/components/home/HeaderPolygons";

const HEADER_HEIGHT = 160;

/** Decorative polygon background — same faceted style as the user home page */
function DashboardHeaderPolygons({
  screenWidth,
  gradientStart,
  gradientEnd,
  glowStart,
  glowEnd,
  topRight,
  accent,
  bottomRight,
  sliver,
}: {
  screenWidth: number;
  gradientStart: string;
  gradientEnd: string;
  glowStart: string;
  glowEnd: string;
  topRight: string;
  accent: string;
  bottomRight: string;
  sliver: string;
}) {
  return (
    <Svg
      width={screenWidth}
      height={HEADER_HEIGHT}
      style={{ position: "absolute", top: 0, left: 0 }}
    >
      <Defs>
        <LinearGradient id="tg1" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor={gradientStart} stopOpacity="0.35" />
          <Stop offset="1" stopColor={gradientEnd} stopOpacity="0.2" />
        </LinearGradient>
        <LinearGradient id="tg2" x1="1" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={glowStart} stopOpacity="0.18" />
          <Stop offset="1" stopColor={glowEnd} stopOpacity="0.12" />
        </LinearGradient>
      </Defs>

      <Polygon
        points={`0,${HEADER_HEIGHT * 0.35} ${screenWidth * 0.45},${HEADER_HEIGHT * 0.1} ${screenWidth * 0.38},${HEADER_HEIGHT} 0,${HEADER_HEIGHT}`}
        fill="url(#tg1)"
      />
      <Polygon
        points={`${screenWidth * 0.55},0 ${screenWidth},0 ${screenWidth},${HEADER_HEIGHT * 0.55} ${screenWidth * 0.7},${HEADER_HEIGHT * 0.3}`}
        fill={topRight}
        opacity={0.15}
      />
      <Polygon
        points={`${screenWidth * 0.3},${HEADER_HEIGHT * 0.05} ${screenWidth * 0.65},${HEADER_HEIGHT * 0.2} ${screenWidth * 0.5},${HEADER_HEIGHT * 0.7} ${screenWidth * 0.15},${HEADER_HEIGHT * 0.45}`}
        fill="url(#tg2)"
      />
      <Polygon
        points={`0,0 ${screenWidth * 0.28},0 ${screenWidth * 0.15},${HEADER_HEIGHT * 0.35} 0,${HEADER_HEIGHT * 0.2}`}
        fill={accent}
        opacity={0.1}
      />
      <Polygon
        points={`${screenWidth * 0.6},${HEADER_HEIGHT * 0.5} ${screenWidth},${HEADER_HEIGHT * 0.35} ${screenWidth},${HEADER_HEIGHT} ${screenWidth * 0.5},${HEADER_HEIGHT}`}
        fill={bottomRight}
        opacity={0.18}
      />
      <Polygon
        points={`${screenWidth * 0.7},0 ${screenWidth * 0.85},0 ${screenWidth * 0.95},${HEADER_HEIGHT * 0.45} ${screenWidth * 0.75},${HEADER_HEIGHT * 0.25}`}
        fill={sliver}
        opacity={0.12}
      />
    </Svg>
  );
}

export default function DashboardHeader() {
  const { width: screenWidth } = useWindowDimensions();
  const themeColors = useThemeColors();
  const { themeId } = useThemeMeta();
  const { data: profile } = useTechSelfProfileQuery();
  const polygonPalette = getHeaderPolygonPalette(themeColors, themeId);

  const fullName = profile
    ? `${profile.first_name} ${profile.last_name}`
    : "...";
  const initials = getInitials(fullName);
  const isOnline = false;
  const specialty = profile?.category_name ?? "Technician";

  return (
    <View
      style={{
        backgroundColor: themeColors.primaryDark,
        paddingHorizontal: 16,
        paddingBottom: 16,
        paddingTop: 8,
        overflow: "hidden",
        shadowColor: themeColors.shadow,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.18,
        shadowRadius: 10,
        elevation: 6,
      }}
    >
      <DashboardHeaderPolygons
        screenWidth={screenWidth}
        gradientStart={polygonPalette.gradientStart}
        gradientEnd={polygonPalette.gradientEnd}
        glowStart={polygonPalette.glowStart}
        glowEnd={polygonPalette.glowEnd}
        topRight={polygonPalette.topRight}
        accent={polygonPalette.accent}
        bottomRight={polygonPalette.bottomRight}
        sliver={polygonPalette.sliver}
      />

      {/* Title row */}
      <Animated.View
        entering={FadeInDown.duration(400)}
        className="mb-4 flex-row items-center justify-between"
      >
        <Text
          style={{
            fontFamily: "GoogleSans_700Bold",
            fontSize: 22,
            color: themeColors.onPrimaryHeader,
          }}
        >
          Fix
          <Text
            style={{
              fontFamily: "GoogleSans_700Bold",
              fontSize: 26,
              color: themeColors.accentSky,
            }}
          >
            IT
          </Text>
          {"  "}
          <Text
            style={{
              fontFamily: "GoogleSans_700Bold",
              fontSize: 22,
              color: themeColors.onPrimaryHeader,
            }}
          >
            Technicians
          </Text>
        </Text>

        <View className="flex-row items-center gap-3">
          <View className="flex-row items-center gap-1.5">
            <Text
              className="font-bold uppercase text-xs"
              style={{
                color: isOnline
                  ? themeColors.statusOnline
                  : "rgba(255,255,255,0.5)",
              }}
            >
              {isOnline ? "Online" : "Offline"}
            </Text>
            <View
              className="h-2 w-2 rounded-full"
              style={{
                backgroundColor: isOnline
                  ? themeColors.statusOnline
                  : themeColors.overlayDim,
              }}
            />
          </View>

          <TouchableOpacity
            className="h-10 w-10 items-center justify-center rounded-full"
            style={{ backgroundColor: themeColors.overlayMd }}
            activeOpacity={0.7}
          >
            <Bell
              size={20}
              color={themeColors.onPrimaryHeader}
              strokeWidth={1.8}
            />
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* Profile card */}
      <Animated.View
        entering={FadeInDown.delay(100).duration(400)}
        className="flex-row items-center justify-between rounded-2xl p-4"
        style={{ backgroundColor: themeColors.overlaySm }}
      >
        <View className="flex-1 flex-row items-center gap-3">
          <View className="relative">
            {profile?.profile_image ? (
              <Image
                source={{ uri: profile.profile_image }}
                className="h-12 w-12 rounded-full"
                style={{ backgroundColor: themeColors.overlayMd }}
              />
            ) : (
              <View
                className="h-12 w-12 items-center justify-center rounded-full"
                style={{ backgroundColor: themeColors.ratingDefault }}
              >
                <Text
                  className="font-bold text-base"
                  style={{ color: themeColors.surfaceBase }}
                >
                  {initials}
                </Text>
              </View>
            )}
            <View
              className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2"
              style={{
                borderColor: themeColors.primaryDark,
                backgroundColor: isOnline
                  ? themeColors.statusOnline
                  : themeColors.overlayDim,
              }}
            />
          </View>

          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontFamily: "GoogleSans_600SemiBold",
                color: themeColors.surfaceBase,
                fontWeight: "700",
              }}
              numberOfLines={1}
            >
              {fullName}
            </Text>
            <Text
              style={{ fontSize: 12, color: themeColors.overlayBright }}
              numberOfLines={1}
            >
              {specialty}
            </Text>
          </View>
        </View>

        {/* Stats */}
        <View className="items-end gap-2" style={{ flexShrink: 0 }}>
          <View className="flex-row items-center gap-1.5">
            <ClipboardList size={14} color={themeColors.overlayBright} />
            <Text
              className="text-sm font-bold"
              style={{ color: themeColors.surfaceBase }}
            >
              {profile?.total_orders ?? 0}
            </Text>
          </View>
          <View className="flex-row items-center gap-1.5">
            <Star
              size={14}
              color={themeColors.ratingDefault}
              fill={themeColors.ratingDefault}
            />
            <Text
              className="text-sm font-bold"
              style={{ color: themeColors.surfaceBase }}
            >
              4.8
            </Text>
          </View>
        </View>
      </Animated.View>
    </View>
  );
}

import { View, TouchableOpacity } from "react-native";
import { Text } from "@/src/components/ui/text";
import { Bell, Star } from "lucide-react-native";
import { Colors } from "@/src/lib/colors";
import { TECH_PROFILE, USER_REVIEWS } from "@/src/lib/tech-mock-data";
import Animated, { FadeInDown } from "react-native-reanimated";

export default function TechHeader() {
  const profile = TECH_PROFILE;

  return (
    <View
      className="border-b border-edge-outline bg-white px-4 pb-4 pt-2"
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 6,
        elevation: 4,
      }}
    >
      {/* Title row */}
      <Animated.View
        entering={FadeInDown.duration(400)}
        className="mb-3 flex-row items-center justify-between"
      >
        <Text
          className="text-xl font-bold text-content"
          style={{ fontFamily: "GoogleSans_700Bold" }}
        >
          Fix<Text style={{ color: Colors.brand }}>IT</Text> Technicians
        </Text>

        <View className="flex-row items-center gap-3">
          {/* Online status */}
          <View className="flex-row items-center gap-1.5">
            <Text
              className="text-xs font-bold uppercase"
              style={{ color: profile.isOnline ? Colors.success : Colors.textMuted }}
            >
              {profile.isOnline ? "Online" : "Offline"}
            </Text>
            <View
              className="h-2 w-2 rounded-full"
              style={{
                backgroundColor: profile.isOnline ? Colors.success : Colors.textMuted,
              }}
            />
          </View>

          {/* Notification bell */}
          <TouchableOpacity
            className="h-10 w-10 items-center justify-center rounded-full"
            style={{ backgroundColor: Colors.surfaceGray }}
            activeOpacity={0.7}
          >
            <Bell size={20} color={Colors.textPrimary} strokeWidth={1.8} />
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
        className="flex-row items-center justify-between rounded-2xl bg-surface-gray p-4"
      >
        <View className="flex-row items-center gap-3">
          {/* Avatar */}
          <View className="relative">
            <View
              className="h-12 w-12 items-center justify-center rounded-full"
              style={{ backgroundColor: profile.avatarColor }}
            >
              <Text className="text-base font-bold text-white">
                {profile.avatarInitials}
              </Text>
            </View>
            {/* Online dot on avatar */}
            <View
              className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-white"
              style={{
                backgroundColor: profile.isOnline ? Colors.success : Colors.textMuted,
              }}
            />
          </View>

          <View>
            <Text
              className="font-bold text-content"
              style={{ fontFamily: "GoogleSans_600SemiBold" }}
            >
              {profile.name}
            </Text>
            <Text className="text-xs text-content-muted">{profile.specialty}</Text>
          </View>
        </View>

        {/* Rating */}
        <View className="items-end">
          <View className="flex-row items-center gap-1">
            <Star
              size={14}
              color="#F59E0B"
              fill="#F59E0B"
              strokeWidth={0}
            />
            <Text className="text-sm font-bold text-content">
              {profile.rating}
            </Text>
          </View>
          <Text className="text-[10px] text-content-muted">
            {profile.reviewCount} reviews
          </Text>
        </View>
      </Animated.View>

      {/* User reviews mini strip */}
      <Animated.View
        entering={FadeInDown.delay(200).duration(400)}
        className="mt-3"
      >
        <Text className="mb-2 text-[10px] font-bold uppercase tracking-widest text-content-muted">
          Recent Reviews
        </Text>
        {USER_REVIEWS.slice(0, 2).map((review) => (
          <View
            key={review.id}
            className="mb-1.5 flex-row items-start gap-2"
          >
            <View className="flex-row items-center gap-0.5">
              {Array.from({ length: review.rating }).map((_, i) => (
                <Star
                  key={`star-${review.id}-${i}`}
                  size={8}
                  color="#F59E0B"
                  fill="#F59E0B"
                  strokeWidth={0}
                />
              ))}
            </View>
            <Text
              className="flex-1 text-[11px] text-content-secondary"
              numberOfLines={1}
            >
              <Text className="font-semibold text-content">
                {review.userName}
              </Text>{" "}
              {review.comment}
            </Text>
          </View>
        ))}
      </Animated.View>
    </View>
  );
}

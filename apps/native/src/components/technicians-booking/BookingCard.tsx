import { useCallback } from "react";
import { Linking, TouchableOpacity, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { ClipboardList, MapPin, ShieldCheck, Star } from "lucide-react-native";
import { Colors } from "@/src/lib/colors";
import type { TechBooking } from "@/src/lib/tech-mock-data";
import { Text } from "@/src/components/ui/text";

interface BookingCardProps {
  readonly booking: TechBooking;
  readonly index: number;
}

/** Single booking card with client info, price, and action buttons. */
export default function BookingCard({ booking, index }: BookingCardProps) {
  const fullStars = Math.floor(booking.rating);
  const hasHalf = booking.rating - fullStars >= 0.25;

  const openMaps = useCallback(() => {
    const q = encodeURIComponent(`${booking.address}, ${booking.city}`);
    Linking.openURL(`https://maps.google.com/?q=${q}`);
  }, [booking.address, booking.city]);

  return (
    <Animated.View
      entering={FadeInDown.delay(index * 100).duration(400)}
      className="mb-4 overflow-hidden rounded-2xl bg-white"
      style={{
        borderWidth: 1,
        borderColor: Colors.borderLight,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 2,
      }}
    >
      <View className="p-4">
        {/* Top row: avatar + info + price */}
        <View className="flex-row gap-3">
          {/* Avatar */}
          <View
            className="h-14 w-14 items-center justify-center rounded-full"
            style={{ backgroundColor: booking.avatarColor }}
          >
            <Text
              style={{
                fontFamily: "GoogleSans_700Bold",
                fontSize: 16,
                color: Colors.white,
              }}
            >
              {booking.avatarInitials}
            </Text>
          </View>

          {/* Client info */}
          <View className="flex-1">
            {/* Name + verified */}
            <View className="flex-row items-center gap-1">
              <Text
                style={{
                  fontFamily: "GoogleSans_700Bold",
                  fontSize: 15,
                  color: Colors.textPrimary,
                }}
              >
                {booking.clientName}
              </Text>
              {booking.verified && (
                <ShieldCheck size={16} color={Colors.brand} fill={Colors.brand} strokeWidth={1} />
              )}
            </View>

            {/* Service + time */}
            <Text
              className="mt-0.5"
              style={{ fontSize: 12, color: Colors.textSecondary }}
            >
              {booking.serviceType} • {booking.time}
            </Text>

            {/* Stars */}
            <View className="mt-1 flex-row items-center gap-0.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={`star-${star}`}
                  size={12}
                  color={Colors.star}
                  fill={star <= fullStars || (star === fullStars + 1 && hasHalf) ? Colors.star : "none"}
                  strokeWidth={1.5}
                />
              ))}
              <Text
                className="ml-1"
                style={{ fontSize: 12, color: Colors.textSecondary }}
              >
                {booking.rating.toFixed(1)}
              </Text>
            </View>

            {/* Location */}
            <View className="mt-1.5 flex-row items-center gap-1">
              <MapPin size={12} color={Colors.textSecondary} strokeWidth={2} />
              <Text style={{ fontSize: 12, color: Colors.textSecondary }}>
                {booking.distance} km away
              </Text>
            </View>
            <Text style={{ fontSize: 11, color: Colors.textSecondary, marginTop: 2 }}>
              {booking.address}, {booking.city}
            </Text>
          </View>

          {/* Price */}
          <View className="items-end">
            <Text style={{ fontSize: 10, color: Colors.textSecondary }}>
              Service Fee
            </Text>
            <Text
              style={{
                fontFamily: "GoogleSans_700Bold",
                fontSize: 20,
                color: Colors.brand,
              }}
            >
              {booking.price}
            </Text>
            <Text style={{ fontSize: 11, color: Colors.textSecondary }}>
              {booking.currency}
            </Text>
          </View>
        </View>

        {/* Action buttons */}
        <View className="mt-3 flex-row gap-2.5">
          <TouchableOpacity
            onPress={openMaps}
            className="flex-1 flex-row items-center justify-center gap-1.5 rounded-xl border py-2.5"
            style={{ borderColor: Colors.brand }}
            activeOpacity={0.7}
          >
            <MapPin size={14} color={Colors.brand} strokeWidth={2} />
            <Text
              style={{
                fontFamily: "GoogleSans_600SemiBold",
                fontSize: 13,
                color: Colors.brand,
              }}
            >
              Open in Maps
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-1 flex-row items-center justify-center gap-1.5 rounded-xl py-2.5"
            style={{ backgroundColor: Colors.brand }}
            activeOpacity={0.85}
          >
            <ClipboardList size={14} color={Colors.white} strokeWidth={2} />
            <Text
              style={{
                fontFamily: "GoogleSans_600SemiBold",
                fontSize: 13,
                color: Colors.white,
              }}
            >
              View Details
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );
}

import { View, TouchableOpacity } from "react-native";
import { Text } from "@/src/components/ui/text";
import { Star, MapPin, Clock, CircleCheck } from "lucide-react-native";
import { Colors } from "@/src/lib/colors";
import type { TechnicianListItem } from "@/src/services/technicians/types";

/* ── Deterministic extras derived from the ID (replaced by real API data later) */
const AVATAR_COLORS = [
  "#2196F3", "#4CAF50", "#FF9800", "#9C27B0",
  "#00BCD4", "#F44336", "#3F51B5", "#795548",
];
const SPECIALTIES = [
  "Technician", "Specialist", "Expert", "Installation Specialist",
  "Maintenance Expert", "Repair Specialist",
];

function seededIndex(id: string, max: number): number {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) | 0;
  return Math.abs(hash) % max;
}

function derive(id: string) {
  return {
    avatarColor: AVATAR_COLORS[seededIndex(id, AVATAR_COLORS.length)],
    specialty: SPECIALTIES[seededIndex(id + "s", SPECIALTIES.length)],
    rating: +(4.5 + (seededIndex(id + "r", 5) * 0.1)).toFixed(1),
    reviewCount: 50 + seededIndex(id + "c", 280),
    distance: (0.5 + seededIndex(id + "d", 50) * 0.1).toFixed(1),
    yearsExp: 3 + seededIndex(id + "y", 15),

  };
}

interface TechnicianListCardProps {
  readonly item: TechnicianListItem;
  readonly onPress?: () => void;
  readonly onAvatarPress?: (technicianId: string, initials: string) => void;
}

export default function TechnicianListCard({ item, onPress, onAvatarPress }: Readonly<TechnicianListCardProps>) {
  const extras = derive(item.id);
  const initials = `${item.first_name[0]}${item.last_name[0]}`;
  const fullName = `${item.first_name} ${item.last_name}`;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      className="mx-4 mb-3 overflow-hidden rounded-2xl bg-white"
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 6,
        elevation: 2,
      }}
    >
      <View className="flex-row p-3.5">
        {/* ── Left: avatar + view profile ── */}
        <View className="mr-3 items-center">
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => onAvatarPress?.(item.id, initials)}
          >
            <View
              className="h-14 w-14 items-center justify-center rounded-full"
              style={{ backgroundColor: extras.avatarColor }}
            >
              <Text
                className="text-[16px] font-bold text-white"
                style={{ fontFamily: "GoogleSans_700Bold" }}
              >
                {initials}
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* ── Center: details ── */}
        <View className="flex-1">
          {/* Name */}
          <Text
            className="text-[15px] font-bold text-content"
            style={{ fontFamily: "GoogleSans_700Bold" }}
            numberOfLines={1}
          >
            {fullName}
          </Text>
          {/* Specialty */}
          <Text
            className="text-[12px] text-content-secondary"
            style={{ fontFamily: "GoogleSans_400Regular" }}
          >
            {extras.specialty}
          </Text>

          {/* Rating · reviews */}
          <View className="mt-1 flex-row items-center" style={{ gap: 4 }}>
            <Star size={12} color={Colors.star} fill={Colors.star} strokeWidth={0} />
            <Text
              className="text-[12px] font-semibold text-content"
              style={{ fontFamily: "GoogleSans_600SemiBold" }}
            >
              {extras.rating}
            </Text>
            <Text className="text-[11px] text-content-muted">·</Text>
            <Text className="text-[11px] text-content-muted">
              {extras.reviewCount} reviews
            </Text>
          </View>

          {/* Distance · experience */}
          <View className="mt-0.5 flex-row items-center" style={{ gap: 4 }}>
            <MapPin size={11} color={Colors.surfaceMuted} strokeWidth={2} />
            <Text className="text-[11px] text-content-muted">
              {extras.distance} km away
            </Text>
            <Text className="text-[11px] text-content-muted">·</Text>
            <Clock size={11} color={Colors.surfaceMuted} strokeWidth={2} />
            <Text className="text-[11px] text-content-muted">
              {extras.yearsExp} yrs exp
            </Text>
          </View>

          {/* Availability badge */}
          <View className="mt-1.5">
            {item.is_available ? (
              <View
                className="flex-row items-center self-start rounded-full px-2 py-0.5"
                style={{ backgroundColor: Colors.availableBg, gap: 3 }}
              >
                <CircleCheck size={11} color={Colors.success} strokeWidth={2.5} />
                <Text
                  className="text-[10px] font-semibold text-success"
                  style={{ fontFamily: "GoogleSans_600SemiBold" }}
                >
                  Available Now
                </Text>
              </View>
            ) : (
              <View
                className="flex-row items-center self-start rounded-full px-2 py-0.5"
                style={{ backgroundColor: Colors.surfaceGray, gap: 3 }}
              >
                <Clock size={11} color={Colors.surfaceMuted} strokeWidth={2.5} />
                <Text
                  className="text-[10px] font-semibold text-surface-muted"
                  style={{ fontFamily: "GoogleSans_600SemiBold" }}
                >
                  Unavailable
                </Text>
              </View>
            )}
          </View>
        </View>


      </View>
    </TouchableOpacity>
  );
}

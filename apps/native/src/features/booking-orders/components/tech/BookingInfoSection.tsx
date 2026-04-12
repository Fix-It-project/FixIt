import { Linking, TouchableOpacity, View } from "react-native";
import { Calendar, MapPin, Phone } from "lucide-react-native";
import { formatDate } from "@/src/lib/helpers/booking-helpers";
import { Text } from "@/src/components/ui/text";
import { useThemeColors } from "@/src/lib/theme";
import type { ThemePalette } from "@/src/lib/theme";
import type { TechnicianOrder } from "@/src/features/schedule/schemas/response.schema";

interface Props {
  readonly booking: TechnicianOrder;
}

function InfoRow({
  icon: Icon,
  label,
  value,
  tappable,
  onPress,
  themeColors,
}: {
  icon: typeof Calendar;
  label: string;
  value: string;
  tappable?: boolean;
  onPress?: () => void;
  themeColors: ThemePalette;
}) {
  const Wrapper = tappable ? TouchableOpacity : View;

  return (
    <Wrapper
      className="flex-row items-center gap-3"
      {...(tappable && { activeOpacity: 0.7, onPress })}
    >
      <View
        className="h-10 w-10 items-center justify-center rounded-xl"
        style={{ backgroundColor: `${themeColors.primary}12` }}
      >
        <Icon size={18} color={themeColors.primary} strokeWidth={2} />
      </View>
      <View className="flex-1">
        <Text
          style={{
            fontSize: 11,
            color: themeColors.textMuted,
            textTransform: "uppercase",
            letterSpacing: 0.5,
          }}
        >
          {label}
        </Text>
        <Text
          style={{
            fontFamily: "GoogleSans_600SemiBold",
            fontSize: 14,
            color: tappable ? themeColors.primary : themeColors.textPrimary,
            marginTop: 1,
          }}
          numberOfLines={2}
        >
          {value}
        </Text>
      </View>
    </Wrapper>
  );
}

export default function BookingInfoSection({ booking }: Props) {
  const themeColors = useThemeColors();
  return (
    <View
      className="mb-4 rounded-2xl bg-surface p-4"
      style={{
        borderWidth: 1,
        borderColor: themeColors.borderDefault,
        gap: 16,
      }}
    >
      <InfoRow
        icon={Calendar}
        label="Scheduled Date"
        value={formatDate(booking.scheduled_date)}
        themeColors={themeColors}
      />

      {booking.user_address && (
        <InfoRow
          icon={MapPin}
          label="Location"
          value={booking.user_address}
          tappable
          themeColors={themeColors}
          onPress={() =>
            Linking.openURL(
              `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(booking.user_address!)}`,
            )
          }
        />
      )}

      {booking.user_phone && (
        <InfoRow
          icon={Phone}
          label="Phone"
          value={booking.user_phone}
          tappable
          themeColors={themeColors}
          onPress={() => Linking.openURL(`tel:${booking.user_phone}`)}
        />
      )}
    </View>
  );
}

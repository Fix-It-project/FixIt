import { Calendar, Phone } from "lucide-react-native";
import { Linking, TouchableOpacity, View } from "react-native";
import { Text } from "@/src/components/ui/text";
import type { Order } from "@/src/features/booking-orders/schemas/response.schema";
import { formatDate } from "@/src/lib/helpers/booking-helpers";
import { useThemeColors } from "@/src/lib/theme";
import type { ThemePalette } from "@/src/lib/theme";

interface Props {
  readonly order: Order;
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
  const color = tappable ? themeColors.primary : themeColors.textPrimary;
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
            color,
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

export default function OrderInfoSection({ order }: Props) {
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
        value={formatDate(order.scheduled_date)}
        themeColors={themeColors}
      />

      {order.technician_phone && (
        <InfoRow
          icon={Phone}
          label="Technician Phone"
          value={order.technician_phone}
          tappable
          onPress={() => Linking.openURL(`tel:${order.technician_phone}`)}
          themeColors={themeColors}
        />
      )}
    </View>
  );
}

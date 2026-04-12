import { View, TouchableOpacity } from "react-native";
import { ChevronRight } from "lucide-react-native";
import { Text } from "@/src/components/ui/text";
import { Colors } from "@/src/lib/colors";
import type { Service } from "@/src/features/services/schemas/response.schema";

function formatPrice(min: number, max: number): string {
  if (min === max) return `${min} EGP`;
  return `${min} – ${max} EGP`;
}

interface ServiceCardProps {
  readonly service: Service;
  readonly accentColor: string;
  readonly onPress: (serviceId: string, serviceName: string) => void;
}

export default function ServiceCard({ service, accentColor, onPress }: ServiceCardProps) {
  return (
    <TouchableOpacity
      className="mb-3 overflow-hidden rounded-xl bg-surface shadow-sm"
      style={{ elevation: 2 }}
      onPress={() => onPress(service.id, service.name)}
      activeOpacity={0.7}
    >
      <View className="flex-row items-center p-4">
        {/* Color accent bar */}
        <View
          className="mr-3.5 h-12 w-1 rounded-full"
          style={{ backgroundColor: accentColor }}
        />

        {/* Content */}
        <View className="flex-1">
          <Text
            className="text-[15px] font-semibold text-content"
            style={{ fontFamily: "GoogleSans_600SemiBold" }}
            numberOfLines={1}
          >
            {service.name}
          </Text>
          {service.description ? (
            <Text
              className="mt-0.5 text-[13px] text-content-muted"
              numberOfLines={2}
            >
              {service.description}
            </Text>
          ) : null}
          <Text
            className="mt-1.5 text-[13px] font-semibold"
            style={{ color: accentColor, fontFamily: "GoogleSans_600SemiBold" }}
          >
            {formatPrice(service.min_price, service.max_price)}
          </Text>
        </View>

        {/* Arrow */}
        <ChevronRight size={20} color={Colors.surfaceMuted} strokeWidth={1.75} />
      </View>
    </TouchableOpacity>
  );
}

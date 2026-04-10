import { View, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { Text } from "@/src/components/ui/text";
import type { Service } from "@/src/features/services/schemas/response.schema";
import ServiceCard from "./ServiceCard";

interface ServiceListBodyProps {
  readonly services: Service[] | undefined;
  readonly isLoading: boolean;
  readonly isError: boolean;
  readonly accentColor: string;
  readonly onRetry: () => void;
  readonly onServicePress: (serviceId: string, serviceName: string) => void;
}

export default function ServiceListContent({
  services,
  isLoading,
  isError,
  accentColor,
  onRetry,
  onServicePress,
}: ServiceListBodyProps) {
  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color={accentColor} />
      </View>
    );
  }

  if (isError) {
    return (
      <View className="flex-1 items-center justify-center gap-2 px-8">
        <Text
          className="text-center text-[16px] font-semibold text-content"
          style={{ fontFamily: "GoogleSans_600SemiBold" }}
        >
          Failed to load services
        </Text>
        <Text className="text-center text-[13px] text-content-muted">
          Something went wrong. Please try again.
        </Text>
        <TouchableOpacity onPress={onRetry} activeOpacity={0.7} className="mt-2">
          <Text className="text-[14px] font-semibold" style={{ color: accentColor }}>
            Retry
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!services || services.length === 0) {
    return (
      <View className="flex-1 items-center justify-center px-8">
        <Text
          className="text-center text-[16px] font-semibold text-content"
          style={{ fontFamily: "GoogleSans_600SemiBold" }}
        >
          No services available
        </Text>
        <Text className="mt-1 text-center text-[13px] text-content-muted">
          This category doesn't have any services yet.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1"
      showsVerticalScrollIndicator={false}
      contentContainerClassName="px-4 pt-4 pb-6"
    >
      {services.map((service) => (
        <ServiceCard
          key={service.id}
          service={service}
          accentColor={accentColor}
          onPress={onServicePress}
        />
      ))}
    </ScrollView>
  );
}

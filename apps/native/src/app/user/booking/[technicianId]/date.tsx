import { useState } from "react";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { Wrench } from "lucide-react-native";
import BackButton from "@/src/components/ui/BackButton";
import { getCategoryMeta } from "@/src/lib/helpers/category-helpers";
import { useThemeColors } from "@/src/lib/theme";
import { Text } from "@/src/components/ui/text";
import BookingDateStep from "@/src/features/booking-orders/components/user/BookingDateStep";
import { useSafeBack } from "@/src/lib/navigation";
import { ROUTES } from "@/src/lib/routes";

export default function BookingDateScreen() {
  const themeColors = useThemeColors();
  const {
    technicianId,
    technicianName,
    serviceId,
    serviceName,
    categoryId,
    categoryName,
  } = useLocalSearchParams<{
    technicianId: string;
    technicianName: string;
    serviceId: string;
    serviceName: string;
    categoryId: string;
    categoryName: string;
  }>();

  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const meta = getCategoryMeta(categoryId);
  const CategoryIcon = meta?.icon ?? Wrench;
  const categoryColor = meta?.color ?? themeColors.primary;

  const goBack = useSafeBack({
    pathname: ROUTES.user.technicians,
    params: { categoryId, categoryName, serviceId, serviceName },
  });

  const handleNext = () => {
    if (!selectedDate) return;
    const route = ROUTES.user.bookingDetails(technicianId ?? "");
    router.push({
      ...route,
      params: {
        ...route.params,
        technicianName,
        serviceId,
        serviceName,
        categoryId,
        categoryName,
        selectedDate,
      },
    });
  };

  return (
    <SafeAreaView
      className="flex-1"
      edges={["top"]}
      style={{ backgroundColor: categoryColor }}
    >
      <View className="flex-1 bg-surface-elevated">
        <View style={{ backgroundColor: categoryColor }} className="pb-5">
          <View className="flex-row items-center px-4 pb-1 pt-2">
            <BackButton variant="header-inverse" className="mr-3" onPress={goBack} />
            <View className="flex-1">
              <Text
                className="text-[20px] font-bold"
                style={{ fontFamily: "GoogleSans_700Bold", color: themeColors.onPrimaryHeader }}
                numberOfLines={1}
              >
                Book {technicianName ?? "Technician"}
              </Text>
              <Text
                className="text-[12px]"
                style={{ fontFamily: "GoogleSans_400Regular", color: themeColors.overlayBright }}
              >
                {serviceName ?? categoryName ?? "Service"} · Step 1 of 2 — Select Date
              </Text>
            </View>
            <View className="h-10 w-10 items-center justify-center rounded-full bg-overlay-md">
              <CategoryIcon size={20} color={themeColors.onPrimaryHeader} strokeWidth={1.75} />
            </View>
          </View>
        </View>

        <BookingDateStep
          technicianId={technicianId ?? ""}
          technicianName={technicianName ?? ""}
          selectedDate={selectedDate}
          onDateSelect={setSelectedDate}
          onNext={handleNext}
        />
      </View>
    </SafeAreaView>
  );
}

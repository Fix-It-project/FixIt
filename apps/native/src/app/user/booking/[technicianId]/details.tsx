import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { Wrench } from "lucide-react-native";
import Toast from "react-native-toast-message";
import BackButton from "@/src/components/ui/BackButton";
import { getCategoryMeta } from "@/src/lib/helpers/category-helpers";
import { useCreateBookingMutation } from "@/src/hooks/orders/useCreateBooking";
import { bookingSchema } from "@/src/features/booking-orders/schemas/form.schema";
import { getErrorMessage } from "@/src/lib/helpers/error-helpers";
import { useThemeColors } from "@/src/lib/theme";
import { Text } from "@/src/components/ui/text";
import BookingDetailsStep, {
  type AttachmentInfo,
} from "@/src/features/booking-orders/components/user/BookingDetailsStep";
import { useSafeBack } from "@/src/lib/navigation";
import { ROUTES } from "@/src/lib/routes";

export default function BookingDetailsScreen() {
  const themeColors = useThemeColors();
  const {
    technicianId,
    technicianName,
    serviceId,
    serviceName,
    categoryId,
    categoryName,
    selectedDate,
  } = useLocalSearchParams<{
    technicianId: string;
    technicianName: string;
    serviceId: string;
    serviceName: string;
    categoryId: string;
    categoryName: string;
    selectedDate: string;
  }>();

  const { mutateAsync: createBooking, isPending } = useCreateBookingMutation();

  const meta = getCategoryMeta(categoryId);
  const CategoryIcon = meta?.icon ?? Wrench;
  const categoryColor = meta?.color ?? themeColors.primary;

  const bookingDateRoute = ROUTES.user.bookingDate(technicianId ?? "");
  const goBack = useSafeBack({
    ...bookingDateRoute,
    params: {
      ...bookingDateRoute.params,
      technicianName,
      serviceId,
      serviceName,
      categoryId,
      categoryName,
    },
  });

  const handleConfirm = async (
    description: string,
    attachment: AttachmentInfo | null,
  ) => {
    if (!technicianId || !selectedDate || !serviceId) return;
    try {
      const payload = bookingSchema.parse({
        technician_id: technicianId,
        service_id: serviceId,
        scheduled_date: selectedDate,
        problem_description: description || undefined,
      });

      await createBooking({ payload, attachment: attachment ?? undefined });

      Toast.show({ type: "success", text1: "Booking submitted pending approval!" });
      setTimeout(() => {
        router.dismissAll();
        router.replace(ROUTES.user.home);
      }, 1000);
    } catch (error: unknown) {
      Toast.show({ type: "error", text1: getErrorMessage(error) });
    }
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
                {serviceName ?? categoryName ?? "Service"} · Step 2 of 2 — Details
              </Text>
            </View>
            <View className="h-10 w-10 items-center justify-center rounded-full bg-overlay-md">
              <CategoryIcon size={20} color={themeColors.onPrimaryHeader} strokeWidth={1.75} />
            </View>
          </View>
        </View>

        <BookingDetailsStep
          selectedDate={selectedDate}
          onBack={goBack}
          onConfirm={handleConfirm}
          isPending={isPending}
        />
      </View>
    </SafeAreaView>
  );
}

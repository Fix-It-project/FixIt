import { useCallback, useState } from "react";
import { BackHandler, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { Wrench } from "lucide-react-native";
import Toast from "react-native-toast-message";
import BackButton from "@/src/components/ui/BackButton";
import { getCategoryMeta } from "@/src/lib/helpers/category-helpers";
import { useCreateBookingMutation } from "@/src/hooks/orders/useCreateBooking";
import { bookingSchema } from "@/src/features/booking-orders/schemas/form.schema";
import { getErrorMessage } from "@/src/lib/helpers/error-helpers";
import { useThemeColors } from "@/src/lib/theme";
import { Text } from "@/src/components/ui/text";
import BookingDateStep from "@/src/features/booking-orders/components/user/BookingDateStep";
import BookingDetailsStep, {
  type AttachmentInfo,
} from "@/src/features/booking-orders/components/user/BookingDetailsStep";
import { useSafeBack } from "@/src/lib/navigation";

type Step = "date" | "details";

export default function BookingScreen() {
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

  const [step, setStep] = useState<Step>("date");
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const { mutateAsync: createBooking, isPending } = useCreateBookingMutation();

  const meta = getCategoryMeta(categoryId);
  const CategoryIcon = meta?.icon ?? Wrench;
  const categoryColor = meta?.color ?? themeColors.primary;

  const stepLabel = step === "date" ? "Step 1 of 2 — Select Date" : "Step 2 of 2 — Details";
  const goBack = useSafeBack({
    pathname: "/(app)/(technicians)/list",
    params: { categoryId, categoryName, serviceId, serviceName },
  });

  const handleBackPress = () => {
    if (step === "details") {
      setStep("date");
      return;
    }

    goBack();
  };

  useFocusEffect(
    useCallback(() => {
      const subscription = BackHandler.addEventListener("hardwareBackPress", () => {
        if (step !== "details") return false;

        setStep("date");
        return true;
      });

      return () => subscription.remove();
    }, [step]),
  );

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

      await createBooking({
        payload,
        attachment: attachment ?? undefined,
      });

      Toast.show({ type: "success", text1: "Booking submitted pending approval!" });
      setTimeout(() => {
        router.dismissAll();
        router.replace("/(app)/(tabs)");
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
            <BackButton
              variant="header-inverse"
              className="mr-3"
              onPress={handleBackPress}
            />
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
                {serviceName ?? categoryName ?? "Service"} · {stepLabel}
              </Text>
            </View>
            <View
              className="h-10 w-10 items-center justify-center rounded-full bg-overlay-md"
            >
              <CategoryIcon
                size={20}
                color={themeColors.onPrimaryHeader}
                strokeWidth={1.75}
              />
            </View>
          </View>
        </View>

        {/* Steps */}
        {step === "date" ? (
          <BookingDateStep
            technicianId={technicianId ?? ""}
            technicianName={technicianName ?? ""}
            selectedDate={selectedDate}
            onDateSelect={setSelectedDate}
            onNext={() => setStep("details")}
          />
        ) : (
          <BookingDetailsStep
            selectedDate={selectedDate!}
            onBack={() => setStep("date")}
            onConfirm={handleConfirm}
            isPending={isPending}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

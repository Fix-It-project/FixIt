import type { ReactNode } from "react";
import { Wrench, type LucideIcon } from "lucide-react-native";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text } from "@/src/components/ui/text";
import BackButton from "@/src/components/ui/BackButton";
import { getCategoryMeta } from "@/src/lib/helpers/category-helpers";
import { useThemeColors } from "@/src/lib/theme";

interface BookingFlowHeaderProps {
  readonly categoryId: string | null | undefined;
  readonly categoryName: string | null | undefined;
  readonly children: ReactNode;
  readonly serviceName: string | null | undefined;
  readonly stepLabel: string;
  readonly technicianName: string | null | undefined;
  readonly onBackPress: () => void;
}

export default function BookingFlowHeader({
  categoryId,
  categoryName,
  children,
  serviceName,
  stepLabel,
  technicianName,
  onBackPress,
}: BookingFlowHeaderProps) {
  const themeColors = useThemeColors();
  const meta = getCategoryMeta(categoryId);
  const CategoryIcon: LucideIcon = meta?.icon ?? Wrench;
  const categoryColor = meta?.color ?? themeColors.primary;

  return (
    <SafeAreaView
      className="flex-1"
      edges={["top"]}
      style={{ backgroundColor: categoryColor }}
    >
      <View className="flex-1 bg-surface-elevated">
        <View style={{ backgroundColor: categoryColor }} className="pb-5">
          <View className="flex-row items-center px-4 pb-1 pt-2">
            <BackButton variant="header-inverse" className="mr-3" onPress={onBackPress} />
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
            <View className="h-10 w-10 items-center justify-center rounded-full bg-overlay-md">
              <CategoryIcon size={20} color={themeColors.onPrimaryHeader} strokeWidth={1.75} />
            </View>
          </View>
        </View>
        {children}
      </View>
    </SafeAreaView>
  );
}

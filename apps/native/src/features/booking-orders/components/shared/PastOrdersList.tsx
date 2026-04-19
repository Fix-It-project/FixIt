import { Image, ScrollView, TouchableOpacity, View } from "react-native";
import { router, type Href } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { ClipboardList, type LucideIcon } from "lucide-react-native";
import PageHeader from "@/src/components/PageHeader";
import { Text } from "@/src/components/ui/text";
import { useDebounce } from "@/src/hooks/useDebounce";
import { CATEGORIES } from "@/src/lib/helpers/categories";
import { formatDate, getAvatarColor } from "@/src/features/booking-orders/utils/booking-helpers";
import { getPfpInitialsFallback } from "@/src/lib/helpers/pfp-initials-fallback";
import { Colors, useThemeColors } from "@/src/lib/theme";

export interface PastOrdersListItem {
  readonly avatarImage?: string | null;
  readonly avatarName: string | null | undefined;
  readonly categoryId: string | null | undefined;
  readonly fallbackName: string;
  readonly id: string;
  readonly name: string | null | undefined;
  readonly route: Href;
  readonly scheduledDate: string;
  readonly serviceName: string | null | undefined;
  readonly status: string;
  readonly statusLabel: string;
}

interface Props {
  readonly items: readonly PastOrdersListItem[];
  readonly onBack?: () => void;
  readonly title?: string;
}

function statusColor(status: string): string {
  return status === "completed" ? Colors.success : Colors.danger;
}

function PastOrderCard({ item }: { readonly item: PastOrdersListItem }) {
  const themeColors = useThemeColors();
  const goToOrder = useDebounce(() => router.push(item.route as never));
  const category = item.categoryId ? CATEGORIES.find((c) => c.id === item.categoryId) : undefined;
  const CategoryIcon: LucideIcon = category?.icon ?? ClipboardList;
  const categoryColor = category?.color ?? Colors.primary;
  const color = statusColor(item.status);

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={goToOrder}
      className="mb-3 rounded-2xl bg-surface p-4"
      style={{ borderWidth: 1, borderColor: themeColors.borderDefault }}
    >
      <View className="flex-row items-center gap-3">
        {item.avatarImage ? (
          <Image
            source={{ uri: item.avatarImage }}
            className="h-11 w-11 rounded-full"
            style={{ backgroundColor: themeColors.surfaceElevated }}
          />
        ) : (
          <View
            className="h-11 w-11 items-center justify-center rounded-full"
            style={{ backgroundColor: getAvatarColor(item.avatarName) }}
          >
            <Text style={{ fontFamily: "GoogleSans_700Bold", fontSize: 14, color: themeColors.surfaceBase }}>
              {getPfpInitialsFallback(item.avatarName)}
            </Text>
          </View>
        )}

        <View className="flex-1">
          <Text
            style={{ fontFamily: "GoogleSans_700Bold", fontSize: 14, color: themeColors.textPrimary }}
            numberOfLines={1}
          >
            {item.name ?? item.fallbackName}
          </Text>
          <View className="mt-0.5 flex-row items-center gap-1.5">
            <CategoryIcon size={12} color={categoryColor} strokeWidth={2} />
            <Text style={{ fontSize: 12, color: themeColors.textSecondary }} numberOfLines={1}>
              {item.serviceName ?? "Service"}
            </Text>
          </View>
        </View>

        <View className="items-end">
          <Text style={{ fontSize: 11, color: themeColors.textMuted }}>{formatDate(item.scheduledDate)}</Text>
          <View
            className="mt-1 rounded-full px-2.5 py-0.5"
            style={{ backgroundColor: `${color}15` }}
          >
            <Text style={{ fontSize: 10, fontFamily: "GoogleSans_600SemiBold", color }}>
              {item.statusLabel}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function PastOrdersList({
  items,
  onBack,
  title = "Past Orders",
}: Props) {
  const themeColors = useThemeColors();

  return (
    <View className="flex-1 bg-surface-elevated">
      <SafeAreaView className="flex-1" edges={["top"]}>
        <PageHeader title={title} onBackPress={onBack} />

        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        >
          {items.length === 0 ? (
            <View className="items-center py-16">
              <Text style={{ fontSize: 14, color: themeColors.textMuted }}>No past orders yet</Text>
            </View>
          ) : (
            items.map((item) => <PastOrderCard key={item.id} item={item} />)
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

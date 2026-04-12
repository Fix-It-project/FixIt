import { Image, ScrollView, TouchableOpacity, View } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { ChevronLeft, ClipboardList, type LucideIcon } from "lucide-react-native";
import { Text } from "@/src/components/ui/text";
import { CATEGORIES } from "@/src/lib/helpers/categories";
import { formatDate, getAvatarColor, getInitials } from "@/src/lib/helpers/booking-helpers";
import { Colors, useThemeColors } from "@/src/lib/theme";

export interface PastOrdersListItem {
  readonly avatarImage?: string | null;
  readonly avatarName: string | null | undefined;
  readonly categoryId: string | null | undefined;
  readonly fallbackName: string;
  readonly id: string;
  readonly name: string | null | undefined;
  readonly route: string | { params: Record<string, string>; pathname: string };
  readonly scheduledDate: string;
  readonly serviceName: string | null | undefined;
  readonly status: string;
  readonly statusLabel: string;
}

interface Props {
  readonly items: readonly PastOrdersListItem[];
}

function statusColor(status: string): string {
  return status === "completed" ? Colors.success : Colors.danger;
}

function PastOrderCard({ item }: { readonly item: PastOrdersListItem }) {
  const themeColors = useThemeColors();
  const category = item.categoryId ? CATEGORIES.find((c) => c.id === item.categoryId) : undefined;
  const CategoryIcon: LucideIcon = category?.icon ?? ClipboardList;
  const categoryColor = category?.color ?? Colors.primary;
  const color = statusColor(item.status);

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={() => router.push(item.route as never)}
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
              {getInitials(item.avatarName)}
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

export default function PastOrdersList({ items }: Props) {
  const themeColors = useThemeColors();

  return (
    <View className="flex-1 bg-surface-elevated">
      <SafeAreaView className="flex-1" edges={["top"]}>
        <View
          className="flex-row items-center gap-3 px-4 pb-4 pt-2"
          style={{ backgroundColor: themeColors.surfaceBase }}
        >
          <TouchableOpacity
            onPress={() => router.back()}
            className="h-9 w-9 items-center justify-center rounded-full"
            style={{ backgroundColor: themeColors.surfaceElevated }}
          >
            <ChevronLeft size={20} color={themeColors.textPrimary} />
          </TouchableOpacity>
          <Text style={{ fontFamily: "GoogleSans_700Bold", fontSize: 18, color: themeColors.textPrimary }}>
            Past Orders
          </Text>
        </View>

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

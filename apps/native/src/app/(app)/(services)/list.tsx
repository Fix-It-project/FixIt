import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, router } from "expo-router";
import { Wrench } from "lucide-react-native";
import { ICON_MAP } from "@/src/lib/helpers/category-helpers";
import { useServicesQuery } from "@/src/hooks/services/useServicesQuery";
import { Colors } from "@/src/lib/colors";
import ServicesHeader from "@/src/features/services/components/user/ServicesHeader";
import ServiceListContent from "@/src/features/services/components/user/ServiceListContent";

const BRAND_DEFAULT = Colors.primary;

export default function ServicesListScreen() {
  const { categoryId, categoryName } = useLocalSearchParams<{
    categoryId: string;
    categoryName: string;
  }>();

  const { data: services, isLoading, isError, refetch } = useServicesQuery(categoryId ?? "");

  const meta = categoryId ? ICON_MAP[categoryId] : undefined;
  const CategoryIcon = meta?.icon ?? Wrench;
  const categoryColor = meta?.color ?? BRAND_DEFAULT;

  const handleServicePress = (serviceId: string, serviceName: string) => {
    router.push({
      pathname: "/(app)/(technicians)/list",
      params: { categoryId, categoryName, serviceId, serviceName },
    });
  };

  return (
    <SafeAreaView className="flex-1" edges={["top"]} style={{ backgroundColor: categoryColor }}>
      <View className="flex-1 bg-surface-elevated">
        <ServicesHeader
          categoryName={categoryName ?? "Services"}
          categoryColor={categoryColor}
          CategoryIcon={CategoryIcon}
        />
        <ServiceListContent
          services={services}
          isLoading={isLoading}
          isError={isError}
          accentColor={categoryColor}
          onRetry={refetch}
          onServicePress={handleServicePress}
        />
      </View>
    </SafeAreaView>
  );
}

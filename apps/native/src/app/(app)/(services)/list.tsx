import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, router } from "expo-router";
import { Wrench } from "lucide-react-native";
import { getCategoryMeta } from "@/src/lib/helpers/category-helpers";
import { useServicesQuery } from "@/src/hooks/services/useServicesQuery";
import ServicesHeader from "@/src/features/services/components/user/ServicesHeader";
import ServiceListContent from "@/src/features/services/components/user/ServiceListContent";
import { Colors } from "@/src/lib/theme";
import { useSafeBack } from "@/src/lib/navigation";

export default function ServicesListScreen() {
  const { categoryId, categoryName, origin } = useLocalSearchParams<{
    categoryId: string;
    categoryName: string;
    origin?: string;
  }>();

  const { data: services, isLoading, isError, refetch } = useServicesQuery(categoryId ?? "");

  const meta = getCategoryMeta(categoryId);
  const CategoryIcon = meta?.icon ?? Wrench;
  const categoryColor = meta?.color ?? Colors.primary;
  const goBack = useSafeBack(origin === "categories" ? "/(app)/(categories)" : "/(app)");

  const handleServicePress = (serviceId: string, serviceName: string) => {
    router.push({
      pathname: "/(app)/(technicians)/list",
      params: { categoryId, categoryName, serviceId, serviceName, origin },
    });
  };

  return (
    <SafeAreaView className="flex-1" edges={["top"]} style={{ backgroundColor: categoryColor }}>
      <View className="flex-1 bg-surface-elevated">
        <ServicesHeader
          categoryName={categoryName ?? "Services"}
          categoryColor={categoryColor}
          CategoryIcon={CategoryIcon}
          onBackPress={goBack}
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

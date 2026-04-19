import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect, useLocalSearchParams, router } from "expo-router";
import { Wrench } from "lucide-react-native";
import { useCallback, useRef } from "react";
import { getCategoryMeta } from "@/src/lib/helpers/category-helpers";
import { useServicesQuery } from "@/src/features/services/hooks/useServicesQuery";
import ServicesHeader from "@/src/features/services/components/user/ServicesHeader";
import ServiceListContent from "@/src/features/services/components/user/ServiceListContent";
import { Colors } from "@/src/lib/theme";
import { useSafeBack } from "@/src/lib/navigation";
import { ROUTES } from "@/src/lib/routes";

export default function ServicesListScreen() {
  const { categoryId, categoryName } = useLocalSearchParams<{
    categoryId: string;
    categoryName: string;
  }>();
  const isNavigatingRef = useRef(false);

  const { data: services, isLoading, isError, refetch } = useServicesQuery(categoryId ?? "");

  const meta = getCategoryMeta(categoryId);
  const CategoryIcon = meta?.icon ?? Wrench;
  const categoryColor = meta?.color ?? Colors.primary;
  const goBack = useSafeBack(ROUTES.user.categories);

  useFocusEffect(
    useCallback(() => {
      isNavigatingRef.current = false;
    }, []),
  );

  const handleServicePress = useCallback((serviceId: string, serviceName: string) => {
    if (isNavigatingRef.current) return;

    isNavigatingRef.current = true;
    router.push({
      pathname: ROUTES.user.technicians,
      params: { categoryId, categoryName, serviceId, serviceName },
    });
  }, [categoryId, categoryName]);

  return (
    <SafeAreaView
      className="flex-1"
      edges={["top"]}
      style={{ backgroundColor: categoryColor }}
    >
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

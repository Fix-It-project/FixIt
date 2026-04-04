import { View, ScrollView, RefreshControl, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Colors } from "@/src/lib/colors";
import { Text } from "@/src/components/ui/text";
import { useUserOrdersQuery } from "@/src/hooks/orders/useUserOrders";
import OrdersHeader from "@/src/components/user/orders/OrdersHeader";
import UserOrderCard from "@/src/components/user/orders/UserOrderCard";
import { useDebounce } from "@/src/hooks/useDebounce";

export default function MyOrdersScreen() {
  const { data: orders = [], isLoading, refetch, isRefetching } = useUserOrdersQuery();
  const goToOrder = useDebounce((id: string) => router.push({ pathname: "/(app)/(orders)/[id]", params: { id } }));

  return (
    <View className="flex-1 bg-surface-gray">
      <SafeAreaView className="flex-1" edges={["top"]}>
        <OrdersHeader />

        {isLoading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color={Colors.brand} />
          </View>
        ) : orders.length === 0 ? (
          <View className="flex-1 items-center justify-center px-8">
            <Text
              style={{ fontFamily: "GoogleSans_600SemiBold", fontSize: 16, color: Colors.textSecondary, textAlign: "center" }}
            >
              No orders yet
            </Text>
            <Text style={{ fontSize: 13, color: Colors.textMuted, textAlign: "center", marginTop: 4 }}>
              Your bookings will appear here once you book a technician.
            </Text>
          </View>
        ) : (
          <ScrollView
            className="flex-1"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
            refreshControl={
              <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={Colors.brand} />
            }
          >
            {orders.map((order) => (
              <UserOrderCard
                key={order.id}
                order={order}
                onPress={() => goToOrder(order.id)}
              />
            ))}
          </ScrollView>
        )}
      </SafeAreaView>
    </View>
  );
}

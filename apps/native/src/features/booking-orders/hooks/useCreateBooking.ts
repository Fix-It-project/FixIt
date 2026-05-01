import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createOrder } from "@/src/features/booking-orders/api/orders";
import type { Order } from "@/src/features/booking-orders/schemas/response.schema";
import { USER_ORDERS_KEY } from "./useUserOrders";

export function useCreateBookingMutation() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: createOrder,
		onSuccess: (response) => {
			queryClient.setQueryData<Order[]>(USER_ORDERS_KEY, (current = []) => {
				const createdOrder = response.data;
				const withoutExisting = current.filter(
					(order) => order.id !== createdOrder.id,
				);
				return [createdOrder, ...withoutExisting];
			});
			queryClient.invalidateQueries({ queryKey: USER_ORDERS_KEY });
		},
	});
}

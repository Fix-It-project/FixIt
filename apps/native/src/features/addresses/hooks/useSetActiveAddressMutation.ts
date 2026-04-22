import { useMutation, useQueryClient } from "@tanstack/react-query";
import { setActiveUserAddress } from "@/src/features/addresses/api";

/**
 * TanStack mutation hook for setting an address as active.
 * Invalidates the user-addresses cache on success so the list refreshes.
 */
export function useSetActiveAddressMutation() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (addressId: string) => setActiveUserAddress(addressId),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["user-addresses"] });
		},
	});
}

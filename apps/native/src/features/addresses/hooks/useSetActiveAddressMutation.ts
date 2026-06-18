import { useMutation, useQueryClient } from "@tanstack/react-query";
import { setActiveUserAddress } from "@/src/features/addresses/api";
import type { Address } from "@/src/features/addresses/schemas/response.schema";

const ADDRESSES_KEY = ["user-addresses"] as const;

/**
 * Sets an address as active. Optimistically flips `is_active` in the cache so
 * the selection updates instantly and STAYS put — the previous approach cleared
 * local optimistic state on settle before the refetch landed, which made the
 * radio flicker (select → deselect → reselect). Rolls back on error.
 */
export function useSetActiveAddressMutation() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (addressId: string) => setActiveUserAddress(addressId),
		onMutate: async (addressId) => {
			await queryClient.cancelQueries({ queryKey: ADDRESSES_KEY });
			const previous = queryClient.getQueryData<Address[]>(ADDRESSES_KEY);
			queryClient.setQueryData<Address[]>(ADDRESSES_KEY, (old) =>
				old?.map((a) => ({ ...a, is_active: a.id === addressId })),
			);
			return { previous };
		},
		onError: (_err, _addressId, context) => {
			if (context?.previous) {
				queryClient.setQueryData(ADDRESSES_KEY, context.previous);
			}
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: ADDRESSES_KEY });
		},
	});
}

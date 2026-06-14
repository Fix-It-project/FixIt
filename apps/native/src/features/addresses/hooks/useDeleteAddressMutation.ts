import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteUserAddress } from "@/src/features/addresses/api";

/**
 * Deletes a user address and refreshes the list. The server rejects deleting the
 * last remaining address (addresses.service) — the caller surfaces a localized
 * message on error, so the global error toast is suppressed via `meta.showToast`.
 */
export function useDeleteAddressMutation() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationKey: ["delete-address"],
		meta: { showToast: false },
		mutationFn: (addressId: string) => deleteUserAddress(addressId),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["user-addresses"] });
		},
	});
}

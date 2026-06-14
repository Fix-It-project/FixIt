import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteUserAddress } from "@/src/features/addresses/api";

/**
 * Deletes a user address and refreshes the list. The server rejects protected
 * address states (for example active or last remaining); the global mutation
 * error sink surfaces those AppErrors.
 */
export function useDeleteAddressMutation() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationKey: ["delete-address"],
		mutationFn: (addressId: string) => deleteUserAddress(addressId),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["user-addresses"] });
		},
	});
}

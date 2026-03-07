import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addUserAddress } from "@/src/services/addresses/api";
import type { CreateAddressRequest } from "@/src/services/addresses/types";

/**
 * TanStack mutation hook for creating a new address.
 * Invalidates the user-addresses cache on success so the list refreshes.
 */
export function useAddAddressMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateAddressRequest) => addUserAddress(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-addresses"] });
    },
  });
}

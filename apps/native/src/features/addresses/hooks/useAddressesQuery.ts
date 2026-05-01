import { useQuery } from "@tanstack/react-query";
import { getUserAddresses } from "@/src/features/addresses/api";
import type { Address } from "@/src/features/addresses/schemas/response.schema";

/**
 * TanStack Query hook that fetches all addresses for the authenticated user.
 * Enabled by default — addresses are needed for the location header display.
 */
export function useAddressesQuery() {
	return useQuery<Address[]>({
		queryKey: ["user-addresses"],
		queryFn: getUserAddresses,
		staleTime: 5 * 60 * 1000,
		retry: 1,
	});
}

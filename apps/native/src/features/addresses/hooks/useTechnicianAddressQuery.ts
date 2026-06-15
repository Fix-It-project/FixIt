import { useQuery } from "@tanstack/react-query";
import { getTechnicianAddresses } from "@/src/features/addresses/api";

export const technicianAddressKeys = {
	all: ["technician-addresses"] as const,
};

/**
 * The technician's single work/service address — the active one, or the first
 * if none is flagged active. `undefined` when the technician has no address yet.
 */
export function useTechnicianAddressQuery() {
	return useQuery({
		queryKey: technicianAddressKeys.all,
		queryFn: getTechnicianAddresses,
		select: (addresses) =>
			addresses.find((address) => address.is_active) ?? addresses[0],
	});
}

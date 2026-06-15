import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
	addTechnicianAddress,
	updateTechnicianAddress,
} from "@/src/features/addresses/api";
import type { CreateAddressRequest } from "@/src/features/addresses/types/types";
import { technicianAddressKeys } from "./useTechnicianAddressQuery";

interface UpsertTechnicianAddressVars {
	/** Existing address id → update (PUT); omitted → create (POST). */
	id?: string;
	payload: CreateAddressRequest;
}

/**
 * Creates or updates the technician's single work address. POST requires
 * latitude/longitude (see address.dto); PUT accepts a partial. Refreshes the
 * technician-address cache on success.
 */
export function useUpsertTechnicianAddressMutation() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, payload }: UpsertTechnicianAddressVars) =>
			id ? updateTechnicianAddress(id, payload) : addTechnicianAddress(payload),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: technicianAddressKeys.all });
		},
	});
}

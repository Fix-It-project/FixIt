import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	getMyServiceRequests,
	type SubmitServiceRequestBody,
	submitServiceRequest,
} from "@/src/features/technicians/api/custom-services";
import { technicianQueryKeys } from "@/src/features/technicians/query-keys";
import type { CustomServiceRequest } from "@/src/features/technicians/schemas/custom-service.schema";

/** The technician's own custom-service requests (pending / approved / rejected). */
export function useMyServiceRequestsQuery(technicianId: string | null) {
	return useQuery<CustomServiceRequest[]>({
		queryKey: technicianQueryKeys.myServiceRequests(),
		queryFn: getMyServiceRequests,
		enabled: !!technicianId,
		staleTime: 0,
		refetchOnMount: "always",
		retry: 1,
	});
}

/** Submit a new request. On success, refresh the requests list (new pending row)
 *  and the technician's own services (an approval may have landed since). */
export function useSubmitServiceRequestMutation(technicianId: string | null) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (body: SubmitServiceRequestBody) => submitServiceRequest(body),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: technicianQueryKeys.myServiceRequests(),
			});
			if (technicianId) {
				queryClient.invalidateQueries({
					queryKey: technicianQueryKeys.services(technicianId),
				});
			}
		},
	});
}

import { useQuery } from "@tanstack/react-query";
import { getPublicSchedule } from "@/src/features/schedule/api/calendar";

export function useTechnicianPublicSchedule(
	technicianId: string | null | undefined,
) {
	const { data, isLoading } = useQuery({
		queryKey: ["public-schedule", technicianId],
		queryFn: () => {
			if (!technicianId) {
				throw new Error("Missing technician id");
			}
			return getPublicSchedule(technicianId);
		},
		enabled: !!technicianId,
	});

	return {
		templates: data?.templates ?? [],
		exceptions: data?.exceptions ?? [],
		isLoading,
	};
}

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	createException,
	deleteException,
	getExceptions,
} from "@/src/lib/technician-calendar";
import { useAuthStore } from "@/src/stores/auth-store";

const exceptionsKey = (userId: string | undefined) =>
	["technician-exceptions", userId] as const;

/** Single-day unavailability overrides for the authenticated technician. */
export function useScheduleExceptionsQuery() {
	const user = useAuthStore((s) => s.user);
	return useQuery({
		queryKey: exceptionsKey(user?.id),
		queryFn: () => {
			if (!user?.id) throw new Error("Not authenticated");
			return getExceptions(user.id);
		},
		enabled: !!user?.id,
	});
}

/** Mark a day unavailable. Server returns 409 if the day has active bookings. */
export function useAddScheduleExceptionMutation() {
	const queryClient = useQueryClient();
	const user = useAuthStore((s) => s.user);
	return useMutation({
		mutationFn: (date: string) => {
			if (!user?.id) throw new Error("Not authenticated");
			return createException(user.id, { date });
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: exceptionsKey(user?.id) });
		},
	});
}

/** Remove an unavailability override (make the day available again). */
export function useDeleteScheduleExceptionMutation() {
	const queryClient = useQueryClient();
	const user = useAuthStore((s) => s.user);
	return useMutation({
		mutationFn: (exceptionId: string) => {
			if (!user?.id) throw new Error("Not authenticated");
			return deleteException(user.id, exceptionId);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: exceptionsKey(user?.id) });
		},
	});
}

import { useQuery } from "@tanstack/react-query";
import { getProfile } from "@/src/features/users/api/user";

export function useProfileQuery() {
	return useQuery({
		queryKey: ["user", "profile"],
		queryFn: getProfile,
		select: (data) => data.profile,
	});
}

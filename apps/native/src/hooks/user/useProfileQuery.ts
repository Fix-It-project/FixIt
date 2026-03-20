import { useQuery } from "@tanstack/react-query";
import { getProfile } from "@/src/services/users/api/user";

export function useProfileQuery() {
  return useQuery({
    queryKey: ["user", "profile"],
    queryFn: getProfile,
    select: (data) => data.profile,
  });
}

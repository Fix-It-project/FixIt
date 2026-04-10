import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateProfile } from "@/src/features/users/api/user";
import type { UpdateProfileRequest } from "@/src/features/users/types/user";

export function useUpdateProfileMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateProfileRequest) => updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user", "profile"] });
    },
  });
}

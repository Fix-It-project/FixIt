import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateTechnicianSelf } from "@/src/features/tech-self/api/tech-self";
import type { UpdateTechnicianSelfRequest } from "@/src/features/tech-self/types/tech-self";

export function useUpdateTechSelfProfileMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateTechnicianSelfRequest) => updateTechnicianSelf(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["technician", "self"] });
    },
  });
}

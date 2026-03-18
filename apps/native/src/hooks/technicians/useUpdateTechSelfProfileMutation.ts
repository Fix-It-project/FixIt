import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateTechnicianSelf } from "@/src/services/technicians/self-api";
import type { UpdateTechnicianSelfRequest } from "@/src/services/technicians/self-api";

export function useUpdateTechSelfProfileMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateTechnicianSelfRequest) => updateTechnicianSelf(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["technician", "self"] });
    },
  });
}

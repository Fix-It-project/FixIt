import { useMutation, useQueryClient } from "@tanstack/react-query";
import { uploadTechnicianProfileImage } from "@/src/services/tech-self/api/tech-self";

interface UploadImageArgs {
  imageUri: string;
  mimeType: string;
}

export function useUploadTechProfileImageMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ imageUri, mimeType }: UploadImageArgs) =>
      uploadTechnicianProfileImage(imageUri, mimeType),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["technician", "self"] });
    },
  });
}

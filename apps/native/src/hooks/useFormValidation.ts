import { useState, useCallback } from "react";
import type { z } from "zod";

export function useFormValidation<T extends z.ZodTypeAny>(schema: T) {
  type FormData = z.infer<T>;
  type FieldErrors = Partial<Record<string, string>>;

  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [error, setError] = useState<string | null>(null);

  const clearFieldError = useCallback(
    (field: string) => {
      if (fieldErrors[field]) {
        setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
      }
      if (error) setError(null);
    },
    [fieldErrors, error]
  );

  const validate = useCallback(
    (data: unknown): { success: true; data: FormData } | { success: false } => {
      setFieldErrors({});
      setError(null);

      const result = schema.safeParse(data);
      if (!result.success) {
        const errors: FieldErrors = {};
        for (const issue of result.error.issues) {
          const field = String(issue.path[0]);
          if (!errors[field]) errors[field] = issue.message;
        }
        setFieldErrors(errors);
        return { success: false };
      }

      return { success: true, data: result.data as FormData };
    },
    [schema]
  );

  return { fieldErrors, error, setError, clearFieldError, validate };
}

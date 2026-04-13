import { useEffect } from "react";
import { Alert } from "react-native";
import { getErrorMessage } from "@/src/lib/helpers/error-helpers";
import { getChangedFields, hasChangedFields } from "@/src/lib/helpers/profile-form";

type StringFields = Record<string, string>;

type ValidationResult<TForm extends StringFields> =
  | { success: true; data: TForm }
  | { success: false };

interface UpdateMutation<TForm extends StringFields> {
  readonly error: unknown;
  readonly isPending: boolean;
  readonly mutate: (
    payload: Partial<TForm>,
    options: {
      onSuccess: () => void;
      onError: (error: unknown) => void;
    },
  ) => void;
}

interface UseProfileEditControllerParams<TForm extends StringFields, THydrateValues> {
  readonly formValues: TForm;
  readonly originalValues: TForm;
  readonly hydrate: (values: THydrateValues) => void;
  readonly hydrateValues: THydrateValues | null;
  readonly reset: () => void;
  readonly goBack: () => void;
  readonly validate: (data: unknown) => ValidationResult<TForm>;
  readonly updateMutation: UpdateMutation<TForm>;
}

export function useProfileEditController<TForm extends StringFields, THydrateValues>({
  formValues,
  originalValues,
  hydrate,
  hydrateValues,
  reset,
  goBack,
  validate,
  updateMutation,
}: UseProfileEditControllerParams<TForm, THydrateValues>) {
  useEffect(() => {
    if (!hydrateValues) return;
    hydrate(hydrateValues);
  }, [hydrate, hydrateValues]);

  const hasChanges = hasChangedFields(formValues, originalValues);

  const handleSave = () => {
    if (!hasChanges) return;

    const result = validate(formValues);
    if (!result.success) return;

    const payload = getChangedFields(result.data, originalValues);
    if (Object.keys(payload).length === 0) {
      Alert.alert("No changes", "You haven't changed anything.");
      return;
    }

    updateMutation.mutate(payload, {
      onSuccess: () => {
        reset();
        goBack();
      },
      onError: (error) => {
        Alert.alert("Update failed", getErrorMessage(error) || "Something went wrong.");
      },
    });
  };

  return {
    errorMessage: updateMutation.error ? getErrorMessage(updateMutation.error) : null,
    handleSave,
    hasChanges,
    isPending: updateMutation.isPending,
  };
}

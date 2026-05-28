import { useEffect } from "react";
import Toast from "react-native-toast-message";
import {
	getChangedFields,
	hasChangedFields,
} from "@/src/features/profile/utils/profile-form";
import { showError } from "@/src/lib/errors";
import { logger } from "@/src/lib/logger";

type StringFields = Record<string, string>;

type ValidationResult<TForm extends StringFields> =
	| { success: true; data: TForm }
	| { success: false };

interface UpdateMutation<TForm extends StringFields> {
	readonly isPending: boolean;
	readonly mutate: (
		payload: Partial<TForm>,
		options: {
			onSuccess: () => void;
			onError: (error: unknown) => void;
		},
	) => void;
}

interface UseProfileEditControllerBaseParams<
	TForm extends StringFields,
	THydrateValues,
> {
	readonly formValues: TForm;
	readonly originalValues: TForm;
	readonly hydrate: (values: THydrateValues) => void;
	readonly hydrateValues: THydrateValues | null;
	readonly reset: () => void;
	readonly goBack: () => void;
	readonly validate: (data: unknown) => ValidationResult<TForm>;
	readonly updateMutation: UpdateMutation<TForm>;
}

export function useProfileEditControllerBase<
	TForm extends StringFields,
	THydrateValues,
>({
	formValues,
	originalValues,
	hydrate,
	hydrateValues,
	reset,
	goBack,
	validate,
	updateMutation,
}: UseProfileEditControllerBaseParams<TForm, THydrateValues>) {
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
			Toast.show({
				type: "info",
				text1: "No changes",
				text2: "You haven't changed anything.",
			});
			return;
		}

		updateMutation.mutate(payload, {
			onSuccess: () => {
				logger.info("profile", "profile_update_succeeded", {
					changedFields: Object.keys(payload),
				});
				reset();
				goBack();
			},
			onError: (error) => {
				logger.error("profile", "profile_update_failed", error);
				showError(error);
			},
		});
	};

	return {
		handleSave,
		hasChanges,
		isPending: updateMutation.isPending,
	};
}

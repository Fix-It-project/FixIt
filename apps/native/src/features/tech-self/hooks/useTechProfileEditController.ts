import { useProfileEditControllerBase } from "@/src/features/profile/hooks/useProfileEditControllerBase";

type StringFields = Record<string, string>;

export function useTechProfileEditController<
	TForm extends StringFields,
	THydrateValues,
>(params: {
	readonly formValues: TForm;
	readonly originalValues: TForm;
	readonly hydrate: (values: THydrateValues) => void;
	readonly hydrateValues: THydrateValues | null;
	readonly reset: () => void;
	readonly goBack: () => void;
	readonly validate: (
		data: unknown,
	) => { success: true; data: TForm } | { success: false };
	readonly updateMutation: {
		readonly error: unknown;
		readonly isPending: boolean;
		readonly mutate: (
			payload: Partial<TForm>,
			options: {
				onSuccess: () => void;
				onError: (error: unknown) => void;
			},
		) => void;
	};
}) {
	return useProfileEditControllerBase(params);
}

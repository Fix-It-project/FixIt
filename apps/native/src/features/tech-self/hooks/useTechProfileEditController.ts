import {
	type UseProfileEditControllerBaseParams,
	useProfileEditControllerBase,
} from "@/src/features/profile/hooks/useProfileEditControllerBase";

export function useTechProfileEditController<
	TForm extends Record<string, string>,
	THydrateValues,
>(params: UseProfileEditControllerBaseParams<TForm, THydrateValues>) {
	return useProfileEditControllerBase(params);
}

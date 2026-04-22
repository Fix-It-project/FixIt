import { FileText, Phone, User } from "lucide-react-native";
import FormInput from "@/src/components/forms/FormInput";
import ProfileEditScreenLayout from "@/src/features/profile/components/ProfileEditScreenLayout";
import { useTechProfileEditController } from "@/src/features/tech-self/hooks/useTechProfileEditController";
import { useTechSelfProfileQuery } from "@/src/features/tech-self/hooks/useTechSelfProfileQuery";
import { useUpdateTechSelfProfileMutation } from "@/src/features/tech-self/hooks/useUpdateTechSelfProfileMutation";
import { editTechProfileSchema } from "@/src/features/tech-self/schemas/form.schema";
import { useEditTechProfileStore } from "@/src/features/tech-self/stores/edit-tech-profile-store";
import { useFormValidation } from "@/src/hooks/useFormValidation";
import { useSafeBack } from "@/src/lib/navigation";
import { ROUTES } from "@/src/lib/routes";

export default function EditTechProfileScreen() {
	const { data: profile } = useTechSelfProfileQuery();
	const updateProfile = useUpdateTechSelfProfileMutation();
	const { fieldErrors, clearFieldError, validate } = useFormValidation(
		editTechProfileSchema,
	);
	const goBack = useSafeBack(ROUTES.technician.profile);

	const {
		firstName,
		lastName,
		phone,
		description,
		setFirstName,
		setLastName,
		setPhone,
		setDescription,
		hydrate,
		reset,
	} = useEditTechProfileStore();

	const formValues = {
		first_name: firstName,
		last_name: lastName,
		phone,
		description,
	};

	const originalValues = {
		first_name: profile?.first_name ?? "",
		last_name: profile?.last_name ?? "",
		phone: profile?.phone ?? "",
		description: profile?.description ?? "",
	};

	const { errorMessage, handleSave, hasChanges, isPending } =
		useTechProfileEditController({
			formValues,
			originalValues,
			hydrate,
			hydrateValues: profile
				? {
						firstName: profile.first_name ?? "",
						lastName: profile.last_name ?? "",
						phone: profile.phone ?? "",
						description: profile.description ?? "",
					}
				: null,
			reset,
			goBack,
			validate,
			updateMutation: updateProfile,
		});

	return (
		<ProfileEditScreenLayout
			errorMessage={errorMessage}
			isPending={isPending}
			isSaveDisabled={!hasChanges || isPending}
			onBackPress={goBack}
			onSavePress={handleSave}
		>
			<FormInput
				label="First Name"
				value={firstName}
				onChangeText={(text) => {
					setFirstName(text);
					clearFieldError("first_name");
				}}
				placeholder="Enter your first name"
				icon={User}
				error={fieldErrors.first_name}
				disabled={isPending}
				variant="outline"
				autoCapitalize="words"
			/>

			<FormInput
				label="Last Name"
				value={lastName}
				onChangeText={(text) => {
					setLastName(text);
					clearFieldError("last_name");
				}}
				placeholder="Enter your last name"
				icon={User}
				error={fieldErrors.last_name}
				disabled={isPending}
				variant="outline"
				autoCapitalize="words"
			/>

			<FormInput
				label="Phone"
				value={phone}
				onChangeText={(text) => {
					setPhone(text);
					clearFieldError("phone");
				}}
				placeholder="Enter your phone number"
				icon={Phone}
				error={fieldErrors.phone}
				disabled={isPending}
				variant="outline"
				keyboardType="phone-pad"
			/>

			<FormInput
				label="About"
				value={description}
				onChangeText={(text) => {
					setDescription(text);
					clearFieldError("description");
				}}
				placeholder="Tell clients about yourself…"
				icon={FileText}
				error={fieldErrors.description}
				disabled={isPending}
				variant="outline"
			/>
		</ProfileEditScreenLayout>
	);
}

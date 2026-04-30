import { Mail, Phone, User } from "lucide-react-native";
import FormInput from "@/src/components/forms/FormInput";
import ProfileEditScreenLayout from "@/src/features/profile/components/ProfileEditScreenLayout";
import { useProfileQuery } from "@/src/features/users/hooks/useProfileQuery";
import { useUpdateProfileMutation } from "@/src/features/users/hooks/useUpdateProfileMutation";
import { useUserProfileEditController } from "@/src/features/users/hooks/useUserProfileEditController";
import { editProfileSchema } from "@/src/features/users/schemas/form.schema";
import { useEditProfileStore } from "@/src/features/users/stores/edit-profile-store";
import { useFormValidation } from "@/src/hooks/useFormValidation";
import { useSafeBack } from "@/src/lib/navigation";
import { ROUTES } from "@/src/lib/routes";

export default function EditProfileScreen() {
	const { data: profile } = useProfileQuery();
	const updateProfile = useUpdateProfileMutation();
	const { fieldErrors, clearFieldError, validate } =
		useFormValidation(editProfileSchema);
	const goBack = useSafeBack(ROUTES.user.profile);

	const {
		fullName,
		email,
		phone,
		setFullName,
		setEmail,
		setPhone,
		hydrate,
		reset,
	} = useEditProfileStore();

	const formValues = {
		full_name: fullName,
		email,
		phone,
	};

	const originalValues = {
		full_name: profile?.full_name ?? "",
		email: profile?.email ?? "",
		phone: profile?.phone ?? "",
	};

	const { errorMessage, handleSave, hasChanges, isPending } =
		useUserProfileEditController({
			formValues,
			originalValues,
			hydrate,
			hydrateValues: profile
				? {
						fullName: profile.full_name ?? "",
						email: profile.email ?? "",
						phone: profile.phone ?? "",
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
				label="Full Name"
				value={fullName}
				onChangeText={(text) => {
					setFullName(text);
					clearFieldError("full_name");
				}}
				placeholder="Enter your full name"
				icon={User}
				error={fieldErrors.full_name}
				disabled={isPending}
				variant="outline"
				autoCapitalize="words"
			/>

			<FormInput
				label="Email"
				value={email}
				onChangeText={(text) => {
					setEmail(text);
					clearFieldError("email");
				}}
				placeholder="Enter your email"
				icon={Mail}
				error={fieldErrors.email}
				disabled={isPending}
				variant="outline"
				keyboardType="email-address"
				autoCapitalize="none"
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
		</ProfileEditScreenLayout>
	);
}

import { Mail, Phone, User } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import FormInput from "@/src/components/forms/FormInput";
import ProfileEditScreenLayout from "@/src/features/profile/components/ProfileEditScreenLayout";
import { useProfileQuery } from "@/src/features/users/hooks/useProfileQuery";
import { useUpdateProfileMutation } from "@/src/features/users/hooks/useUpdateProfileMutation";
import { useUserProfileEditController } from "@/src/features/users/hooks/useUserProfileEditController";
import { editProfileSchema } from "@/src/features/users/schemas/form.schema";
import { useEditProfileStore } from "@/src/features/users/stores/edit-profile-store";
import { useFormValidation } from "@/src/hooks/useFormValidation";
import { ROUTES, useSafeBack } from "@/src/lib/navigation";

export default function EditProfileScreen() {
	const { t } = useTranslation("profile");
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

	const { handleSave, hasChanges, isPending } = useUserProfileEditController({
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
			isPending={isPending}
			isSaveDisabled={!hasChanges || isPending}
			onBackPress={goBack}
			onSavePress={handleSave}
		>
			<FormInput
				label={t("edit.fullName")}
				value={fullName}
				onChangeText={(text) => {
					setFullName(text);
					clearFieldError("full_name");
				}}
				placeholder={t("edit.fullNamePlaceholder")}
				icon={User}
				error={fieldErrors.full_name}
				disabled={isPending}
				variant="filled"
				autoCapitalize="words"
			/>

			<FormInput
				label={t("edit.email")}
				value={email}
				onChangeText={(text) => {
					setEmail(text);
					clearFieldError("email");
				}}
				placeholder={t("edit.emailPlaceholder")}
				icon={Mail}
				error={fieldErrors.email}
				disabled={isPending}
				variant="filled"
				keyboardType="email-address"
				autoCapitalize="none"
				textAlign="left"
				textDirection="ltr"
			/>

			<FormInput
				label={t("edit.phone")}
				value={phone}
				onChangeText={(text) => {
					setPhone(text);
					clearFieldError("phone");
				}}
				placeholder={t("edit.phonePlaceholder")}
				icon={Phone}
				error={fieldErrors.phone}
				disabled={isPending}
				variant="filled"
				keyboardType="phone-pad"
				textAlign="left"
				textDirection="ltr"
			/>
		</ProfileEditScreenLayout>
	);
}

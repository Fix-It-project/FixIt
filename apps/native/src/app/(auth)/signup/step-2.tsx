import { router } from "expo-router";
import { Phone } from "lucide-react-native";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator } from "react-native";
import FormInput from "@/src/components/forms/FormInput";
import { Button } from "@/src/components/ui/button";
import { Text as BtnText } from "@/src/components/ui/text";
import { useThemeColors } from "@/src/constants/design-tokens";
import AddressFormSection from "@/src/features/address-entry/components/AddressFormSection";
import AuthPageLayout from "@/src/features/auth/components/shared/AuthPageLayout";
import ErrorBanner from "@/src/features/auth/components/shared/ErrorBanner";
import { useOAuthCompleteMutation } from "@/src/features/auth/hooks/useOAuthCompleteMutation";
import { useSignUpMutation } from "@/src/features/auth/hooks/useSignUpMutation";
import { userAddressSchema } from "@/src/features/auth/schemas/form.schema";
import { useUserSignupStore } from "@/src/features/auth/stores/user-signup-store";
import { useFormValidation } from "@/src/hooks/useFormValidation";
import { getErrorMessage } from "@/src/lib/errors";
import { ROUTES } from "@/src/lib/navigation";
import { useLocationStore } from "@/src/stores/location-store";

/**
 * Step 2 of user signup — address details.
 *  - `password` mode: submits the full payload to `/api/auth/signup`.
 *  - `oauth` mode: completes the profile via `/api/auth/oauth/complete`, then
 *    persists the stashed Supabase session (see useOAuthCompleteMutation). OAuth
 *    has no phone from Google, so we collect it here.
 */
export default function SignUpStep2() {
	const { t } = useTranslation("auth");
	const themeColors = useThemeColors();
	const mode = useUserSignupStore((s) => s.mode);
	const storedName = useUserSignupStore((s) => s.fullName);
	const storedEmail = useUserSignupStore((s) => s.email);
	const storedPhone = useUserSignupStore((s) => s.phone);
	const storedPassword = useUserSignupStore((s) => s.password);
	const hasPendingSession = useUserSignupStore(
		(s) => s.pendingSession !== null,
	);

	const [city, setCity] = useState("");
	const [street, setStreet] = useState("");
	const [buildingNumber, setBuildingNumber] = useState("");
	const [apartmentNumber, setApartmentNumber] = useState("");
	const [phone, setPhone] = useState("");

	const { location, requestLocationPermission } = useLocationStore();
	const signUpMutation = useSignUpMutation();
	const oauthCompleteMutation = useOAuthCompleteMutation();
	const { fieldErrors, clearFieldError, validate } =
		useFormValidation(userAddressSchema);

	const isPending = signUpMutation.isPending || oauthCompleteMutation.isPending;

	// Guard against landing here without the step-1 / OAuth state (e.g. deep link).
	useEffect(() => {
		if (mode === "oauth" ? !hasPendingSession : !storedEmail) {
			router.replace(ROUTES.auth.signup);
		}
	}, [mode, hasPendingSession, storedEmail]);

	const handleSubmit = async () => {
		const result = validate({ city, street, buildingNumber, apartmentNumber });
		if (!result.success) return;

		let coords = location;
		if (!coords) {
			await requestLocationPermission();
			coords = useLocationStore.getState().location;
		}

		const address = {
			city: result.data.city,
			street: result.data.street,
			building_no: result.data.buildingNumber ?? "",
			apartment_no: result.data.apartmentNumber ?? "",
			latitude: coords?.latitude ?? null,
			longitude: coords?.longitude ?? null,
		};

		if (mode === "oauth") {
			oauthCompleteMutation.mutate({
				fullName: storedName || undefined,
				phone: phone.trim() || undefined,
				...address,
			});
			return;
		}

		signUpMutation.mutate({
			fullName: storedName,
			email: storedEmail,
			phone: storedPhone,
			password: storedPassword,
			...address,
		});
	};

	const activeError = signUpMutation.error ?? oauthCompleteMutation.error;
	const errorMessage = activeError ? getErrorMessage(activeError) : null;

	const isFormValid =
		city.trim().length > 0 &&
		street.trim().length > 0 &&
		(mode !== "oauth" || phone.trim().length > 0);

	return (
		<AuthPageLayout
			title={t("signup.step2Title")}
			subtitle={t("signup.step2Subtitle")}
		>
			<ErrorBanner message={errorMessage} />

			{mode === "oauth" ? (
				<FormInput
					label={t("form.phoneNumber")}
					value={phone}
					onChangeText={setPhone}
					placeholder={t("form.phonePlaceholder")}
					icon={Phone}
					keyboardType="phone-pad"
					required
					disabled={isPending}
					testID="signup-phone-input"
				/>
			) : null}

			<AddressFormSection
				city={city}
				onCityChange={(text) => {
					setCity(text);
					clearFieldError("city");
				}}
				street={street}
				onStreetChange={(text) => {
					setStreet(text);
					clearFieldError("street");
				}}
				buildingNumber={buildingNumber}
				onBuildingNumberChange={(text) => {
					setBuildingNumber(text);
					clearFieldError("buildingNumber");
				}}
				apartmentNumber={apartmentNumber}
				onApartmentNumberChange={(text) => {
					setApartmentNumber(text);
					clearFieldError("apartmentNumber");
				}}
				errors={{
					city: fieldErrors.city,
					street: fieldErrors.street,
					buildingNumber: fieldErrors.buildingNumber,
					apartmentNumber: fieldErrors.apartmentNumber,
				}}
				disabled={isPending}
				testIDPrefix="signup"
			/>

			<Button
				onPress={handleSubmit}
				disabled={!isFormValid || isPending}
				className="mt-stack-sm"
				testID="signup-submit"
			>
				{isPending ? (
					<ActivityIndicator color={themeColors.surfaceOnPrimary} />
				) : (
					<BtnText variant="buttonLg">
						{mode === "oauth"
							? t("signup.finishSetup")
							: t("signup.createAccount")}
					</BtnText>
				)}
			</Button>
		</AuthPageLayout>
	);
}

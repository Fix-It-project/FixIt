import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import { ActivityIndicator } from "react-native";
import ErrorBanner from "@/src/components/feedback/ErrorBanner";
import { Button } from "@/src/components/ui/button";
import { Text as BtnText } from "@/src/components/ui/text";
import AddressFormSection from "@/src/features/address-entry/components/AddressFormSection";
import AuthPageLayout from "@/src/features/auth/components/shared/AuthPageLayout";
import DocumentUploadField from "@/src/features/auth/components/shared/DocumentUploadField";
import { useTechnicianSignUpMutation } from "@/src/features/auth/hooks/useTechnicianSignUpMutation";
import {
	type TechStep5Data,
	techStep5Schema,
} from "@/src/features/auth/schemas/form.schema";
import { useTechnicianSignupStore } from "@/src/features/auth/stores/technician-signup-store";
import { useFormValidation } from "@/src/hooks/useFormValidation";
import { getErrorMessage } from "@/src/lib/helpers/error-helpers";
import { useThemeColors } from "@/src/lib/theme";

export default function TechnicianSignUpStep5() {
	const themeColors = useThemeColors();
	const store = useTechnicianSignupStore();
	const [nationalId, setNationalId] = useState(store.nationalId);
	const [criminalRecord, setCriminalRecord] = useState(store.criminalRecord);
	const [certificate, setCertificate] = useState(store.certificate);
	const [city, setCity] = useState(store.city);
	const [address, setAddress] = useState(store.address);
	const [buildingNumber, setBuildingNumber] = useState(store.buildingNumber);
	const [apartmentNumber, setApartmentNumber] = useState(store.apartmentNumber);

	const signUpMutation = useTechnicianSignUpMutation();
	const { fieldErrors, error, clearFieldError, validate } =
		useFormValidation(techStep5Schema);

	const pickImage = async (
		setter: (uri: string) => void,
		field: keyof TechStep5Data,
	) => {
		const result = await ImagePicker.launchImageLibraryAsync({
			mediaTypes: ["images"],
			allowsEditing: true,
			quality: 0.8,
		});

		if (!result.canceled && result.assets[0]) {
			setter(result.assets[0].uri);
			clearFieldError(field);
		}
	};

	const handleSubmit = () => {
		const result = validate({
			nationalId,
			criminalRecord,
			certificate,
			city,
			address,
			buildingNumber,
			apartmentNumber,
		});
		if (!result.success) return;

		store.setStep5Data({
			...result.data,
			buildingNumber: result.data.buildingNumber ?? "",
			apartmentNumber: result.data.apartmentNumber ?? "",
		});

		signUpMutation.mutate({
			email: store.email,
			password: store.password,
			firstName: store.firstName,
			lastName: store.lastName,
			phone: store.phone,
			categoryId: store.categories[0] ?? "",
			city,
			street: address,
			buildingNumber: result.data.buildingNumber ?? "",
			apartmentNumber: result.data.apartmentNumber ?? "",
			nationalIdUri: nationalId,
			criminalRecordUri: criminalRecord,
			certificateUri: certificate,
		});
	};

	const errorMessage = signUpMutation.error
		? getErrorMessage(signUpMutation.error)
		: error;

	const isFormValid =
		nationalId.length > 0 &&
		criminalRecord.length > 0 &&
		certificate.length > 0 &&
		city.trim().length > 0 &&
		address.trim().length > 0;

	return (
		<AuthPageLayout
			title="Required Documents"
			subtitle="Please upload the following documents and provide your location details."
		>
			<ErrorBanner message={errorMessage} />

			<DocumentUploadField
				label="National ID"
				value={nationalId}
				onPick={() => pickImage(setNationalId, "nationalId")}
				error={fieldErrors.nationalId}
				required
			/>

			<DocumentUploadField
				label="Criminal Record"
				value={criminalRecord}
				onPick={() => pickImage(setCriminalRecord, "criminalRecord")}
				error={fieldErrors.criminalRecord}
				required
			/>

			<DocumentUploadField
				label="Certificate"
				value={certificate}
				onPick={() => pickImage(setCertificate, "certificate")}
				error={fieldErrors.certificate}
				required
			/>

			<AddressFormSection
				city={city}
				onCityChange={(text) => {
					setCity(text);
					clearFieldError("city");
				}}
				street={address}
				onStreetChange={(text) => {
					setAddress(text);
					clearFieldError("address");
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
					street: fieldErrors.address,
					buildingNumber: fieldErrors.buildingNumber,
					apartmentNumber: fieldErrors.apartmentNumber,
				}}
				disabled={signUpMutation.isPending}
				streetLabel="Address"
			/>

			<Button
				onPress={handleSubmit}
				disabled={!isFormValid || signUpMutation.isPending}
				className="mt-2"
			>
				{signUpMutation.isPending ? (
					<ActivityIndicator color={themeColors.surfaceBase} />
				) : (
					<BtnText>Apply as Technician</BtnText>
				)}
			</Button>
		</AuthPageLayout>
	);
}

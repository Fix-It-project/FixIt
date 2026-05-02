import * as DocumentPicker from "expo-document-picker";
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
import type { UploadDocumentInput } from "@/src/features/auth/utils/signup-helpers";
import { useFormValidation } from "@/src/hooks/useFormValidation";
import { getErrorMessage } from "@/src/lib/helpers/error-helpers";
import { useThemeColors } from "@/src/lib/theme";

const DOCUMENT_PICKER_TYPES = [
	"application/pdf",
	"image/*",
	"application/msword",
	"application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

function createStoredDocument(uri: string): UploadDocumentInput | null {
	if (!uri) return null;
	return {
		uri,
		name: uri.split("/").pop() || "document",
		type: "application/octet-stream",
	};
}

export default function TechnicianSignUpStep5() {
	const themeColors = useThemeColors();
	const store = useTechnicianSignupStore();
	const [nationalId, setNationalId] = useState<UploadDocumentInput | null>(
		createStoredDocument(store.nationalId),
	);
	const [criminalRecord, setCriminalRecord] =
		useState<UploadDocumentInput | null>(
			createStoredDocument(store.criminalRecord),
		);
	const [certificate, setCertificate] = useState<UploadDocumentInput | null>(
		createStoredDocument(store.certificate),
	);
	const [city, setCity] = useState(store.city);
	const [address, setAddress] = useState(store.address);
	const [buildingNumber, setBuildingNumber] = useState(store.buildingNumber);
	const [apartmentNumber, setApartmentNumber] = useState(store.apartmentNumber);

	const signUpMutation = useTechnicianSignUpMutation();
	const { fieldErrors, error, clearFieldError, validate } =
		useFormValidation(techStep5Schema);

	const pickDocument = async (
		setter: (document: UploadDocumentInput) => void,
		field: keyof TechStep5Data,
	) => {
		const result = await DocumentPicker.getDocumentAsync({
			type: DOCUMENT_PICKER_TYPES,
			multiple: false,
			copyToCacheDirectory: true,
		});

		if (!result.canceled && result.assets[0]) {
			const asset = result.assets[0];
			setter({
				uri: asset.uri,
				name: asset.name,
				type: asset.mimeType ?? "application/octet-stream",
			});
			clearFieldError(field);
		}
	};

	const handleSubmit = () => {
		const result = validate({
			nationalId: nationalId?.uri ?? "",
			criminalRecord: criminalRecord?.uri ?? "",
			certificate: certificate?.uri ?? "",
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

		if (!nationalId || !criminalRecord || !certificate) return;

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
			nationalId,
			criminalRecord,
			certificate,
		});
	};

	const errorMessage = signUpMutation.error
		? getErrorMessage(signUpMutation.error)
		: error;

	const isFormValid =
		!!nationalId &&
		!!criminalRecord &&
		!!certificate &&
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
				value={nationalId?.uri ?? ""}
				fileName={nationalId?.name}
				onPick={() => pickDocument(setNationalId, "nationalId")}
				error={fieldErrors.nationalId}
				required
			/>

			<DocumentUploadField
				label="Criminal Record"
				value={criminalRecord?.uri ?? ""}
				fileName={criminalRecord?.name}
				onPick={() => pickDocument(setCriminalRecord, "criminalRecord")}
				error={fieldErrors.criminalRecord}
				required
			/>

			<DocumentUploadField
				label="Certificate"
				value={certificate?.uri ?? ""}
				fileName={certificate?.name}
				onPick={() => pickDocument(setCertificate, "certificate")}
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
				className="mt-stack-sm"
			>
				{signUpMutation.isPending ? (
					<ActivityIndicator color={themeColors.surfaceBase} />
				) : (
					<BtnText variant="buttonLg">Apply as Technician</BtnText>
				)}
			</Button>
		</AuthPageLayout>
	);
}

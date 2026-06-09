import { Building2, Home, MapPin, Navigation } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import FormInput from "@/src/components/forms/FormInput";

interface AddressFormSectionProps {
	readonly city: string;
	readonly onCityChange: (text: string) => void;
	readonly street: string;
	readonly onStreetChange: (text: string) => void;
	readonly buildingNumber: string;
	readonly onBuildingNumberChange: (text: string) => void;
	readonly apartmentNumber: string;
	readonly onApartmentNumberChange: (text: string) => void;
	readonly errors?: {
		readonly city?: string;
		readonly street?: string;
		readonly buildingNumber?: string;
		readonly apartmentNumber?: string;
	};
	readonly disabled?: boolean;
	readonly variant?: "filled" | "outline";
	readonly streetLabel?: string;
	readonly required?: boolean;
	readonly buildingRequired?: boolean;
	readonly showIcons?: boolean;
	/** When set, each field gets a testID of `${testIDPrefix}-<field>-input` for E2E selection. */
	readonly testIDPrefix?: string;
}

export default function AddressFormSection({
	city,
	onCityChange,
	street,
	onStreetChange,
	buildingNumber,
	onBuildingNumberChange,
	apartmentNumber,
	onApartmentNumberChange,
	errors,
	disabled,
	variant,
	streetLabel,
	required = true,
	buildingRequired = false,
	showIcons = true,
	testIDPrefix,
}: AddressFormSectionProps) {
	const { t } = useTranslation("addresses");
	const fieldTestID = (field: string) =>
		testIDPrefix ? `${testIDPrefix}-${field}-input` : undefined;

	return (
		<>
			<FormInput
				label={t("form.city")}
				value={city}
				onChangeText={onCityChange}
				placeholder={t("form.cityPlaceholder")}
				icon={showIcons ? MapPin : undefined}
				error={errors?.city}
				disabled={disabled}
				required={required}
				variant={variant}
				testID={fieldTestID("city")}
			/>

			<FormInput
				label={streetLabel ?? t("form.streetAddress")}
				value={street}
				onChangeText={onStreetChange}
				placeholder={t("form.streetPlaceholder")}
				icon={showIcons ? Navigation : undefined}
				error={errors?.street}
				disabled={disabled}
				required={required}
				variant={variant}
				testID={fieldTestID("street")}
			/>

			<View className="flex-row gap-stack-md">
				<View className="flex-1">
					<FormInput
						label={t("form.building")}
						value={buildingNumber}
						onChangeText={onBuildingNumberChange}
						placeholder={t("form.buildingPlaceholder")}
						icon={showIcons ? Building2 : undefined}
						error={errors?.buildingNumber}
						disabled={disabled}
						keyboardType="numeric"
						required={buildingRequired}
						variant={variant}
						testID={fieldTestID("building")}
					/>
				</View>
				<View className="flex-1">
					<FormInput
						label={t("form.apartment")}
						value={apartmentNumber}
						onChangeText={onApartmentNumberChange}
						placeholder={t("form.apartmentPlaceholder")}
						icon={showIcons ? Home : undefined}
						error={errors?.apartmentNumber}
						disabled={disabled}
						required={buildingRequired}
						variant={variant}
						testID={fieldTestID("apartment")}
					/>
				</View>
			</View>
		</>
	);
}

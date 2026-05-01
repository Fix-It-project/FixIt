import { Building2, Home, MapPin, Navigation } from "lucide-react-native";
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
	streetLabel = "Street Address",
	required = true,
	buildingRequired = false,
	showIcons = true,
}: AddressFormSectionProps) {
	return (
		<>
			<FormInput
				label="City"
				value={city}
				onChangeText={onCityChange}
				placeholder="e.g. Cairo"
				icon={showIcons ? MapPin : undefined}
				error={errors?.city}
				disabled={disabled}
				required={required}
				variant={variant}
			/>

			<FormInput
				label={streetLabel}
				value={street}
				onChangeText={onStreetChange}
				placeholder="Street address or area"
				icon={showIcons ? Navigation : undefined}
				error={errors?.street}
				disabled={disabled}
				required={required}
				variant={variant}
			/>

			<View className="flex-row gap-stack-md">
				<View className="flex-1">
					<FormInput
						label="Building No."
						value={buildingNumber}
						onChangeText={onBuildingNumberChange}
						placeholder="e.g. 12"
						icon={showIcons ? Building2 : undefined}
						error={errors?.buildingNumber}
						disabled={disabled}
						keyboardType="numeric"
						required={buildingRequired}
						variant={variant}
					/>
				</View>
				<View className="flex-1">
					<FormInput
						label="Apartment No."
						value={apartmentNumber}
						onChangeText={onApartmentNumberChange}
						placeholder="e.g. 5A"
						icon={showIcons ? Home : undefined}
						error={errors?.apartmentNumber}
						disabled={disabled}
						required={buildingRequired}
						variant={variant}
					/>
				</View>
			</View>
		</>
	);
}

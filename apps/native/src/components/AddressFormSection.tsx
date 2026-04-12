import { View } from "react-native";
import { MapPin, Navigation, Building2, Home } from "lucide-react-native";
import FormInput from "@/src/features/auth/components/shared/FormInput";

interface AddressFormSectionProps {
  city: string;
  onCityChange: (text: string) => void;
  street: string;
  onStreetChange: (text: string) => void;
  buildingNumber: string;
  onBuildingNumberChange: (text: string) => void;
  apartmentNumber: string;
  onApartmentNumberChange: (text: string) => void;
  errors?: {
    city?: string;
    street?: string;
    buildingNumber?: string;
    apartmentNumber?: string;
  };
  disabled?: boolean;
  variant?: "filled" | "outline";
  /** Label for the street field (defaults to "Street Address") */
  streetLabel?: string;
  /** Whether city and street fields are required (defaults to true) */
  required?: boolean;
  /** Whether building and apartment fields are required (defaults to false) */
  buildingRequired?: boolean;
  /** Show icons on the inputs (defaults to true) */
  showIcons?: boolean;
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

      <View className="flex-row gap-3">
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

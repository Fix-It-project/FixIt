import { router, useLocalSearchParams } from "expo-router";
import { MapPin } from "lucide-react-native";
import { useCallback, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { SafeAreaView } from "react-native-safe-area-context";
import PageHeader from "@/src/components/PageHeader";
import { Button } from "@/src/components/ui/button";
import { Text } from "@/src/components/ui/text";
import AddressFormSection from "@/src/features/address-entry/components/AddressFormSection";
import { useAddAddressMutation } from "@/src/features/addresses/hooks/useAddAddressMutation";
import { addAddressSchema } from "@/src/features/addresses/schemas/form.schema";
import { useFormValidation } from "@/src/hooks/useFormValidation";
import { getErrorMessage } from "@/src/lib/helpers/error-helpers";
import { Colors, spacing, useThemeColors } from "@/src/lib/theme";

export default function AddAddressScreen() {
	const themeColors = useThemeColors();
	const params = useLocalSearchParams<{
		latitude: string;
		longitude: string;
	}>();
	const latitude = Number(params.latitude);
	const longitude = Number(params.longitude);

	const [city, setCity] = useState("");
	const [street, setStreet] = useState("");
	const [buildingNumber, setBuildingNumber] = useState("");
	const [apartmentNumber, setApartmentNumber] = useState("");

	const { fieldErrors, clearFieldError, validate } =
		useFormValidation(addAddressSchema);
	const addMutation = useAddAddressMutation();

	const handleSubmit = useCallback(() => {
		const result = validate({ city, street, buildingNumber, apartmentNumber });
		if (!result.success) return;

		addMutation.mutate(
			{
				city: result.data.city,
				street: result.data.street,
				building_no: result.data.buildingNumber || undefined,
				apartment_no: result.data.apartmentNumber || undefined,
				latitude,
				longitude,
			},
			{
				onSuccess: () => {
					router.back();
				},
			},
		);
	}, [
		city,
		street,
		buildingNumber,
		apartmentNumber,
		latitude,
		longitude,
		validate,
		addMutation,
	]);

	return (
		<SafeAreaView
			className="flex-1"
			style={{ backgroundColor: themeColors.surfaceBase }}
		>
			{/* Header */}
			<PageHeader title="Address Details" variant="surface" />

			<KeyboardAwareScrollView
				style={{ flex: 1, paddingHorizontal: spacing.screen.paddingX }}
				showsVerticalScrollIndicator={false}
				keyboardShouldPersistTaps="handled"
				keyboardDismissMode="interactive"
				contentContainerStyle={{
					gap: spacing.stack.lg,
					paddingBottom: spacing.stack.xl + spacing.stack.sm,
				}}
				bottomOffset={20}
			>
				{/* Coords badge */}
				<View
					className="flex-row items-center rounded-lg px-3 py-2.5"
					style={{ backgroundColor: themeColors.primaryLight }}
				>
					<MapPin size={14} color={Colors.primary} strokeWidth={2} />
					<Text
						variant="bodySm"
						className="ml-2"
						style={{ color: Colors.primary }}
					>
						Location: {latitude.toFixed(4)}, {longitude.toFixed(4)}
					</Text>
				</View>

				{/* Form fields */}
				<AddressFormSection
					city={city}
					onCityChange={(t) => {
						setCity(t);
						clearFieldError("city");
					}}
					street={street}
					onStreetChange={(t) => {
						setStreet(t);
						clearFieldError("street");
					}}
					buildingNumber={buildingNumber}
					onBuildingNumberChange={setBuildingNumber}
					apartmentNumber={apartmentNumber}
					onApartmentNumberChange={setApartmentNumber}
					errors={{ city: fieldErrors.city, street: fieldErrors.street }}
					variant="outline"
					streetLabel="Street"
					showIcons={false}
				/>

				{/* Mutation error */}
				{addMutation.isError && (
					<Text
						variant="bodySm"
						className="text-center"
						style={{ color: Colors.danger }}
					>
						{getErrorMessage(addMutation.error)}
					</Text>
				)}

				{/* Submit */}
				<Button
					onPress={handleSubmit}
					disabled={addMutation.isPending}
					className="w-full rounded-xl"
				>
					{addMutation.isPending ? (
						<ActivityIndicator size="small" color={themeColors.surfaceBase} />
					) : (
						<Text>Save Address</Text>
					)}
				</Button>
			</KeyboardAwareScrollView>
		</SafeAreaView>
	);
}

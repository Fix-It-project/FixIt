import { router } from "expo-router";
import { Map as MapIcon, MapPin, Navigation } from "lucide-react-native";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { ScreenSafeAreaView } from "@/src/components/layout/ScreenSafeAreaView";
import { Button } from "@/src/components/ui/button";
import { Text } from "@/src/components/ui/text";
import { spacing, useThemeColors } from "@/src/constants/design-tokens";
import AddressFormSection from "@/src/features/address-entry/components/AddressFormSection";
import { useTechnicianAddressQuery } from "@/src/features/addresses/hooks/useTechnicianAddressQuery";
import { useUpsertTechnicianAddressMutation } from "@/src/features/addresses/hooks/useUpsertTechnicianAddressMutation";
import { addAddressSchema } from "@/src/features/addresses/schemas/form.schema";
import { LocationSnapshot } from "@/src/features/location-picker/components/LocationSnapshot";
import { usePickedLocationStore } from "@/src/features/location-picker/stores/picked-location-store";
import { useFormValidation } from "@/src/hooks/useFormValidation";
import { getErrorMessage } from "@/src/lib/errors";
import { ROUTES } from "@/src/lib/navigation";
import { useLocationStore } from "@/src/stores/location-store";

/**
 * Technician's single work/service address. Mirrors the user "add address" screen
 * (app/user/profile/addresses/new.tsx): the composition layer wires the shared
 * AddressFormSection with the addresses feature + the location store. The server
 * requires coordinates on create, so Save stays disabled until a location is captured.
 */
export default function TechnicianServiceLocationScreen() {
	const { t } = useTranslation("addresses");
	const themeColors = useThemeColors();

	const { data: address, isLoading } = useTechnicianAddressQuery();
	const upsert = useUpsertTechnicianAddressMutation();

	const requestLocation = useLocationStore(
		(state) => state.requestLocationPermission,
	);
	const storeLocation = useLocationStore((state) => state.location);
	const isLocating = useLocationStore((state) => state.isLoading);

	const [city, setCity] = useState("");
	const [street, setStreet] = useState("");
	const [buildingNumber, setBuildingNumber] = useState("");
	const [apartmentNumber, setApartmentNumber] = useState("");
	const [coords, setCoords] = useState<{
		latitude: number;
		longitude: number;
	} | null>(null);
	const [hydrated, setHydrated] = useState(false);

	const { fieldErrors, clearFieldError, validate } = useFormValidation(
		addAddressSchema(t),
	);

	// Prefill once from the existing address.
	useEffect(() => {
		if (hydrated || !address) return;
		setCity(address.city);
		setStreet(address.street);
		setBuildingNumber(address.building_no ?? "");
		setApartmentNumber(address.apartment_no ?? "");
		if (address.latitude != null && address.longitude != null) {
			setCoords({ latitude: address.latitude, longitude: address.longitude });
		}
		setHydrated(true);
	}, [address, hydrated]);

	// Adopt the GPS fix captured by the location store.
	useEffect(() => {
		if (storeLocation) setCoords(storeLocation);
	}, [storeLocation]);

	// Adopt a point chosen on the map picker (preserves typed fields), then clear.
	const picked = usePickedLocationStore((state) => state.coords);
	const clearPicked = usePickedLocationStore((state) => state.clear);
	useEffect(() => {
		if (picked) {
			setCoords(picked);
			clearPicked();
		}
	}, [picked, clearPicked]);

	const openPicker = () =>
		router.push(
			ROUTES.technician.settingsAddressPickLocation(coords ?? undefined),
		);

	const handleSave = () => {
		const result = validate({ city, street, buildingNumber, apartmentNumber });
		if (!result.success || !coords) return;

		upsert.mutate(
			{
				id: address?.id,
				payload: {
					city: result.data.city,
					street: result.data.street,
					building_no: result.data.buildingNumber || undefined,
					apartment_no: result.data.apartmentNumber || undefined,
					latitude: coords.latitude,
					longitude: coords.longitude,
				},
			},
			{ onSuccess: () => router.back() },
		);
	};

	if (isLoading) {
		return (
			<ScreenSafeAreaView
				className="flex-1 items-center justify-center"
				edges={["bottom"]}
				style={{ backgroundColor: themeColors.surfaceBase }}
			>
				<ActivityIndicator size="large" color={themeColors.primary} />
			</ScreenSafeAreaView>
		);
	}

	return (
		<ScreenSafeAreaView
			className="flex-1"
			edges={["bottom"]}
			style={{ backgroundColor: themeColors.surfaceBase }}
		>
			<KeyboardAwareScrollView
				style={{ flex: 1, paddingHorizontal: spacing.screen.paddingX }}
				showsVerticalScrollIndicator={false}
				keyboardShouldPersistTaps="handled"
				keyboardDismissMode="interactive"
				contentContainerStyle={{
					gap: spacing.stack.lg,
					paddingVertical: spacing.stack.lg,
					paddingBottom: spacing.stack.xl + spacing.stack.sm,
				}}
				bottomOffset={20}
			>
				<Text variant="bodySm" className="text-content-secondary">
					{t("techAddress.description")}
				</Text>

				{/* Location: snapshot when set (tap to adjust), else a prompt. */}
				{coords ? (
					<LocationSnapshot
						latitude={coords.latitude}
						longitude={coords.longitude}
						onPress={openPicker}
					/>
				) : (
					<View
						className="flex-row items-center rounded-input px-stack-md py-control-trigger-y"
						style={{ backgroundColor: themeColors.primaryLight }}
					>
						<MapPin size={16} color={themeColors.primary} strokeWidth={2} />
						<Text
							variant="bodySm"
							className="ml-stack-sm flex-1"
							numberOfLines={1}
							style={{ color: themeColors.primary }}
						>
							{t("techAddress.locationRequired")}
						</Text>
					</View>
				)}

				<View className="gap-stack-sm">
					<Button
						variant="secondary"
						iconLeft={Navigation}
						onPress={() => {
							void requestLocation();
						}}
						loading={isLocating}
						fullWidth
					>
						{t("techAddress.captureCta")}
					</Button>
					<Button
						variant="outline"
						iconLeft={MapIcon}
						onPress={openPicker}
						fullWidth
					>
						{t("techAddress.setOnMap")}
					</Button>
				</View>

				<AddressFormSection
					city={city}
					onCityChange={(value) => {
						setCity(value);
						clearFieldError("city");
					}}
					street={street}
					onStreetChange={(value) => {
						setStreet(value);
						clearFieldError("street");
					}}
					buildingNumber={buildingNumber}
					onBuildingNumberChange={setBuildingNumber}
					apartmentNumber={apartmentNumber}
					onApartmentNumberChange={setApartmentNumber}
					errors={{ city: fieldErrors.city, street: fieldErrors.street }}
					variant="outline"
				/>

				{upsert.isError && (
					<Text variant="bodySm" className="text-center text-danger">
						{getErrorMessage(upsert.error)}
					</Text>
				)}

				<Button
					onPress={handleSave}
					disabled={upsert.isPending || !coords}
					loading={upsert.isPending}
					fullWidth
					size="lg"
				>
					{t("techAddress.save")}
				</Button>
			</KeyboardAwareScrollView>
		</ScreenSafeAreaView>
	);
}

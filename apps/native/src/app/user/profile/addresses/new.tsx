import { router, useLocalSearchParams } from "expo-router";
import { Map as MapIcon, Navigation } from "lucide-react-native";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import PageHeader from "@/src/components/layout/PageHeader";
import { ScreenSafeAreaView } from "@/src/components/layout/ScreenSafeAreaView";
import { Button } from "@/src/components/ui/button";
import { Text } from "@/src/components/ui/text";
import { Colors, spacing, useThemeColors } from "@/src/constants/design-tokens";
import AddressFormSection from "@/src/features/address-entry/components/AddressFormSection";
import { useAddAddressMutation } from "@/src/features/addresses/hooks/useAddAddressMutation";
import { addAddressSchema } from "@/src/features/addresses/schemas/form.schema";
import { LocationSnapshot } from "@/src/features/location-picker/components/LocationSnapshot";
import { usePickedLocationStore } from "@/src/features/location-picker/stores/picked-location-store";
import { useFormValidation } from "@/src/hooks/useFormValidation";
import { getErrorMessage } from "@/src/lib/errors";
import { ROUTES } from "@/src/lib/navigation";
import { useLocationStore } from "@/src/stores/location-store";

function finiteOrNull(value: string | string[] | undefined): number | null {
	const raw = Array.isArray(value) ? value[0] : value;
	if (raw == null) return null;
	const n = Number(raw);
	return Number.isFinite(n) ? n : null;
}

export default function AddAddressScreen() {
	const { t } = useTranslation("addresses");
	const themeColors = useThemeColors();
	const params = useLocalSearchParams<{
		latitude?: string;
		longitude?: string;
	}>();

	// Coords are optional now: the screen can open from "Use current location"
	// (params present) OR "Set on map" (none → pick on the map first).
	const initialLat = finiteOrNull(params.latitude);
	const initialLng = finiteOrNull(params.longitude);
	const [coords, setCoords] = useState<{
		latitude: number;
		longitude: number;
	} | null>(
		initialLat != null && initialLng != null
			? { latitude: initialLat, longitude: initialLng }
			: null,
	);

	const [city, setCity] = useState("");
	const [street, setStreet] = useState("");
	const [buildingNumber, setBuildingNumber] = useState("");
	const [apartmentNumber, setApartmentNumber] = useState("");

	const { fieldErrors, clearFieldError, validate } = useFormValidation(
		addAddressSchema(t),
	);
	const addMutation = useAddAddressMutation();

	// Adopt a point chosen on the map picker (preserves typed fields), then clear.
	const picked = usePickedLocationStore((state) => state.coords);
	const clearPicked = usePickedLocationStore((state) => state.clear);
	useEffect(() => {
		if (picked) {
			setCoords(picked);
			clearPicked();
		}
	}, [picked, clearPicked]);

	const requestLocation = useLocationStore(
		(state) => state.requestLocationPermission,
	);
	const isLocating = useLocationStore((state) => state.isLoading);

	const handleUseCurrentLocation = useCallback(async () => {
		await requestLocation();
		const location = useLocationStore.getState().location;
		if (location) setCoords(location);
	}, [requestLocation]);

	const openPicker = useCallback(() => {
		router.push(ROUTES.user.profileAddressPickLocation(coords ?? undefined));
	}, [coords]);

	const handleSubmit = useCallback(() => {
		if (!coords) return;
		const result = validate({ city, street, buildingNumber, apartmentNumber });
		if (!result.success) return;

		addMutation.mutate(
			{
				city: result.data.city,
				street: result.data.street,
				building_no: result.data.buildingNumber || undefined,
				apartment_no: result.data.apartmentNumber || undefined,
				latitude: coords.latitude,
				longitude: coords.longitude,
			},
			{ onSuccess: () => router.back() },
		);
	}, [
		coords,
		city,
		street,
		buildingNumber,
		apartmentNumber,
		validate,
		addMutation,
	]);

	return (
		<ScreenSafeAreaView
			className="flex-1"
			style={{ backgroundColor: themeColors.surfaceBase }}
		>
			<PageHeader title={t("form.title")} variant="surface" />

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
				{/* Location: snapshot when set (tap to adjust), else pick options. */}
				{coords ? (
					<LocationSnapshot
						latitude={coords.latitude}
						longitude={coords.longitude}
						onPress={openPicker}
					/>
				) : (
					<View className="gap-stack-sm">
						<Button
							variant="primary"
							fullWidth
							iconLeft={MapIcon}
							onPress={openPicker}
							accessibilityLabel={t("form.setOnMap")}
						>
							{t("form.setOnMap")}
						</Button>
						<Button
							variant="secondary"
							fullWidth
							iconLeft={Navigation}
							onPress={handleUseCurrentLocation}
							loading={isLocating}
							disabled={isLocating}
							accessibilityLabel={t("addSheet.useCurrentLocation")}
						>
							{t("addSheet.useCurrentLocation")}
						</Button>
					</View>
				)}

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
					streetLabel={t("form.street")}
					showIcons={false}
				/>

				{addMutation.isError && (
					<Text
						variant="bodySm"
						className="text-center"
						style={{ color: Colors.danger }}
					>
						{getErrorMessage(addMutation.error)}
					</Text>
				)}

				<Button
					onPress={handleSubmit}
					disabled={addMutation.isPending || !coords}
					className="w-full rounded-button"
				>
					{addMutation.isPending ? (
						<ActivityIndicator
							size="small"
							color={themeColors.surfaceOnPrimary}
						/>
					) : (
						<Text variant="buttonLg">{t("form.save")}</Text>
					)}
				</Button>
			</KeyboardAwareScrollView>
		</ScreenSafeAreaView>
	);
}

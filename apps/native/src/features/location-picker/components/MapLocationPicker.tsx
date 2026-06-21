import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { LocateFixed, MapPin, X } from "lucide-react-native";
import { useRef } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, Pressable, StyleSheet, View } from "react-native";
import MapView, { PROVIDER_GOOGLE, type Region } from "react-native-maps";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { Button } from "@/src/components/ui/button";
import { Text } from "@/src/components/ui/text";
import { useThemeColors } from "@/src/constants/design-tokens";
import { useLocationStore } from "@/src/stores/location-store";
import { usePickedLocationStore } from "../stores/picked-location-store";

// Cairo — final fallback when there are no route coords and no GPS fix yet.
const CAIRO: Region = {
	latitude: 30.0444,
	longitude: 31.2357,
	latitudeDelta: 0.05,
	longitudeDelta: 0.05,
};
const ZOOM_DELTA = 0.01;

/** First finite number from an Expo route param (which may be absent or an array). */
function firstFinite(value: string | string[] | undefined): number | null {
	const raw = Array.isArray(value) ? value[0] : value;
	if (raw == null) return null;
	const n = Number(raw);
	return Number.isFinite(n) ? n : null;
}

/**
 * Full-screen Google map with a fixed centre pin (the map pans under it).
 * Confirm hands the centre coords back to the form via the transient picked-
 * location store, then pops. Used by both the user and technician add-address
 * flows through thin role-scoped route wrappers.
 */
export default function MapLocationPicker() {
	const router = useRouter();
	const { t } = useTranslation("addresses");
	const colors = useThemeColors();
	const insets = useSafeAreaInsets();
	const mapRef = useRef<MapView>(null);

	const setPicked = usePickedLocationStore((s) => s.setCoords);
	const requestLocation = useLocationStore((s) => s.requestLocationPermission);
	const isLocating = useLocationStore((s) => s.isLoading);

	const params = useLocalSearchParams<{
		lat?: string | string[];
		lng?: string | string[];
		next?: string | string[];
	}>();
	const paramLat = firstFinite(params.lat);
	const paramLng = firstFinite(params.lng);
	// When present, confirm replaces this screen with the form route (carrying the
	// coords) instead of handing back via the store + pop.
	const nextRaw = Array.isArray(params.next) ? params.next[0] : params.next;
	const next = nextRaw || null;

	// Initial region precedence: route coords → current GPS → Cairo default.
	const storeLocation = useLocationStore.getState().location;
	let initialRegion: Region;
	if (paramLat != null && paramLng != null) {
		initialRegion = {
			latitude: paramLat,
			longitude: paramLng,
			latitudeDelta: ZOOM_DELTA,
			longitudeDelta: ZOOM_DELTA,
		};
	} else if (storeLocation) {
		initialRegion = {
			latitude: storeLocation.latitude,
			longitude: storeLocation.longitude,
			latitudeDelta: ZOOM_DELTA,
			longitudeDelta: ZOOM_DELTA,
		};
	} else {
		initialRegion = CAIRO;
	}

	// Latest map centre — updated as the user pans; read on confirm.
	const centerRef = useRef({
		latitude: initialRegion.latitude,
		longitude: initialRegion.longitude,
	});

	const handleRecenter = async () => {
		await requestLocation();
		const { location, permissionStatus } = useLocationStore.getState();
		if (location) {
			mapRef.current?.animateToRegion(
				{
					latitude: location.latitude,
					longitude: location.longitude,
					latitudeDelta: ZOOM_DELTA,
					longitudeDelta: ZOOM_DELTA,
				},
				500,
			);
		} else if (permissionStatus === "denied") {
			Toast.show({ type: "info", text1: t("picker.permissionDenied") });
		}
	};

	const handleConfirm = () => {
		const center = centerRef.current;
		if (next) {
			router.replace({
				pathname: next as "/user/profile/addresses/new",
				params: {
					latitude: String(center.latitude),
					longitude: String(center.longitude),
				},
			});
			return;
		}
		setPicked({ ...center });
		router.back();
	};

	return (
		<View style={{ flex: 1 }}>
			<Stack.Screen options={{ headerShown: false }} />
			<MapView
				ref={mapRef}
				provider={PROVIDER_GOOGLE}
				style={StyleSheet.absoluteFill}
				initialRegion={initialRegion}
				onRegionChangeComplete={(r) => {
					centerRef.current = {
						latitude: r.latitude,
						longitude: r.longitude,
					};
				}}
				showsUserLocation
				showsMyLocationButton={false}
			/>

			{/* Fixed centre pin — tip points at the map centre. */}
			<View pointerEvents="none" style={styles.pinLayer}>
				<View style={{ transform: [{ translateY: -18 }] }}>
					<MapPin
						size={42}
						color={colors.primary}
						fill={colors.primary}
						strokeWidth={1.5}
					/>
				</View>
			</View>

			{/* Top bar: cancel + title. */}
			<View
				style={[
					styles.topBar,
					{ top: insets.top + 8, backgroundColor: colors.surfaceBase },
				]}
			>
				<Pressable
					onPress={() => router.back()}
					accessibilityRole="button"
					accessibilityLabel={t("picker.cancel")}
					hitSlop={10}
				>
					<X size={22} color={colors.textPrimary} strokeWidth={2} />
				</Pressable>
				<Text
					variant="body"
					className="font-bold text-content"
					numberOfLines={1}
					style={{ flex: 1 }}
				>
					{t("picker.title")}
				</Text>
			</View>

			{/* Recenter FAB. */}
			<Pressable
				onPress={handleRecenter}
				accessibilityRole="button"
				accessibilityLabel={t("picker.recenter")}
				disabled={isLocating}
				style={[
					styles.fab,
					{
						bottom: insets.bottom + 96,
						backgroundColor: colors.surfaceBase,
						borderColor: colors.borderDefault,
					},
				]}
			>
				{isLocating ? (
					<ActivityIndicator size="small" color={colors.primary} />
				) : (
					<LocateFixed size={22} color={colors.primary} strokeWidth={2} />
				)}
			</Pressable>

			{/* Confirm. */}
			<View
				style={{
					position: "absolute",
					left: 16,
					right: 16,
					bottom: insets.bottom + 16,
				}}
			>
				<Button onPress={handleConfirm} fullWidth size="lg">
					<Text variant="buttonLg" className="text-surface-on-primary">
						{t("picker.confirm")}
					</Text>
				</Button>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	pinLayer: {
		position: "absolute",
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		alignItems: "center",
		justifyContent: "center",
	},
	topBar: {
		position: "absolute",
		left: 16,
		right: 16,
		flexDirection: "row",
		alignItems: "center",
		gap: 12,
		paddingHorizontal: 14,
		paddingVertical: 12,
		borderRadius: 14,
	},
	fab: {
		position: "absolute",
		right: 16,
		width: 48,
		height: 48,
		borderRadius: 24,
		alignItems: "center",
		justifyContent: "center",
		borderWidth: StyleSheet.hairlineWidth,
	},
});

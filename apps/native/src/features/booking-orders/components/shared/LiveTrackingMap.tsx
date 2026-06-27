// Inline live-tracking map card used by both the user and technician tracking
// stages. Shows two markers — "you" (self) and the other party (target) — with
// a straight line between them and a camera that auto-fits both points.
//
// Self position: when a `self` coord is passed the map uses it and starts no
// watcher (de-dup seam for screens that already watch GPS). Otherwise it runs
// one throttled foreground watcher. Foreground permission is guaranteed on any
// screen behind the root LocationGate (see hooks/useLocationGate.ts), so no
// in-component prompt is needed.
//
// Marker movement is discrete: the target marker snaps to each new coordinate
// (realtime pings are ~30s apart). The only animation is the camera fit.

import * as Location from "expo-location";
import { type ReactNode, useEffect, useRef, useState } from "react";
import { StyleSheet, useWindowDimensions, View } from "react-native";
import MapView, {
	Marker,
	Polyline,
	PROVIDER_GOOGLE,
	type Region,
} from "react-native-maps";
import { Text } from "@/src/components/ui/text";
import {
	elevation,
	shadowStyle,
	space,
	useThemeColors,
} from "@/src/constants/design-tokens";
import { useLocationStore } from "@/src/stores/location-store";

export interface LatLng {
	readonly latitude: number;
	readonly longitude: number;
}

interface Props {
	/** The other party's coordinate (technician for the user, customer for the tech). */
	readonly target: LatLng | null;
	/** Marker label for the device owner. */
	readonly selfLabel: string;
	/** Marker label for the other party. */
	readonly targetLabel: string;
	/** Caption rendered under the map (e.g. the distance/ETA pill). */
	readonly caption?: ReactNode;
	/** When provided, the map uses this instead of starting its own GPS watcher. */
	readonly self?: LatLng | null;
	/** Empty-state copy shown until the target coordinate is known. */
	readonly waitingLabel: string;
	/**
	 * Full-bleed mode: the map spans the screen width (cancels the host's
	 * horizontal padding) and fills most of the viewport height, with the
	 * caption floating over it. Default `false` renders the compact card.
	 */
	readonly fill?: boolean;
	/** Horizontal padding (px) of the host to cancel in fill mode. */
	readonly hostPaddingX?: number;
	/**
	 * Screen mode: the map IS the screen — it fills its parent absolutely with no
	 * card, rounding, or caption. Used by the tracking screen, where a floating
	 * sheet (not this caption) carries the details. Overrides `fill`.
	 */
	readonly screen?: boolean;
	/**
	 * Extra bottom camera-fit padding (px) in screen mode, so both markers settle
	 * above the floating sheet instead of behind it.
	 */
	readonly bottomFitInset?: number;
}

// Cairo — final fallback before any fix is available. Mirrors MapLocationPicker.
const CAIRO: Region = {
	latitude: 30.0444,
	longitude: 31.2357,
	latitudeDelta: 0.05,
	longitudeDelta: 0.05,
};
const ZOOM_DELTA = 0.02;
const MAP_HEIGHT = 240;
const FIT_PADDING = { top: 64, right: 64, bottom: 64, left: 64 };

function regionFor(coord: LatLng): Region {
	return {
		latitude: coord.latitude,
		longitude: coord.longitude,
		latitudeDelta: ZOOM_DELTA,
		longitudeDelta: ZOOM_DELTA,
	};
}

export default function LiveTrackingMap({
	target,
	selfLabel,
	targetLabel,
	caption,
	self: selfOverride,
	waitingLabel,
	fill = false,
	hostPaddingX = space[4],
	screen = false,
	bottomFitInset = 0,
}: Props) {
	const colors = useThemeColors();
	const mapRef = useRef<MapView>(null);
	const { height: windowHeight } = useWindowDimensions();
	// Fill mode fills most of the viewport (leaving room for the header, stage
	// pills, hero and sticky CTA); the compact card keeps its fixed height.
	const mapHeight = fill
		? Math.max(380, Math.round(windowHeight * 0.62))
		: MAP_HEIGHT;
	// Camera fit padding: in screen mode reserve room at the top (floating back +
	// status bar) and at the bottom (the floating sheet) so neither marker hides.
	const fitPadding = screen
		? { top: 96, right: 56, bottom: 56 + bottomFitInset, left: 56 }
		: FIT_PADDING;

	// Self position: prefer the override; otherwise watch our own GPS.
	const [watchedSelf, setWatchedSelf] = useState<LatLng | null>(
		() => useLocationStore.getState().location,
	);
	const self = selfOverride ?? watchedSelf;

	useEffect(() => {
		// The caller owns the position — don't open a second watcher.
		if (selfOverride) return;

		let cancelled = false;
		let subscription: Location.LocationSubscription | null = null;

		(async () => {
			const { status } = await Location.getForegroundPermissionsAsync();
			if (cancelled || status !== "granted") return;
			subscription = await Location.watchPositionAsync(
				{
					accuracy: Location.Accuracy.Balanced,
					distanceInterval: 25,
					timeInterval: 5000,
				},
				(pos) => {
					if (cancelled) return;
					setWatchedSelf({
						latitude: pos.coords.latitude,
						longitude: pos.coords.longitude,
					});
				},
			);
		})();

		return () => {
			cancelled = true;
			subscription?.remove();
		};
	}, [selfOverride]);

	// Auto-fit the camera whenever either point moves.
	useEffect(() => {
		if (self && target) {
			mapRef.current?.fitToCoordinates([self, target], {
				edgePadding: fitPadding,
				animated: true,
			});
		} else {
			const only = self ?? target;
			if (only) mapRef.current?.animateToRegion(regionFor(only), 400);
		}
	}, [
		self?.latitude,
		self?.longitude,
		target?.latitude,
		target?.longitude,
	]);

	const initialRegion = regionFor(target ?? self ?? CAIRO);

	const mapBox = (
		<View
			className={
				fill || screen
					? "overflow-hidden bg-surface-muted"
					: "overflow-hidden rounded-card bg-surface-muted"
			}
			style={
				screen
					? { flex: 1 }
					: fill
						? { height: mapHeight, marginHorizontal: -hostPaddingX }
						: { height: mapHeight }
			}
		>
				<MapView
					ref={mapRef}
					provider={PROVIDER_GOOGLE}
					style={StyleSheet.absoluteFill}
					initialRegion={initialRegion}
					pitchEnabled={false}
					rotateEnabled={false}
					toolbarEnabled={false}
				>
					{self ? (
						<Marker
							coordinate={self}
							title={selfLabel}
							anchor={{ x: 0.5, y: 0.5 }}
						>
							<View
								style={[
									styles.dot,
									styles.selfDot,
									{
										backgroundColor: colors.primary,
										borderColor: colors.surfaceBase,
									},
								]}
							/>
						</Marker>
					) : null}

					{target ? (
						<Marker
							coordinate={target}
							title={targetLabel}
							anchor={{ x: 0.5, y: 0.5 }}
						>
							<View
								style={[
									styles.dot,
									styles.targetDot,
									{
										backgroundColor: colors.surfaceBase,
										borderColor: colors.primary,
									},
								]}
							>
								<View
									style={[
										styles.targetCore,
										{ backgroundColor: colors.primary },
									]}
								/>
							</View>
						</Marker>
					) : null}

					{self && target ? (
						<Polyline
							coordinates={[self, target]}
							strokeColor={colors.primary}
							strokeWidth={3}
							lineDashPattern={[2, 6]}
						/>
					) : null}
				</MapView>

				{!target ? (
					<View
						style={[
							StyleSheet.absoluteFill,
							styles.waitingOverlay,
							{ backgroundColor: `${colors.surfaceBase}CC` },
						]}
						pointerEvents="none"
					>
						<Text variant="bodySm" style={{ color: colors.textSecondary }}>
							{waitingLabel}
						</Text>
					</View>
				) : null}

				{fill && caption ? (
					<View style={styles.captionFloat} pointerEvents="box-none">
						<View
							className="rounded-full"
							style={[
								{ backgroundColor: colors.surfaceBase },
								shadowStyle(elevation.raised, { shadowColor: colors.shadow }),
							]}
						>
							{caption}
						</View>
					</View>
				) : null}
			</View>
	);

	if (fill || screen) return mapBox;

	return (
		<View style={{ gap: space[3] }}>
			{mapBox}
			{caption}
		</View>
	);
}

const styles = StyleSheet.create({
	dot: {
		alignItems: "center",
		justifyContent: "center",
	},
	selfDot: {
		width: 18,
		height: 18,
		borderRadius: 9,
		borderWidth: 3,
	},
	targetDot: {
		width: 24,
		height: 24,
		borderRadius: 12,
		borderWidth: 3,
	},
	targetCore: {
		width: 8,
		height: 8,
		borderRadius: 4,
	},
	waitingOverlay: {
		alignItems: "center",
		justifyContent: "center",
	},
	captionFloat: {
		position: "absolute",
		top: space[3],
		left: space[4],
		right: space[4],
		alignItems: "flex-start",
	},
});

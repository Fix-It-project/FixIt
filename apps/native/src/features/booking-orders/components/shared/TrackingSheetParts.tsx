// Shared building blocks for the tracking sheet (used by both the user and
// technician tracking screens): the counterparty row with a tap-to-call button,
// and the live distance/ETA status line.

import { Info, MapPin, Phone } from "lucide-react-native";
import type { ReactNode } from "react";
import { Linking, Pressable, View } from "react-native";
import { Text } from "@/src/components/ui/text";
import {
	elevation,
	shadowStyle,
	space,
	spacing,
	useThemeColors,
} from "@/src/constants/design-tokens";
import OrderIdentityRow from "@/src/features/booking-orders/components/state-machine/shared/OrderIdentityRow";
import StageProgressBar from "@/src/features/booking-orders/components/state-machine/shared/StageProgressBar";
import { formatCurrency } from "@/src/features/booking-orders/utils/format-currency";

interface PartyRowProps {
	readonly name: string;
	readonly imageUrl: string | null;
	readonly initials: string;
	readonly avatarColor: string;
	readonly roleLabel: string;
	readonly ratingTechnicianId?: string | null;
	readonly phone: string | null;
	readonly callLabel: string;
	readonly onInfoPress?: () => void;
	readonly infoLabel?: string;
}

const BTN_SIZE = 44;

function RoundIconButton({
	onPress,
	label,
	children,
}: {
	readonly onPress: () => void;
	readonly label: string;
	readonly children: ReactNode;
}) {
	// Bare icon, no circular background/border — just a tap target.
	return (
		<Pressable
			accessibilityRole="button"
			accessibilityLabel={label}
			onPress={onPress}
			style={{
				width: BTN_SIZE,
				height: BTN_SIZE,
				alignItems: "center",
				justifyContent: "center",
			}}
		>
			{children}
		</Pressable>
	);
}

export function TrackingPartyRow({
	name,
	imageUrl,
	initials,
	avatarColor,
	roleLabel,
	ratingTechnicianId,
	phone,
	callLabel,
	onInfoPress,
	infoLabel,
}: PartyRowProps) {
	const colors = useThemeColors();
	return (
		<View style={{ flexDirection: "row", alignItems: "center", gap: space[2] }}>
			<View style={{ flex: 1 }}>
				<OrderIdentityRow
					name={name}
					imageUrl={imageUrl}
					initials={initials}
					avatarColor={avatarColor}
					roleLabel={roleLabel}
					ratingTechnicianId={ratingTechnicianId}
					showChevron={false}
				/>
			</View>
			{phone ? (
				<RoundIconButton
					onPress={() => Linking.openURL(`tel:${phone}`)}
					label={callLabel}
				>
					<Phone
						size={spacing.icon.sm}
						color={colors.primary}
						strokeWidth={2.4}
					/>
				</RoundIconButton>
			) : null}
			{onInfoPress ? (
				<RoundIconButton onPress={onInfoPress} label={infoLabel ?? ""}>
					<Info
						size={spacing.icon.sm}
						color={colors.primary}
						strokeWidth={2.4}
					/>
				</RoundIconButton>
			) : null}
		</View>
	);
}

/** Inspection-fee row pinned at the bottom of the sheet (label · amount). */
export function InspectionFeeRow({
	label,
	amount,
}: {
	readonly label: string;
	readonly amount: number | null | undefined;
}) {
	const colors = useThemeColors();
	if (typeof amount !== "number") return null;
	return (
		<View
			style={{
				flexDirection: "row",
				alignItems: "center",
				justifyContent: "space-between",
				paddingTop: space[3],
				borderTopWidth: 1,
				borderTopColor: colors.borderDefault,
			}}
		>
			<Text variant="bodySm" style={{ color: colors.textMuted }}>
				{label}
			</Text>
			<Text
				variant="body"
				className="font-google-sans-bold"
				style={{ color: colors.textPrimary }}
			>
				{formatCurrency(amount)}
			</Text>
		</View>
	);
}

/** Floating card over the map: a single destination address (technician side). */
export function TrackingDestinationCard({
	label,
	address,
}: {
	readonly label: string;
	readonly address: string;
}) {
	const colors = useThemeColors();
	return (
		<View
			className="rounded-card"
			style={[
				{
					flexDirection: "row",
					alignItems: "center",
					gap: space[2],
					paddingHorizontal: space[3],
					paddingVertical: space[3],
					backgroundColor: colors.surfaceBase,
				},
				shadowStyle(elevation.raised, { shadowColor: colors.shadow }),
			]}
		>
			<MapPin size={spacing.icon.sm} color={colors.primary} strokeWidth={2.2} />
			<View style={{ flex: 1 }}>
				<Text variant="caption" style={{ color: colors.textMuted }}>
					{label}
				</Text>
				<Text
					variant="bodySm"
					className="font-google-sans-bold"
					style={{ color: colors.textPrimary }}
					numberOfLines={1}
				>
					{address}
				</Text>
			</View>
		</View>
	);
}

/** Floating stage-progress pills over the map (tracking is always step 1). */
export function TrackingStagePills({
	labels,
}: {
	readonly labels: readonly string[];
}) {
	const colors = useThemeColors();
	return (
		<View
			className="rounded-card"
			style={[
				{ backgroundColor: colors.surfaceBase, paddingVertical: space[1] },
				shadowStyle(elevation.raised, { shadowColor: colors.shadow }),
			]}
		>
			<StageProgressBar
				stepIndex={1}
				stepCount={labels.length}
				labels={labels}
			/>
		</View>
	);
}

export function TrackingStatusLine({ text }: { readonly text: string }) {
	const colors = useThemeColors();
	return (
		<View style={{ flexDirection: "row", alignItems: "center", gap: space[2] }}>
			<MapPin
				size={spacing.icon.caption}
				color={colors.primary}
				strokeWidth={2.4}
			/>
			<Text
				variant="bodySm"
				className="font-google-sans-bold"
				style={{ color: colors.textSecondary }}
			>
				{text}
			</Text>
		</View>
	);
}

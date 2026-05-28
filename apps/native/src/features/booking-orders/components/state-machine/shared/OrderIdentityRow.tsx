// Counterparty identity row (avatar + name + rating + chevron) for
// OrderInfoCompact.

import { Image } from "expo-image";
import { ChevronRight } from "lucide-react-native";
import { View } from "react-native";
import { Text } from "@/src/components/ui/text";
import { space, spacing, useThemeColors } from "@/src/constants/design-tokens";
import RatingChip from "./RatingChip";

const AVATAR_SIZE = 44;

interface OrderIdentityRowProps {
	readonly name: string;
	readonly imageUrl: string | null;
	readonly initials: string;
	readonly avatarColor: string;
	readonly roleLabel: string;
	/** Technician id — when set, renders the rating chip beside the name. */
	readonly ratingTechnicianId?: string | null;
	readonly showChevron: boolean;
}

export default function OrderIdentityRow({
	name,
	imageUrl,
	initials,
	avatarColor,
	roleLabel,
	ratingTechnicianId,
	showChevron,
}: OrderIdentityRowProps) {
	const themeColors = useThemeColors();

	return (
		<View
			style={{ flexDirection: "row", alignItems: "center", gap: space[3] }}
		>
			{imageUrl ? (
				<Image
					source={{ uri: imageUrl }}
					contentFit="cover"
					style={{
						width: AVATAR_SIZE,
						height: AVATAR_SIZE,
						borderRadius: AVATAR_SIZE / 2,
						backgroundColor: themeColors.surfaceElevated,
					}}
				/>
			) : (
				<View
					style={{
						width: AVATAR_SIZE,
						height: AVATAR_SIZE,
						borderRadius: AVATAR_SIZE / 2,
						alignItems: "center",
						justifyContent: "center",
						backgroundColor: avatarColor,
					}}
				>
					<Text
						variant="bodySm"
						className="font-google-sans-bold"
						style={{ color: themeColors.surfaceBase }}
					>
						{initials}
					</Text>
				</View>
			)}
			<View style={{ flex: 1, gap: space[1] }}>
				<View
					style={{ flexDirection: "row", alignItems: "center", gap: space[2] }}
				>
					<Text
						variant="body"
						className="font-google-sans-bold"
						style={{ color: themeColors.textPrimary }}
						numberOfLines={1}
					>
						{name}
					</Text>
					{ratingTechnicianId ? (
						<RatingChip technicianId={ratingTechnicianId} />
					) : null}
				</View>
				<Text
					variant="caption"
					style={{ color: themeColors.textMuted }}
					numberOfLines={1}
				>
					{roleLabel}
				</Text>
			</View>
			{showChevron ? (
				<ChevronRight
					size={spacing.icon.sm}
					color={themeColors.textMuted}
					strokeWidth={2.2}
				/>
			) : null}
		</View>
	);
}

import { MapPin } from "lucide-react-native";
import { TouchableOpacity, View } from "react-native";
import { RadioGroupItem } from "@/src/components/ui/radio-group";
import { Text } from "@/src/components/ui/text";
import { useThemeColors } from "@/src/constants/design-tokens";
import type { Address } from "@/src/features/addresses/schemas/response.schema";

interface AddressListItemProps {
	readonly address: Address;
	readonly isActive: boolean;
	readonly onPress: () => void;
	readonly disabled?: boolean;
	readonly onDelete?: () => void;
	/** Dim + disable the delete action (e.g. the active address can't be deleted). */
	readonly deleteDisabled?: boolean;
	readonly deleteLabel?: string;
}

/**
 * One selectable address row. Selection is driven by a `RadioGroupItem`
 * (the parent must render it inside a `<RadioGroup>`); the row body is also
 * tappable. An optional delete action sits at the trailing edge.
 */
export default function AddressListItem({
	address,
	isActive,
	onPress,
	disabled = false,
	onDelete,
	deleteDisabled = false,
	deleteLabel,
}: AddressListItemProps) {
	const themeColors = useThemeColors();

	const detailParts = [address.building_no, address.apartment_no].filter(
		Boolean,
	);

	return (
		<View
			className="flex-row items-center gap-list-row py-list-row-comfortable-y"
			style={{ opacity: disabled ? 0.5 : 1 }}
		>
			<TouchableOpacity
				onPress={onPress}
				disabled={disabled || isActive}
				activeOpacity={0.7}
				className="flex-1 flex-row items-center gap-list-row"
			>
				<View
					className="h-control-icon-box-md w-control-icon-box-md items-center justify-center rounded-pill"
					style={{ backgroundColor: themeColors.surfaceElevated }}
				>
					<MapPin size={18} color={themeColors.textSecondary} strokeWidth={2} />
				</View>

				<View className="flex-1">
					<Text variant="buttonLg" className="text-content" numberOfLines={1}>
						{address.city}
					</Text>
					<Text
						variant="bodySm"
						className="mt-stack-xs text-content-secondary"
						numberOfLines={2}
					>
						{address.street}
						{detailParts.length > 0 ? `, ${detailParts.join(", ")}` : ""}
					</Text>
				</View>

				<RadioGroupItem value={address.id} disabled={disabled} />
			</TouchableOpacity>

			{onDelete ? (
				<TouchableOpacity
					onPress={onDelete}
					disabled={disabled || deleteDisabled}
					activeOpacity={0.7}
					className="rounded-button px-stack-sm py-stack-xs"
					style={{
						backgroundColor: themeColors.dangerLight,
						opacity: deleteDisabled ? 0.4 : 1,
					}}
				>
					<Text variant="caption" style={{ color: themeColors.danger }}>
						{deleteLabel}
					</Text>
				</TouchableOpacity>
			) : null}
		</View>
	);
}

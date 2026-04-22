import { X } from "lucide-react-native";
import {
	ActivityIndicator,
	Modal,
	Pressable,
	TextInput,
	TouchableOpacity,
	View,
} from "react-native";
import { Text } from "@/src/components/ui/text";
import { fontFamily, radius, useThemeColors } from "@/src/lib/theme";

function withAlpha(hexColor: string, alpha: number) {
	const normalized = hexColor.replace("#", "");
	if (normalized.length !== 6) return hexColor;
	const r = Number.parseInt(normalized.slice(0, 2), 16);
	const g = Number.parseInt(normalized.slice(2, 4), 16);
	const b = Number.parseInt(normalized.slice(4, 6), 16);
	return `rgba(${r},${g},${b},${alpha})`;
}

interface Props {
	readonly confirmLabel: string;
	readonly isLoading: boolean;
	readonly onClose: () => void;
	readonly onConfirm: () => void;
	readonly onReasonChange: (text: string) => void;
	readonly reason: string;
	readonly subjectFallback: string;
	readonly subjectName: string | null | undefined;
	readonly subjectRole: string;
	readonly title: string;
	readonly visible: boolean;
}

export default function CancelReasonModal({
	confirmLabel,
	isLoading,
	onClose,
	onConfirm,
	onReasonChange,
	reason,
	subjectFallback,
	subjectName,
	subjectRole,
	title,
	visible,
}: Props) {
	const themeColors = useThemeColors();

	return (
		<Modal
			visible={visible}
			transparent
			animationType="fade"
			onRequestClose={onClose}
		>
			<Pressable
				style={{
					flex: 1,
					backgroundColor: withAlpha(themeColors.shadow, 0.45),
					justifyContent: "center",
					alignItems: "center",
				}}
				onPress={onClose}
			>
				<Pressable
					onPress={() => {}}
					className="w-[88%] rounded-sheet p-sheet"
					style={{ backgroundColor: themeColors.surfaceBase }}
				>
					<View className="mb-4 flex-row items-center justify-between">
						<Text variant="h3" style={{ color: themeColors.textPrimary }}>
							{title}
						</Text>
						<TouchableOpacity
							onPress={onClose}
							className="h-8 w-8 items-center justify-center rounded-full"
							style={{ backgroundColor: themeColors.surfaceElevated }}
						>
							<X size={16} color={themeColors.textSecondary} />
						</TouchableOpacity>
					</View>

					<Text
						variant="bodySm"
						className="mb-4"
						style={{ color: themeColors.textSecondary }}
					>
						Are you sure you want to cancel the {subjectRole} with{" "}
						<Text
							variant="bodySm"
							className="font-semibold"
							style={{ color: themeColors.textPrimary }}
						>
							{subjectName ?? subjectFallback}
						</Text>
						?
					</Text>

					<TextInput
						value={reason}
						onChangeText={onReasonChange}
						placeholder="Reason for cancellation (optional)"
						placeholderTextColor={themeColors.textMuted}
						multiline
						numberOfLines={3}
						className="mb-4 rounded-xl border px-4 py-3 text-sm"
						style={{
							borderWidth: 1,
							borderColor: themeColors.borderDefault,
							borderRadius: radius.button,
							fontFamily: fontFamily.regular,
							color: themeColors.textPrimary,
							textAlignVertical: "top",
							minHeight: 80,
						}}
					/>

					<View className="flex-row gap-2.5">
						<TouchableOpacity
							onPress={onClose}
							className="flex-1 items-center rounded-xl border py-3"
							style={{
								borderWidth: 1,
								borderColor: themeColors.borderDefault,
								backgroundColor: themeColors.surfaceBase,
							}}
							activeOpacity={0.7}
						>
							<Text
								variant="buttonMd"
								style={{ color: themeColors.textPrimary }}
							>
								Keep
							</Text>
						</TouchableOpacity>

						<TouchableOpacity
							onPress={onConfirm}
							disabled={isLoading}
							className="flex-1 items-center rounded-xl py-3"
							style={{
								backgroundColor: isLoading
									? themeColors.borderDefault
									: themeColors.danger,
							}}
							activeOpacity={0.85}
						>
							{isLoading ? (
								<ActivityIndicator
									size="small"
									color={themeColors.surfaceBase}
								/>
							) : (
								<Text
									variant="buttonMd"
									style={{ color: themeColors.surfaceBase }}
								>
									{confirmLabel}
								</Text>
							)}
						</TouchableOpacity>
					</View>
				</Pressable>
			</Pressable>
		</Modal>
	);
}

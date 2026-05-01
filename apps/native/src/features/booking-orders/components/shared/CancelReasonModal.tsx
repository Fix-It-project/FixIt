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
import { radius, typography, useThemeColors } from "@/src/lib/theme";

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
					backgroundColor: themeColors.backdrop,
					justifyContent: "center",
					alignItems: "center",
				}}
				onPress={onClose}
			>
				<Pressable
					onPress={() => {}}
					className="w-modal rounded-sheet p-sheet"
					style={{ backgroundColor: themeColors.surfaceBase }}
				>
					<View className="mb-stack-lg flex-row items-center justify-between">
						<Text variant="h3" style={{ color: themeColors.textPrimary }}>
							{title}
						</Text>
						<TouchableOpacity
							onPress={onClose}
							className="h-control-icon-box-sm w-control-icon-box-sm items-center justify-center rounded-pill"
							style={{ backgroundColor: themeColors.surfaceElevated }}
						>
							<X size={16} color={themeColors.textSecondary} />
						</TouchableOpacity>
					</View>

					<Text
						variant="bodySm"
						className="mb-stack-lg"
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
						className="mb-stack-lg rounded-input border px-card py-stack-md text-sm"
						style={{
							...typography.bodySm,
							borderColor: themeColors.borderDefault,
							borderRadius: radius.button,
							color: themeColors.textPrimary,
							textAlignVertical: "top",
							minHeight: 80,
						}}
					/>

					<View className="flex-row gap-card-compact">
						<TouchableOpacity
							onPress={onClose}
							className="flex-1 items-center rounded-input border py-stack-md"
							style={{
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
							className="flex-1 items-center rounded-input py-stack-md"
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

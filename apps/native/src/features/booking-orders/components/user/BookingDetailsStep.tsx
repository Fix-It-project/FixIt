import * as ImagePicker from "expo-image-picker";
import { Camera, Paperclip, X } from "lucide-react-native";
import { useState } from "react";
import {
	Image,
	KeyboardAvoidingView,
	Platform,
	ScrollView,
	TextInput,
	TouchableOpacity,
	View,
} from "react-native";
import { Button } from "@/src/components/ui/button";
import { Text } from "@/src/components/ui/text";
import { Colors, spacing, typography, useThemeColors } from "@/src/lib/theme";

export interface AttachmentInfo {
	uri: string;
	name: string;
	type: string;
}

interface BookingDetailsStepProps {
	readonly selectedDate: string;
	readonly onBack: () => void;
	readonly onConfirm: (
		description: string,
		attachment: AttachmentInfo | null,
	) => void;
	readonly isPending: boolean;
}

export default function BookingDetailsStep({
	selectedDate,
	onBack,
	onConfirm,
	isPending,
}: BookingDetailsStepProps) {
	const themeColors = useThemeColors();
	const [description, setDescription] = useState("");
	const [attachment, setAttachment] = useState<AttachmentInfo | null>(null);

	const pickImage = async () => {
		const result = await ImagePicker.launchImageLibraryAsync({
			mediaTypes: ["images"],
			quality: 0.8,
			allowsEditing: false,
		});

		if (!result.canceled && result.assets[0]) {
			const asset = result.assets[0];
			const name = asset.fileName ?? `photo_${Date.now()}.jpg`;
			const type = asset.mimeType ?? "image/jpeg";
			setAttachment({ uri: asset.uri, name, type });
		}
	};

	const takePhoto = async () => {
		const permission = await ImagePicker.requestCameraPermissionsAsync();
		if (!permission.granted) return;

		const result = await ImagePicker.launchCameraAsync({
			quality: 0.8,
			allowsEditing: false,
		});

		if (!result.canceled && result.assets[0]) {
			const asset = result.assets[0];
			const name = asset.fileName ?? `photo_${Date.now()}.jpg`;
			const type = asset.mimeType ?? "image/jpeg";
			setAttachment({ uri: asset.uri, name, type });
		}
	};

	return (
		<KeyboardAvoidingView
			className="flex-1"
			behavior={Platform.OS === "ios" ? "padding" : undefined}
			keyboardVerticalOffset={100}
		>
			<ScrollView
				className="flex-1 px-screen-x pt-card"
				showsVerticalScrollIndicator={false}
				keyboardShouldPersistTaps="handled"
				contentContainerStyle={{ flexGrow: 1 }}
			>
				{/* Date badge */}
				<View className="mb-stack-lg rounded-input bg-app-primary-light px-card py-control-trigger-y">
					<Text variant="buttonMd" className="text-center text-app-primary">
						Scheduled for: {selectedDate}
					</Text>
				</View>

				{/* Description */}
				<View className="mb-stack-lg">
					<Text variant="buttonLg" className="mb-stack-sm text-content">
						Describe the Problem
					</Text>
					<Text variant="caption" className="mb-stack-md text-content-muted">
						Optional — help the technician prepare for the job
					</Text>
					<TextInput
						value={description}
						onChangeText={setDescription}
						placeholder="e.g. AC not cooling, making noise when turned on..."
						placeholderTextColor={themeColors.textMuted}
						multiline
						numberOfLines={5}
						textAlignVertical="top"
						className="rounded-input border border-edge bg-surface px-card py-stack-md text-content"
						style={{
							...typography.bodySm,
							minHeight: spacing.button.height.xl + spacing.avatar.lg,
						}}
					/>
				</View>

				{/* Attachment */}
				<View className="mb-stack-lg">
					<Text variant="buttonLg" className="mb-stack-sm text-content">
						Attach a Photo
					</Text>
					<Text variant="caption" className="mb-stack-md text-content-muted">
						Optional — a photo can help diagnose the issue faster
					</Text>

					{attachment ? (
						<View className="overflow-hidden rounded-input border border-edge">
							<Image
								source={{ uri: attachment.uri }}
								className="h-media-attachment w-full"
								resizeMode="cover"
							/>
							<TouchableOpacity
								onPress={() => setAttachment(null)}
								className="absolute top-stack-sm right-stack-sm h-control-icon-box-sm w-control-icon-box-sm items-center justify-center rounded-pill bg-shadow/50"
								activeOpacity={0.7}
							>
								<X
									size={16}
									color={themeColors.surfaceBase}
									strokeWidth={2.5}
								/>
							</TouchableOpacity>
							<View className="px-stack-md py-stack-sm">
								<Text
									variant="caption"
									className="text-content-muted"
									numberOfLines={1}
								>
									{attachment.name}
								</Text>
							</View>
						</View>
					) : (
						<View className="flex-row gap-stack-md">
							<TouchableOpacity
								onPress={pickImage}
								className="flex-1 flex-row items-center justify-center gap-stack-sm rounded-input border border-edge border-dashed bg-surface py-card"
								activeOpacity={0.7}
							>
								<Paperclip size={18} color={Colors.primary} strokeWidth={2} />
								<Text variant="buttonMd" className="text-app-primary">
									Gallery
								</Text>
							</TouchableOpacity>

							<TouchableOpacity
								onPress={takePhoto}
								className="flex-1 flex-row items-center justify-center gap-stack-sm rounded-input border border-edge border-dashed bg-surface py-card"
								activeOpacity={0.7}
							>
								<Camera size={18} color={Colors.primary} strokeWidth={2} />
								<Text variant="buttonMd" className="text-app-primary">
									Camera
								</Text>
							</TouchableOpacity>
						</View>
					)}
				</View>

				{/* Spacer + buttons */}
				<View className="flex-1 justify-end pb-stack-xl">
					<Button
						onPress={() => onConfirm(description, attachment)}
						disabled={isPending}
						className="w-full"
					>
						<Text variant="buttonLg" className="text-surface-on-primary">
							{isPending ? "Submitting..." : "Confirm Booking"}
						</Text>
					</Button>

					<TouchableOpacity
						onPress={onBack}
						disabled={isPending}
						className="mt-stack-md items-center py-stack-sm"
						activeOpacity={0.7}
					>
						<Text variant="label" className="text-content-muted">
							Back to Date Selection
						</Text>
					</TouchableOpacity>
				</View>
			</ScrollView>
		</KeyboardAvoidingView>
	);
}

import * as ImagePicker from "expo-image-picker";
import { Camera, Paperclip, X } from "lucide-react-native";
import { Image, View } from "react-native";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Text } from "@/src/components/ui/text";
import { spacing, useThemeColors } from "@/src/constants/design-tokens";

export interface AttachmentInfo {
	uri: string;
	name: string;
	type: string;
}

interface BookingProblemCardProps {
	readonly description: string;
	readonly onDescriptionChange: (text: string) => void;
	readonly attachment: AttachmentInfo | null;
	readonly onAttachmentChange: (attachment: AttachmentInfo | null) => void;
}

export function BookingProblemCard({
	description,
	onDescriptionChange,
	attachment,
	onAttachmentChange,
}: BookingProblemCardProps) {
	const themeColors = useThemeColors();

	const pickImage = async () => {
		const result = await ImagePicker.launchImageLibraryAsync({
			mediaTypes: ["images"],
			quality: 0.8,
			allowsEditing: false,
		});
		if (!result.canceled && result.assets[0]) {
			const asset = result.assets[0];
			onAttachmentChange({
				uri: asset.uri,
				name: asset.fileName ?? `photo_${Date.now()}.jpg`,
				type: asset.mimeType ?? "image/jpeg",
			});
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
			onAttachmentChange({
				uri: asset.uri,
				name: asset.fileName ?? `photo_${Date.now()}.jpg`,
				type: asset.mimeType ?? "image/jpeg",
			});
		}
	};

	return (
		<View className="gap-stack-md">
			<View className="rounded-card border border-edge bg-card p-card-compact">
				<Text variant="buttonMd" className="font-semibold text-content">
					Describe the problem
				</Text>
				<Text variant="caption" className="mt-stack-xs text-content-muted">
					Optional. Helps the technician prepare.
				</Text>
				<Input
					value={description}
					onChangeText={onDescriptionChange}
					placeholder="e.g. AC not cooling, noisy when running..."
					multiline
					numberOfLines={4}
					className="mt-stack-sm min-h-[100px]"
				/>
			</View>

			<View className="rounded-card border border-edge bg-card p-card-compact">
				<Text variant="buttonMd" className="font-semibold text-content">
					Attach a photo
				</Text>
				<Text variant="caption" className="mt-stack-xs text-content-muted">
					Optional. A photo speeds up diagnosis.
				</Text>

				{attachment ? (
					<View className="mt-stack-sm overflow-hidden rounded-input border border-edge">
						<Image
							source={{ uri: attachment.uri }}
							resizeMode="cover"
							style={{
								width: "100%",
								height: spacing.media.attachmentPreviewHeight,
							}}
						/>
						<Button
							variant="secondary"
							size="icon"
							onPress={() => onAttachmentChange(null)}
							className="absolute top-stack-sm right-stack-sm h-control-icon-box-sm w-control-icon-box-sm items-center justify-center rounded-pill bg-shadow/50"
							iconLeft={
								<X
									size={spacing.icon.xs}
									color={themeColors.surfaceOnPrimary}
									strokeWidth={2.5}
								/>
							}
							accessibilityLabel="Remove photo"
						/>
					</View>
				) : (
					<View className="mt-stack-sm flex-row gap-stack-md">
						<Button
							variant="secondary"
							size="lg"
							onPress={pickImage}
							className="flex-1 border-dashed bg-card"
							iconLeft={Paperclip}
							accessibilityLabel="Pick photo from gallery"
						>
							Gallery
						</Button>
						<Button
							variant="secondary"
							size="lg"
							onPress={takePhoto}
							className="flex-1 border-dashed bg-card"
							iconLeft={Camera}
							accessibilityLabel="Take photo"
						>
							Camera
						</Button>
					</View>
				)}
			</View>
		</View>
	);
}

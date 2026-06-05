import * as ImagePicker from "expo-image-picker";
import { Camera, Paperclip, X } from "lucide-react-native";
import { Image, TouchableOpacity, View } from "react-native";
import { Input } from "@/src/components/ui/input";
import { Text } from "@/src/components/ui/text";
import { Colors, spacing, useThemeColors } from "@/src/constants/design-tokens";

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
			<View>
				<Text variant="buttonLg" className="text-content">
					Describe the problem
				</Text>
				<Text variant="caption" className="mt-stack-xs text-content-muted">
					Optional — help the technician prepare.
				</Text>
				<Input
					value={description}
					onChangeText={onDescriptionChange}
					placeholder="e.g. AC not cooling, noisy when running…"
					multiline
					numberOfLines={4}
					className="mt-stack-sm min-h-[100px]"
				/>
			</View>

			<View>
				<Text variant="buttonLg" className="text-content">
					Attach a photo
				</Text>
				<Text variant="caption" className="mt-stack-xs text-content-muted">
					Optional — a photo speeds up diagnosis.
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
						<TouchableOpacity
							onPress={() => onAttachmentChange(null)}
							className="absolute top-stack-sm right-stack-sm h-control-icon-box-sm w-control-icon-box-sm items-center justify-center rounded-pill bg-shadow/50"
							activeOpacity={0.7}
						>
							<X
								size={spacing.icon.xs}
								color={themeColors.surfaceOnPrimary}
								strokeWidth={2.5}
							/>
						</TouchableOpacity>
					</View>
				) : (
					<View className="mt-stack-sm flex-row gap-stack-md">
						<TouchableOpacity
							onPress={pickImage}
							className="flex-1 flex-row items-center justify-center gap-stack-sm rounded-input border border-edge border-dashed bg-card py-card"
							activeOpacity={0.7}
						>
							<Paperclip
								size={spacing.icon.sm}
								color={Colors.primary}
								strokeWidth={2}
							/>
							<Text variant="buttonMd" className="text-app-primary">
								Gallery
							</Text>
						</TouchableOpacity>
						<TouchableOpacity
							onPress={takePhoto}
							className="flex-1 flex-row items-center justify-center gap-stack-sm rounded-input border border-edge border-dashed bg-card py-card"
							activeOpacity={0.7}
						>
							<Camera
								size={spacing.icon.sm}
								color={Colors.primary}
								strokeWidth={2}
							/>
							<Text variant="buttonMd" className="text-app-primary">
								Camera
							</Text>
						</TouchableOpacity>
					</View>
				)}
			</View>
		</View>
	);
}

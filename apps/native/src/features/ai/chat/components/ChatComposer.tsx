import {
	ArrowUp,
	Camera,
	ChevronDown,
	ImagePlus,
	Mic,
	Paperclip,
	X,
} from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { Image, Pressable, TouchableOpacity, View } from "react-native";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu";
import { Input } from "@/src/components/ui/input";
import {
	Popover,
	PopoverClose,
	PopoverContent,
	PopoverTrigger,
} from "@/src/components/ui/popover";
import { Text } from "@/src/components/ui/text";
import { useThemeColors } from "@/src/constants/design-tokens";
import type {
	AudioRecorderState,
	RecordedAudio,
} from "../hooks/useAudioRecorder";
import type { ChatFlow, SelectedImage } from "../types";

type Props = {
	mode: ChatFlow;
	onSelectMode: (mode: ChatFlow) => void;
	message: string;
	onMessageChange: (value: string) => void;
	selectedImage: SelectedImage | null;
	onClearImage: () => void;
	onPickImage: () => void;
	onTakePhoto: () => void;
	onSend: () => void;
	canSend: boolean;
	isLoading: boolean;
	// Audio props
	recorderState: AudioRecorderState;
	recordedAudio: RecordedAudio | null;
	recordingDurationMs: number;
	onStartRecording: () => void;
	onStopRecording: () => void;
	onClearAudio: () => void;
	onCancelRecording: () => void;
};

const ICON = 22;
const CIRCLE = 36;
const HIT = { top: 8, bottom: 8, left: 8, right: 8 };

export default function ChatComposer({
	mode,
	onSelectMode,
	message,
	onMessageChange,
	selectedImage,
	onClearImage,
	onPickImage,
	onTakePhoto,
	onSend,
	canSend,
	isLoading,
	recorderState,
	recordedAudio,
	onStartRecording,
	onStopRecording,
	onClearAudio,
	onCancelRecording,
}: Props) {
	const { t } = useTranslation("chat");
	const themeColors = useThemeColors();

	const isRecording = recorderState === "recording";
	const hasAudio = recorderState === "recorded" && !!recordedAudio;
	const disableTyping = isRecording || hasAudio;
	const modeLabel =
		mode === "recommend"
			? t("composer.modeRecommend")
			: t("composer.modeAgent");

	return (
		<View
			className="px-screen-x pt-stack-xs pb-stack-sm"
			style={{ backgroundColor: themeColors.surfaceBase }}
		>
			{selectedImage ? (
				<ComposerChip
					onClear={onClearImage}
					leading={
						<Image
							source={{ uri: selectedImage.uri }}
							className="h-9 w-9 rounded-lg"
							resizeMode="cover"
						/>
					}
					title={selectedImage.name}
					subtitle={t("composer.imageNote")}
				/>
			) : null}

			{hasAudio ? (
				<ComposerChip
					onClear={onClearAudio}
					leading={
						<View
							className="h-9 w-9 items-center justify-center rounded-lg"
							style={{ backgroundColor: themeColors.primary }}
						>
							<Mic
								size={16}
								color={themeColors.onPrimaryHeader}
								strokeWidth={2}
							/>
						</View>
					}
					title={t("composer.voiceMessageLabel")}
					subtitle={t("composer.voiceReplaces")}
				/>
			) : null}

			{isRecording ? (
				<View
					className="mb-stack-sm flex-row items-center gap-stack-sm rounded-2xl px-stack-md py-stack-sm"
					style={{ backgroundColor: themeColors.dangerSoft }}
				>
					<View
						className="h-2.5 w-2.5 rounded-full"
						style={{ backgroundColor: themeColors.danger }}
					/>
					<Text
						variant="bodySm"
						className="flex-1 font-google-sans-semibold"
						style={{ color: themeColors.danger }}
					>
						{t("composer.recordingLabel")}
					</Text>
					<TouchableOpacity
						onPress={onCancelRecording}
						hitSlop={HIT}
						accessibilityLabel={t("composer.recordingLabel")}
					>
						<X size={16} color={themeColors.danger} strokeWidth={2.4} />
					</TouchableOpacity>
				</View>
			) : null}

			{/* Twitter/Grok-style box: input on top, toolbar row at the bottom. */}
			<View
				className="rounded-3xl border px-stack-md pt-stack-sm pb-stack-xs"
				style={{
					borderColor: themeColors.borderDefault,
					backgroundColor: themeColors.surfaceBase,
				}}
			>
				<Input
					placeholder={
						hasAudio
							? t("composer.placeholderVoice")
							: t("composer.placeholderText")
					}
					value={message}
					onChangeText={onMessageChange}
					multiline
					editable={!disableTyping}
					className="min-h-[28px] border-0 bg-transparent px-0 py-stack-xs"
					style={{
						maxHeight: 120,
						color: themeColors.textPrimary,
						opacity: disableTyping ? 0.4 : 1,
					}}
				/>

				<View className="mt-stack-xs flex-row items-center">
					{/* Attach popover */}
					<Popover>
						<PopoverTrigger
							className="h-9 w-9 items-center justify-center"
							accessibilityLabel={t("composer.gallery")}
						>
							<Paperclip
								size={ICON}
								color={themeColors.textSecondary}
								strokeWidth={2}
							/>
						</PopoverTrigger>
						<PopoverContent side="top" align="start" sideOffset={12}>
							<PopoverClose asChild>
								<AttachRow
									icon={
										<ImagePlus
											size={18}
											color={themeColors.primary}
											strokeWidth={2}
										/>
									}
									label={t("composer.gallery")}
									onPress={onPickImage}
								/>
							</PopoverClose>
							<PopoverClose asChild>
								<AttachRow
									icon={
										<Camera
											size={18}
											color={themeColors.primary}
											strokeWidth={2}
										/>
									}
									label={t("composer.camera")}
									onPress={onTakePhoto}
								/>
							</PopoverClose>
						</PopoverContent>
					</Popover>

					<View className="flex-1" />

					{/* Mode selector — plain text + chevron, no box/icon. */}
					<DropdownMenu>
						<DropdownMenuTrigger
							className="mr-stack-sm flex-row items-center gap-1"
							accessibilityLabel={modeLabel}
						>
							<Text
								variant="bodySm"
								className="font-google-sans-semibold"
								style={{ color: themeColors.textPrimary }}
							>
								{modeLabel}
							</Text>
							<ChevronDown
								size={16}
								color={themeColors.textMuted}
								strokeWidth={2.4}
							/>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end" side="top">
							<ModeItem
								label={t("composer.modeRecommend")}
								active={mode === "recommend"}
								onPress={() => onSelectMode("recommend")}
							/>
							<ModeItem
								label={t("composer.modeAgent")}
								active={mode === "agent"}
								onPress={() => onSelectMode("agent")}
							/>
						</DropdownMenuContent>
					</DropdownMenu>

					{/* Voice / Send / Stop circle */}
					{isRecording ? (
						<CircleButton
							bg={themeColors.danger}
							onPress={onStopRecording}
							label={t("composer.recordingLabel")}
						>
							<View
								className="h-3.5 w-3.5 rounded-sm"
								style={{ backgroundColor: themeColors.onPrimaryHeader }}
							/>
						</CircleButton>
					) : canSend ? (
						<CircleButton
							bg={themeColors.primary}
							onPress={onSend}
							disabled={isLoading}
							label={t("composer.placeholderText")}
						>
							<ArrowUp
								size={ICON}
								color={themeColors.onPrimaryHeader}
								strokeWidth={2.6}
							/>
						</CircleButton>
					) : (
						<CircleButton
							bg={themeColors.primary}
							onPress={onStartRecording}
							label={t("composer.voiceMessageLabel")}
						>
							<Mic
								size={ICON}
								color={themeColors.onPrimaryHeader}
								strokeWidth={2.2}
							/>
						</CircleButton>
					)}
				</View>
			</View>
		</View>
	);
}

function ModeItem({
	label,
	active,
	onPress,
}: {
	label: string;
	active: boolean;
	onPress: () => void;
}) {
	const themeColors = useThemeColors();
	return (
		<DropdownMenuItem onPress={onPress}>
			<Text
				variant="bodySm"
				className={active ? "font-google-sans-bold" : "font-google-sans"}
				style={{
					color: active ? themeColors.primary : themeColors.textPrimary,
				}}
			>
				{label}
			</Text>
		</DropdownMenuItem>
	);
}

function AttachRow({
	icon,
	label,
	onPress,
}: {
	icon: React.ReactNode;
	label: string;
	onPress: () => void;
}) {
	return (
		<Pressable
			onPress={onPress}
			className="flex-row items-center gap-stack-sm rounded-xl px-stack-sm py-stack-sm active:opacity-60"
		>
			{icon}
			<Text variant="bodySm" className="font-google-sans-semibold text-content">
				{label}
			</Text>
		</Pressable>
	);
}

function CircleButton({
	bg,
	onPress,
	disabled,
	label,
	children,
}: {
	bg: string;
	onPress: () => void;
	disabled?: boolean;
	label: string;
	children: React.ReactNode;
}) {
	return (
		<TouchableOpacity
			onPress={onPress}
			disabled={disabled}
			activeOpacity={0.85}
			hitSlop={HIT}
			accessibilityLabel={label}
			className="items-center justify-center rounded-full"
			style={{
				width: CIRCLE,
				height: CIRCLE,
				backgroundColor: bg,
				opacity: disabled ? 0.5 : 1,
			}}
		>
			{children}
		</TouchableOpacity>
	);
}

function ComposerChip({
	leading,
	title,
	subtitle,
	onClear,
}: {
	leading: React.ReactNode;
	title: string;
	subtitle: string;
	onClear: () => void;
}) {
	const themeColors = useThemeColors();
	return (
		<View
			className="mb-stack-sm flex-row items-center gap-stack-sm rounded-2xl px-stack-md py-stack-sm"
			style={{ backgroundColor: themeColors.surfaceElevated }}
		>
			{leading}
			<View className="flex-1">
				<Text
					variant="bodySm"
					numberOfLines={1}
					style={{ color: themeColors.textPrimary }}
				>
					{title}
				</Text>
				<Text variant="caption" style={{ color: themeColors.textMuted }}>
					{subtitle}
				</Text>
			</View>
			<TouchableOpacity
				onPress={onClear}
				hitSlop={HIT}
				className="h-8 w-8 items-center justify-center rounded-full"
				style={{ backgroundColor: themeColors.overlaySm }}
			>
				<X size={14} color={themeColors.textSecondary} strokeWidth={2.4} />
			</TouchableOpacity>
		</View>
	);
}

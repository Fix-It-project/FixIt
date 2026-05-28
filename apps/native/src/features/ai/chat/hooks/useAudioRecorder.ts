import {
	AudioQuality,
	getRecordingPermissionsAsync,
	IOSOutputFormat,
	type RecordingOptions,
	requestRecordingPermissionsAsync,
	setAudioModeAsync,
	useAudioRecorderState,
	useAudioRecorder as useExpoAudioRecorder,
} from "expo-audio";
import { File } from "expo-file-system";
import { useCallback, useEffect, useRef, useState } from "react";
import Toast from "react-native-toast-message";
import { showError } from "@/src/lib/errors";
import { logger } from "@/src/lib/logger";

export type AudioRecorderState = "idle" | "recording" | "recorded";

export type RecordedAudio = {
	uri: string;
	base64: string;
	durationMs: number;
};

const RECORDING_OPTIONS: RecordingOptions = {
	extension: ".m4a",
	sampleRate: 16000,
	numberOfChannels: 1,
	bitRate: 64000,
	android: {
		outputFormat: "mpeg4",
		audioEncoder: "aac",
	},
	ios: {
		outputFormat: IOSOutputFormat.MPEG4AAC,
		audioQuality: AudioQuality.MEDIUM,
		linearPCMBitDepth: 16,
		linearPCMIsBigEndian: false,
		linearPCMIsFloat: false,
	},
	web: {
		mimeType: "audio/webm",
		bitsPerSecond: 64000,
	},
};

export function useAudioRecorder() {
	const [recorderState, setRecorderState] =
		useState<AudioRecorderState>("idle");
	const [recordedAudio, setRecordedAudio] = useState<RecordedAudio | null>(
		null,
	);
	const recorder = useExpoAudioRecorder(RECORDING_OPTIONS);
	const recorderStatus = useAudioRecorderState(recorder);

	const localDurationMsRef = useRef(0);

	useEffect(() => {
		if (recorderState === "recording") {
			localDurationMsRef.current = recorderStatus.durationMillis;
		}
	}, [recorderState, recorderStatus.durationMillis]);

	const stopAndCleanup = useCallback(async () => {
		if (recorderStatus.isRecording) {
			try {
				await recorder.stop();
			} catch {
				// already stopped
			}
		}
		await setAudioModeAsync({ allowsRecording: false });
	}, [recorder, recorderStatus.isRecording]);

	useEffect(() => {
		return () => {
			void stopAndCleanup();
		};
	}, [stopAndCleanup]);

	const startRecording = useCallback(async () => {
		try {
			// Request mic permission
			const currentPermission = await getRecordingPermissionsAsync();
			const permission = currentPermission.granted
				? currentPermission
				: await requestRecordingPermissionsAsync();
			if (!permission.granted) {
				logger.info("ai.audio", "microphone_permission_denied");
				Toast.show({
					type: "info",
					text1: "Microphone access required",
					text2: "Please allow microphone access to record audio.",
				});
				return;
			}

			// Clean up any leftover recording
			await stopAndCleanup();

			setRecordedAudio(null);
			localDurationMsRef.current = 0;

			await setAudioModeAsync({
				allowsRecording: true,
				playsInSilentMode: true,
			});

			await recorder.prepareToRecordAsync();
			recorder.record();
			setRecorderState("recording");
		} catch (err) {
			logger.error("useAudioRecorder", "Failed to start recording", err);
			showError(err);
			setRecorderState("idle");
		}
	}, [recorder, stopAndCleanup]);

	const stopRecording = useCallback(async (): Promise<RecordedAudio | null> => {
		if (!recorderStatus.isRecording) return null;

		try {
			await recorder.stop();
			await setAudioModeAsync({ allowsRecording: false });
			const durationMs =
				recorder.getStatus().durationMillis ?? localDurationMsRef.current;
			const uri = recorder.uri ?? recorder.getStatus().url;
			if (!uri) {
				setRecorderState("idle");
				return null;
			}

			const base64 = await new File(uri).base64();

			const result: RecordedAudio = { uri, base64, durationMs };
			localDurationMsRef.current = durationMs;
			setRecordedAudio(result);
			setRecorderState("recorded");
			return result;
		} catch (err) {
			logger.error("useAudioRecorder", "Failed to stop recording", err);
			showError(err);
			setRecorderState("idle");
			return null;
		}
	}, [recorder, recorderStatus.isRecording]);

	const clearAudio = useCallback(async () => {
		await stopAndCleanup();
		setRecordedAudio(null);
		localDurationMsRef.current = 0;
		setRecorderState("idle");
	}, [stopAndCleanup]);

	const cancelRecording = useCallback(async () => {
		await stopAndCleanup();
		localDurationMsRef.current = 0;
		setRecorderState("idle");
	}, [stopAndCleanup]);

	const recordingDurationMs =
		recorderState === "recording"
			? recorderStatus.durationMillis
			: localDurationMsRef.current;

	return {
		recorderState,
		recordedAudio,
		recordingDurationMs,
		startRecording,
		stopRecording,
		clearAudio,
		cancelRecording,
	};
}

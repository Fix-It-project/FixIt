import {
  AudioQuality,
  IOSOutputFormat,
  RecordingOptions,
  getRecordingPermissionsAsync,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
  useAudioRecorder as useExpoAudioRecorder,
  useAudioRecorderState,
} from "expo-audio";
import { File } from "expo-file-system";
import { useCallback, useEffect, useRef, useState } from "react";
import { Alert } from "react-native";

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
  const [recorderState, setRecorderState] = useState<AudioRecorderState>("idle");
  const [recordedAudio, setRecordedAudio] = useState<RecordedAudio | null>(null);
  const recorder = useExpoAudioRecorder(RECORDING_OPTIONS);
  const recorderStatus = useAudioRecorderState(recorder);

  const localDurationMsRef = useRef(0);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      void stopAndCleanup();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  const startRecording = useCallback(async () => {
    try {
      // Request mic permission
      const currentPermission = await getRecordingPermissionsAsync();
      const permission =
        currentPermission.granted ? currentPermission : await requestRecordingPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(
          "Microphone access required",
          "Please allow microphone access to record audio.",
        );
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
      console.error("Failed to start recording:", err);
      Alert.alert("Recording failed", "Could not start the microphone. Please try again.");
      setRecorderState("idle");
    }
  }, [recorder, stopAndCleanup]);

  const stopRecording = useCallback(async (): Promise<RecordedAudio | null> => {
    if (!recorderStatus.isRecording) return null;

    try {
      await recorder.stop();
      await setAudioModeAsync({ allowsRecording: false });
      const durationMs = recorder.getStatus().durationMillis ?? localDurationMsRef.current;
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
      console.error("Failed to stop recording:", err);
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
    recorderState === "recording" ? recorderStatus.durationMillis : localDurationMsRef.current;

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

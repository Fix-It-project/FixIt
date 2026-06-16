import * as Updates from "expo-updates";
import { useEffect } from "react";
import { Sentry } from "@/src/config/monitoring";

function updateType(update: Updates.UpdateInfo | undefined): string | undefined {
	return update?.type;
}

function updateId(update: Updates.UpdateInfo | undefined): string | undefined {
	return update?.type === Updates.UpdateInfoType.NEW ? update.updateId : undefined;
}

export function OtaUpdateObserver() {
	const {
		availableUpdate,
		checkError,
		currentlyRunning,
		downloadedUpdate,
		downloadError,
		isUpdateAvailable,
		isUpdatePending,
	} = Updates.useUpdates();

	useEffect(() => {
		Sentry.setContext("ota_update", {
			channel: currentlyRunning.channel ?? null,
			currentUpdateId: currentlyRunning.updateId ?? null,
			isEmbeddedLaunch: currentlyRunning.isEmbeddedLaunch,
			isEmergencyLaunch: currentlyRunning.isEmergencyLaunch,
			isUpdateAvailable,
			isUpdatePending,
			runtimeVersion: currentlyRunning.runtimeVersion ?? null,
			availableUpdateId: updateId(availableUpdate) ?? null,
			availableUpdateType: updateType(availableUpdate) ?? null,
			downloadedUpdateId: updateId(downloadedUpdate) ?? null,
			downloadedUpdateType: updateType(downloadedUpdate) ?? null,
		});
	}, [
		availableUpdate,
		currentlyRunning.channel,
		currentlyRunning.isEmbeddedLaunch,
		currentlyRunning.isEmergencyLaunch,
		currentlyRunning.runtimeVersion,
		currentlyRunning.updateId,
		downloadedUpdate,
		isUpdateAvailable,
		isUpdatePending,
	]);

	useEffect(() => {
		if (!isUpdatePending) return;

		Sentry.addBreadcrumb({
			category: "ota_update",
			level: "info",
			message: "OTA update downloaded and pending app restart",
			data: {
				channel: currentlyRunning.channel,
				currentUpdateId: currentlyRunning.updateId,
				downloadedUpdateId: updateId(downloadedUpdate),
				runtimeVersion: currentlyRunning.runtimeVersion,
			},
		});
	}, [
		currentlyRunning.channel,
		currentlyRunning.runtimeVersion,
		currentlyRunning.updateId,
		downloadedUpdate,
		isUpdatePending,
	]);

	useEffect(() => {
		if (checkError) {
			Sentry.captureException(checkError, {
				tags: { area: "ota_update", operation: "check" },
			});
		}
	}, [checkError]);

	useEffect(() => {
		if (downloadError) {
			Sentry.captureException(downloadError, {
				tags: { area: "ota_update", operation: "download" },
			});
		}
	}, [downloadError]);

	return null;
}

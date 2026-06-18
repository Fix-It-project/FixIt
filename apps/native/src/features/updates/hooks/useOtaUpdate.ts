import * as Updates from "expo-updates";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import Toast from "react-native-toast-message";
import { confirm } from "@/src/components/ui/dialog";
import { Sentry } from "@/src/config/monitoring";

export type OtaStatus = "idle" | "checking" | "downloading";

/**
 * Manual "Check for updates" flow on top of the auto-check OtaUpdateObserver.
 * Checks → downloads if available → prompts a restart to apply.
 *
 * `Updates.isEnabled` is false in Expo Go and dev builds, so the action degrades
 * to an informational toast there instead of throwing.
 */
export function useOtaUpdate() {
	const { t } = useTranslation("settings");
	const [status, setStatus] = useState<OtaStatus>("idle");

	const checkForUpdate = useCallback(async () => {
		if (!Updates.isEnabled) {
			Toast.show({ type: "info", text1: t("updates.unavailableDev") });
			return;
		}
		if (status !== "idle") return;

		setStatus("checking");
		try {
			const result = await Updates.checkForUpdateAsync();
			if (!result.isAvailable) {
				Toast.show({ type: "info", text1: t("updates.upToDate") });
				return;
			}

			setStatus("downloading");
			await Updates.fetchUpdateAsync();

			const restart = await confirm({
				title: t("updates.readyTitle"),
				description: t("updates.readyBody"),
				primary: { label: t("updates.restartNow") },
				secondary: { label: t("updates.later") },
			});
			if (restart) {
				await Updates.reloadAsync();
			}
		} catch (error) {
			Sentry.captureException(error, {
				tags: { area: "ota_update", operation: "manual_check" },
			});
			Toast.show({ type: "error", text1: t("updates.error") });
		} finally {
			setStatus("idle");
		}
	}, [status, t]);

	return { status, checkForUpdate, isEnabled: Updates.isEnabled };
}

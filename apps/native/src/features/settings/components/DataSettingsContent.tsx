import { Image } from "expo-image";
import { Trash2 } from "lucide-react-native";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ScrollView } from "react-native";
import Toast from "react-native-toast-message";
import { confirm } from "@/src/components/ui/dialog";
import { Text } from "@/src/components/ui/text";
import queryClient from "@/src/config/query-client";
import { logger } from "@/src/lib/logger";
import { SettingsItem } from "./SettingsItem";

export function DataSettingsContent() {
	const { t } = useTranslation("settings");
	const [clearing, setClearing] = useState(false);

	const handleClearCache = async () => {
		const ok = await confirm({
			title: t("data.clearTitle"),
			description: t("data.clearDescription"),
			primary: { label: t("data.clearConfirm") },
			secondary: { label: t("data.clearCancel") },
		});
		if (!ok || clearing) return;

		setClearing(true);
		try {
			await Promise.all([Image.clearMemoryCache(), Image.clearDiskCache()]);
			queryClient.clear();
			Toast.show({ type: "success", text1: t("data.cleared") });
		} catch (error) {
			logger.error("settings", "clear_cache_failed", error);
			Toast.show({ type: "error", text1: t("data.clearFailed") });
		} finally {
			setClearing(false);
		}
	};

	return (
		<ScrollView
			className="flex-1 bg-surface"
			contentContainerClassName="px-screen-x py-stack-xl"
		>
			<Text variant="bodySm" className="mb-stack-md text-content-muted">
				{t("data.intro")}
			</Text>
			<SettingsItem
				icon={Trash2}
				label={t("data.clearCache")}
				onPress={handleClearCache}
				hideChevron
			/>
		</ScrollView>
	);
}

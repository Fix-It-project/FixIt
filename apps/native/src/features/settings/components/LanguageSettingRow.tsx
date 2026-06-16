import { Languages } from "lucide-react-native";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { type Language, SUPPORTED_LANGUAGES } from "@/src/constants/i18n";
import { confirm } from "@/src/stores/dialog-store";
import { useLanguageStore } from "@/src/stores/language-store";
import { SelectionDialog, type SelectionDialogOption } from "./SelectionDialog";
import { SettingsItem } from "./SettingsItem";

export function LanguageSettingRow() {
	const { t } = useTranslation("common");
	const { t: ts } = useTranslation("settings");
	const language = useLanguageStore((state) => state.language);
	const setLanguage = useLanguageStore((state) => state.setLanguage);
	const [open, setOpen] = useState(false);

	// Autonyms — each language shown in its own script.
	const labels: Record<Language, string> = {
		en: t("english"),
		ar: t("arabic"),
	};

	// Switching language flips text direction (LTR<->RTL) which reloads the app.
	const handleSelect = async (value: Language) => {
		setOpen(false);
		if (value === language) return;
		const confirmed = await confirm({
			title: ts("language.restartTitle"),
			description: ts("language.restartMessage"),
			primary: { label: ts("language.restartConfirm") },
			secondary: { label: ts("language.cancel") },
		});
		if (confirmed) void setLanguage(value);
	};

	const options: SelectionDialogOption[] = SUPPORTED_LANGUAGES.map((value) => ({
		key: value,
		label: labels[value],
	}));

	return (
		<>
			<SettingsItem
				icon={Languages}
				label={ts("language.title")}
				rightText={labels[language]}
				onPress={() => setOpen(true)}
			/>
			<SelectionDialog
				visible={open}
				onClose={() => setOpen(false)}
				title={ts("language.title")}
				value={language}
				onValueChange={(key) => void handleSelect(key as Language)}
				options={options}
			/>
		</>
	);
}

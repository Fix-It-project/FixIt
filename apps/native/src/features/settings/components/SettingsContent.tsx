import { router } from "expo-router";
import {
	Bell,
	CircleHelp,
	Database,
	Info,
	LogOut,
	MessageCircleQuestion,
	Shield,
	TextCursorInput,
} from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { ScrollView } from "react-native";
import { confirm } from "@/src/components/ui/dialog";
import { useLogoutMutation } from "@/src/features/auth/hooks/useLogoutMutation";
import { useDebounce } from "@/src/hooks/useDebounce";
import { showError } from "@/src/lib/errors";
import { ROUTES } from "@/src/lib/navigation";
import { LanguageSettingRow } from "./LanguageSettingRow";
import { SettingsItem } from "./SettingsItem";
import { SettingsSection } from "./SettingsSection";
import { ThemeSettingRow } from "./ThemeSettingRow";

interface SettingsContentProps {
	readonly userType: "user" | "technician";
}

export default function SettingsContent({ userType }: SettingsContentProps) {
	const { t } = useTranslation("settings");
	const logout = useLogoutMutation();
	const isTech = userType === "technician";
	const r = isTech ? ROUTES.technician : ROUTES.user;

	const goNotifications = useDebounce(() =>
		router.push(r.settingsNotifications as never),
	);
	const goPrivacy = useDebounce(() => router.push(r.settingsPrivacy as never));
	const goHelp = useDebounce(() => router.push(r.settingsHelp as never));
	const goDisplay = useDebounce(() => router.push(r.settingsDisplay as never));
	const goData = useDebounce(() => router.push(r.settingsData as never));
	const goAbout = useDebounce(() => router.push(r.settingsAbout as never));
	const goFaq = useDebounce(() => router.push(r.settingsFaq as never));

	const handleLogout = async () => {
		const ok = await confirm({
			title: t("account.logoutTitle"),
			description: t("account.logoutDescription"),
			primary: { label: t("account.logoutConfirm"), destructive: true },
			secondary: { label: t("account.logoutCancel") },
		});
		if (ok) logout.mutate(undefined, { onError: (error) => showError(error) });
	};

	return (
		<ScrollView
			className="flex-1 bg-surface"
			contentContainerClassName="py-stack-md"
		>
			<SettingsSection title={t("sections.appearance")}>
				<ThemeSettingRow />
				<LanguageSettingRow />
			</SettingsSection>

			<SettingsSection title={t("sections.preferences")}>
				<SettingsItem
					icon={Bell}
					label={t("menu.notifications")}
					onPress={goNotifications}
				/>
				<SettingsItem
					icon={TextCursorInput}
					label={t("menu.display")}
					onPress={goDisplay}
				/>
				<SettingsItem icon={Database} label={t("menu.data")} onPress={goData} />
			</SettingsSection>

			<SettingsSection title={t("sections.support")}>
				<SettingsItem
					icon={MessageCircleQuestion}
					label={t("menu.faq")}
					onPress={goFaq}
				/>
				<SettingsItem
					icon={Shield}
					label={t("menu.privacy")}
					onPress={goPrivacy}
				/>
				<SettingsItem
					icon={CircleHelp}
					label={t("menu.help")}
					onPress={goHelp}
				/>
				<SettingsItem icon={Info} label={t("menu.about")} onPress={goAbout} />
			</SettingsSection>

			<SettingsSection title={t("sections.account")} bottomSeparator={false}>
				<SettingsItem
					icon={LogOut}
					label={t("account.logout")}
					onPress={handleLogout}
					destructive
					hideChevron
				/>
			</SettingsSection>
		</ScrollView>
	);
}

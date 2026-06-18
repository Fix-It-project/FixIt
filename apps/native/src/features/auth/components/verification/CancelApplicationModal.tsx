import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/src/components/ui/button";
import { Dialog } from "@/src/components/ui/dialog";
import { Text } from "@/src/components/ui/text";
import { useThemeColors } from "@/src/constants/design-tokens";
import PasswordInput from "@/src/features/auth/components/shared/PasswordInput";
import { useCancelApplicationMutation } from "@/src/features/auth/hooks/useCancelApplicationMutation";
import { getErrorMessage } from "@/src/lib/errors";

interface CancelApplicationModalProps {
	readonly email: string;
	readonly open: boolean;
	readonly onClose: () => void;
}

export function CancelApplicationModal({
	email,
	open,
	onClose,
}: CancelApplicationModalProps) {
	const { t } = useTranslation("auth");
	const c = useThemeColors();
	const [password, setPassword] = useState("");
	const mutation = useCancelApplicationMutation();
	const errorMessage = mutation.error ? getErrorMessage(mutation.error) : null;

	const submit = () => {
		if (!password || mutation.isPending) return;
		mutation.mutate({ email, password });
	};

	const close = () => {
		if (mutation.isPending) return;
		setPassword("");
		mutation.reset();
		onClose();
	};

	return (
		<Dialog visible={open} onClose={close}>
			<Dialog.Header>{t("verification.cancelModal.title")}</Dialog.Header>
			<Dialog.Body>{t("verification.cancelModal.body")}</Dialog.Body>
			<Dialog.Form>
				{errorMessage ? (
					<Text variant="bodySm" style={{ color: c.danger }}>
						{errorMessage}
					</Text>
				) : null}
				<PasswordInput
					label={t("verification.cancelModal.passwordLabel")}
					value={password}
					onChangeText={setPassword}
					disabled={mutation.isPending}
					required
				/>
			</Dialog.Form>
			<Dialog.Footer>
				<Button
					variant="secondary"
					onPress={close}
					disabled={mutation.isPending}
				>
					{t("verification.cancelModal.keep")}
				</Button>
				<Button
					variant="destructive"
					loading={mutation.isPending}
					disabled={!password}
					onPress={submit}
				>
					{t("verification.cancelModal.withdraw")}
				</Button>
			</Dialog.Footer>
		</Dialog>
	);
}

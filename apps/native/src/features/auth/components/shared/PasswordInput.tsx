import { useTranslation } from "react-i18next";
import FormInput, {
	type FormInputProps,
} from "@/src/components/forms/FormInput";

export type PasswordInputProps = Pick<
	FormInputProps,
	| "label"
	| "value"
	| "onChangeText"
	| "error"
	| "disabled"
	| "variant"
	| "required"
	| "testID"
> & {
	readonly placeholder?: string;
};

export default function PasswordInput({
	label,
	value,
	onChangeText,
	placeholder,
	error,
	disabled,
	variant = "outline",
	required = false,
	testID,
}: PasswordInputProps) {
	const { t } = useTranslation("auth");
	return (
		<FormInput
			label={label}
			value={value}
			onChangeText={onChangeText}
			placeholder={placeholder ?? t("form.passwordPlaceholder")}
			error={error}
			disabled={disabled}
			variant={variant}
			required={required}
			secureToggle
			testID={testID}
		/>
	);
}

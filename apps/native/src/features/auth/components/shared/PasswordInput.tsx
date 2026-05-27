import FormInput, { type FormInputProps } from "@/src/components/forms/FormInput";

export type PasswordInputProps = Pick<
	FormInputProps,
	"label" | "value" | "onChangeText" | "error" | "disabled" | "variant" | "required"
> & {
	readonly placeholder?: string;
};

export default function PasswordInput({
	label,
	value,
	onChangeText,
	placeholder = "Enter your password",
	error,
	disabled,
	variant = "outline",
	required = false,
}: PasswordInputProps) {
	return (
		<FormInput
			label={label}
			value={value}
			onChangeText={onChangeText}
			placeholder={placeholder}
			error={error}
			disabled={disabled}
			variant={variant}
			required={required}
			secureToggle
		/>
	);
}

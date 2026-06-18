// A themed single-select dialog: a titled list of radio options with an
// optional color-preview swatch. Built on the app's portal-based Dialog
// primitive + RadioGroup (works where the gorhom modal sheet did not). The
// parent owns the selected value and decides whether selecting closes the
// dialog (theme closes immediately; language defers to a restart confirm).
import { Pressable, View } from "react-native";
import { Dialog } from "@/src/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/src/components/ui/radio-group";
import { Text } from "@/src/components/ui/text";
import { useThemeColors } from "@/src/constants/design-tokens";

export interface SelectionDialogOption {
	readonly key: string;
	readonly label: string;
	readonly description?: string;
	/** Optional color preview chip(s) shown on the left (e.g. theme swatch). */
	readonly swatches?: readonly string[];
}

interface SelectionDialogProps {
	readonly visible: boolean;
	readonly onClose: () => void;
	readonly title: string;
	readonly value: string;
	readonly onValueChange: (key: string) => void;
	readonly options: readonly SelectionDialogOption[];
}

function Swatches({ colors }: { readonly colors: readonly string[] }) {
	const themeColors = useThemeColors();
	return (
		<View
			className="h-avatar-sm w-avatar-sm flex-row overflow-hidden rounded-pill"
			style={{ borderWidth: 1, borderColor: themeColors.borderDefault }}
		>
			{colors.map((c) => (
				<View key={c} className="flex-1" style={{ backgroundColor: c }} />
			))}
		</View>
	);
}

export function SelectionDialog({
	visible,
	onClose,
	title,
	value,
	onValueChange,
	options,
}: SelectionDialogProps) {
	return (
		<Dialog visible={visible} onClose={onClose}>
			<Dialog.Header>{title}</Dialog.Header>
			<Dialog.Body>
				<RadioGroup value={value} onValueChange={onValueChange}>
					{options.map((opt) => {
						const selected = opt.key === value;
						return (
							<Pressable
								key={opt.key}
								onPress={() => onValueChange(opt.key)}
								accessibilityRole="radio"
								accessibilityState={{ selected }}
								className="flex-row items-center gap-stack-md py-list-row-comfortable-y active:opacity-70"
							>
								{opt.swatches ? <Swatches colors={opt.swatches} /> : null}
								<View className="flex-1">
									<Text
										variant="body"
										className={
											selected ? "font-semibold text-content" : "text-content"
										}
									>
										{opt.label}
									</Text>
									{opt.description ? (
										<Text
											variant="caption"
											className="mt-stack-xs text-content-muted"
										>
											{opt.description}
										</Text>
									) : null}
								</View>
								<RadioGroupItem value={opt.key} />
							</Pressable>
						);
					})}
				</RadioGroup>
			</Dialog.Body>
		</Dialog>
	);
}

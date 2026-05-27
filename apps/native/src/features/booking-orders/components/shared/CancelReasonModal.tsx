import * as React from "react";
import { Button } from "@/src/components/ui/button";
import { Dialog } from "@/src/components/ui/dialog";
import { Text } from "@/src/components/ui/text";
import { Textarea } from "@/src/components/ui/textarea";

interface Props {
	readonly confirmLabel?: string;
	readonly isLoading: boolean;
	readonly onClose: () => void;
	readonly onConfirm: () => void;
	readonly onReasonChange: (text: string) => void;
	readonly reason: string;
	readonly subjectFallback: string;
	readonly subjectName: string | null | undefined;
	readonly subjectRole: string;
	readonly title: string;
	readonly visible: boolean;
}

export default function CancelReasonModal({
	isLoading,
	onClose,
	onConfirm,
	onReasonChange,
	reason,
	subjectFallback,
	subjectName,
	subjectRole,
	title,
	visible,
	confirmLabel = "Cancel",
}: Props) {
	const reasonRef = React.useRef(reason);

	React.useEffect(() => {
		if (visible) {
			reasonRef.current = reason;
		}
	}, [reason, visible]);

	const handleConfirm = () => {
		onReasonChange(reasonRef.current);
		onConfirm();
	};

	return (
		<Dialog visible={visible} onClose={onClose} dismissible={false}>
			<Dialog.Header>{title}</Dialog.Header>
			<Dialog.Body>
				<Text variant="bodySm">
					Are you sure you want to cancel the {subjectRole} with{" "}
					<Text variant="bodySm" className="font-semibold">
						{subjectName ?? subjectFallback}
					</Text>
					?
				</Text>
			</Dialog.Body>
			<Dialog.Form>
				<Textarea
					defaultValue={reason}
					onChangeText={(text) => {
						reasonRef.current = text;
					}}
					placeholder="Reason (optional)"
					numberOfLines={3}
					className="min-h-[72px]"
				/>
			</Dialog.Form>
			<Dialog.Footer>
				<Button variant="secondary" onPress={onClose}>
					Keep
				</Button>
				<Button
					variant="destructive"
					loading={isLoading}
					disabled={isLoading}
					onPress={handleConfirm}
				>
					{confirmLabel}
				</Button>
			</Dialog.Footer>
		</Dialog>
	);
}

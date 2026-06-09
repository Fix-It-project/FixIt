import { Card } from "@/src/components/ui/card";
import { Text } from "@/src/components/ui/text";

interface Props {
	readonly description: string;
}

export default function BookingDescriptionCard({ description }: Props) {
	return (
		<Card className="mb-stack-lg p-card">
			<Text variant="buttonMd" className="mb-stack-sm text-content">
				Problem Description
			</Text>
			<Text variant="bodySm" className="text-content-secondary">
				{description}
			</Text>
		</Card>
	);
}

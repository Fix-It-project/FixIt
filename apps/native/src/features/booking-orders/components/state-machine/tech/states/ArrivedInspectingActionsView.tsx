import { Check, Search } from "lucide-react-native";
import { View } from "react-native";
import { Button } from "@/src/components/ui/button";
import { space } from "@/src/constants/design-tokens";
import {
	InspectionProgress,
	StageHero,
} from "@/src/features/booking-orders/components/state-machine/shared";
import { useTechFinishInspection } from "@/src/features/booking-orders/hooks";
import type { Order } from "@/src/features/booking-orders/schemas/response.schema";

interface Props {
	readonly order: Order;
}

export default function ArrivedInspectingBody(_props: Props) {
	return (
		<View style={{ gap: space[5] }}>
			<StageHero
				icon={Search}
				eyebrow="On site"
				title="Scope the work."
				subtitle="Inspect carefully. Quote should reflect parts + labor."
			/>
			<InspectionProgress />
		</View>
	);
}

export function ArrivedInspectingCta({ order }: Props) {
	const finishInspection = useTechFinishInspection();
	const handlePress = () => {
		finishInspection.mutate({ orderId: order.id });
	};
	return (
		<Button
			variant="primary"
			size="lg"
			fullWidth
			iconLeft={Check}
			loading={finishInspection.isPending}
			onPress={handlePress}
			accessibilityLabel="Finish inspection"
		>
			{"Finish inspection"}
		</Button>
	);
}

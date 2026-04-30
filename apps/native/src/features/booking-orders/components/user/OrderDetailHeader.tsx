import DetailHeader from "@/src/features/booking-orders/components/shared/DetailHeader";
import type { Order } from "@/src/features/booking-orders/schemas/response.schema";

interface Props {
	readonly order: Order;
	readonly onBack: () => void;
}

export default function OrderDetailHeader({ order, onBack }: Props) {
	return (
		<DetailHeader
			categoryId={order.category_id}
			onBack={onBack}
			title="Order Details"
		/>
	);
}

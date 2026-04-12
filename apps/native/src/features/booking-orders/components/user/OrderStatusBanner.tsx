import { View } from "react-native";
import { CheckCircle, Clock, XCircle, AlertTriangle } from "lucide-react-native";
import { Colors } from "@/src/lib/colors";
import { Text } from "@/src/components/ui/text";
import type { OrderStatus } from "@/src/schemas/shared.schema";

const BANNER_CONFIG: Record<OrderStatus, { label: string; color: string; bg: string; icon: typeof Clock }> = {
  pending: { label: "Waiting for technician to accept", color: Colors.warning, bg: "#fffbeb", icon: Clock },
  accepted: { label: "Accepted by technician", color: Colors.success, bg: "#ecfdf5", icon: CheckCircle },
  rejected: { label: "Rejected by technician", color: Colors.danger, bg: "#fef2f2", icon: XCircle },
  cancelled_by_user: { label: "Cancelled by you", color: Colors.danger, bg: "#fef2f2", icon: XCircle },
  cancelled_by_technician: { label: "Cancelled by technician", color: Colors.danger, bg: "#fef2f2", icon: AlertTriangle },
  completed: { label: "Completed", color: Colors.success, bg: "#ecfdf5", icon: CheckCircle },
};

interface Props {
  readonly status: OrderStatus;
  readonly cancellationReason?: string | null;
}

export default function OrderStatusBanner({ status, cancellationReason }: Props) {
  const config = BANNER_CONFIG[status];

  return (
    <View
      className="mb-4 flex-row items-center gap-3 rounded-2xl p-4"
      style={{ backgroundColor: config.bg, borderWidth: 1, borderColor: `${config.color}20` }}
    >
      <config.icon size={22} color={config.color} strokeWidth={1.8} />
      <View className="flex-1">
        <Text style={{ fontFamily: "GoogleSans_600SemiBold", fontSize: 14, color: config.color }}>
          {config.label}
        </Text>
        {cancellationReason ? (
          <Text style={{ fontSize: 12, color: Colors.textSecondary, marginTop: 2 }}>
            {cancellationReason}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

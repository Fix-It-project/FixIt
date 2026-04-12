import { useState } from 'react';
import { TouchableOpacity, View } from 'react-native';
import { ChevronDown, ChevronUp } from 'lucide-react-native';
import { Text } from '@/src/components/ui/text';
import { Colors } from '@/src/lib/colors';
import ScheduleOrderCard from './ScheduleOrderCard';
import type { TechnicianOrder } from '@/src/features/schedule/schemas/response.schema';

interface ScheduleOrdersPanelProps {
  readonly orders: TechnicianOrder[];
}

// Keyed by selectedDate from parent so expanded state resets automatically on day change.
export default function ScheduleOrdersPanel({ orders }: ScheduleOrdersPanelProps) {
  const [expanded, setExpanded] = useState(false);

  if (orders.length === 0) return null;

  return (
    <View className="mt-2.5 overflow-hidden rounded-[14px] border border-success-alt/25 bg-order-bg">
      <TouchableOpacity
        onPress={() => setExpanded((prev) => !prev)}
        className="flex-row items-center justify-between px-3.5 py-3"
        activeOpacity={0.7}
      >
        <View className="flex-row items-center gap-2">
          <View className="h-2 w-2 rounded-full bg-success-alt" />
          <Text className="font-semibold text-[13px] text-order-text">
            {orders.length} order{orders.length > 1 ? 's' : ''} this day
          </Text>
        </View>
        {expanded
          ? <ChevronUp size={18} color={Colors.orderText} strokeWidth={2} />
          : <ChevronDown size={18} color={Colors.orderText} strokeWidth={2} />}
      </TouchableOpacity>

      {expanded && (
        <View className="px-3 pb-3">
          {orders.map((o) => (
            <ScheduleOrderCard key={o.id} order={o} />
          ))}
        </View>
      )}
    </View>
  );
}

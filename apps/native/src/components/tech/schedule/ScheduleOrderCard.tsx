import { View, Text } from 'react-native';
import { Colors } from '@/src/lib/colors';
import type { TechnicianOrder } from '@/src/services/tech-calendar/schemas/response.schema';

export const STATUS_LABEL: Record<TechnicianOrder['status'], string> = {
  pending: 'Pending',
  accepted: 'Accepted',
  rejected: 'Rejected',
  cancelled_by_user: 'Cancelled by user',
  cancelled_by_technician: 'Cancelled by you',
  completed: 'Completed',
};

export const STATUS_COLOR: Record<TechnicianOrder['status'], string> = {
  pending: '#F59E0B',
  accepted: '#22C55E',
  rejected: '#EF4444',
  cancelled_by_user: '#9CA3AF',
  cancelled_by_technician: '#9CA3AF',
  completed: '#3B82F6',
};

interface ScheduleOrderCardProps {
  readonly order: TechnicianOrder;
}

export default function ScheduleOrderCard({ order }: ScheduleOrderCardProps) {
  const color = STATUS_COLOR[order.status];
  const label = STATUS_LABEL[order.status];

  return (
    <View
      style={{
        borderWidth: 1,
        borderColor: Colors.borderLight,
        borderRadius: 14,
        padding: 14,
        marginBottom: 10,
        backgroundColor: Colors.white,
      }}
    >
      {/* Status badge */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start', marginBottom: 8 }}>
        <View style={{ backgroundColor: color + '1A', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 }}>
          <Text style={{ color, fontSize: 12, fontWeight: '700' }}>{label}</Text>
        </View>
      </View>

      {/* Primary Description */}
      {order.problem_description ? (
        <Text
          style={{ color: Colors.textPrimary, fontSize: 13, fontWeight: '500', lineHeight: 18 }}
          numberOfLines={3}
        >
          {order.problem_description}
        </Text>
      ) : (
        <Text style={{ color: Colors.textMuted, fontSize: 13, fontStyle: 'italic' }}>
          No description provided.
        </Text>
      )}

      {/* Active indicator */}
      {order.active && (
        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10, gap: 5 }}>
          <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#22C55E' }} />
          <Text style={{ color: '#22C55E', fontSize: 12, fontWeight: '600' }}>Active booking</Text>
        </View>
      )}
    </View>
  );
}

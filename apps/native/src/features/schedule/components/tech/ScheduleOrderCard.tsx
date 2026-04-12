import { View, Text } from 'react-native';
import { Colors } from '@/src/lib/theme';
import { useThemeColors } from '@/src/lib/theme';
import type { TechnicianOrder } from '@/src/features/schedule/schemas/response.schema';

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
  accepted: Colors.successAlt,
  rejected: '#EF4444',
  cancelled_by_user: '#9CA3AF',
  cancelled_by_technician: '#9CA3AF',
  completed: '#3B82F6',
};

interface ScheduleOrderCardProps {
  readonly order: TechnicianOrder;
}

export default function ScheduleOrderCard({ order }: ScheduleOrderCardProps) {
  const themeColors = useThemeColors();
  const color = STATUS_COLOR[order.status];
  const label = STATUS_LABEL[order.status];

  return (
    <View
      className="mb-2.5 rounded-[14px] bg-surface p-3.5"
      style={{
        borderWidth: 1,
        borderColor: themeColors.borderDefault,
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
          style={{ color: themeColors.textPrimary, fontSize: 13, fontWeight: '500', lineHeight: 18 }}
          numberOfLines={3}
        >
          {order.problem_description}
        </Text>
      ) : (
        <Text style={{ color: themeColors.textMuted, fontSize: 13, fontStyle: 'italic' }}>
          No description provided.
        </Text>
      )}

      {/* Active indicator */}
      {order.active && (
        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10, gap: 5 }}>
          <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.successAlt }} />
          <Text style={{ color: Colors.successAlt, fontSize: 12, fontWeight: '600' }}>Active booking</Text>
        </View>
      )}
    </View>
  );
}

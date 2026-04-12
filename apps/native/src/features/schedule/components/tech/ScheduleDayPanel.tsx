import { TouchableOpacity, View } from 'react-native';
import { Text } from '@/src/components/ui/text';
import type { TechnicianOrder } from '@/src/features/schedule/schemas/response.schema';
import ScheduleOrdersPanel from './ScheduleOrdersPanel';

interface Props {
  selectedDate: string;
  today: string;
  selectedDayName: string;
  isSelectedDatePast: boolean;
  isSelectedDateException: boolean;
  isSelectedDayWorking: boolean;
  canMarkUnavailable: boolean;
  orders: TechnicianOrder[];
  onMarkUnavailable: () => void;
  onRemoveOverride: () => void;
  isAddingException: boolean;
  isDeletingException: boolean;
}

export default function ScheduleDayPanel({
  selectedDate,
  today,
  selectedDayName,
  isSelectedDatePast,
  isSelectedDateException,
  isSelectedDayWorking,
  canMarkUnavailable,
  orders,
  onMarkUnavailable,
  onRemoveOverride,
  isAddingException,
  isDeletingException,
}: Props) {
  return (
    <View className="mx-3 mt-3 rounded-2xl border border-edge bg-surface-elevated p-3.5">
      <Text className="mb-0.5 font-semibold text-[13px] text-content-secondary">
        {selectedDate === today ? 'Today' : selectedDayName}{' '}
        <Text className="font-normal text-[13px] text-content-muted">{selectedDate}</Text>
      </Text>

      {isSelectedDatePast ? (
        <Text className="mt-1 text-[13px] text-content-muted">
          Past dates cannot be modified.
        </Text>
      ) : isSelectedDateException ? (
        <>
          <Text className="mt-1 text-[13px] text-status-unavailable">
            🚫 Marked as unavailable (override)
          </Text>
          <TouchableOpacity
            onPress={onRemoveOverride}
            disabled={isDeletingException}
            className={`mt-2.5 items-center rounded-xl border border-status-unavailable py-2.5 ${
              isDeletingException ? 'bg-edge' : 'bg-status-unstatus-available'
            }`}
          >
            <Text
              className={`font-semibold text-[13px] ${
                isDeletingException ? 'text-content-muted' : 'text-status-unavailable'
              }`}
            >
              {isDeletingException ? 'Removing...' : 'Remove Override'}
            </Text>
          </TouchableOpacity>
        </>
      ) : isSelectedDayWorking ? (
        <>
          <Text className="mt-1 text-[13px] text-content-muted">
            ✅ Working day — you are available
          </Text>
          {canMarkUnavailable && (
            <TouchableOpacity
              onPress={onMarkUnavailable}
              disabled={isAddingException}
              className={`mt-2.5 items-center rounded-xl border border-edge py-2.5 ${
                isAddingException ? 'bg-edge' : 'bg-surface'
              }`}
            >
              <Text
                className={`font-semibold text-[13px] ${
                  isAddingException ? 'text-content-muted' : 'text-content'
                }`}
              >
                {isAddingException ? 'Saving...' : 'Mark as Unavailable'}
              </Text>
            </TouchableOpacity>
          )}
        </>
      ) : (
        <Text className="mt-1 text-[13px] text-content-muted">
          Day off — not a working day in your schedule.
        </Text>
      )}

      <ScheduleOrdersPanel orders={orders} />
    </View>
  );
}

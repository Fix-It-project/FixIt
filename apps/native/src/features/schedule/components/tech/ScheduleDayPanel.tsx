import { TouchableOpacity, View } from 'react-native';
import { Text } from '@/src/components/ui/text';
import type { ScheduledEvent } from '@/src/features/schedule/schemas/response.schema';
import ScheduleOrdersPanel from './ScheduleOrdersPanel';

interface StatusActionButtonProps {
  readonly disabled: boolean;
  readonly disabledBackgroundClassName: string;
  readonly enabledBackgroundClassName: string;
  readonly enabledBorderClassName: string;
  readonly disabledTextClassName: string;
  readonly enabledTextClassName: string;
  readonly idleLabel: string;
  readonly loadingLabel: string;
  readonly onPress: () => void;
}

interface Props {
  readonly selectedDate: string;
  readonly today: string;
  readonly selectedDayName: string;
  readonly isSelectedDatePast: boolean;
  readonly isSelectedDateException: boolean;
  readonly isSelectedDayWorking: boolean;
  readonly canMarkUnavailable: boolean;
  readonly orders: ScheduledEvent[];
  readonly onMarkUnavailable: () => void;
  readonly onRemoveOverride: () => void;
  readonly isAddingException: boolean;
  readonly isDeletingException: boolean;
}

function StatusActionButton({
  disabled,
  disabledBackgroundClassName,
  enabledBackgroundClassName,
  enabledBorderClassName,
  disabledTextClassName,
  enabledTextClassName,
  idleLabel,
  loadingLabel,
  onPress,
}: StatusActionButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      className={`mt-2.5 items-center rounded-xl border py-2.5 ${
        disabled ? disabledBackgroundClassName : `${enabledBorderClassName} ${enabledBackgroundClassName}`
      }`}
    >
      <Text
        className={`font-semibold text-[13px] ${
          disabled ? disabledTextClassName : enabledTextClassName
        }`}
      >
        {disabled ? loadingLabel : idleLabel}
      </Text>
    </TouchableOpacity>
  );
}

function renderDayStatus({
  isSelectedDatePast,
  isSelectedDateException,
  isSelectedDayWorking,
  canMarkUnavailable,
  onMarkUnavailable,
  onRemoveOverride,
  isAddingException,
  isDeletingException,
}: Pick<
  Props,
  | 'isSelectedDatePast'
  | 'isSelectedDateException'
  | 'isSelectedDayWorking'
  | 'canMarkUnavailable'
  | 'onMarkUnavailable'
  | 'onRemoveOverride'
  | 'isAddingException'
  | 'isDeletingException'
>) {
  if (isSelectedDatePast) {
    return (
      <Text className="mt-1 text-[13px] text-content-muted">
        Past dates cannot be modified.
      </Text>
    );
  }

  if (isSelectedDateException) {
    return (
      <>
        <Text className="mt-1 text-[13px] text-status-unavailable">
          🚫 Marked as unavailable (override)
        </Text>
        <StatusActionButton
          onPress={onRemoveOverride}
          disabled={isDeletingException}
          disabledBackgroundClassName="border-status-unavailable bg-edge"
          enabledBackgroundClassName="bg-status-unavailable-bg"
          enabledBorderClassName="border-status-unavailable"
          disabledTextClassName="text-content-muted"
          enabledTextClassName="text-status-unavailable"
          idleLabel="Remove Override"
          loadingLabel="Removing..."
        />
      </>
    );
  }

  if (isSelectedDayWorking) {
    return (
      <>
        <Text className="mt-1 text-[13px] text-content-muted">
          ✅ Working day — you are available
        </Text>
        {canMarkUnavailable ? (
          <StatusActionButton
            onPress={onMarkUnavailable}
            disabled={isAddingException}
            disabledBackgroundClassName="border-edge bg-edge"
            enabledBackgroundClassName="bg-surface"
            enabledBorderClassName="border-edge"
            disabledTextClassName="text-content-muted"
            enabledTextClassName="text-content"
            idleLabel="Mark as Unavailable"
            loadingLabel="Saving..."
          />
        ) : null}
      </>
    );
  }

  return (
    <Text className="mt-1 text-[13px] text-content-muted">
      Day off — not a working day in your schedule.
    </Text>
  );
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
  const dayStatus = renderDayStatus({
    isSelectedDatePast,
    isSelectedDateException,
    isSelectedDayWorking,
    canMarkUnavailable,
    onMarkUnavailable,
    onRemoveOverride,
    isAddingException,
    isDeletingException,
  });

  return (
    <View className="mx-3 mt-3 rounded-2xl border border-edge bg-surface-elevated p-3.5">
      <Text className="mb-0.5 font-semibold text-[13px] text-content-secondary">
        {selectedDate === today ? 'Today' : selectedDayName}{' '}
        <Text className="font-normal text-[13px] text-content-muted">{selectedDate}</Text>
      </Text>

      {dayStatus}

      <ScheduleOrdersPanel orders={orders} />
    </View>
  );
}

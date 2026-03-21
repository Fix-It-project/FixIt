import { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';

import BottomSheet, { BottomSheetBackdrop, BottomSheetView } from '@gorhom/bottom-sheet';
import { Calendar, type DateData } from 'react-native-calendars';
import Toast from 'react-native-toast-message';

import { Text } from '@/src/components/ui/text';
import { Button } from '@/src/components/ui/button';
import { useCreateBookingMutation } from '@/src/hooks/orders/useCreateBooking';
import { useTechnicianPublicSchedule } from '@/src/hooks/tech/usePublicSchedule';
import { useAvailabilityMarks } from '@/src/hooks/user/useAvailabilityMarks';
import { Colors } from '@/src/lib/colors';
import { getErrorMessage } from '@/src/lib/helpers/error-helpers';
import { bookingSchema } from '@/src/services/orders/schemas/form.schema';

export interface UserBookingSheetRef {
  open: (techId: string, name: string, serviceId: string) => void;
  close: () => void;
}

const UserBookingSheet = forwardRef<UserBookingSheetRef>((props, ref) => {
  const sheetRef = useRef<BottomSheet>(null);
  const [isOpen, setIsOpen] = useState(false);

  const [techId, setTechId] = useState<string | null>(null);
  const [techName, setTechName] = useState('');
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const { templates, exceptions, isLoading } = useTechnicianPublicSchedule(techId);
  const { mutateAsync: createBooking, isPending } = useCreateBookingMutation();

  const markedDates = useAvailabilityMarks(templates, exceptions, selectedDate);

  useImperativeHandle(ref, () => ({
    open: (id: string, name: string, serviceId: string) => {
      setTechId(id);
      setTechName(name);
      setSelectedServiceId(serviceId);
      setSelectedDate(null);
      setIsOpen(true);
      sheetRef.current?.expand();
    },
    close: () => {
      sheetRef.current?.close();
      setIsOpen(false);
    },
  }));

  const handleConfirm = async () => {
    if (!techId || !selectedDate || !selectedServiceId) return;
    try {
      const payload = bookingSchema.parse({
        technician_id: techId,
        service_id: selectedServiceId,
        scheduled_date: selectedDate,
        problem_description: 'General Service Request',
      });
      await createBooking(payload);
      Toast.show({ type: 'success', text1: 'Booking submitted pending approval!' });
      setTimeout(() => {
        sheetRef.current?.close();
      }, 1500);
    } catch (error: unknown) {
      Toast.show({ type: 'error', text1: getErrorMessage(error) });
    }
  };

  return (
    <BottomSheet
      ref={sheetRef}
      index={-1}
      snapPoints={['75%']}
      enablePanDownToClose
      onClose={() => setIsOpen(false)}
      backgroundStyle={{ borderTopLeftRadius: 24, borderTopRightRadius: 24 }}
      handleIndicatorStyle={{ backgroundColor: Colors.borderLight, width: 40 }}
      backdropComponent={(bProps) => (
        <BottomSheetBackdrop {...bProps} appearsOnIndex={0} disappearsOnIndex={-1} />
      )}
    >
      <BottomSheetView className="flex-1 px-5 pb-5">
        {isOpen && (
          <>
            <View className="mb-4">
              <Text className="font-bold text-[20px]">Book {techName}</Text>
              <Text className="mt-1 text-[14px] text-content-muted">
                Select an available date for the service
              </Text>
            </View>

            {isLoading ? (
              <View className="flex-1 items-center justify-center">
                <ActivityIndicator size="large" color={Colors.brand} />
              </View>
            ) : (
              <>
                <Calendar
                  minDate={new Date().toISOString().split('T')[0]}
                  onDayPress={(day: DateData) => setSelectedDate(day.dateString)}
                  markedDates={markedDates}
                  markingType="custom"
                  theme={{
                    todayTextColor: Colors.brand,
                    arrowColor: Colors.brand,
                    textDisabledColor: Colors.borderLight,
                    selectedDayBackgroundColor: Colors.brand,
                    selectedDayTextColor: Colors.white,
                    dayTextColor: Colors.textPrimary,
                    // @ts-expect-error: undocumented but supported calendar theme override
                    'stylesheet.day.basic': {
                      base: {
                        width: 32,
                        height: 32,
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: 16,
                      },
                    },
                  }}
                />

                <View className="flex-1 justify-end pt-4">
                  <Button
                    disabled={!selectedDate || isPending}
                    onPress={handleConfirm}
                    className="w-full"
                  >
                    <Text>
                      {isPending ? 'Confirming...' : 'Confirm Booking'}
                    </Text>
                  </Button>
                </View>
              </>
            )}
          </>
        )}
      </BottomSheetView>
    </BottomSheet>
  );
});

export default UserBookingSheet;

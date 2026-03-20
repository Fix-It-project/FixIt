import React, { forwardRef, useImperativeHandle, useRef, useState, useMemo, useCallback } from 'react';
import { View, TouchableOpacity, ActivityIndicator, Animated } from 'react-native';
import BottomSheet, { BottomSheetView, BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import { Calendar } from 'react-native-calendars';
import { Text } from '@/src/components/ui/text';
import { Colors } from '@/src/lib/colors';
import { useTechnicianPublicSchedule } from '@/src/hooks/tech/usePublicSchedule';
import { useCreateBookingMutation } from '@/src/hooks/orders/useCreateBooking';

type ToastType = 'success' | 'error';

function useToast() {
  const opacity = useRef(new Animated.Value(0)).current;
  const [message, setMessage] = useState('');
  const [type, setType] = useState<ToastType>('success');
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = useCallback(
    (msg: string, toastType: ToastType = 'success') => {
      if (timerRef.current) clearTimeout(timerRef.current);
      setMessage(msg);
      setType(toastType);
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 250, useNativeDriver: true }),
        Animated.delay(1500),
        Animated.timing(opacity, { toValue: 0, duration: 300, useNativeDriver: true }),
      ]).start();
      timerRef.current = setTimeout(() => setMessage(''), 2100);
    },
    [opacity],
  );

  const ToastComponent = message ? (
    <Animated.View
      style={{
        opacity,
        position: 'absolute',
        top: 16,
        left: 16,
        right: 16,
        zIndex: 100,
        backgroundColor: type === 'success' ? Colors.brand : '#D9534F',
        borderRadius: 14,
        paddingHorizontal: 16,
        paddingVertical: 12,
        shadowColor: '#000',
        shadowOpacity: 0.15,
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 8,
        elevation: 6,
      }}
    >
      <Text style={{ color: '#fff', fontWeight: '600', fontSize: 14 }}>{message}</Text>
    </Animated.View>
  ) : null;

  return { show, ToastComponent };
}

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

  const { show: showToast, ToastComponent } = useToast();

  const { templates, exceptions, isLoading } = useTechnicianPublicSchedule(techId);
  const { mutateAsync: createBooking, isPending } = useCreateBookingMutation();

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
    }
  }));

  // Build the dates available based on the templates & exceptions.
  const markedDates = useMemo(() => {
    const marks: Record<string, any> = {};
    if (!templates.length) return marks;

    const activeDays = new Set(templates.filter(t => t.active).map(t => t.day_of_week));
    const exceptionDates = new Set(exceptions.map(e => e.date));

    const today = new Date();
    const end = new Date();
    end.setMonth(today.getMonth() + 3);

    const cursor = new Date(today);
    while (cursor <= end) {
      const dateStr = cursor.toISOString().split('T')[0];
      const dayOfWeek = cursor.getDay();

      const isUnavailable = !activeDays.has(dayOfWeek) || exceptionDates.has(dateStr);
      const isSelected = dateStr === selectedDate;

      if (isSelected && !isUnavailable) {
        marks[dateStr] = {
          selected: true,
          selectedColor: Colors.brand,
          customStyles: {
            container: {
              backgroundColor: Colors.brand,
              borderRadius: 20,
            },
            text: { color: '#fff', fontWeight: '700' },
          },
        };
      } else if (isUnavailable) {
        marks[dateStr] = {
          disabled: true,
          disableTouchEvent: true,
          customStyles: {
            container: { backgroundColor: 'transparent' },
            text: { color: '#D1D5DB' },   
          },
        };
      }

      cursor.setDate(cursor.getDate() + 1);
    }
    return marks;
  }, [templates, exceptions, selectedDate]);

  const handleConfirm = async () => {
    if (!techId || !selectedDate) return;
    try {
      await createBooking({
        technician_id: techId,
        service_id: '9722e1e5-0a32-401b-b9f1-0521062bf682', //hardcoded for now since logic not yet implemented
        scheduled_date: selectedDate,
        problem_description: 'General Service Request', //hardcoded for now since we don't have a description input in the UI
      });
      showToast('Booking submitted pending approval! ✓', 'success');
      setTimeout(() => {
        sheetRef.current?.close();
      }, 1500); 
    } catch (error: any) {
      const errorMsg = error?.response?.data?.error || error?.message || 'Failed to submit booking. Try again.';
      showToast(errorMsg, 'error');
    }
  };

  return (
    <BottomSheet
      ref={sheetRef}
      index={-1}
      snapPoints={['75%']}
      enablePanDownToClose
      onClose={() => setIsOpen(false)}
      backdropComponent={(bProps) => (
        <BottomSheetBackdrop {...bProps} appearsOnIndex={0} disappearsOnIndex={-1} />
      )}
    >
      <BottomSheetView style={{ flex: 1, paddingHorizontal: 20, paddingBottom: 20 }}>
        {ToastComponent}
        
        {isOpen && (
          <>
            <View className="mb-4">
              <Text className="text-[20px] font-bold">Book {techName}</Text>
              <Text className="text-[14px] text-content-muted mt-1">Select an available date for the service</Text>
            </View>

            {isLoading ? (
              <View className="flex-1 items-center justify-center">
                <ActivityIndicator size="large" color={Colors.brand} />
              </View>
            ) : (
              <>
                <Calendar
                  minDate={new Date().toISOString().split('T')[0]}
                  onDayPress={(day: any) => setSelectedDate(day.dateString)}
                  markedDates={markedDates}
                  markingType="custom"
                  theme={{
                    todayTextColor: Colors.brand,
                    arrowColor: Colors.brand,
                    textDisabledColor: '#D1D5DB',
                    selectedDayBackgroundColor: Colors.brand,
                    selectedDayTextColor: '#fff',
                    dayTextColor: '#111827',
                    // Rounded day cells — required for pill-shaped selection
                    'stylesheet.day.basic': {
                      base: {
                        width: 32,
                        height: 32,
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: 16,
                      },
                    },
                  } as any}
                />

                <View className="flex-1 justify-end pt-4">
                  <TouchableOpacity
                    disabled={!selectedDate || isPending}
                    onPress={handleConfirm}
                    activeOpacity={0.8}
                    style={{
                      backgroundColor: !selectedDate || isPending ? Colors.borderLight : Colors.brand,
                      padding: 16,
                      borderRadius: 12,
                      alignItems: 'center',
                    }}
                  >
                    <Text className="text-white font-bold text-[16px]">
                      {isPending ? 'Confirming...' : 'Confirm Booking'}
                    </Text>
                  </TouchableOpacity>
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
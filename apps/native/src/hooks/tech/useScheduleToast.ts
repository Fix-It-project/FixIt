import { useState, useCallback, useRef } from 'react';
import { Animated } from 'react-native';

type ToastType = 'success' | 'error';

export function useScheduleToast() {
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
        Animated.delay(2500),
        Animated.timing(opacity, { toValue: 0, duration: 300, useNativeDriver: true }),
      ]).start();
      timerRef.current = setTimeout(() => setMessage(''), 3100);
    },
    [opacity],
  );

  return { show, message, type, opacity };
}

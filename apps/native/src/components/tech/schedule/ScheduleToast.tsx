import { Animated, Text } from 'react-native';
import { Colors } from '@/src/lib/colors';

interface ScheduleToastProps {
  readonly message: string;
  readonly type: 'success' | 'error';
  readonly opacity: Animated.Value;
}

export default function ScheduleToast({ message, type, opacity }: ScheduleToastProps) {
  if (!message) return null;

  return (
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
  );
}

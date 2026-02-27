
import { View, Text } from 'react-native';
import Toast, { type ToastConfig, type ToastProps } from 'react-native-toast-message';
import { CheckCircle2, XCircle, Info } from 'lucide-react-native';
import { Colors } from '@/src/lib/colors';

export const toastConfig: ToastConfig = {
  success: ({ text1, text2 }) => (
    <View className="mt-2 flex-row items-center rounded-2xl border border-edge/50 bg-white p-4 w-[90%] shadow-sm">
      <View style={{ marginRight: 12, alignSelf: 'center' }}>
        <CheckCircle2 color={Colors.success} size={20} />
      </View>
      <View className="flex-1">
        {text1 ? <Text className="text-[15px] font-bold text-content">{text1}</Text> : null}
        {text2 ? <Text className="mt-1 text-[13px] text-content-secondary">{text2}</Text> : null}
      </View>
    </View>
  ),
  error: ({ text1, text2 }) => (
    <View className="mt-2 flex-row items-center rounded-2xl border border-red-200 bg-red-50 p-4 w-[90%] shadow-sm">
      <View style={{ marginRight: 12, alignSelf: 'center' }}>
        <XCircle color={Colors.error} size={20} />
      </View>
      <View className="flex-1">
        {text1 ? <Text className="text-[15px] font-bold text-red-800">{text1}</Text> : null}
        {text2 ? <Text className="mt-1 text-[13px] text-red-600">{text2}</Text> : null}
      </View>
    </View>
  ),
  info: ({ text1, text2 }) => (
    <View className="mt-2 flex-row items-center rounded-2xl border border-brand/30 bg-brand-light p-4 w-[90%] shadow-sm">
      <View style={{ marginRight: 12, alignSelf: 'center' }}>
        <Info color={Colors.brand} size={20} />
      </View>
      <View className="flex-1">
        {text1 ? <Text className="text-[15px] font-bold text-content">{text1}</Text> : null}
        {text2 ? <Text className="mt-1 text-[13px] text-content-secondary">{text2}</Text> : null}
      </View>
    </View>
  ),
};

// Simple wrapper so we can import Toast and config together easily from Reusables path
export function CustomToast(props: ToastProps) {
  return <Toast config={toastConfig} {...props} />;
}

export { Toast };

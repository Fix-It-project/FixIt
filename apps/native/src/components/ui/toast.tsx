
import { View, Text } from 'react-native';
import Toast, { type ToastConfig, type ToastProps } from 'react-native-toast-message';
import { CheckCircle2, XCircle, Info } from 'lucide-react-native';

export const toastConfig: ToastConfig = {
  success: ({ text1, text2 }) => (
    <View className="mt-2 flex-row items-center rounded-2xl border border-[#c4c0cc]/50 bg-white p-4 w-[90%] shadow-sm">
      <View style={{ marginRight: 12, alignSelf: 'center' }}>
        <CheckCircle2 color="#10b981" size={20} />
      </View>
      <View className="flex-1">
        {text1 ? <Text className="text-[15px] font-bold text-[#141118]">{text1}</Text> : null}
        {text2 ? <Text className="mt-1 text-[13px] text-[#735f8c]">{text2}</Text> : null}
      </View>
    </View>
  ),
  error: ({ text1, text2 }) => (
    <View className="mt-2 flex-row items-center rounded-2xl border border-red-200 bg-red-50 p-4 w-[90%] shadow-sm">
      <View style={{ marginRight: 12, alignSelf: 'center' }}>
        <XCircle color="#ef4444" size={20} />
      </View>
      <View className="flex-1">
        {text1 ? <Text className="text-[15px] font-bold text-red-800">{text1}</Text> : null}
        {text2 ? <Text className="mt-1 text-[13px] text-red-600">{text2}</Text> : null}
      </View>
    </View>
  ),
  info: ({ text1, text2 }) => (
    <View className="mt-2 flex-row items-center rounded-2xl border border-[#036ded]/30 bg-[#ebeeff] p-4 w-[90%] shadow-sm">
      <View style={{ marginRight: 12, alignSelf: 'center' }}>
        <Info color="#036ded" size={20} />
      </View>
      <View className="flex-1">
        {text1 ? <Text className="text-[15px] font-bold text-[#141118]">{text1}</Text> : null}
        {text2 ? <Text className="mt-1 text-[13px] text-[#735f8c]">{text2}</Text> : null}
      </View>
    </View>
  ),
};

// Simple wrapper so we can import Toast and config together easily from Reusables path
export function CustomToast(props: ToastProps) {
  return <Toast config={toastConfig} {...props} />;
}

export { Toast };

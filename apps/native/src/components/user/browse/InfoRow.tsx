import { View } from "react-native";
import { Text } from "@/src/components/ui/text";

interface InfoRowProps {
  readonly icon: React.ReactNode;
  readonly text: string | number;
  readonly className?: string;
}

export default function InfoRow({ icon, text, className = "" }: InfoRowProps) {
  return (
    <View
      className={`w-full flex-row items-center rounded-xl bg-surface-gray px-4 py-3 ${className}`}
      style={{ gap: 8, minHeight: 48 }}
    >
      {icon}
      <Text
        className="flex-1 text-[13px] text-content-secondary"
        style={{ fontFamily: "GoogleSans_400Regular", includeFontPadding: false }}
      >
        {text}
      </Text>
    </View>
  );
}

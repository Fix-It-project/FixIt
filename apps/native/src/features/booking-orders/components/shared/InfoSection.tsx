import type { LucideIcon } from "lucide-react-native";
import { TouchableOpacity, View } from "react-native";
import { Text } from "@/src/components/ui/text";
import { useThemeColors } from "@/src/lib/theme";

export interface InfoSectionRow {
  readonly icon: LucideIcon;
  readonly label: string;
  readonly onPress?: () => void;
  readonly value: string;
}

interface Props {
  readonly rows: readonly InfoSectionRow[];
}

function InfoRow({ icon: Icon, label, onPress, value }: InfoSectionRow) {
  const themeColors = useThemeColors();
  const color = onPress ? themeColors.primary : themeColors.textPrimary;
  const content = (
    <>
      <View
        className="h-10 w-10 items-center justify-center rounded-xl"
        style={{ backgroundColor: `${themeColors.primary}12` }}
      >
        <Icon size={18} color={themeColors.primary} strokeWidth={2} />
      </View>
      <View className="flex-1">
        <Text
          style={{
            fontSize: 11,
            color: themeColors.textMuted,
            textTransform: "uppercase",
            letterSpacing: 0.5,
          }}
        >
          {label}
        </Text>
        <Text
          style={{
            fontFamily: "GoogleSans_600SemiBold",
            fontSize: 14,
            color,
            marginTop: 1,
          }}
          numberOfLines={2}
        >
          {value}
        </Text>
      </View>
    </>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        className="flex-row items-center gap-3"
        activeOpacity={0.7}
        onPress={onPress}
      >
        {content}
      </TouchableOpacity>
    );
  }

  return <View className="flex-row items-center gap-3">{content}</View>;
}

export default function InfoSection({ rows }: Props) {
  const themeColors = useThemeColors();

  return (
    <View
      className="mb-4 rounded-2xl bg-surface p-4"
      style={{
        borderWidth: 1,
        borderColor: themeColors.borderDefault,
        gap: 16,
      }}
    >
      {rows.map((row) => (
        <InfoRow
          key={`${row.label}:${row.value}`}
          icon={row.icon}
          label={row.label}
          value={row.value}
          onPress={row.onPress}
        />
      ))}
    </View>
  );
}

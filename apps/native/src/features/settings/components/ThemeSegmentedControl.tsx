import { Moon, Smartphone, Sun } from "lucide-react-native";
import { Pressable, View } from "react-native";
import { Text } from "@/src/components/ui/text";
import { useColorScheme } from "@/src/hooks/use-color-scheme";
import { useThemeColors } from "@/src/lib/theme";
import { type ThemeOption, useThemeEasterEgg } from "@/src/features/settings/hooks/useThemeEasterEgg";

const OPTIONS: ThemeOption[] = [
  { value: "light", label: "Light", Icon: Sun },
  { value: "dark", label: "Dark", Icon: Moon },
  { value: "system", label: "System", Icon: Smartphone },
];

export function ThemeSegmentedControl() {
  const { preference, setPreference } = useColorScheme();
  const themeColors = useThemeColors();
  const { options, handlePreferencePress } = useThemeEasterEgg(
    setPreference,
    OPTIONS,
  );

  return (
    <View
      className="flex-row rounded-xl p-1"
      style={{
        backgroundColor: themeColors.surfaceElevated,
      }}
    >
      {options.map(({ value, label, Icon }) => {
        const isActive = preference === value;

        return (
          <Pressable
            key={value}
            className="flex-1 flex-row items-center justify-center rounded-lg py-2.5"
            onPress={() => handlePreferencePress(value)}
            style={{
              backgroundColor: isActive
                ? themeColors.surfaceBase
                : "transparent",
              elevation: isActive ? 1 : 0,
            }}
          >
            <View className="flex-row items-center justify-center gap-2">
              <Icon
                size={16}
                strokeWidth={1.8}
                color={isActive ? themeColors.primary : themeColors.textMuted}
              />
              <Text
                className="text-sm font-medium"
                style={{
                  color: isActive ? themeColors.primary : themeColors.textMuted,
                }}
              >
                {label}
              </Text>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

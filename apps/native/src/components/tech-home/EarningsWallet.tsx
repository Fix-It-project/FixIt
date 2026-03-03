import { View, TouchableOpacity } from "react-native";
import { Text } from "@/src/components/ui/text";
import { TrendingUp } from "lucide-react-native";
import { Colors } from "@/src/lib/colors";
import { EARNINGS, WALLET } from "@/src/lib/tech-mock-data";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeInUp } from "react-native-reanimated";

function MiniBarChart() {
  const maxVal = Math.max(...EARNINGS.barData);

  return (
    <View className="mt-3 flex-row items-end" style={{ height: 32, gap: 3 }}>
      {EARNINGS.barData.map((val, i) => {
        const heightPercent = (val / maxVal) * 100;
        const opacity = 0.3 + (i / (EARNINGS.barData.length - 1)) * 0.7;

        return (
          <View
            key={`bar-${i}`}
            className="flex-1 rounded-sm"
            style={{
              height: `${heightPercent}%`,
              backgroundColor: Colors.brand,
              opacity,
            }}
          />
        );
      })}
    </View>
  );
}

export default function EarningsWallet() {
  return (
    <Animated.View
      entering={FadeInUp.delay(300).duration(400)}
      className="mt-6 flex-row gap-4 px-4"
    >
      {/* Earnings card */}
      <View
        className="flex-1 rounded-2xl bg-white p-4"
        style={{
          borderWidth: 1,
          borderColor: Colors.borderLight,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.04,
          shadowRadius: 4,
          elevation: 1,
        }}
      >
        <Text className="mb-1 text-[10px] font-bold uppercase tracking-wider text-content-muted">
          Weekly Earnings
        </Text>
        <Text
          className="text-xl font-bold text-content"
          style={{ fontFamily: "GoogleSans_700Bold" }}
        >
          {EARNINGS.weeklyAmount}
        </Text>

        <View className="mt-1.5 flex-row items-center gap-1">
          <TrendingUp size={12} color={Colors.success} strokeWidth={2} />
          <Text className="text-[10px] font-bold" style={{ color: Colors.success }}>
            {EARNINGS.trendPercentage}
          </Text>
        </View>

        <MiniBarChart />
      </View>

      {/* Wallet card */}
      <View
        className="flex-1 justify-between rounded-2xl bg-white p-4"
        style={{
          borderWidth: 1,
          borderColor: Colors.borderLight,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.04,
          shadowRadius: 4,
          elevation: 1,
        }}
      >
        <View>
          <Text className="mb-1 text-[10px] font-bold uppercase tracking-wider text-content-muted">
            Wallet Balance
          </Text>
          <Text
            className="text-xl font-bold text-content"
            style={{ fontFamily: "GoogleSans_700Bold" }}
          >
            {WALLET.balance}
          </Text>
        </View>

        <TouchableOpacity
          className="mt-4 items-center rounded-xl border py-2.5"
          style={{
            backgroundColor: `${Colors.brand}10`,
            borderColor: `${Colors.brand}30`,
          }}
          activeOpacity={0.7}
        >
          <Text
            className="text-[11px] font-bold uppercase"
            style={{ color: Colors.brand }}
          >
            Withdraw
          </Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

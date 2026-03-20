import { View, TouchableOpacity } from "react-native";
import { Text } from "@/src/components/ui/text";
import { Colors } from "@/src/lib/colors";
import { WALLET } from "@/src/lib/mock-data/tech";
import Animated, { FadeInUp } from "react-native-reanimated";

export default function EarningsWallet() {
  return (
    <Animated.View
      entering={FadeInUp.delay(300).duration(400)}
      className="mt-6 px-4"
    >
      {/* Wallet card */}
      <View
        className="rounded-2xl bg-white p-4"
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
          Wallet Balance
        </Text>
        <Text
          className="text-xl font-bold text-content"
          style={{ fontFamily: "GoogleSans_700Bold" }}
        >
          {WALLET.balance}
        </Text>

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

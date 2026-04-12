import { View, Text } from 'react-native';
import { Colors } from '@/src/lib/colors';

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
      <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: color }} />
      <Text style={{ fontSize: 12, color: Colors.textMuted }}>{label}</Text>
    </View>
  );
}

export default function ScheduleLegend() {
  return (
    <View style={{ marginTop: 16, paddingHorizontal: 16 }}>
      <Text style={{ fontSize: 13, fontWeight: '600', marginBottom: 10, color: Colors.textSecondary }}>
        Legend
      </Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 16 }}>
        <LegendItem color={Colors.primary} label="Selected date" />
        <LegendItem color={Colors.borderDefault} label="Day off" />
        <LegendItem color={Colors.successAlt} label="Has orders" />
        <LegendItem color={Colors.statusUnavailable} label="Overridden (unavailable)" />
      </View>
    </View>
  );
}

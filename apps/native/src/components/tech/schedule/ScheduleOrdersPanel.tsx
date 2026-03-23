import { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Animated } from 'react-native';
import type { TechnicianOrder } from '@/src/services/tech-calendar/schemas/response.schema';
import ScheduleOrderCard from './ScheduleOrderCard';

interface ScheduleOrdersPanelProps {
  readonly orders: TechnicianOrder[];
}

export default function ScheduleOrdersPanel({ orders }: ScheduleOrdersPanelProps) {
  const [expanded, setExpanded] = useState(false);
  const anim = useRef(new Animated.Value(0)).current;

  // Reset expansion when the order list changes (i.e. day changed)
  useEffect(() => {
    setExpanded(false);
    anim.setValue(0);
  }, [orders]);

  if (orders.length === 0) return null;

  const toggle = () => {
    const toValue = expanded ? 0 : 1;
    Animated.spring(anim, { toValue, useNativeDriver: false, tension: 60, friction: 10 }).start();
    setExpanded(!expanded);
  };

  return (
    <View
      style={{
        marginTop: 10,
        borderWidth: 1,
        borderColor: '#22C55E40',
        borderRadius: 14,
        overflow: 'hidden',
        backgroundColor: '#F0FDF4',
      }}
    >
      {/* Header / toggle */}
      <TouchableOpacity
        onPress={toggle}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 14,
          paddingVertical: 12,
        }}
        activeOpacity={0.7}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#22C55E' }} />
          <Text style={{ color: '#15803D', fontWeight: '600', fontSize: 13 }}>
            {orders.length} order{orders.length > 1 ? 's' : ''} this day
          </Text>
        </View>
        <Text style={{ color: '#15803D', fontSize: 18, lineHeight: 20 }}>
          {expanded ? '▲' : '▼'}
        </Text>
      </TouchableOpacity>

      {/* Expandable cards */}
      {expanded && (
        <View style={{ paddingHorizontal: 12, paddingBottom: 12 }}>
          {orders.map((o) => (
            <ScheduleOrderCard key={o.id} order={o} />
          ))}
        </View>
      )}
    </View>
  );
}

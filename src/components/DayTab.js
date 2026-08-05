import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { COLORS, FONTS, hexToRgba } from '../theme';

export default function DayTab({ label, color, active, onPress, wide }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.tab,
        wide && styles.tabWide,
        { backgroundColor: active ? color : hexToRgba(color, 0.16) },
      ]}
    >
      <Text style={[styles.label, active && styles.labelActive, wide && styles.labelWide]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  tab: {
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    marginBottom: 8,
  },
  tabWide: { width: undefined, paddingHorizontal: 14 },
  label: { fontFamily: FONTS.mono, fontWeight: '700', fontSize: 14, color: COLORS.ink },
  labelActive: { color: '#fff8ec' },
  labelWide: { fontFamily: FONTS.body, fontSize: 12 },
});

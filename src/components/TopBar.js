import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS } from '../theme';

export default function TopBar({ title, onExit, right }) {
  return (
    <View style={styles.bar}>
      <TouchableOpacity onPress={onExit} style={styles.iconBtn}>
        <Ionicons name="chevron-back" size={20} color={COLORS.ink} />
      </TouchableOpacity>
      <Text style={styles.title} numberOfLines={1}>
        {title}
      </Text>
      {right ? <Text style={styles.right}>{right}</Text> : <View style={{ width: 32 }} />}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 8, paddingBottom: 10 },
  iconBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.card,
  },
  title: { flex: 1, marginLeft: 10, fontFamily: FONTS.body, fontWeight: '700', fontSize: 15, color: COLORS.ink },
  right: { fontFamily: FONTS.mono, fontSize: 12, color: COLORS.inkSoft },
});

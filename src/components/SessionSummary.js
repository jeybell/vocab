import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS } from '../theme';

export default function SessionSummary({ total, wrongCount, onRestart, onExit }) {
  const correct = total - wrongCount;
  return (
    <View style={styles.wrap}>
      <Ionicons name="sparkles-outline" size={28} color={COLORS.ink} />
      <Text style={styles.title}>학습 완료</Text>
      <Text style={styles.score}>
        {correct} / {total}
      </Text>
      <Text style={styles.scoreLabel}>정답</Text>
      <View style={styles.actions}>
        <TouchableOpacity style={[styles.btn, styles.btnGhost]} onPress={onExit}>
          <Text style={styles.btnGhostText}>처음으로</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.btn, styles.btnPrimary]} onPress={onRestart}>
          <Ionicons name="refresh" size={15} color="#fff8ec" />
          <Text style={styles.btnPrimaryText}>다시 학습</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8, paddingHorizontal: 20 },
  title: { fontFamily: FONTS.serifBold, fontSize: 20, color: COLORS.ink, marginTop: 6 },
  score: { fontFamily: FONTS.mono, fontSize: 40, fontWeight: '700', color: COLORS.ink, marginTop: 6 },
  scoreLabel: { fontSize: 13, color: COLORS.inkSoft, marginBottom: 8 },
  actions: { flexDirection: 'row', gap: 10, width: '100%', maxWidth: 280 },
  btn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderRadius: 10,
    paddingVertical: 12,
  },
  btnGhost: { borderWidth: 1, borderColor: COLORS.cardBorder },
  btnGhostText: { color: COLORS.inkSoft, fontWeight: '700', fontSize: 14 },
  btnPrimary: { backgroundColor: COLORS.ink },
  btnPrimaryText: { color: '#fff8ec', fontWeight: '700', fontSize: 14 },
});

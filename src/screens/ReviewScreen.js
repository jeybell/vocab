import React from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, DAY_ACCENT, FONTS } from '../theme';
import TopBar from '../components/TopBar';

export default function ReviewScreen({ wrongPool, loaded, onStartFlashcard, onStartQuiz, onRemove, onClearAll, onExit }) {
  return (
    <SafeAreaView style={styles.container}>
      <TopBar title="오답노트" onExit={onExit} />
      {!loaded ? (
        <Text style={styles.emptyPlain}>불러오는 중...</Text>
      ) : wrongPool.length === 0 ? (
        <View style={styles.emptyWrap}>
          <Ionicons name="sparkles-outline" size={22} color={COLORS.inkSoft} />
          <Text style={styles.emptyTitle}>아직 틀린 단어가 없어요.</Text>
          <Text style={styles.emptySub}>플래시카드나 퀴즈에서 놓친 단어가 여기 쌓입니다.</Text>
        </View>
      ) : (
        <View style={styles.body}>
          <View style={styles.actionsRow}>
            <TouchableOpacity style={styles.actionBtn} onPress={onStartFlashcard}>
              <Ionicons name="layers-outline" size={15} color={COLORS.ink} />
              <Text style={styles.actionBtnText}>플래시카드로 복습</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBtn} onPress={onStartQuiz}>
              <Ionicons name="list-outline" size={15} color={COLORS.ink} />
              <Text style={styles.actionBtnText}>퀴즈로 복습</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={wrongPool}
            keyExtractor={(item) => item.id}
            style={{ flex: 1 }}
            contentContainerStyle={{ paddingBottom: 12, gap: 7 }}
            renderItem={({ item }) => (
              <View style={styles.row}>
                <View style={[styles.dayChipSm, { backgroundColor: DAY_ACCENT[item.day] }]}>
                  <Text style={styles.dayChipSmText}>D{item.day}</Text>
                </View>
                <View style={styles.rowText}>
                  <Text style={styles.rowWord}>{item.word}</Text>
                  <Text style={styles.rowMeaning}>{item.meaning}</Text>
                </View>
                <TouchableOpacity onPress={() => onRemove(item.id)} hitSlop={8}>
                  <Ionicons name="checkmark" size={18} color={COLORS.green} />
                </TouchableOpacity>
              </View>
            )}
          />

          <TouchableOpacity style={styles.clearBtn} onPress={onClearAll}>
            <Ionicons name="trash-outline" size={14} color={COLORS.red} />
            <Text style={styles.clearBtnText}>오답노트 전체 지우기</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.paper },
  body: { flex: 1, paddingHorizontal: 20 },
  emptyPlain: { flex: 1, textAlign: 'center', textAlignVertical: 'center', color: COLORS.inkSoft },
  emptyWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 6, paddingHorizontal: 30 },
  emptyTitle: { color: COLORS.inkSoft, fontSize: 14 },
  emptySub: { color: COLORS.inkSoft, fontSize: 12, textAlign: 'center' },
  actionsRow: { flexDirection: 'row', gap: 10, marginBottom: 14 },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    borderRadius: 10,
    paddingVertical: 11,
  },
  actionBtnText: { fontWeight: '700', fontSize: 12.5, color: COLORS.ink },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    borderRadius: 10,
    padding: 10,
  },
  dayChipSm: { paddingHorizontal: 7, paddingVertical: 3, borderRadius: 999 },
  dayChipSmText: { color: '#fff', fontFamily: FONTS.mono, fontSize: 10, fontWeight: '700' },
  rowText: { flex: 1 },
  rowWord: { fontFamily: FONTS.serifBold, fontSize: 15, color: COLORS.ink },
  rowMeaning: { fontSize: 12, color: COLORS.inkSoft },
  clearBtn: { flexDirection: 'row', gap: 5, alignItems: 'center', justifyContent: 'center', paddingVertical: 12 },
  clearBtnText: { color: COLORS.red, fontSize: 12.5 },
});

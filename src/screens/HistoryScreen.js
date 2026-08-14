import React from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS } from '../theme';
import TopBar from '../components/TopBar';

function formatDate(iso) {
  const d = new Date(iso);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday = d.toDateString() === yesterday.toDateString();

  const time = d.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
  if (isToday) return `오늘 ${time}`;
  if (isYesterday) return `어제 ${time}`;
  return `${d.getMonth() + 1}월 ${d.getDate()}일 ${time}`;
}

export default function HistoryScreen({ history, loaded, onClearAll, onExit }) {
  return (
    <SafeAreaView style={styles.container}>
      <TopBar title="학습 기록" onExit={onExit} right={loaded ? `총 ${history.length}회` : ''} />
      {!loaded ? (
        <Text style={styles.emptyPlain}>불러오는 중...</Text>
      ) : history.length === 0 ? (
        <View style={styles.emptyWrap}>
          <Ionicons name="time-outline" size={22} color={COLORS.inkSoft} />
          <Text style={styles.emptyTitle}>아직 완료한 학습이 없어요.</Text>
          <Text style={styles.emptySub}>플래시카드나 퀴즈를 끝까지 마치면 여기 기록됩니다.</Text>
        </View>
      ) : (
        <View style={styles.body}>
          <FlatList
            data={history}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingBottom: 12, gap: 8 }}
            renderItem={({ item }) => {
              const ratio = item.total > 0 ? item.correct / item.total : 0;
              const scoreColor = ratio >= 0.8 ? COLORS.green : ratio >= 0.5 ? COLORS.ink : COLORS.red;
              return (
                <View style={styles.row}>
                  <View style={styles.rowTop}>
                    <Ionicons
                      name={item.mode === 'quiz' ? 'list-outline' : 'layers-outline'}
                      size={14}
                      color={COLORS.inkSoft}
                    />
                    <Text style={styles.rowMode}>{item.mode === 'quiz' ? '퀴즈' : '플래시카드'}</Text>
                    <Text style={styles.rowDate}>{formatDate(item.date)}</Text>
                  </View>
                  <Text style={styles.rowTitle} numberOfLines={1}>
                    {item.title}
                  </Text>
                  <Text style={[styles.rowScore, { color: scoreColor }]}>
                    {item.correct} / {item.total}
                  </Text>
                </View>
              );
            }}
          />
          <TouchableOpacity style={styles.clearBtn} onPress={onClearAll}>
            <Ionicons name="trash-outline" size={14} color={COLORS.red} />
            <Text style={styles.clearBtnText}>기록 전체 지우기</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.paper },
  body: { flex: 1, paddingHorizontal: 20, paddingTop: 4 },
  emptyPlain: { flex: 1, textAlign: 'center', textAlignVertical: 'center', color: COLORS.inkSoft },
  emptyWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 6, paddingHorizontal: 30 },
  emptyTitle: { color: COLORS.inkSoft, fontSize: 14 },
  emptySub: { color: COLORS.inkSoft, fontSize: 12, textAlign: 'center' },
  row: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    borderRadius: 10,
    padding: 12,
  },
  rowTop: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  rowMode: { fontSize: 11.5, fontWeight: '700', color: COLORS.inkSoft, flex: 1 },
  rowDate: { fontFamily: FONTS.mono, fontSize: 11, color: COLORS.inkSoft },
  rowTitle: { fontFamily: FONTS.body, fontWeight: '700', fontSize: 14.5, color: COLORS.ink, marginTop: 4 },
  rowScore: { fontFamily: FONTS.mono, fontSize: 16, fontWeight: '700', marginTop: 4 },
  clearBtn: { flexDirection: 'row', gap: 5, alignItems: 'center', justifyContent: 'center', paddingVertical: 12 },
  clearBtnText: { color: COLORS.red, fontSize: 12.5 },
});

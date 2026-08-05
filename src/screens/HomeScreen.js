import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import DayTab from '../components/DayTab';
import { COLORS, DAY_ACCENT, FONTS, hexToRgba } from '../theme';
import { WORDS } from '../data/words';

const DAYS = [1, 2, 3, 4, 5];

function sessionLabel(session) {
  const modeLabel = session.mode === 'quiz' ? '퀴즈' : '플래시카드';
  const scope =
    session.source === 'wrong'
      ? '오답노트'
      : Array.isArray(session.selectedDays) && session.selectedDays.length === DAYS.length
        ? '전체'
        : `Day ${(session.selectedDays || []).slice().sort((a, b) => a - b).join(', ')}`;
  const total = session.deckIds ? session.deckIds.length : 0;
  return `${scope} · ${modeLabel} · ${session.index + 1}/${total}`;
}

export default function HomeScreen({
  selectedDays,
  toggleDay,
  selectAll,
  poolCount,
  wrongCount,
  loaded,
  onStart,
  onReview,
  savedSession,
  onResume,
}) {
  const allSelected = selectedDays.length === DAYS.length;
  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.eyebrow}>원정의T · 정의쌤 어휘 노트</Text>
        <Text style={styles.title}>단어장</Text>
        <Text style={styles.sub}>무작위 학습 · 총 {WORDS.length}개 단어</Text>

        {savedSession && (
          <TouchableOpacity style={styles.resumeCard} onPress={onResume}>
            <View style={styles.resumeIconWrap}>
              <Ionicons name="play" size={16} color="#fff8ec" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.resumeTitle}>이어서 학습하기</Text>
              <Text style={styles.resumeDesc}>{sessionLabel(savedSession)}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={COLORS.inkSoft} />
          </TouchableOpacity>
        )}

        <View style={styles.tabRail}>
          {DAYS.map((d) => (
            <DayTab
              key={d}
              label={String(d)}
              color={DAY_ACCENT[d]}
              active={selectedDays.includes(d)}
              onPress={() => toggleDay(d)}
            />
          ))}
          <DayTab label="전체" color={COLORS.ink} active={allSelected} onPress={selectAll} wide />
        </View>

        <Text style={styles.poolStatus}>
          선택한 범위:{' '}
          {allSelected ? '전체 (Day 1~5)' : `Day ${[...selectedDays].sort((a, b) => a - b).join(', ')}`} ·{' '}
          {poolCount}개 단어
        </Text>

        <TouchableOpacity style={styles.modeCard} onPress={() => onStart('flashcard')} disabled={poolCount === 0}>
          <Ionicons name="layers-outline" size={22} color={COLORS.ink} />
          <Text style={styles.modeTitle}>플래시카드</Text>
          <Text style={styles.modeDesc}>단어 → 뜻 뒤집어 보기</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.modeCard} onPress={() => onStart('quiz')} disabled={poolCount === 0}>
          <Ionicons name="list-outline" size={22} color={COLORS.ink} />
          <Text style={styles.modeTitle}>퀴즈</Text>
          <Text style={styles.modeDesc}>영 → 한 4지선다</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.modeCard, { borderColor: hexToRgba(COLORS.red, 0.35) }]}
          onPress={onReview}
          disabled={!loaded}
        >
          <Ionicons name="bookmark-outline" size={22} color={COLORS.ink} />
          <Text style={styles.modeTitle}>
            오답노트{loaded && wrongCount > 0 ? `  (${wrongCount})` : ''}
          </Text>
          <Text style={styles.modeDesc}>
            {loaded ? (wrongCount > 0 ? '틀린 단어 다시 보기' : '아직 틀린 단어 없음') : '불러오는 중...'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.paper },
  scroll: { padding: 20, paddingBottom: 40 },
  eyebrow: { fontFamily: FONTS.mono, fontSize: 11, color: COLORS.inkSoft, letterSpacing: 1, textTransform: 'uppercase' },
  title: { fontFamily: FONTS.serifBold, fontWeight: '700', fontSize: 34, color: COLORS.ink, marginTop: 4 },
  sub: { color: COLORS.inkSoft, fontSize: 13, marginBottom: 18 },
  resumeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: COLORS.ink,
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
  },
  resumeIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 999,
    backgroundColor: 'rgba(255,248,236,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  resumeTitle: { color: '#fff8ec', fontWeight: '700', fontSize: 14.5 },
  resumeDesc: { color: 'rgba(255,248,236,0.75)', fontSize: 12, marginTop: 2, fontFamily: FONTS.mono },
  tabRail: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 12 },
  poolStatus: { fontSize: 12.5, color: COLORS.inkSoft, marginBottom: 18 },
  modeCard: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    gap: 3,
  },
  modeTitle: { fontFamily: FONTS.body, fontWeight: '700', fontSize: 16, color: COLORS.ink, marginTop: 4 },
  modeDesc: { fontSize: 12.5, color: COLORS.inkSoft },
});

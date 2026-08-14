import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, Animated, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, DAY_ACCENT, FONTS } from '../theme';
import { shuffle } from '../utils/shuffle';
import { WORDS_BY_ID } from '../data/words';
import { saveSession, clearSession, addHistoryEntry } from '../storage';
import TopBar from '../components/TopBar';
import SessionSummary from '../components/SessionSummary';

export default function FlashcardScreen({ pool, title, onExit, onWrong, resumeData, sessionMeta }) {
  const [deck] = useState(() => {
    if (resumeData && resumeData.deckIds && resumeData.deckIds.length) {
      return resumeData.deckIds.map((id) => WORDS_BY_ID[id]).filter(Boolean);
    }
    return shuffle(pool);
  });
  const [index, setIndex] = useState(resumeData ? resumeData.index : 0);
  const [flipped, setFlipped] = useState(false);
  const [wrongCount, setWrongCount] = useState(resumeData ? resumeData.wrongCount : 0);
  const [done, setDone] = useState(false);
  const anim = useRef(new Animated.Value(0)).current;

  const current = deck[index];

  useEffect(() => {
    if (!deck.length || done) return;
    saveSession({
      mode: 'flashcard',
      ...sessionMeta,
      deckIds: deck.map((w) => w.id),
      index,
      wrongCount,
      updatedAt: Date.now(),
    });
  }, [index, wrongCount]);

  const flip = () => {
    Animated.spring(anim, {
      toValue: flipped ? 0 : 1,
      useNativeDriver: true,
      friction: 8,
      tension: 10,
    }).start();
    setFlipped(!flipped);
  };

  const advance = (markedWrong) => {
    const finalWrongCount = markedWrong ? wrongCount + 1 : wrongCount;
    if (markedWrong) {
      setWrongCount(finalWrongCount);
      onWrong(current.id);
    }
    if (index + 1 >= deck.length) {
      setDone(true);
      clearSession();
      addHistoryEntry({
        id: `${Date.now()}`,
        date: new Date().toISOString(),
        mode: 'flashcard',
        title,
        total: deck.length,
        correct: deck.length - finalWrongCount,
        wrongCount: finalWrongCount,
      });
    } else {
      setIndex((i) => i + 1);
      setFlipped(false);
      anim.setValue(0);
    }
  };

  const goBack = () => {
    if (index === 0) return;
    setIndex((i) => i - 1);
    setFlipped(false);
    anim.setValue(0);
  };

  const restart = () => {
    setIndex(0);
    setFlipped(false);
    setWrongCount(0);
    setDone(false);
    anim.setValue(0);
  };

  if (deck.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <TopBar title={title} onExit={onExit} />
        <Text style={styles.empty}>학습할 단어가 없습니다.</Text>
      </SafeAreaView>
    );
  }

  if (done) {
    return (
      <SafeAreaView style={styles.container}>
        <TopBar title={title} onExit={onExit} />
        <SessionSummary total={deck.length} wrongCount={wrongCount} onRestart={restart} onExit={onExit} />
      </SafeAreaView>
    );
  }

  const frontRotate = anim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '180deg'] });
  const backRotate = anim.interpolate({ inputRange: [0, 1], outputRange: ['180deg', '360deg'] });
  const frontOpacity = anim.interpolate({ inputRange: [0, 0.5, 0.501, 1], outputRange: [1, 1, 0, 0] });
  const backOpacity = anim.interpolate({ inputRange: [0, 0.499, 0.5, 1], outputRange: [0, 0, 1, 1] });

  return (
    <SafeAreaView style={styles.container}>
      <TopBar title={title} onExit={onExit} right={`${index + 1} / ${deck.length}`} />
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${(index / deck.length) * 100}%` }]} />
      </View>

      <View style={styles.cardWrap}>
        <TouchableOpacity activeOpacity={0.9} onPress={flip} style={styles.cardTouchable}>
          <Animated.View
            style={[
              styles.face,
              { transform: [{ perspective: 1200 }, { rotateY: frontRotate }], opacity: frontOpacity },
            ]}
          >
            <View style={[styles.dayChip, { backgroundColor: DAY_ACCENT[current.day] }]}>
              <Text style={styles.dayChipText}>Day {current.day}</Text>
            </View>
            <Text style={styles.word}>{current.word}</Text>
            <Text style={styles.ipa}>{current.ipa}</Text>
            {current.example ? <Text style={styles.frontExample}>{current.example}</Text> : null}
            <Text style={styles.hint}>탭하여 뜻 보기</Text>
          </Animated.View>
          <Animated.View
            style={[
              styles.face,
              styles.faceBack,
              { transform: [{ perspective: 1200 }, { rotateY: backRotate }], opacity: backOpacity },
            ]}
          >
            <Text style={styles.meaning}>{current.meaning}</Text>
            <Text style={styles.kr}>{current.kr}</Text>
            {current.roots ? (
              <View style={styles.rootsBox}>
                <Text style={styles.rootsLabel}>어원</Text>
                <Text style={styles.rootsText}>{current.roots}</Text>
              </View>
            ) : null}
            {current.exampleKr ? (
              <View style={styles.exampleBox}>
                <Text style={styles.exampleKr}>{current.exampleKr}</Text>
              </View>
            ) : null}
          </Animated.View>
        </TouchableOpacity>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.btn, styles.btnBack, index === 0 && styles.btnDisabled]}
          onPress={goBack}
          disabled={index === 0}
        >
          <Text style={[styles.btnText, { color: COLORS.inkSoft }]}>← 이전</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.btn, styles.btnRed]} onPress={() => advance(true)}>
          <Text style={[styles.btnText, { color: COLORS.red }]}>다시 볼래요</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.btn, styles.btnGreen]} onPress={() => advance(false)}>
          <Text style={[styles.btnText, { color: COLORS.green }]}>알아요</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.paper },
  empty: { flex: 1, textAlign: 'center', textAlignVertical: 'center', color: COLORS.inkSoft },
  progressTrack: { height: 4, backgroundColor: COLORS.cardBorder, borderRadius: 999, marginHorizontal: 20, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: COLORS.ink },
  cardWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 },
  cardTouchable: { width: '100%', maxWidth: 340, height: 380 },
  face: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 14,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backfaceVisibility: 'hidden',
  },
  faceBack: {},
  dayChip: { position: 'absolute', top: 14, left: 14, paddingHorizontal: 9, paddingVertical: 3, borderRadius: 999 },
  dayChipText: { color: '#fff', fontFamily: FONTS.mono, fontSize: 11, fontWeight: '700' },
  word: { fontFamily: FONTS.serifBold, fontSize: 30, color: COLORS.ink, marginTop: 8, textAlign: 'center' },
  ipa: { fontFamily: FONTS.mono, color: COLORS.inkSoft, fontSize: 14, marginTop: 6 },
  frontExample: {
    fontSize: 13,
    color: COLORS.ink,
    textAlign: 'center',
    lineHeight: 18,
    marginTop: 14,
    paddingHorizontal: 8,
  },
  hint: { position: 'absolute', bottom: 14, fontSize: 11, color: COLORS.inkSoft },
  meaning: { fontFamily: FONTS.serifBold, fontSize: 24, color: COLORS.ink, textAlign: 'center' },
  kr: { color: COLORS.inkSoft, fontSize: 13, marginTop: 8 },
  exampleBox: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.cardBorder,
    width: '100%',
  },
  exampleKr: { fontSize: 12, color: COLORS.inkSoft, textAlign: 'center', lineHeight: 17 },
  rootsBox: {
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.cardBorder,
    width: '100%',
    alignItems: 'center',
  },
  rootsLabel: {
    fontFamily: FONTS.mono,
    fontSize: 10,
    fontWeight: '700',
    color: DAY_ACCENT[6],
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  rootsText: { fontSize: 11.5, color: COLORS.ink, textAlign: 'center', lineHeight: 16 },
  actions: { flexDirection: 'row', gap: 8, paddingHorizontal: 20, paddingBottom: 20, paddingTop: 4 },
  btn: { flex: 1, borderRadius: 10, paddingVertical: 13, alignItems: 'center', backgroundColor: COLORS.card, borderWidth: 1 },
  btnBack: { flex: 0.7, borderColor: COLORS.cardBorder },
  btnDisabled: { opacity: 0.35 },
  btnRed: { borderColor: 'rgba(192,57,47,0.4)' },
  btnGreen: { borderColor: 'rgba(47,111,78,0.4)' },
  btnText: { fontWeight: '700', fontSize: 14 },
});

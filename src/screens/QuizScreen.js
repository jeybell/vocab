import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Speech from 'expo-speech';
import { COLORS, DAY_ACCENT, FONTS } from '../theme';
import { shuffle } from '../utils/shuffle';
import { buildQuizOptions } from '../utils/quiz';
import { WORDS_BY_ID } from '../data/words';
import { saveSession, clearSession, addHistoryEntry } from '../storage';
import TopBar from '../components/TopBar';
import SessionSummary from '../components/SessionSummary';
import SpeakButton from '../components/SpeakButton';
import { Stamp } from '../components/Stamp';

export default function QuizScreen({ pool, title, onExit, onWrong, resumeData, sessionMeta }) {
  const [deck] = useState(() => {
    if (resumeData && resumeData.deckIds && resumeData.deckIds.length) {
      return resumeData.deckIds.map((id) => WORDS_BY_ID[id]).filter(Boolean);
    }
    return shuffle(pool);
  });
  const [index, setIndex] = useState(resumeData ? resumeData.index : 0);
  const [options, setOptions] = useState(() =>
    deck.length ? buildQuizOptions(deck[resumeData ? resumeData.index : 0], pool) : []
  );
  const [picked, setPicked] = useState(null);
  const [wrongCount, setWrongCount] = useState(resumeData ? resumeData.wrongCount : 0);
  const [done, setDone] = useState(false);

  const current = deck[index];
  const answered = picked !== null;

  useEffect(() => {
    if (!deck.length || done) return;
    saveSession({
      mode: 'quiz',
      ...sessionMeta,
      deckIds: deck.map((w) => w.id),
      index,
      wrongCount,
      updatedAt: Date.now(),
    });
  }, [index, wrongCount]);

  // 다음 문제로 넘어가거나 화면을 벗어나면 재생 중인 발음을 끊습니다.
  useEffect(() => {
    return () => {
      Speech.stop();
    };
  }, [index]);

  const pick = (opt) => {
    if (answered) return;
    setPicked(opt);
    if (!opt.correct) {
      setWrongCount((c) => c + 1);
      onWrong(current.id);
    }
  };

  const next = () => {
    if (index + 1 >= deck.length) {
      setDone(true);
      clearSession();
      addHistoryEntry({
        id: `${Date.now()}`,
        date: new Date().toISOString(),
        mode: 'quiz',
        title,
        total: deck.length,
        correct: deck.length - wrongCount,
        wrongCount,
      });
      return;
    }
    const n = index + 1;
    setIndex(n);
    setOptions(buildQuizOptions(deck[n], pool));
    setPicked(null);
  };

  const restart = () => {
    setIndex(0);
    setOptions(deck.length ? buildQuizOptions(deck[0], pool) : []);
    setPicked(null);
    setWrongCount(0);
    setDone(false);
  };

  if (deck.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <TopBar title={title} onExit={onExit} />
        <Text style={styles.empty}>퀴즈를 풀 단어가 없습니다.</Text>
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

  return (
    <SafeAreaView style={styles.container}>
      <TopBar title={title} onExit={onExit} right={`${index + 1} / ${deck.length}`} />
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${(index / deck.length) * 100}%` }]} />
      </View>

      <View style={styles.wordCard}>
        <View style={[styles.dayChip, { backgroundColor: DAY_ACCENT[current.day] }]}>
          <Text style={styles.dayChipText}>Day {current.day}</Text>
        </View>
        <Text style={styles.word}>{current.word}</Text>
        <View style={styles.pronRow}>
          <Text style={styles.ipa}>{current.ipa}</Text>
          <SpeakButton text={current.word} />
        </View>
        <Stamp show={!!(answered && picked && picked.correct)} type="correct" />
        <Stamp show={!!(answered && picked && !picked.correct)} type="wrong" />
      </View>

      <View style={styles.options}>
        {options.map((opt, i) => {
          const style = [styles.option];
          if (answered) {
            if (opt.correct) style.push(styles.optionCorrect);
            else if (opt === picked) style.push(styles.optionWrong);
            else style.push(styles.optionDim);
          }
          return (
            <TouchableOpacity key={i} style={style} onPress={() => pick(opt)} disabled={answered}>
              <Text style={styles.optionText}>{opt.text}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.footer}>
        {answered ? (
          <TouchableOpacity style={styles.nextBtn} onPress={next}>
            <Text style={styles.nextBtnText}>다음</Text>
          </TouchableOpacity>
        ) : (
          <Text style={styles.footerHint}>정답을 선택하세요</Text>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.paper, paddingHorizontal: 20 },
  empty: { flex: 1, textAlign: 'center', textAlignVertical: 'center', color: COLORS.inkSoft },
  progressTrack: { height: 4, backgroundColor: COLORS.cardBorder, borderRadius: 999, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: COLORS.ink },
  wordCard: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    borderRadius: 14,
    paddingVertical: 30,
    alignItems: 'center',
    marginTop: 18,
    marginBottom: 18,
  },
  dayChip: { position: 'absolute', top: 14, left: 14, paddingHorizontal: 9, paddingVertical: 3, borderRadius: 999 },
  dayChipText: { color: '#fff', fontFamily: FONTS.mono, fontSize: 11, fontWeight: '700' },
  word: { fontFamily: FONTS.serifBold, fontSize: 28, color: COLORS.ink, marginTop: 6 },
  pronRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 8 },
  ipa: { fontFamily: FONTS.mono, color: COLORS.inkSoft, fontSize: 13 },
  options: { gap: 9 },
  option: { backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.cardBorder, borderRadius: 10, padding: 14 },
  optionText: { fontSize: 14.5, color: COLORS.ink },
  optionCorrect: { borderColor: COLORS.green, backgroundColor: 'rgba(47,111,78,0.1)' },
  optionWrong: { borderColor: COLORS.red, backgroundColor: 'rgba(192,57,47,0.1)' },
  optionDim: { opacity: 0.5 },
  footer: { marginTop: 16, paddingBottom: 20 },
  footerHint: { textAlign: 'center', fontSize: 12.5, color: COLORS.inkSoft, padding: 10 },
  nextBtn: { backgroundColor: COLORS.ink, borderRadius: 10, paddingVertical: 13, alignItems: 'center' },
  nextBtnText: { color: '#fff8ec', fontWeight: '700', fontSize: 14 },
});

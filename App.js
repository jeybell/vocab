import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { WORDS } from './src/data/words';
import { loadWrongWords, saveWrongWords, loadSession, clearSession, loadHistory, clearHistory } from './src/storage';
import HomeScreen from './src/screens/HomeScreen';
import FlashcardScreen from './src/screens/FlashcardScreen';
import QuizScreen from './src/screens/QuizScreen';
import ReviewScreen from './src/screens/ReviewScreen';
import HistoryScreen from './src/screens/HistoryScreen';

const DAYS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

function dayLabel(days) {
  if (days.length === DAYS.length) return `전체 (Day ${DAYS[0]}~${DAYS[DAYS.length - 1]})`;
  return `Day ${[...days].sort((a, b) => a - b).join(', ')}`;
}

export default function App() {
  const [screen, setScreen] = useState('home'); // home | study | review
  const [mode, setMode] = useState('flashcard'); // flashcard | quiz
  const [source, setSource] = useState('days'); // days | wrong
  const [selectedDays, setSelectedDays] = useState(DAYS);
  const [sessionKey, setSessionKey] = useState(0);
  const [wrongIds, setWrongIds] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [savedSession, setSavedSession] = useState(null);
  const [pendingResume, setPendingResume] = useState(null);
  const [history, setHistory] = useState([]);
  const [historyLoaded, setHistoryLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      const ids = await loadWrongWords();
      setWrongIds(ids);
      const session = await loadSession();
      setSavedSession(session);
      setLoaded(true);
      const h = await loadHistory();
      setHistory(h);
      setHistoryLoaded(true);
    })();
  }, []);

  const refreshSession = async () => {
    const session = await loadSession();
    setSavedSession(session);
  };

  const refreshHistory = async () => {
    const h = await loadHistory();
    setHistory(h);
  };

  const dayPool = useMemo(() => WORDS.filter((w) => selectedDays.includes(w.day)), [selectedDays]);
  const wrongPool = useMemo(() => WORDS.filter((w) => wrongIds.includes(w.id)), [wrongIds]);
  const activePool = source === 'wrong' ? wrongPool : dayPool;

  const toggleAllDays = () => {
    setSelectedDays((prev) => (prev.length === DAYS.length ? [] : DAYS));
  };

  const toggleDay = (d) => {
    setSelectedDays((prev) => {
      if (prev.includes(d)) {
        const next = prev.filter((x) => x !== d);
        return next.length ? next : prev;
      }
      return [...prev, d].sort((a, b) => a - b);
    });
  };

  const addWrong = useCallback((id) => {
    setWrongIds((prev) => {
      if (prev.includes(id)) return prev;
      const next = [...prev, id];
      saveWrongWords(next);
      return next;
    });
  }, []);

  const removeWrong = useCallback((id) => {
    setWrongIds((prev) => {
      const next = prev.filter((w) => w !== id);
      saveWrongWords(next);
      return next;
    });
  }, []);

  const clearAll = useCallback(() => {
    setWrongIds([]);
    saveWrongWords([]);
  }, []);

  const startStudy = (m, src) => {
    // 새로 시작하는 세션이므로 기존 저장된 진행 상황은 버림
    clearSession();
    setSavedSession(null);
    setPendingResume(null);
    setMode(m);
    setSource(src);
    setSessionKey((k) => k + 1);
    setScreen('study');
  };

  const startResume = () => {
    if (!savedSession) return;
    setPendingResume(savedSession);
    setMode(savedSession.mode);
    setSource(savedSession.source);
    if (savedSession.source === 'days' && Array.isArray(savedSession.selectedDays)) {
      setSelectedDays(savedSession.selectedDays);
    }
    setSessionKey((k) => k + 1);
    setScreen('study');
  };

  const exitStudy = () => {
    setScreen(source === 'wrong' ? 'review' : 'home');
    refreshSession();
    refreshHistory();
  };

  const clearAllHistory = async () => {
    await clearHistory();
    setHistory([]);
  };

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      {screen === 'home' && (
        <HomeScreen
          selectedDays={selectedDays}
          toggleDay={toggleDay}
          selectAll={toggleAllDays}
          poolCount={dayPool.length}
          wrongCount={wrongIds.length}
          loaded={loaded}
          onStart={(m) => startStudy(m, 'days')}
          onReview={() => setScreen('review')}
          savedSession={loaded ? savedSession : null}
          onResume={startResume}
          onHistory={() => setScreen('history')}
        />
      )}
      {screen === 'history' && (
        <HistoryScreen
          history={history}
          loaded={historyLoaded}
          onClearAll={clearAllHistory}
          onExit={() => setScreen('home')}
        />
      )}
      {screen === 'review' && (
        <ReviewScreen
          wrongPool={wrongPool}
          loaded={loaded}
          onStartFlashcard={() => startStudy('flashcard', 'wrong')}
          onStartQuiz={() => startStudy('quiz', 'wrong')}
          onRemove={removeWrong}
          onClearAll={clearAll}
          onExit={() => setScreen('home')}
        />
      )}
      {screen === 'study' && mode === 'flashcard' && (
        <FlashcardScreen
          key={sessionKey}
          pool={activePool}
          title={source === 'wrong' ? '오답노트 · 플래시카드' : dayLabel(selectedDays)}
          onExit={exitStudy}
          onWrong={addWrong}
          resumeData={pendingResume}
          sessionMeta={{ source, selectedDays }}
        />
      )}
      {screen === 'study' && mode === 'quiz' && (
        <QuizScreen
          key={sessionKey}
          pool={activePool}
          title={source === 'wrong' ? '오답노트 · 퀴즈' : dayLabel(selectedDays)}
          onExit={exitStudy}
          onWrong={addWrong}
          resumeData={pendingResume}
          sessionMeta={{ source, selectedDays }}
        />
      )}
    </SafeAreaProvider>
  );
}

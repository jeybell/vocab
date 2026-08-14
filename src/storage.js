import AsyncStorage from '@react-native-async-storage/async-storage';

const WRONG_KEY = 'vocab.wrongWords';
const SESSION_KEY = 'vocab.activeSession';
const HISTORY_KEY = 'vocab.history';

export async function loadWrongWords() {
  try {
    const raw = await AsyncStorage.getItem(WRONG_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.warn('오답노트 불러오기 실패', e);
    return [];
  }
}

export async function saveWrongWords(ids) {
  try {
    await AsyncStorage.setItem(WRONG_KEY, JSON.stringify(ids));
  } catch (e) {
    console.warn('오답노트 저장 실패', e);
  }
}

// 학습 세션(진행 중인 플래시카드/퀴즈) 저장 - 앱을 나갔다 와도 이어보기 가능
export async function loadSession() {
  try {
    const raw = await AsyncStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.deckIds) || parsed.deckIds.length === 0) return null;
    return parsed;
  } catch (e) {
    return null;
  }
}

export async function saveSession(session) {
  try {
    await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } catch (e) {
    console.warn('세션 저장 실패', e);
  }
}

export async function clearSession() {
  try {
    await AsyncStorage.removeItem(SESSION_KEY);
  } catch (e) {
    console.warn('세션 삭제 실패', e);
  }
}

// 학습 완료 기록 (몇 일치 · 모드 · 점수) - 최대 200개까지 보관
export async function loadHistory() {
  try {
    const raw = await AsyncStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    return [];
  }
}

export async function addHistoryEntry(entry) {
  try {
    const current = await loadHistory();
    const next = [entry, ...current].slice(0, 200);
    await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(next));
    return next;
  } catch (e) {
    console.warn('학습 기록 저장 실패', e);
    return null;
  }
}

export async function clearHistory() {
  try {
    await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify([]));
  } catch (e) {
    console.warn('학습 기록 삭제 실패', e);
  }
}

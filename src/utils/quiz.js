import { WORDS } from '../data/words';
import { shuffle } from './shuffle';

export function buildQuizOptions(word, contextPool) {
  const sameDay = contextPool.filter((w) => w.day === word.day && w.id !== word.id);
  const others = WORDS.filter((w) => w.id !== word.id);
  const seenMeanings = new Set([word.meaning]);
  const distractors = [];

  const tryPool = (pool) => {
    for (const w of shuffle(pool)) {
      if (distractors.length >= 3) break;
      if (seenMeanings.has(w.meaning)) continue;
      seenMeanings.add(w.meaning);
      distractors.push(w.meaning);
    }
  };

  tryPool(sameDay);
  if (distractors.length < 3) tryPool(others);

  return shuffle([
    { text: word.meaning, correct: true },
    ...distractors.map((m) => ({ text: m, correct: false })),
  ]);
}

// TTS로 읽히기 전에 단어 표기를 정리합니다.
// 단어 데이터에는 화면 표시용 기호가 섞여 있는데(목적어 자리를 뜻하는 ~,
// 생략 가능함을 뜻하는 괄호), 그대로 넘기면 기호까지 읽으려 하거나
// 발음이 어색해집니다.
//   "get ~ in trouble"   -> "get in trouble"
//   "that is (to say)"   -> "that is to say"
export function toSpeechText(word) {
  if (!word) return '';
  return word
    .replace(/~/g, ' ')
    .replace(/[()]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

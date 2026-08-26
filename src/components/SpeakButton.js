import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Speech from 'expo-speech';
import { COLORS } from '../theme';
import { toSpeechText } from '../utils/speech';

export default function SpeakButton({ text, style }) {
  const speak = () => {
    const spoken = toSpeechText(text);
    if (!spoken) return;
    // 연타로 음성이 겹치지 않도록 이전 재생을 끊고 시작합니다.
    Speech.stop();
    // 언어를 지정하지 않으면 기기 기본 언어(한국어)로 영단어를 읽습니다.
    Speech.speak(spoken, { language: 'en-US' });
  };

  return (
    <TouchableOpacity
      onPress={speak}
      style={[styles.btn, style]}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      accessibilityLabel="발음 듣기"
    >
      <Ionicons name="volume-medium-outline" size={18} color={COLORS.inkSoft} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    width: 32,
    height: 32,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    backgroundColor: COLORS.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

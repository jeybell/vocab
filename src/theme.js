import { Platform } from 'react-native';

export const COLORS = {
  paper: '#f2efe3',
  ink: '#22314f',
  inkSoft: '#5b6a86',
  red: '#c0392f',
  green: '#2f6f4e',
  card: '#fffdf6',
  cardBorder: 'rgba(34,49,79,0.14)',
};

export const DAY_ACCENT = {
  1: '#c9524f',
  2: '#c78a2e',
  3: '#3f7d5c',
  4: '#3a6ea5',
  5: '#6c5b9e',
};

// 별도 폰트 설치 없이 iOS/Android 기본 내장 서체를 활용합니다.
export const FONTS = {
  serif: Platform.select({ ios: 'Georgia', android: 'serif', default: 'serif' }),
  serifBold: Platform.select({ ios: 'Georgia-Bold', android: 'serif', default: 'serif' }),
  mono: Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' }),
  body: Platform.select({ ios: 'System', android: 'sans-serif', default: 'System' }),
};

export function hexToRgba(hex, alpha) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

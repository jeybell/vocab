import React, { useEffect, useRef } from 'react';
import { Animated, View, StyleSheet, Platform } from 'react-native';
import { COLORS } from '../theme';

// 웹에는 네이티브 애니메이션 모듈이 없어 켜두면 경고가 뜨고 JS로 폴백됩니다.
const NATIVE_DRIVER = Platform.OS !== 'web';

export function Stamp({ show, type }) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(anim, {
      toValue: show ? 1 : 0,
      useNativeDriver: NATIVE_DRIVER,
      friction: 5,
      tension: 120,
    }).start();
  }, [show]);

  const scale = anim.interpolate({ inputRange: [0, 1], outputRange: [0.5, 1] });

  return (
    <Animated.View
      pointerEvents="none"
      style={[styles.wrap, { opacity: anim, transform: [{ scale }, { rotate: '-10deg' }] }]}
    >
      {type === 'correct' ? (
        <View style={styles.circle} />
      ) : (
        <>
          <View style={[styles.bar, { transform: [{ rotate: '42deg' }] }]} />
          <View style={[styles.bar, { transform: [{ rotate: '-42deg' }] }]} />
        </>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', top: 10, right: 14, width: 44, height: 44 },
  circle: { width: '100%', height: '100%', borderWidth: 3, borderColor: COLORS.red, borderRadius: 22 },
  bar: {
    position: 'absolute',
    top: 20,
    left: -6,
    width: 56,
    height: 3,
    backgroundColor: COLORS.red,
    borderRadius: 2,
  },
});

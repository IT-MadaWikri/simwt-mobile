/**
 * Muncul — animasi "reveal" saat isi menggantikan skeleton: memudar masuk sambil
 * naik sedikit. Bungkus HANYA isi yang baru dipasang setelah data selesai dimuat
 * (cabang `: <Isi />` dari `memuat ? <Skeleton /> : <Isi />`); animasi jalan sekali
 * saat dipasang. Jangan membungkus item FlatList: item ikut animasi tiap tergulir.
 *
 *   {memuat ? <SkeletonBaris /> : <Muncul><DaftarTiket /></Muncul>}
 *   <Muncul style={gs.flex1}>…</Muncul>   // bila isinya perlu mengisi layar
 */
import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleProp, ViewStyle } from 'react-native';

interface MunculProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  /** Tunda (ms) — untuk memunculkan beberapa blok berurutan. */
  jeda?: number;
}

export default function Muncul({ children, style, jeda = 0 }: MunculProps) {
  const nilai = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(nilai, {
      toValue: 1,
      duration: 320,
      delay: jeda,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [nilai, jeda]);

  return (
    <Animated.View
      style={[
        { opacity: nilai, transform: [{ translateY: nilai.interpolate({ inputRange: [0, 1], outputRange: [12, 0] }) }] },
        style,
      ]}
    >
      {children}
    </Animated.View>
  );
}

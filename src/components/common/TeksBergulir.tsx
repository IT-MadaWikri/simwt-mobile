/**
 * TeksBergulir — satu baris teks yang bergantian di tempat yang sama: teks lama bergulir ke atas
 * keluar, teks berikutnya naik dari bawah. Berputar sendiri tiap `jeda` ms; bila hanya satu teks,
 * tampil diam. Presentasional.
 */
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, StyleProp, StyleSheet, TextStyle, View } from 'react-native';

interface TeksBergulirProps {
  teks: string[];
  style?: StyleProp<TextStyle>;
  /** Tinggi satu baris; harus ≥ line height gaya teksnya. */
  tinggi?: number;
  /** Lama tiap teks bertahan sebelum berganti (ms). */
  jeda?: number;
}

const DURASI_GULIR = 350;

export default function TeksBergulir({ teks, style, tinggi = 18, jeda = 2500 }: TeksBergulirProps) {
  const [indeks, setIndeks] = useState(0);
  // Naik satu tiap pergantian dan tidak pernah di-reset, jadi tidak ada kedipan saat `indeks` berganti.
  const langkah = useRef(new Animated.Value(0)).current;
  const tujuan = useRef(0);
  const banyak = teks.length;

  useEffect(() => {
    if (banyak < 2) return;
    const pewaktu = setInterval(() => {
      Animated.timing(langkah, {
        toValue: ++tujuan.current,
        duration: DURASI_GULIR,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished) setIndeks((i) => i + 1);
      });
    }, jeda);
    return () => clearInterval(pewaktu);
  }, [banyak, jeda, langkah]);

  const rentang = { inputRange: [indeks, indeks + 1], extrapolate: 'clamp' as const };
  const keluar = langkah.interpolate({ ...rentang, outputRange: [0, -tinggi] });
  const masuk = langkah.interpolate({ ...rentang, outputRange: [tinggi, 0] });

  return (
    <View style={{ height: tinggi, overflow: 'hidden' }}>
      <Animated.Text numberOfLines={1} style={[style, styles.baris, { height: tinggi, transform: [{ translateY: keluar }] }]}>
        {teks[indeks % banyak]}
      </Animated.Text>
      {banyak > 1 ? (
        <Animated.Text numberOfLines={1} style={[style, styles.baris, { height: tinggi, transform: [{ translateY: masuk }] }]}>
          {teks[(indeks + 1) % banyak]}
        </Animated.Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  baris: { position: 'absolute', left: 0, right: 0, top: 0 },
});

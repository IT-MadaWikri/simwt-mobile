/**
 * BrandSpinner — pemuat berputar bergaya SIMWT.
 *
 * Menggantikan `<ActivityIndicator>` bawaan, yang rupanya berbeda-beda di tiap
 * platform sehingga aplikasi terasa tidak punya identitas sendiri. Bentuknya
 * diambil dari cincin di `LoadingScreen`, jadi pemuat kecil dan pemuat layar
 * penuh terasa satu keluarga.
 *
 * ── Dua jalur animasi, dan alasannya ─────────────────────────────────────
 * WEB memakai `animationKeyframes` (properti khas react-native-web yang
 * menghasilkan CSS `@keyframes` sungguhan), NATIVE memakai `Animated` dengan
 * native driver.
 *
 * Ini bukan pilihan gaya. `react-native-web` TIDAK punya modul animasi native
 * — `useNativeDriver: true` diam-diam jatuh ke animasi berbasis JS (lihat
 * peringatannya di NativeAnimatedHelper.js). Akibatnya, tepat ketika layar
 * sedang memuat data — saat thread JS paling sibuk — putaran spinner-nya
 * MEMBEKU. Persis di saat ia paling dibutuhkan.
 *
 * Animasi CSS dijalankan compositor peramban, di luar thread JS, jadi tetap
 * berputar mulus walau JS sedang sibuk. Di native, `useNativeDriver` memang
 * benar-benar berjalan di thread UI, jadi jalur `Animated` sudah tepat.
 */
import React, { useEffect, useRef } from 'react';
import { Animated, Easing, View, StyleSheet, Platform } from 'react-native';
import { brand } from '../../../constants/Colors';

interface BrandSpinnerProps {
  /** Diameter cincin terluar (px). */
  size?: number;
  /** Warna busur utama. Default hijau brand. */
  color?: string;
}

const DI_WEB = Platform.OS === 'web';

/** Keyframes putaran penuh — hanya dipakai di web. */
const PUTAR_MAJU = [{ '0%': { transform: 'rotate(0deg)' }, '100%': { transform: 'rotate(360deg)' } }];
const PUTAR_MUNDUR = [{ '0%': { transform: 'rotate(360deg)' }, '100%': { transform: 'rotate(0deg)' } }];

export default function BrandSpinner({ size = 40, color = brand[500] }: BrandSpinnerProps) {
  const luar = useRef(new Animated.Value(0)).current;
  const dalam = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (DI_WEB) return; // di web animasinya ditangani CSS, bukan Animated

    const putar = (nilai: Animated.Value, durasi: number) =>
      Animated.loop(
        Animated.timing(nilai, {
          toValue: 1,
          duration: durasi,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      );

    const animasi = [putar(luar, 1000), putar(dalam, 1600)];
    animasi.forEach((a) => a.start());
    return () => animasi.forEach((a) => a.stop());
  }, [luar, dalam]);

  const rotasiLuar = luar.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  const rotasiDalam = dalam.interpolate({ inputRange: [0, 1], outputRange: ['360deg', '0deg'] });

  const tebal = Math.max(2, Math.round(size * 0.08));
  const jarak = Math.round(size * 0.22);

  /** Gaya putaran: CSS di web, transform ter-animasi di native. */
  const gerak = (maju: boolean, durasi: number) =>
    DI_WEB
      ? ({
          animationKeyframes: maju ? PUTAR_MAJU : PUTAR_MUNDUR,
          animationDuration: `${durasi}ms`,
          animationTimingFunction: 'linear',
          animationIterationCount: 'infinite',
        } as any)
      : { transform: [{ rotate: maju ? rotasiLuar : rotasiDalam }] };

  // Di web dipakai View BIASA, bukan Animated.View: pembungkus Animated
  // memproses style lewat pipeline-nya sendiri, dan properti CSS khas
  // react-native-web seperti `animationKeyframes` bisa tidak diteruskan.
  // Di web tidak ada nilai Animated yang perlu dilacak, jadi tidak ada
  // yang hilang dengan memakai View polos.
  const Cincin: any = DI_WEB ? View : Animated.View;

  return (
    <View style={{ width: size, height: size }}>
      {/* Hanya sebagian sisi yang diberi warna pekat; sisanya samar. Saat
          berputar, bagian pekat itulah yang terbaca sebagai busur berjalan. */}
      <Cincin
        style={[
          styles.ring,
          {
            borderWidth: tebal,
            borderRadius: size,
            borderColor: `${color}22`,
            borderTopColor: color,
            borderRightColor: `${color}88`,
          },
          gerak(true, 1000),
        ]}
      />
      <Cincin
        style={[
          styles.ring,
          {
            top: jarak,
            left: jarak,
            right: jarak,
            bottom: jarak,
            borderWidth: Math.max(2, tebal - 1),
            borderRadius: size,
            borderColor: 'transparent',
            borderBottomColor: brand[300],
          },
          gerak(false, 1600),
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  ring: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderStyle: 'solid',
  },
});

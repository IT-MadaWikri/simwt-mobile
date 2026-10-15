/**
 * LoadingScreen — layar memuat brand, versi mobile dari layar muat karir-mwt.
 *
 * Menirukan blok `.ls-*` di `karir-mwt/app/globals.css`:
 *   - latar hijau gelap (di web: radial-gradient #054a2a → #043d23)
 *   - tiga cincin berputar dengan kecepatan & arah berbeda
 *   - empat percikan di sisi kotak cincin, berkedip bergantian
 *   - logo/ikon di tengah yang "bernapas"
 *   - nama produk + subjudul huruf kapital berjarak lebar
 *   - garis progres bergradien di bawah
 *
 * Perbedaan yang disengaja dari versi web:
 *   - Radial gradient tidak ada di React Native. Didekati dengan
 *     latar `brand[900]` polos plus satu lingkaran cahaya di tengah —
 *     secara visual sangat mirip, tanpa perlu SVG atau pustaka tambahan.
 *   - Roda gigi watermark yang berputar dihilangkan: di web ia dekoratif
 *     dan hampir tak terlihat (opasitas 0.025), sementara di ponsel ia
 *     menambah dua animasi berjalan terus-menerus tanpa manfaat visual.
 *
 * Semua animasi memakai `useNativeDriver: true` sehingga berjalan di thread
 * UI dan tidak tersendat saat JS sibuk memuat data — justru saat itulah
 * layar ini muncul.
 */
import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing, Dimensions, Image, Platform } from 'react-native';
import Colors, { brand } from '../../../constants/Colors';
import Spacing from '../../../constants/Spacing';
import Typography, { fonts } from '../../../constants/Typography';

const { width } = Dimensions.get('window');

interface LoadingScreenProps {
  /** Judul besar. Default: nama aplikasi. */
  title?: string;
  /** Baris kecil huruf kapital di bawah judul. */
  subtitle?: string;
}

const DI_WEB = Platform.OS === 'web';

/**
 * Gaya putaran berulang.
 *
 * Di WEB memakai `animationKeyframes` (CSS `@keyframes` sungguhan) karena
 * react-native-web TIDAK punya modul animasi native: `useNativeDriver: true`
 * di sana diam-diam jatuh ke animasi berbasis JS, sehingga cincin MEMBEKU
 * tepat saat layar sibuk memuat data. Animasi CSS dijalankan compositor
 * peramban, jadi kebal terhadap thread JS yang penuh.
 *
 * Di native, native driver memang berjalan di thread UI — `Animated` tepat.
 */
function useSpin(duration: number, reverse = false) {
  const value = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (DI_WEB) return;

    const loop = Animated.loop(
      Animated.timing(value, {
        toValue: 1,
        duration,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    loop.start();
    return () => loop.stop();
  }, [duration, value]);

  if (DI_WEB) {
    return {
      animationKeyframes: [
        reverse
          ? { '0%': { transform: 'rotate(360deg)' }, '100%': { transform: 'rotate(0deg)' } }
          : { '0%': { transform: 'rotate(0deg)' }, '100%': { transform: 'rotate(360deg)' } },
      ],
      animationDuration: `${duration}ms`,
      animationTimingFunction: 'linear',
      animationIterationCount: 'infinite',
    } as any;
  }

  return {
    transform: [
      {
        rotate: value.interpolate({
          inputRange: [0, 1],
          outputRange: reverse ? ['360deg', '0deg'] : ['0deg', '360deg'],
        }),
      },
    ],
  } as any;
}

/**
 * Logo monogram MWT — file yang SAMA dengan yang dipakai layar muat karir-mwt
 * (`public/assets/img/logo-loader.png`), disalin ke `assets/images/`.
 */
const LOGO = require('../../../assets/images/logo-loader.png');

export default function LoadingScreen({
  title = 'PT Mada Wikri Tunggal',
  subtitle = 'SIMWT Mobile',
}: LoadingScreenProps) {
  // Kecepatan tiap cincin disamakan dengan .ls-ring-1/2/3 di karir-mwt.
  const ring1 = useSpin(1100);
  const ring2 = useSpin(1800, true);
  const ring3 = useSpin(850);

  // Watermark logo raksasa yang berputar sangat lambat di latar — pengganti
  // roda gigi `.ls-gear-bg` karir-mwt, tapi memakai logo sendiri.
  const watermark = useSpin(60000);

  const breathe = useRef(new Animated.Value(0)).current;
  const glow = useRef(new Animated.Value(0)).current;
  const halo = useRef(new Animated.Value(0)).current;
  const shuttle = useRef(new Animated.Value(0)).current;
  /** Kemunculan blok teks, meniru `.ls-text` → `.ls-text-visible`. */
  const textIn = useRef(new Animated.Value(0)).current;
  const sparks = [
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
  ];

  useEffect(() => {
    const pulse = (value: Animated.Value, duration: number, delay = 0) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(value, { toValue: 1, duration, useNativeDriver: true }),
          Animated.timing(value, { toValue: 0, duration, useNativeDriver: true }),
        ])
      );

    const animations = [
      pulse(breathe, 1200),
      pulse(glow, 1200),
      // Lingkar halo yang mengembang keluar lalu memudar — memberi kesan
      // "denyut" di sekeliling cincin, bukan sekadar berputar di tempat.
      Animated.loop(
        Animated.timing(halo, {
          toValue: 1,
          duration: 2000,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        })
      ),
      // Percikan berkedip bergantian, seperti animation-delay di CSS.
      ...sparks.map((spark, i) => pulse(spark, 700, i * 350)),
      // Garis progres berjalan bolak-balik (indeterminate). Sengaja memakai
      // translateX, BUKAN lebar: transform bisa dijalankan native driver,
      // sedangkan animasi lebar memaksa perhitungan tata letak tiap frame di
      // JS — persis saat thread JS sedang sibuk memuat data.
      Animated.loop(
        Animated.timing(shuttle, {
          toValue: 1,
          duration: 1400,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        })
      ),
      Animated.timing(textIn, {
        toValue: 1,
        duration: 500,
        delay: 350,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ];

    animations.forEach((a) => a.start());
    return () => animations.forEach((a) => a.stop());
  }, []);

  const logoScale = breathe.interpolate({ inputRange: [0, 1], outputRange: [1, 0.94] });
  const logoOpacity = breathe.interpolate({ inputRange: [0, 1], outputRange: [1, 0.85] });
  const glowScale = glow.interpolate({ inputRange: [0, 1], outputRange: [1, 1.15] });
  const glowOpacity = glow.interpolate({ inputRange: [0, 1], outputRange: [0.7, 1] });
  const haloScale = halo.interpolate({ inputRange: [0, 1], outputRange: [0.9, 1.9] });
  const haloOpacity = halo.interpolate({ inputRange: [0, 0.15, 1], outputRange: [0, 0.35, 0] });
  const textOpacity = textIn;
  const textShift = textIn.interpolate({ inputRange: [0, 1], outputRange: [12, 0] });
  const shuttleShift = shuttle.interpolate({
    inputRange: [0, 1],
    outputRange: [-width * 0.4, width],
  });

  // View biasa di web — pembungkus Animated bisa tidak meneruskan
  // properti CSS khas react-native-web. Lihat BrandSpinner.tsx.
  const Cincin: any = DI_WEB ? View : Animated.View;
  const Gambar: any = DI_WEB ? Image : Animated.Image;

  return (
    <View style={[styles.overlay, { backgroundColor: brand[900] }]}>
      {/* Watermark logo raksasa, berputar sangat lambat. Dekoratif — memberi
          kedalaman pada latar supaya tidak terasa datar. */}
      <Gambar
        source={LOGO}
        resizeMode="contain"
        style={[styles.watermark, watermark]}
      />

      {/* Cahaya lembut di tengah — pengganti radial-gradient .ls-glow */}
      <Animated.View
        style={[
          styles.glow,
          { transform: [{ scale: glowScale }], opacity: glowOpacity },
        ]}
      />

      <View style={styles.ringBox}>
        {/* Halo yang mengembang keluar dari cincin lalu memudar. */}
        <Animated.View
          style={[
            styles.halo,
            { transform: [{ scale: haloScale }], opacity: haloOpacity },
          ]}
        />
        <Cincin style={[styles.ring, styles.ring1, ring1]} />
        <Cincin style={[styles.ring, styles.ring2, ring2]} />
        <Cincin style={[styles.ring, styles.ring3, ring3]} />

        {[styles.sparkTop, styles.sparkRight, styles.sparkBottom, styles.sparkLeft].map(
          (position, i) => (
            <Animated.View
              key={i}
              style={[
                styles.spark,
                position,
                {
                  opacity: sparks[i].interpolate({ inputRange: [0, 1], outputRange: [1, 0.2] }),
                  transform: [
                    { scale: sparks[i].interpolate({ inputRange: [0, 1], outputRange: [1, 0.4] }) },
                  ],
                },
              ]}
            />
          )
        )}

        <Animated.View style={{ transform: [{ scale: logoScale }], opacity: logoOpacity }}>
          {/*
            `tintColor` mewarnai ulang seluruh piksel non-transparan menjadi
            putih — padanan React Native dari `filter: brightness(0) invert(1)`
            yang dipakai karir-mwt. Logo aslinya hijau, dan hijau di atas latar
            hijau gelap ini nyaris tidak terbaca, jadi pewarnaan ini bukan
            sekadar gaya.
          */}
          <Image
            source={LOGO}
            style={styles.logo}
            resizeMode="contain"
            accessibilityLabel="PT Mada Wikri Tunggal"
          />
        </Animated.View>
      </View>

      <Animated.View
        style={[
          styles.textBlock,
          { opacity: textOpacity, transform: [{ translateY: textShift }] },
        ]}
      >
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </Animated.View>

      <View style={styles.progressTrack}>
        <Animated.View
          style={[styles.progressBar, { transform: [{ translateX: shuttleShift }] }]}
        >
          <View style={[StyleSheet.absoluteFill, { backgroundColor: brand[500] }]} />
        </Animated.View>
      </View>
    </View>
  );
}

const RING_BOX = 140;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xxl,
  },
  watermark: {
    position: 'absolute',
    width: width * 1.6,
    height: width * 1.6,
    top: -width * 0.5,
    right: -width * 0.6,
    tintColor: Colors.white,
    opacity: 0.03,
    // Murni dekorasi — jangan sampai menangkap sentuhan.
    pointerEvents: 'none',
  },
  glow: {
    position: 'absolute',
    width: width * 0.8,
    height: width * 0.8,
    borderRadius: width * 0.4,
    backgroundColor: 'rgba(18,183,106,0.10)',
  },
  halo: {
    position: 'absolute',
    width: RING_BOX,
    height: RING_BOX,
    borderRadius: RING_BOX,
    borderWidth: 1,
    borderColor: brand[400],
  },
  ringBox: {
    width: RING_BOX,
    height: RING_BOX,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    position: 'absolute',
    borderRadius: RING_BOX,
    borderStyle: 'solid',
  },
  // Hanya sebagian sisi yang diberi warna terang sehingga saat berputar
  // terlihat seperti busur berjalan — teknik yang sama dengan versi CSS.
  ring1: {
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderWidth: 3,
    borderColor: 'rgba(18,183,106,0.12)',
    borderTopColor: brand[500],
    borderRightColor: 'rgba(18,183,106,0.5)',
  },
  ring2: {
    top: 16,
    left: 16,
    right: 16,
    bottom: 16,
    borderWidth: 2.5,
    borderColor: 'rgba(6,91,50,0.15)',
    borderBottomColor: brand[400],
    borderLeftColor: 'rgba(50,213,131,0.45)',
  },
  ring3: {
    top: 31,
    left: 31,
    right: 31,
    bottom: 31,
    borderWidth: 2,
    borderColor: 'transparent',
    borderTopColor: 'rgba(108,233,166,0.6)',
    borderBottomColor: 'rgba(108,233,166,0.3)',
  },
  // 84 dari kotak cincin 140 — proporsi yang sama persis dengan karir-mwt
  // (`width: 84px` di dalam `.ls-box` 140px).
  logo: {
    width: 84,
    height: 84,
    tintColor: Colors.white,
  },
  spark: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: brand[400],
  },
  sparkTop: { top: -3, alignSelf: 'center' },
  sparkBottom: { bottom: -3, alignSelf: 'center' },
  sparkLeft: { left: -3, top: RING_BOX / 2 - 3 },
  sparkRight: { right: -3, top: RING_BOX / 2 - 3 },

  textBlock: {
    alignItems: 'center',
  },
  title: {
    fontFamily: fonts.bold,
    fontSize: Typography.sizes.xl,
    color: Colors.white,
    letterSpacing: 0.3,
  },
  subtitle: {
    marginTop: Spacing.xs,
    fontFamily: fonts.semibold,
    fontSize: Typography.sizes.xs,
    color: brand[400],
    textTransform: 'uppercase',
    letterSpacing: Typography.letterSpacing.wide,
  },

  progressTrack: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
  },
  // Lebarnya tetap; yang bergerak posisinya (translateX), sehingga terlihat
  // seperti berkas cahaya yang melintas — pola indeterminate yang lazim.
  progressBar: {
    height: '100%',
    width: '40%',
  },
});

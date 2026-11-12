/**
 * SplashModul — layar pembuka satu modul layanan, seolah modul itu aplikasi tersendiri: ubin ikon
 * berwarna, nama modul, keterangan, dan spinner di dasar layar. Murni visual; pemanggil yang
 * menentukan kapan berpindah ke layar berikutnya.
 */
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import BrandSpinner from './BrandSpinner';
import Icon from './Icon';
import Colors from '../../../constants/Colors';
import Spacing from '../../../constants/Spacing';
import { fonts, ukuranCatatan } from '../../../constants/Typography';

interface SplashModulProps {
  ikon: string;
  nama: string;
  /** Warna dasar ubin ikon (hex). */
  warna: string;
  keterangan?: string;
}

export default function SplashModul({ ikon, nama, warna, keterangan = 'PT Mada Wikri Tunggal' }: SplashModulProps) {
  const { bottom } = useSafeAreaInsets();
  const muncul = useRef(new Animated.Value(0)).current;

  // Ikon dan nama memudar masuk sambil membesar sedikit, seperti modul yang sedang dibuka.
  useEffect(() => {
    Animated.spring(muncul, { toValue: 1, speed: 8, bounciness: 8, useNativeDriver: true }).start();
  }, [muncul]);

  return (
    <View style={styles.layar}>
      <Animated.View
        style={[styles.tengah, { opacity: muncul, transform: [{ scale: muncul.interpolate({ inputRange: [0, 1], outputRange: [0.85, 1] }) }] }]}
      >
        <View style={[styles.ubin, { backgroundColor: warna }]}>
          <Icon name={ikon} size={48} color={Colors.white} />
        </View>
        <Text style={styles.nama}>{nama}</Text>
        <Text style={styles.keterangan}>{keterangan}</Text>
      </Animated.View>

      <View style={[styles.spinner, { bottom: bottom + Spacing.xxl }]}>
        <BrandSpinner size={28} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  layar: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.white },
  tengah: { alignItems: 'center', gap: Spacing.sm },
  ubin: {
    width: 104,
    height: 104,
    marginBottom: Spacing.md,
    borderRadius: Spacing.radius.xxl,
    ...Spacing.curve,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nama: { fontFamily: fonts.bold, fontSize: 20, color: Colors.textPrimary },
  keterangan: { fontFamily: fonts.regular, fontSize: ukuranCatatan, color: Colors.textTertiary },
  spinner: { position: 'absolute' },
});

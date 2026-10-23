/**
 * LoadingScreen — layar memuat satu halaman penuh: latar putih, logo SIMWT Mobile di tengah dengan spinner
 * di bawahnya (satu-satunya yang bergerak), dan maskot di dasar layar tepat di atas bilah navigasi sistem. Tampil selama aplikasi memeriksa sesi login.
 */
import React from 'react';
import { Image, StyleSheet, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import BrandSpinner from './BrandSpinner';
import Colors from '../../../constants/Colors';
import Spacing from '../../../constants/Spacing';

const LOGO = require('../../../assets/images/logo-simwt-mobile.png');
const MASKOT = require('../../../assets/images/maskot-memuat.webp');
// Ukuran asli gambar maskot (lebar × tinggi) untuk menjaga rasio saat selebar layar.
const RASIO_MASKOT = 1240 / 2000;
// Rasio logo (lebar ÷ tinggi) dan porsi lebar layar yang dipakainya.
const RASIO_LOGO = 1382 / 143;
const PORSI_LOGO = 0.42;

export default function LoadingScreen() {
  const { width } = useWindowDimensions();
  // Maskot berdiri tepat di atas bilah navigasi sistem, bukan di belakangnya.
  const { bottom } = useSafeAreaInsets();

  return (
    <View style={styles.layar}>
      <Image source={LOGO} style={{ width: width * PORSI_LOGO, height: (width * PORSI_LOGO) / RASIO_LOGO }} resizeMode="contain" />
      <View style={styles.spinner}>
        <BrandSpinner size={28} />
      </View>
      <Image source={MASKOT} style={[styles.maskot, { width, height: width * RASIO_MASKOT, bottom }]} resizeMode="contain" />
    </View>
  );
}

const styles = StyleSheet.create({
  layar: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.white },
  spinner: { marginTop: Spacing.lg },
  maskot: { position: 'absolute', left: 0 },
});

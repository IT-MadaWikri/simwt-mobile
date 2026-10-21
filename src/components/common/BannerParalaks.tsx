/**
 * BannerParalaks — gambar persegi selebar layar di puncak layar menu, dengan
 * efek paralaks seperti header beranda: gambar bergeser setengah kecepatan
 * gulir, sementara `children` (opak, sudut atasnya membulat) menggulir normal
 * dan menutupinya. Dipakai di dalam `Animated.ScrollView` yang
 * `onScroll`-nya mengisi `scrollY` (native driver). Pasangkan dengan
 * `<AppBar transparan />`.
 */
import React from 'react';
import { Animated, Image, ImageSourcePropType, StyleSheet, useWindowDimensions, View } from 'react-native';
import Colors from '../../../constants/Colors';
import Spacing from '../../../constants/Spacing';

interface BannerParalaksProps {
  sumber: ImageSourcePropType;
  /** Posisi gulir layar; menggerakkan efek paralaks. */
  scrollY: Animated.Value;
  children: React.ReactNode;
}

export default function BannerParalaks({ sumber, scrollY, children }: BannerParalaksProps) {
  const { width: lebar } = useWindowDimensions();
  // Gulir negatif (tarik ke bawah di iOS) tidak ikut menggeser gambar.
  const geser = scrollY.interpolate({ inputRange: [0, 1], outputRange: [0, 0.5], extrapolateLeft: 'clamp' });

  return (
    <>
      <Animated.View style={{ width: lebar, height: lebar, transform: [{ translateY: geser }] }}>
        <Image source={sumber} style={{ width: lebar, height: lebar, resizeMode: 'cover' }} />
      </Animated.View>
      <View style={styles.isi}>
        {children}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  // Naik menimpa tepi bawah gambar sebesar radiusnya, supaya lengkung sudut memperlihatkan gambar di belakangnya.
  isi: {
    marginTop: -Spacing.radius.xxl,
    paddingTop: Spacing.lg,
    borderTopLeftRadius: Spacing.radius.xxl,
    borderTopRightRadius: Spacing.radius.xxl,
    ...Spacing.curve,
    backgroundColor: Colors.white,
  },
});

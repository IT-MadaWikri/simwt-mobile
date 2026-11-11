/**
 * SkeletonDetailAset — kerangka hasil scan aset: galeri persegi, identitas
 * dengan chip, empat ubin 2×2, lalu seksi informasi dan riwayat.
 */
import React from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import Colors from '../../../constants/Colors';
import Spacing from '../../../constants/Spacing';
import { Skeleton } from '../common/Skeleton';

export default function SkeletonDetailAset() {
  const { width } = useWindowDimensions();
  return (
    <View style={styles.layar}>
      <Skeleton w={width} h={width} r={0} />

      <View style={styles.seksi}>
        <Skeleton w="65%" h={16} />
        <Skeleton w="40%" h={12} style={styles.jarak} />
        <View style={[styles.baris, styles.jarak]}>
          <Skeleton w={84} h={22} />
          <Skeleton w={72} h={22} />
          <Skeleton w={92} h={22} />
        </View>
      </View>

      <View style={styles.seksi}>
        <View style={styles.grid}>
          {[0, 1, 2, 3].map((i) => (
            <View key={i} style={[styles.baris, styles.ubin]}>
              <Skeleton w={32} h={32} r={16} />
              <View style={styles.isi}>
                <Skeleton w="50%" h={10} />
                <Skeleton w="80%" h={12} />
              </View>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.seksi}>
        <Skeleton w={96} h={10} style={styles.judulSeksi} />
        {[0, 1, 2, 3].map((i) => (
          <View key={i} style={[styles.baris, i > 0 && styles.jarakBesar]}>
            <Skeleton w={20} h={20} r={10} />
            <View style={styles.isi}>
              <Skeleton w="30%" h={10} />
              <Skeleton w="55%" h={12} />
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  layar: { flex: 1, backgroundColor: Colors.background },
  seksi: {
    backgroundColor: Colors.white,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    marginBottom: Spacing.sm,
  },
  baris: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  grid: { flexDirection: 'row', flexWrap: 'wrap', rowGap: Spacing.md },
  ubin: { width: '50%' },
  isi: { flex: 1, gap: 6 },
  jarak: { marginTop: Spacing.sm },
  jarakBesar: { marginTop: Spacing.md },
  judulSeksi: { marginBottom: Spacing.md },
});

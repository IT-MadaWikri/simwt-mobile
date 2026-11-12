/**
 * SkeletonDetailTiket — kerangka Detail Tiket: empat petak metrik, ringkasan,
 * detail masalah, foto, dan progres. Urutannya sama dengan seksi aslinya.
 */
import React from 'react';
import { StyleSheet, View } from 'react-native';
import Colors from '../../../constants/Colors';
import Spacing from '../../../constants/Spacing';
import { Skeleton } from '../common/Skeleton';

export default function SkeletonDetailTiket() {
  return (
    <View style={styles.layar}>
      <View style={styles.metrik}>
        {[0, 1, 2, 3].map((i) => (
          <View key={i} style={styles.petak}>
            <Skeleton w="50%" h={10} />
            <Skeleton w="35%" h={18} />
          </View>
        ))}
      </View>

      <View style={styles.seksi}>
        <View style={styles.baris}>
          <Skeleton w={72} h={20} />
          <Skeleton w={64} h={20} />
        </View>
        <Skeleton w="75%" h={14} style={styles.jarak} />
        <Skeleton w="55%" h={12} style={styles.jarak} />
        <Skeleton w="45%" h={12} style={styles.jarak} />
      </View>

      <View style={styles.seksi}>
        <Skeleton w={96} h={10} style={styles.judulSeksi} />
        <Skeleton w="95%" h={10} />
        <Skeleton w="80%" h={10} style={styles.jarak} />
      </View>

      <View style={styles.seksi}>
        <Skeleton w={40} h={10} style={styles.judulSeksi} />
        <View style={styles.baris}>
          <Skeleton h={0} r={Spacing.radius.lg} style={styles.foto} />
          <Skeleton h={0} r={Spacing.radius.lg} style={styles.foto} />
        </View>
      </View>

      <View style={styles.seksi}>
        <Skeleton w={120} h={10} style={styles.judulSeksi} />
        {[0, 1, 2].map((i) => (
          <View key={i} style={[styles.baris, i > 0 && styles.jarakBesar]}>
            <Skeleton w={16} h={16} r={8} />
            <View style={styles.isi}>
              <Skeleton w="55%" h={12} />
              <Skeleton w="30%" h={10} />
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  layar: { flex: 1, backgroundColor: Colors.background },
  metrik: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: Spacing.md,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  petak: {
    width: '48%',
    gap: Spacing.sm,
    backgroundColor: Colors.white,
    borderRadius: Spacing.radius.xl,
    ...Spacing.curve,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
    padding: Spacing.md,
  },
  seksi: {
    backgroundColor: Colors.white,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    marginBottom: Spacing.sm,
  },
  baris: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  isi: { flex: 1, gap: 6 },
  jarak: { marginTop: Spacing.sm },
  jarakBesar: { marginTop: Spacing.md },
  judulSeksi: { marginBottom: Spacing.md },
  foto: { flex: 1, width: undefined, height: undefined, aspectRatio: 1 },
});

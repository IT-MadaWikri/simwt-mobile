/**
 * SkeletonDetailKaryawan — kerangka detail karyawan: kartu profil (avatar 80,
 * nama, lencana, dua kotak masa kerja/usia) lalu kartu informasi berpetak.
 */
import React from 'react';
import { StyleSheet, View } from 'react-native';
import Colors from '../../../constants/Colors';
import Spacing from '../../../constants/Spacing';
import { Skeleton } from '../common/Skeleton';

function KartuInfo() {
  return (
    <View style={styles.kartu}>
      <View style={styles.baris}>
        <Skeleton w={36} h={36} r={Spacing.radius.sm} />
        <Skeleton w={120} h={12} />
      </View>
      <View style={styles.grid}>
        {[0, 1, 2, 3].map((i) => (
          <View key={i} style={styles.petak}>
            <Skeleton w="45%" h={10} />
            <Skeleton w="75%" h={12} />
          </View>
        ))}
      </View>
    </View>
  );
}

export default function SkeletonDetailKaryawan() {
  return (
    <View style={styles.layar}>
      <View style={styles.kartu}>
        <View style={styles.baris}>
          <Skeleton w={80} h={80} r={40} />
          <View style={styles.isi}>
            <Skeleton w="70%" h={16} />
            <Skeleton w={110} h={20} />
            <Skeleton w={150} h={20} />
          </View>
        </View>
        <View style={[styles.baris, styles.ringkas]}>
          <Skeleton h={64} r={Spacing.radius.md} style={styles.kotak} />
          <Skeleton h={64} r={Spacing.radius.md} style={styles.kotak} />
        </View>
      </View>
      <KartuInfo />
      <KartuInfo />
    </View>
  );
}

const styles = StyleSheet.create({
  layar: { flex: 1, backgroundColor: Colors.background, padding: Spacing.lg, gap: Spacing.md },
  kartu: {
    backgroundColor: Colors.white,
    borderRadius: Spacing.radius.xl,
    ...Spacing.curve,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
    padding: 20,
  },
  baris: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  isi: { flex: 1, gap: 8 },
  ringkas: { marginTop: Spacing.lg },
  kotak: { flex: 1, width: undefined },
  grid: { flexDirection: 'row', flexWrap: 'wrap', rowGap: Spacing.md, marginTop: Spacing.lg },
  petak: { width: '50%', gap: 6 },
});

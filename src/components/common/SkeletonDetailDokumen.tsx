/**
 * SkeletonDetailDokumen — kerangka detail dokumen berformulir (request akun IT,
 * keluar pabrik HRD): kepala berikon + lencana, deretan baris "label | nilai",
 * lalu linimasa status.
 */
import React from 'react';
import { StyleSheet, View } from 'react-native';
import Colors from '../../../constants/Colors';
import Spacing from '../../../constants/Spacing';
import { Skeleton } from './Skeleton';

export default function SkeletonDetailDokumen() {
  return (
    <View style={styles.layar}>
      <View style={[styles.baris, styles.kepala]}>
        <Skeleton w={40} h={40} r={20} />
        <View style={styles.isi}>
          <Skeleton w="60%" h={14} />
          <Skeleton w={84} h={20} />
          <Skeleton w="45%" h={10} />
        </View>
      </View>

      <Skeleton w={72} h={10} style={styles.judulBagian} />
      {Array.from({ length: 7 }, (_, i) => (
        <View key={i} style={[styles.baris, styles.barisIsian]}>
          <Skeleton w={84} h={10} />
          <Skeleton w={i % 2 ? '45%' : '60%'} h={10} />
        </View>
      ))}

      <Skeleton w={48} h={10} style={[styles.judulBagian, { marginTop: Spacing.lg }]} />
      {[0, 1, 2].map((i) => (
        <View key={i} style={[styles.baris, i > 0 && styles.jarakBesar]}>
          <Skeleton w={16} h={16} r={8} />
          <View style={styles.isi}>
            <Skeleton w="50%" h={12} />
            <Skeleton w="30%" h={10} />
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  layar: { flex: 1, backgroundColor: Colors.white, paddingHorizontal: Spacing.screenPadding, paddingTop: Spacing.md },
  baris: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  kepala: { alignItems: 'flex-start', marginBottom: Spacing.md },
  isi: { flex: 1, gap: 6 },
  judulBagian: { marginBottom: Spacing.md },
  barisIsian: { justifyContent: 'space-between', marginBottom: Spacing.md },
  jarakBesar: { marginTop: Spacing.md },
});

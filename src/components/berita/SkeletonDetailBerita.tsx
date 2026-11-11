/**
 * SkeletonDetailBerita — kerangka artikel: judul dua baris, meta, statistik,
 * foto sampul 16:10, lalu beberapa baris isi.
 */
import React from 'react';
import { StyleSheet, View } from 'react-native';
import Colors from '../../../constants/Colors';
import Spacing from '../../../constants/Spacing';
import { Skeleton } from '../common/Skeleton';

export default function SkeletonDetailBerita() {
  return (
    <View style={styles.layar}>
      <Skeleton w="90%" h={22} />
      <Skeleton w="60%" h={22} style={styles.jarak} />

      <View style={[styles.baris, styles.meta]}>
        <Skeleton w="55%" h={10} />
        <Skeleton w={56} h={10} />
      </View>
      <View style={[styles.baris, styles.jarak]}>
        <Skeleton w={36} h={10} />
        <Skeleton w={36} h={10} />
      </View>

      <Skeleton h={0} r={Spacing.radius.md} style={styles.foto} />

      {[100, 96, 100, 70].map((l, i) => (
        <Skeleton key={i} w={`${l}%`} h={10} style={styles.jarak} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  layar: { flex: 1, backgroundColor: Colors.backgroundPlain, padding: Spacing.screenPadding },
  baris: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  meta: { justifyContent: 'space-between', marginTop: Spacing.md },
  jarak: { marginTop: Spacing.sm },
  foto: { width: '100%', height: undefined, aspectRatio: 16 / 10, marginVertical: Spacing.md },
});

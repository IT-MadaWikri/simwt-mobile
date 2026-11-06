/**
 * DaftarManfaat — daftar kartu manfaat Kaizen (judul + tipe) dengan chevron di kanan.
 * Rincian (Penghematan, Sebelum, Sesudah, lokasi, pelaksana) tidak ditampilkan di sini; ketuk kartu
 * → `onPilih(indeks)` dan pemanggil membuka sheet rincian. Presentasional murni.
 */
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from '../common/Icon';
import Colors, { slate } from '../../../constants/Colors';
import Spacing from '../../../constants/Spacing';
import { fonts, ukuranIsi } from '../../../constants/Typography';
import { gs } from '../../../constants/GlobalStyles';
import type { ItemManfaat } from './SliderManfaat';

export default function DaftarManfaat({
  items,
  onPilih,
}: {
  /** `judul` mis. "Productivity 1". */
  items: (Pick<ItemManfaat, 'ikon' | 'warna' | 'tipe'> & { judul: string })[];
  onPilih: (indeks: number) => void;
}) {
  return (
    <View style={styles.daftar}>
      {items.map((m, urut) => (
        <TouchableOpacity key={urut} style={styles.kartu} activeOpacity={0.7} onPress={() => onPilih(urut)}>
          <View style={[gs.row, { gap: 6, flex: 1 }]}>
            <Icon name={m.ikon} size={16} color={m.warna} />
            <Text style={styles.judul}>{m.judul}</Text>
          </View>
          {m.tipe ? (
            <View style={styles.chip}>
              <Text style={styles.teksChip}>{m.tipe === 'Eksternal' ? 'Luar perusahaan' : 'Dalam perusahaan'}</Text>
            </View>
          ) : null}
          <Icon name="chevron-right" size={18} color={Colors.textTertiary} />
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  daftar: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
  },
  kartu: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    borderRadius: Spacing.radius.md,
    ...Spacing.curve,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
    backgroundColor: Colors.white,
  },
  judul: {
    fontSize: ukuranIsi,
    fontFamily: fonts.bold,
    color: Colors.textPrimary,
  },
  chip: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: Spacing.radius.full,
    ...Spacing.curve,
    backgroundColor: slate[100],
  },
  teksChip: {
    fontSize: 10,
    fontFamily: fonts.semibold,
    color: Colors.textSecondary,
  },
});

/** Satu baris aset pada daftar — presentasional, tanpa data fetching. */
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from '../common/Icon';
import Colors, { brand, slate } from '../../../constants/Colors';
import Spacing from '../../../constants/Spacing';
import { fonts } from '../../../constants/Typography';

interface BarisAsetProps {
  nama: string;
  nomor: string;
  /** Keterangan di bawah nomor (kategori · PIC); string kosong = tidak tampil. */
  keterangan: string;
  /** Kondisi aset ("Baik", "Rusak", …); tidak tampil bila kosong. */
  kondisi?: string | null;
  onPress: () => void;
}

export default function BarisAset({ nama, nomor, keterangan, kondisi, onPress }: BarisAsetProps) {
  return (
    <TouchableOpacity style={styles.baris} activeOpacity={0.6} onPress={onPress}>
      <View style={styles.logo}>
        <Icon name="box" size={18} color={Colors.textSecondary} />
      </View>

      <View style={styles.isi}>
        <Text style={styles.judul} numberOfLines={1}>{nama}</Text>
        <Text style={styles.sub} numberOfLines={1}>{nomor}</Text>
        {keterangan ? <Text style={styles.sub} numberOfLines={1}>{keterangan}</Text> : null}
      </View>

      {kondisi ? (
        <View style={styles.kondisi}>
          <Text style={styles.teksKondisi}>{kondisi}</Text>
        </View>
      ) : null}

      <Icon name="chevron-right" size={16} color={Colors.textTertiary} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  baris: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingHorizontal: Spacing.screenPadding,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.white,
  },
  logo: {
    width: 42,
    height: 42,
    borderRadius: Spacing.radius.sm,
    ...Spacing.curve,
    backgroundColor: slate[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  isi: { flex: 1, gap: 2 },
  judul: { fontFamily: fonts.semibold, fontSize: 12, color: Colors.textPrimary },
  sub: { fontFamily: fonts.regular, fontSize: 12, color: Colors.textTertiary },
  kondisi: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: Spacing.radius.full,
    ...Spacing.curve,
    backgroundColor: brand[50],
  },
  teksKondisi: { fontFamily: fonts.semibold, fontSize: 10, color: brand[700] },
});

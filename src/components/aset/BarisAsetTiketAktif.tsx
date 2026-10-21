/** Satu baris aset yang punya tiket aktif — presentasional, tanpa data fetching. */
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from '../common/Icon';
import LencanaStatusTiket from '../tiket/LencanaStatusTiket';
import Colors, { slate } from '../../../constants/Colors';
import Spacing from '../../../constants/Spacing';
import { fonts } from '../../../constants/Typography';
import { StatusTiket } from '../../types/tiket';

interface BarisAsetTiketAktifProps {
  nama: string;
  nomor: string;
  judulTiket: string;
  status: StatusTiket;
  /** Banyaknya tiket aktif pada aset ini; angka hanya tampil bila lebih dari 1. */
  jumlahTiket?: number;
  onPress: () => void;
}

export default function BarisAsetTiketAktif({ nama, nomor, judulTiket, status, jumlahTiket = 1, onPress }: BarisAsetTiketAktifProps) {
  return (
    <TouchableOpacity style={styles.baris} activeOpacity={0.6} onPress={onPress}>
      <View style={styles.logo}>
        <Icon name="box" size={18} color={Colors.textSecondary} />
      </View>

      <View style={styles.isi}>
        <Text style={styles.judul} numberOfLines={1}>{nama}</Text>
        <Text style={styles.sub} numberOfLines={1}>{nomor}</Text>
        <Text style={styles.sub} numberOfLines={1}>{judulTiket}</Text>
      </View>

      <View style={styles.kanan}>
        <LencanaStatusTiket status={status} />
        {jumlahTiket > 1 ? <Text style={styles.sub}>{jumlahTiket} tiket aktif</Text> : null}
      </View>

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
  kanan: { alignItems: 'flex-end', gap: 4, flexShrink: 0 },
});

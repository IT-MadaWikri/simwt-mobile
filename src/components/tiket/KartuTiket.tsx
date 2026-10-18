/** Satu baris tiket pada daftar — presentasional, tanpa data fetching. */
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from '../common/Icon';
import LencanaStatusTiket from './LencanaStatusTiket';
import Colors from '../../../constants/Colors';
import Spacing from '../../../constants/Spacing';
import { fonts } from '../../../constants/Typography';
import { StatusTiket } from '../../types/tiket';
import { BULAN } from '../../utils/kaizen';

const tanggal = (iso: string | null) => {
  if (!iso) return '-';
  const t = new Date(iso);
  return `${t.getDate()} ${BULAN[t.getMonth()]} ${t.getFullYear()}`;
};

interface KartuTiketProps {
  noTiket: string;
  judul: string;
  status: StatusTiket;
  jenis: string | null;
  plant: string | null;
  tanggalDiajukan: string | null;
  tanggalSelesai: string | null;
  onPress: () => void;
}

export default function KartuTiket({
  noTiket,
  judul,
  status,
  jenis,
  plant,
  tanggalDiajukan,
  tanggalSelesai,
  onPress,
}: KartuTiketProps) {
  const meta = [jenis, plant].filter(Boolean).join(' · ');
  return (
    <TouchableOpacity style={styles.baris} activeOpacity={0.6} onPress={onPress}>
      <View style={styles.isi}>
        <View style={styles.atas}>
          <Text style={styles.nomor} numberOfLines={1}>#{noTiket}</Text>
          <LencanaStatusTiket status={status} />
        </View>
        <Text style={styles.judul} numberOfLines={2}>{judul}</Text>
        {meta ? <Text style={styles.sub} numberOfLines={1}>{meta}</Text> : null}
        <Text style={styles.sub}>
          Diajukan {tanggal(tanggalDiajukan)}
          {status === 'OK' ? ` · Selesai ${tanggal(tanggalSelesai)}` : ''}
        </Text>
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
  isi: { flex: 1, gap: 2 },
  atas: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: Spacing.sm },
  nomor: { fontFamily: fonts.semibold, fontSize: 12, color: Colors.textSecondary, flexShrink: 1 },
  judul: { fontFamily: fonts.semibold, fontSize: 12, color: Colors.textPrimary },
  sub: { fontFamily: fonts.regular, fontSize: 12, color: Colors.textSecondary },
});

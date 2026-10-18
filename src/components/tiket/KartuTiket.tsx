/** Satu baris tiket pada daftar — presentasional, tanpa data fetching. */
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from '../common/Icon';
import LencanaStatusTiket, { WARNA_STATUS_TIKET } from './LencanaStatusTiket';
import Colors from '../../../constants/Colors';
import Spacing from '../../../constants/Spacing';
import { fonts } from '../../../constants/Typography';
import { STATUS_TIKET } from '../../adapters/tiket';
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

/** Potongan kecil berikon (jenis, plant) di baris keterangan. */
function Potongan({ ikon, teks }: { ikon: string; teks: string }) {
  return (
    <View style={styles.potongan}>
      <Icon name={ikon as any} size={12} color={Colors.textTertiary} />
      <Text style={styles.sub} numberOfLines={1}>{teks}</Text>
    </View>
  );
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
  const warna = WARNA_STATUS_TIKET[status];
  return (
    <TouchableOpacity style={styles.baris} activeOpacity={0.6} onPress={onPress}>
      <View style={[styles.logo, { backgroundColor: warna.bg }]}>
        <Icon name={STATUS_TIKET[status].ikon as any} size={18} color={warna.fg} />
      </View>

      <View style={styles.isi}>
        <Text style={styles.judul} numberOfLines={1}>{judul}</Text>
        <Text style={styles.nomor} numberOfLines={1}>#{noTiket}</Text>
        <View style={styles.meta}>
          {jenis ? <Potongan ikon="shape-outline" teks={jenis} /> : null}
          {plant ? <Potongan ikon="factory" teks={plant} /> : null}
        </View>
      </View>

      <View style={styles.kanan}>
        <LencanaStatusTiket status={status} />
        <Text style={styles.sub}>{tanggal(tanggalDiajukan)}</Text>
        {status === 'OK' ? <Text style={styles.selesai}>Selesai {tanggal(tanggalSelesai)}</Text> : null}
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  isi: { flex: 1, gap: 2 },
  judul: { fontFamily: fonts.semibold, fontSize: 12, color: Colors.textPrimary },
  nomor: { fontFamily: fonts.regular, fontSize: 12, color: Colors.textSecondary },
  meta: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, marginTop: 2 },
  potongan: { flexDirection: 'row', alignItems: 'center', gap: 4, flexShrink: 1 },
  sub: { fontFamily: fonts.regular, fontSize: 12, color: Colors.textTertiary },
  kanan: { alignItems: 'flex-end', gap: 4, flexShrink: 0 },
  selesai: { fontFamily: fonts.regular, fontSize: 10, color: Colors.textTertiary },
});

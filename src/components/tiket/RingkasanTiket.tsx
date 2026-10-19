/**
 * Ringkasan di puncak detail tiket (gaya detail Kaizen): lencana status + nomor,
 * judul, jenis · plant, lalu pengaju dan baris info (departemen, aset). Presentasional.
 */
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Avatar from '../common/Avatar';
import Icon from '../common/Icon';
import LencanaStatusTiket from './LencanaStatusTiket';
import Colors, { slate } from '../../../constants/Colors';
import Spacing from '../../../constants/Spacing';
import { fonts, ukuranIsi } from '../../../constants/Typography';
import { StatusTiket } from '../../types/tiket';

interface RingkasanTiketProps {
  noTiket: string;
  judul: string;
  status: StatusTiket;
  jenis: string | null;
  plant: string | null;
  diajukanOleh: string;
  pic: string | null;
  departemen: string | null;
  aset: string | null;
}

export default function RingkasanTiket({
  noTiket,
  judul,
  status,
  jenis,
  plant,
  diajukanOleh,
  pic,
  departemen,
  aset,
}: RingkasanTiketProps) {
  const tag = [jenis, plant].filter(Boolean).join('  ·  ');
  const info = [
    { ikon: 'office-building-outline', teks: departemen },
    { ikon: 'barcode', teks: aset },
  ].filter((i) => i.teks);

  return (
    <View>
      <View style={styles.atas}>
        <LencanaStatusTiket status={status} panjang />
        <Text style={styles.kecil}>#{noTiket}</Text>
      </View>

      <Text style={styles.judul}>{judul || 'Tanpa judul'}</Text>
      {tag ? <Text style={styles.kecil}>{tag}</Text> : null}

      <View style={styles.garis} />

      <View style={styles.pengaju}>
        <Avatar nama={diajukanOleh} ukuran={34} />
        <View style={{ flex: 1 }}>
          <Text style={styles.nama} numberOfLines={1}>{diajukanOleh || '-'}</Text>
          <Text style={styles.kecil}>Pengaju</Text>
        </View>
      </View>

      <View style={styles.pengaju}>
        <Avatar nama={pic ?? '?'} ukuran={34} />
        <View style={{ flex: 1 }}>
          <Text style={[styles.nama, !pic && { color: Colors.textTertiary }]} numberOfLines={1}>{pic ?? 'Belum di-assign'}</Text>
          <Text style={styles.kecil}>PIC perbaikan</Text>
        </View>
      </View>

      {info.map((i) => (
        <View key={i.ikon} style={styles.barisInfo}>
          <Icon name={i.ikon as any} size={14} color={Colors.textTertiary} />
          <Text style={[styles.kecil, { flex: 1 }]}>{i.teks}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  atas: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  judul: {
    marginTop: Spacing.sm,
    marginBottom: 4,
    fontSize: 12,
    fontFamily: fonts.bold,
    color: Colors.textPrimary,
  },
  kecil: { fontSize: 12, fontFamily: fonts.regular, color: Colors.textTertiary },
  garis: { height: StyleSheet.hairlineWidth, backgroundColor: Colors.border, marginVertical: Spacing.md },
  pengaju: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  nama: { fontSize: ukuranIsi, fontFamily: fonts.semibold, color: Colors.textPrimary },
  barisInfo: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: Spacing.sm },
});

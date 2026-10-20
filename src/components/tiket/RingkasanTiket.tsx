/**
 * Ringkasan di puncak detail tiket: lencana status + nomor, judul, kapsul jenis & plant,
 * kartu pengaju/PIC, lalu baris info (departemen, aset) dengan ikon berwarna. Presentasional.
 */
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Avatar from '../common/Avatar';
import Icon from '../common/Icon';
import LencanaStatusTiket from './LencanaStatusTiket';
import Colors from '../../../constants/Colors';
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
  const chip = [
    { ikon: 'progress-wrench', teks: jenis, warna: WARNA.jingga },
    { ikon: 'factory', teks: plant, warna: WARNA.biru },
  ].filter((c) => c.teks);
  const info = [
    { ikon: 'office-building-outline', teks: departemen, warna: WARNA.ungu },
    { ikon: 'barcode', teks: aset, warna: WARNA.tosca },
  ].filter((i) => i.teks);

  return (
    <View>
      <View style={styles.atas}>
        <LencanaStatusTiket status={status} panjang />
        <Text style={styles.kecil}>#{noTiket}</Text>
      </View>

      <Text style={styles.judul}>{judul || 'Tanpa judul'}</Text>
      {chip.length > 0 && (
        <View style={styles.chipBaris}>
          {chip.map((c) => (
            <View key={c.ikon} style={[styles.chip, { backgroundColor: tint(c.warna) }]}>
              <Icon name={c.ikon as any} size={13} color={c.warna} />
              <Text style={[styles.chipTeks, { color: c.warna }]} numberOfLines={1}>{c.teks}</Text>
            </View>
          ))}
        </View>
      )}

      <View style={styles.orang}>
        <View style={styles.kartuOrang}>
          <Avatar nama={diajukanOleh} ukuran={34} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.peran, { color: WARNA.tosca }]}>Pengaju</Text>
            <Text style={styles.nama} numberOfLines={1}>{diajukanOleh || '-'}</Text>
          </View>
        </View>

        <View style={styles.kartuOrang}>
          <Avatar nama={pic ?? '?'} ukuran={34} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.peran, { color: WARNA.ungu }]}>PIC perbaikan</Text>
            <Text style={[styles.nama, !pic && { color: Colors.textTertiary }]} numberOfLines={1}>{pic ?? 'Belum di-assign'}</Text>
          </View>
        </View>
      </View>

      {info.map((i) => (
        <View key={i.ikon} style={styles.barisInfo}>
          <View style={[styles.ubinIkon, { backgroundColor: tint(i.warna) }]}>
            <Icon name={i.ikon as any} size={15} color={i.warna} />
          </View>
          <Text style={[styles.isi, { flex: 1 }]}>{i.teks}</Text>
        </View>
      ))}
    </View>
  );
}

// Warna ikon (sama dengan grid layanan) dan tint 12% untuk latar kapsul/ubin.
const WARNA = { jingga: '#ff9a2e', biru: '#4a98ff', ungu: '#9a6bff', tosca: '#1fc2a8' };
const tint = (hex: string) => `${hex}1f`;

const styles = StyleSheet.create({
  atas: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  judul: {
    marginTop: Spacing.sm,
    marginBottom: Spacing.sm,
    fontSize: 12,
    fontFamily: fonts.bold,
    color: Colors.textPrimary,
  },
  kecil: { fontSize: 12, fontFamily: fonts.regular, color: Colors.textTertiary },
  isi: { fontSize: 12, fontFamily: fonts.regular, color: Colors.textSecondary },
  chipBaris: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: Spacing.radius.full,
    maxWidth: '100%',
  },
  chipTeks: { fontSize: 12, fontFamily: fonts.semibold },
  orang: { marginTop: Spacing.md, gap: Spacing.sm },
  kartuOrang: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.sm,
    backgroundColor: Colors.background,
    borderRadius: Spacing.radius.md,
    ...Spacing.curve,
  },
  peran: { fontSize: 12, fontFamily: fonts.semibold },
  nama: { fontSize: ukuranIsi, fontFamily: fonts.semibold, color: Colors.textPrimary },
  barisInfo: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, marginTop: Spacing.sm },
  ubinIkon: {
    width: 28,
    height: 28,
    borderRadius: Spacing.radius.sm,
    ...Spacing.curve,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

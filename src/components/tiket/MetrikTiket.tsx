/**
 * Metrik waktu penanganan tiket dalam tata letak bento: Total Downtime melebar di atas,
 * Waktu Tunggu & Waktu Proses berdampingan, Total Perbaikan melebar di bawah. Tahap yang
 * masih berjalan menampilkan jam berjalan (HH:MM:SS) dan penanda "Berjalan".
 */
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Icon from '../common/Icon';
import Colors, { brand, slate } from '../../../constants/Colors';
import Spacing from '../../../constants/Spacing';
import { fonts } from '../../../constants/Typography';
import { formatDurasi } from '../../adapters/tiket';
import { formatJam, useJamBerjalan } from '../../hooks/useJamBerjalan';
import { MetrikTiket as Metrik } from '../../types/tiket';

function KartuMetrik({ metrik, lebar }: { metrik: Metrik; lebar?: boolean }) {
  const jam = useJamBerjalan(metrik.berjalanSejak);
  const berjalan = jam !== null;
  const nilai = berjalan ? formatJam(jam) : metrik.detik !== null ? formatDurasi(metrik.detik) : '-';

  return (
    <View style={[styles.kartu, berjalan && styles.kartuBerjalan, lebar ? styles.lebar : styles.setengah]}>
      <View style={styles.atas}>
        <Text style={styles.label} numberOfLines={1}>{metrik.label}</Text>
        {berjalan ? (
          <View style={styles.penanda}>
            <View style={styles.titik} />
            <Text style={styles.teksPenanda}>Berjalan</Text>
          </View>
        ) : (
          <Icon name="clock-outline" size={16} color={metrik.detik !== null ? brand[600] : Colors.textTertiary} />
        )}
      </View>
      <Text style={[styles.nilai, berjalan && { color: brand[700] }, nilai === '-' && { color: Colors.textTertiary }]}>
        {nilai}
      </Text>
      <Text style={styles.ket} numberOfLines={1}>{metrik.keterangan}</Text>
    </View>
  );
}

export default function MetrikTiket({ metrik }: { metrik: Metrik[] }) {
  const ambil = (id: Metrik['id']) => metrik.find((m) => m.id === id);
  const downtime = ambil('downtime');
  const tunggu = ambil('tunggu');
  const proses = ambil('proses');
  const perbaikan = ambil('perbaikan');

  return (
    <View style={styles.grid}>
      {downtime ? <KartuMetrik metrik={downtime} lebar /> : null}
      {tunggu ? <KartuMetrik metrik={tunggu} /> : null}
      {proses ? <KartuMetrik metrik={proses} /> : null}
      {perbaikan ? <KartuMetrik metrik={perbaikan} lebar /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  kartu: {
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
    borderRadius: Spacing.radius.xl,
    ...Spacing.curve,
    padding: Spacing.md,
    backgroundColor: Colors.white,
    gap: 2,
  },
  kartuBerjalan: { backgroundColor: brand[50], borderColor: brand[100] },
  lebar: { width: '100%' },
  // Dua kolom: setengah lebar dikurangi separuh celah.
  setengah: { flexGrow: 1, flexBasis: '45%' },
  atas: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: Spacing.sm },
  label: { flexShrink: 1, fontFamily: fonts.regular, fontSize: 12, color: Colors.textSecondary },
  nilai: { fontFamily: fonts.bold, fontSize: 18, color: Colors.textPrimary, marginTop: 2 },
  ket: { fontFamily: fonts.regular, fontSize: 12, color: Colors.textTertiary },
  penanda: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  titik: { width: 6, height: 6, borderRadius: 3, backgroundColor: brand[500] },
  teksPenanda: { fontFamily: fonts.semibold, fontSize: 10, color: brand[700] },
});

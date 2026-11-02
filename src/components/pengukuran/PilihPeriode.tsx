/**
 * Kartu pilihan periode (dengan titik status isian dan jamnya) plus isian jam untuk periode yang
 * sedang dipilih. Dipakai di tab Dimensi dan Visual. Presentasional.
 */
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import FieldJam from '../common/FieldJam';
import Colors, { brand, slate } from '../../../constants/Colors';
import Spacing from '../../../constants/Spacing';
import { fonts, ukuranIsi } from '../../../constants/Typography';
import { Periode, StatusPeriode } from '../../types/pengukuran';

const WARNA_STATUS: Record<StatusPeriode, string> = {
  lengkap: brand[500],
  sebagian: Colors.warning,
  kosong: slate[400],
};

interface PilihPeriodeProps {
  daftarPeriode: Periode[];
  periodeAktif: Periode;
  ambilStatus: (periode: Periode) => StatusPeriode;
  ambilJam: (periode: Periode) => string;
  onPilih: (periode: Periode) => void;
  onUbahJam: (periode: Periode, jam: string) => void;
}

export default function PilihPeriode({ daftarPeriode, periodeAktif, ambilStatus, ambilJam, onPilih, onUbahJam }: PilihPeriodeProps) {
  return (
    <View style={styles.wadah}>
      <View style={styles.baris}>
        {daftarPeriode.map((periode) => {
          const aktif = periode === periodeAktif;
          return (
            <TouchableOpacity
              key={periode}
              style={[styles.kartu, aktif && styles.kartuAktif]}
              onPress={() => onPilih(periode)}
              activeOpacity={0.7}
            >
              <Text style={[styles.periode, aktif && { color: brand[700] }]}>{periode}</Text>
              <View style={styles.status}>
                <View style={[styles.titik, { backgroundColor: WARNA_STATUS[ambilStatus(periode)] }]} />
                <Text style={styles.jam}>{ambilJam(periode) || '--:--'}</Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.baris}>
        <FieldJam label={`Jam periode ${periodeAktif}`} value={ambilJam(periodeAktif)} onChange={(jam) => onUbahJam(periodeAktif, jam)} />
      </View>
      <Text style={styles.catatan}>Jam untuk setiap periode aktif wajib diisi.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wadah: { marginBottom: Spacing.lg },
  baris: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.md },
  kartu: {
    flex: 1,
    gap: 6,
    padding: Spacing.md,
    borderRadius: Spacing.radius.md,
    ...Spacing.curve,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
  },
  kartuAktif: { borderColor: brand[600], backgroundColor: brand[50] },
  periode: { fontFamily: fonts.semibold, fontSize: ukuranIsi, color: Colors.textPrimary },
  status: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  titik: { width: 8, height: 8, borderRadius: 4 },
  jam: { fontFamily: fonts.regular, fontSize: ukuranIsi, color: Colors.textSecondary },
  catatan: { fontFamily: fonts.regular, fontSize: ukuranIsi, color: Colors.textTertiary },
});

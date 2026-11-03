/**
 * Tab pilihan periode (dengan titik status isian) plus isian jam untuk periode yang
 * sedang dipilih. Dipakai di tab Dimensi dan Visual. Presentasional.
 */
import React, { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
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
  const jumlah = Math.max(daftarPeriode.length, 1);
  const indeks = Math.max(daftarPeriode.indexOf(periodeAktif), 0);
  const geser = useRef(new Animated.Value(indeks)).current;

  useEffect(() => {
    // `left` berupa persen (properti layout), jadi tanpa native driver dan tanpa mengukur lebar.
    Animated.spring(geser, { toValue: indeks, useNativeDriver: false, bounciness: 0, speed: 20 }).start();
  }, [geser, indeks]);

  const left = geser.interpolate({ inputRange: [0, jumlah], outputRange: ['0%', '100%'] });

  return (
    <View style={styles.wadah}>
      <View style={styles.tabs}>
        <View style={styles.jalur}>
          <Animated.View style={[styles.indikator, { width: `${100 / jumlah}%`, left }]} />
          {daftarPeriode.map((periode) => {
            const aktif = periode === periodeAktif;
            return (
              <TouchableOpacity key={periode} style={styles.tab} onPress={() => onPilih(periode)} activeOpacity={0.7}>
                <View style={[styles.titik, { backgroundColor: WARNA_STATUS[ambilStatus(periode)] }]} />
                <Text style={[styles.periode, aktif && styles.periodeAktif]}>{periode}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
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
  jalur: { flexDirection: 'row' },
  tabs: {
    padding: 4,
    marginBottom: Spacing.md,
    borderRadius: Spacing.radius.full,
    backgroundColor: slate[100],
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: Spacing.sm,
    borderRadius: Spacing.radius.full,
  },
  indikator: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    borderRadius: Spacing.radius.full,
    backgroundColor: Colors.white,
  },
  periode: { fontFamily: fonts.medium, fontSize: ukuranIsi, color: Colors.textTertiary },
  periodeAktif: { fontFamily: fonts.bold, color: brand[700] },
  titik: { width: 8, height: 8, borderRadius: 4 },
  catatan: { fontFamily: fonts.regular, fontSize: ukuranIsi, color: Colors.textTertiary },
});

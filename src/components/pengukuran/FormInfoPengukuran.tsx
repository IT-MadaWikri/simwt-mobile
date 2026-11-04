/** Tab Info: nomor lot (Final Inspection), checker, shift, dan periode yang diukur. Presentasional. */
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import FieldTeks from '../common/FieldTeks';
import FieldPilihan from '../common/FieldPilihan';
import ChipPilihan from './ChipPilihan';
import Colors, { brand } from '../../../constants/Colors';
import Spacing from '../../../constants/Spacing';
import { fonts, fontsJudul, ukuranIsi } from '../../../constants/Typography';
import { DAFTAR_PERIODE_NON_FINAL, PILIHAN_SHIFT } from '../../../constants/Pengukuran';
import { Periode } from '../../types/pengukuran';

interface FormInfoPengukuranProps {
  isFinalInspection: boolean;
  lotNumber: string;
  checkerName: string;
  shift: string;
  periodeAktif: Periode[];
  onUbahLot: (lot: string) => void;
  onUbahShift: (shift: string) => void;
  onTogglePeriode: (periode: Periode) => void;
  onBukaChecker: () => void;
}

export default function FormInfoPengukuran({
  isFinalInspection,
  lotNumber,
  checkerName,
  shift,
  periodeAktif,
  onUbahLot,
  onUbahShift,
  onTogglePeriode,
  onBukaChecker,
}: FormInfoPengukuranProps) {
  return (
    <View style={styles.wadah}>
      {isFinalInspection ? (
        <FieldTeks label="No. lot" nilai={lotNumber} onUbah={onUbahLot} wajib placeholder="Masukkan no. lot" />
      ) : null}

      <FieldPilihan label="Nama checker" nilai={checkerName || null} placeholder="Pilih nama checker" wajib onPress={onBukaChecker} />

      {!isFinalInspection ? (
        <>
          <Text style={styles.judul}>Shift</Text>
          <View style={styles.chips}>
            {PILIHAN_SHIFT.map((s) => (
              <ChipPilihan key={s} label={s} aktif={s === shift} onPress={() => onUbahShift(s)} />
            ))}
          </View>

          <Text style={styles.judul}>Periode pengukuran</Text>
          <View style={styles.chips}>
            {DAFTAR_PERIODE_NON_FINAL.map((p) => (
              <ChipPilihan key={p} label={p} aktif={periodeAktif.includes(p)} onPress={() => onTogglePeriode(p)} />
            ))}
          </View>

          <View style={styles.info}>
            <Text style={styles.infoJudul}>Info</Text>
            <Text style={styles.infoTeks}>Pilih periode sesuai kondisi lapangan. Minimal 1 periode harus aktif.</Text>
            <Text style={styles.infoTeks}>
              Isi nilai lewat tab Dimensi dan Visual, termasuk jam untuk tiap periode yang aktif.
            </Text>
          </View>
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wadah: { padding: Spacing.screenPadding, backgroundColor: Colors.white },
  judul: { marginBottom: 6, fontSize: ukuranIsi, fontFamily: fontsJudul.medium, color: Colors.textPrimary },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: Spacing.lg },
  info: {
    gap: 4,
    padding: Spacing.md,
    borderRadius: Spacing.radius.md,
    ...Spacing.curve,
    borderWidth: 1,
    borderColor: brand[200],
    backgroundColor: brand[50],
  },
  infoJudul: { fontFamily: fonts.bold, fontSize: ukuranIsi, color: brand[700] },
  infoTeks: { fontFamily: fonts.regular, fontSize: ukuranIsi, color: brand[700] },
});

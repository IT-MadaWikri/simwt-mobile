/** Bilah aksi bawah layar input: ringkasan periode lengkap, simpan draf, dan kirim. Presentasional. */
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Button from '../common/Button';
import Colors, { brand } from '../../../constants/Colors';
import Spacing from '../../../constants/Spacing';
import { fonts, ukuranIsi } from '../../../constants/Typography';
import { gs } from '../../../constants/GlobalStyles';

interface BarAksiPengukuranProps {
  /** Sembunyikan ringkasan periode (Final Inspection hanya satu periode). */
  tanpaPeriode: boolean;
  jumlahPeriodeLengkap: number;
  totalPeriode: number;
  bisaDraf: boolean;
  bisaKirim: boolean;
  menyimpanDraf: boolean;
  mengirim: boolean;
  onDraf: () => void;
  onKirim: () => void;
}

export default function BarAksiPengukuran({
  tanpaPeriode,
  jumlahPeriodeLengkap,
  totalPeriode,
  bisaDraf,
  bisaKirim,
  menyimpanDraf,
  mengirim,
  onDraf,
  onKirim,
}: BarAksiPengukuranProps) {
  const insets = useSafeAreaInsets();
  const lengkap = jumlahPeriodeLengkap === totalPeriode;

  return (
    <View style={[styles.bar, { paddingBottom: insets.bottom + Spacing.md }]}>
      {!tanpaPeriode ? (
        <Text style={[styles.ringkas, lengkap && { color: brand[700] }]}>
          {jumlahPeriodeLengkap}/{totalPeriode} periode lengkap
        </Text>
      ) : null}
      <View style={[gs.row, { gap: Spacing.sm }]}>
        <Button
          variant="outline"
          icon="content-save-outline"
          label="Draf"
          loading={menyimpanDraf}
          disabled={!bisaDraf || mengirim}
          onPress={onDraf}
          style={gs.flex1}
        />
        <Button icon="send" label="Kirim" loading={mengirim} disabled={!bisaKirim || menyimpanDraf} onPress={onKirim} style={gs.flex1} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    gap: Spacing.sm,
    paddingHorizontal: Spacing.screenPadding,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.white,
  },
  ringkas: { fontFamily: fonts.semibold, fontSize: ukuranIsi, color: Colors.textSecondary },
});

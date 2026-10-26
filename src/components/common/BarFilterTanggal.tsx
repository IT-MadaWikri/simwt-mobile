/**
 * Filter rentang tanggal langsung di atas daftar: dua isian tanggal (Dari – Sampai), masing-masing punya
 * tombol hapus sendiri. Presentasional.
 */
import React from 'react';
import { StyleSheet, View } from 'react-native';
import FieldTanggal from './FieldTanggal';
import Spacing from '../../../constants/Spacing';

interface BarFilterTanggalProps {
  /** Rentang yang berlaku ('YYYY-MM-DD'; '' = tanpa batas). */
  dari: string;
  sampai: string;
  onUbahDari: (v: string) => void;
  onUbahSampai: (v: string) => void;
}

export default function BarFilterTanggal({ dari, sampai, onUbahDari, onUbahSampai }: BarFilterTanggalProps) {
  return (
    <View style={styles.baris}>
      <FieldTanggal label="Dari" value={dari} max={sampai || undefined} onChange={onUbahDari} />
      <FieldTanggal label="Sampai" value={sampai} min={dari || undefined} onChange={onUbahSampai} />
    </View>
  );
}

const styles = StyleSheet.create({
  baris: { flexDirection: 'row', gap: Spacing.sm, paddingHorizontal: Spacing.screenPadding, paddingVertical: Spacing.sm },
});

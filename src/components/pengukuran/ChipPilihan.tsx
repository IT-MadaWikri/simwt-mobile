/** Chip pil untuk sheet filter Pengukuran QC; `onHapus` menambah tombol silang (pilihan yang sudah dipilih). */
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Icon from '../common/Icon';
import Colors from '../../../constants/Colors';
import Spacing from '../../../constants/Spacing';
import { fonts, ukuranIsi } from '../../../constants/Typography';

interface ChipPilihanProps {
  label: string;
  aktif?: boolean;
  onPress?: () => void;
  onHapus?: () => void;
}

export default function ChipPilihan({ label, aktif = false, onPress, onHapus }: ChipPilihanProps) {
  const isi = (
    <>
      <Text style={[styles.teks, aktif && styles.teksAktif]} numberOfLines={1}>{label}</Text>
      {onHapus ? <Icon name="close" size={12} color={Colors.white} /> : null}
    </>
  );

  if (onHapus) {
    return (
      <TouchableOpacity style={[styles.chip, styles.chipAktif]} onPress={onHapus} activeOpacity={0.8} accessibilityLabel={`Hapus ${label}`}>
        {isi}
      </TouchableOpacity>
    );
  }
  return onPress ? (
    <TouchableOpacity style={[styles.chip, aktif && styles.chipAktif]} onPress={onPress} activeOpacity={0.8}>
      {isi}
    </TouchableOpacity>
  ) : (
    <View style={styles.chip}>{isi}</View>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
    borderRadius: Spacing.radius.full,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
  },
  chipAktif: { backgroundColor: Colors.textPrimary, borderColor: Colors.textPrimary },
  teks: { fontSize: ukuranIsi, fontFamily: fonts.medium, color: Colors.textSecondary, flexShrink: 1 },
  teksAktif: { color: Colors.white, fontFamily: fonts.semibold },
});

/**
 * FieldPilihan — field berlabel yang tampak seperti input formulir tapi membuka
 * bottom sheet pilihan (`SheetPilihan`). Gaya sama dengan kolom isian Buat Kaizen.
 * Presentasional.
 */
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Icon from './Icon';
import Colors, { slate } from '../../../constants/Colors';
import Spacing from '../../../constants/Spacing';
import { fonts, ukuranIsi } from '../../../constants/Typography';

interface FieldPilihanProps {
  label: string;
  /** Teks pilihan saat ini; null = belum dipilih. */
  nilai: string | null;
  placeholder?: string;
  wajib?: boolean;
  /** Matikan (mis. induknya belum dipilih). */
  nonaktif?: boolean;
  /** Pesan galat di bawah field; mewarnai bingkai. */
  galat?: string;
  onPress: () => void;
}

export default function FieldPilihan({
  label,
  nilai,
  placeholder = `Pilih ${label.toLowerCase()}`,
  wajib = false,
  nonaktif = false,
  galat,
  onPress,
}: FieldPilihanProps) {
  return (
    <View style={[styles.field, nonaktif && { opacity: 0.5 }]}>
      <Text style={styles.label}>
        {label}
        {wajib ? <Text style={styles.wajib}> *</Text> : <Text style={styles.opsional}> (opsional)</Text>}
      </Text>
      <TouchableOpacity
        style={[styles.input, galat ? styles.inputGalat : null]}
        activeOpacity={0.7}
        disabled={nonaktif}
        onPress={onPress}
      >
        <Text style={[styles.nilai, !nilai && { color: Colors.placeholder }]} numberOfLines={1}>
          {nilai ?? placeholder}
        </Text>
        <Icon name="chevron-down" size={18} color={Colors.textTertiary} />
      </TouchableOpacity>
      {galat ? <Text style={styles.galat}>{galat}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  field: { marginBottom: Spacing.md },
  label: { fontSize: ukuranIsi, fontFamily: fonts.medium, color: Colors.textPrimary, marginBottom: 6 },
  wajib: { color: Colors.danger },
  opsional: { color: Colors.textTertiary, fontFamily: fonts.regular },
  input: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Spacing.radius.md,
    ...Spacing.curve,
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    backgroundColor: slate[50],
  },
  inputGalat: { borderColor: Colors.danger },
  nilai: { flex: 1, fontSize: ukuranIsi, fontFamily: fonts.regular, color: Colors.textPrimary },
  galat: { marginTop: 4, fontSize: 12, fontFamily: fonts.regular, color: Colors.danger },
});

/**
 * FieldTeks — kolom isian teks berlabel, bentuknya sama dengan `FieldPilihan`
 * dan kolom isian Buat Kaizen/Tiket. Presentasional.
 */
import React from 'react';
import { StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';
import Colors, { slate } from '../../../constants/Colors';
import Spacing from '../../../constants/Spacing';
import { fonts, ukuranIsi } from '../../../constants/Typography';
import { inputReset } from '../../../constants/GlobalStyles';

interface FieldTeksProps
  extends Pick<TextInputProps, 'keyboardType' | 'autoCapitalize' | 'autoComplete' | 'placeholder' | 'editable' | 'multiline'> {
  label: string;
  nilai: string;
  onUbah: (teks: string) => void;
  wajib?: boolean;
  /** Sembunyikan isi (kata sandi). */
  rahasia?: boolean;
  /** Pesan galat di bawah field; mewarnai bingkai. */
  galat?: string;
}

export default function FieldTeks({
  label,
  nilai,
  onUbah,
  wajib = false,
  rahasia = false,
  galat,
  placeholder = label,
  editable = true,
  ...sisa
}: FieldTeksProps) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>
        {label}
        {wajib ? <Text style={styles.wajib}> *</Text> : <Text style={styles.opsional}> (opsional)</Text>}
      </Text>
      <TextInput
        style={[styles.input, sisa.multiline && styles.inputBanyakBaris, galat ? styles.inputGalat : null, !editable && styles.inputMati]}
        value={nilai}
        onChangeText={onUbah}
        secureTextEntry={rahasia}
        placeholder={placeholder}
        placeholderTextColor={Colors.placeholder}
        editable={editable}
        {...sisa}
      />
      {galat ? <Text style={styles.galat}>{galat}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  field: { marginBottom: Spacing.md },
  label: { fontSize: ukuranIsi, fontFamily: fonts.medium, color: Colors.textPrimary, marginBottom: 6 },
  wajib: { color: Colors.danger },
  opsional: { fontFamily: fonts.regular, color: Colors.textTertiary },
  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Spacing.radius.md,
    ...Spacing.curve,
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    fontSize: ukuranIsi,
    fontFamily: fonts.regular,
    color: Colors.textPrimary,
    backgroundColor: slate[50],
    ...inputReset,
  },
  // Isian panjang (keterangan, alasan): minimal ±3 baris, teks mulai dari atas.
  inputBanyakBaris: { minHeight: 76, textAlignVertical: 'top' },
  inputGalat: { borderColor: Colors.danger },
  inputMati: { color: Colors.textSecondary, backgroundColor: slate[100] },
  galat: { marginTop: 4, fontSize: 12, fontFamily: fonts.regular, color: Colors.danger },
});

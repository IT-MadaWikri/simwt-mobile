/** Satu titik ukur visual: catatan per sampel (kosong = OK, terisi = NG). Presentasional. */
import React from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import Colors, { slate } from '../../../constants/Colors';
import Spacing from '../../../constants/Spacing';
import { fonts, ukuranIsi } from '../../../constants/Typography';
import { inputReset } from '../../../constants/GlobalStyles';

interface InputTitikVisualProps {
  nama: string;
  drawing: string;
  alat: string;
  nilaiPerSampel: string[];
  onUbahNilai: (index: number, nilai: string) => void;
}

export default function InputTitikVisual({ nama, drawing, alat, nilaiPerSampel, onUbahNilai }: InputTitikVisualProps) {
  return (
    <View style={styles.kartu}>
      <Text style={styles.nama}>{nama} (DWG: {drawing || '-'})</Text>
      <Text style={styles.sub}>{alat || '-'}</Text>

      {nilaiPerSampel.map((nilai, index) => (
        <View key={index} style={styles.sampel}>
          <Text style={styles.label}>Sample {index + 1}</Text>
          <TextInput
            style={styles.input}
            value={nilai}
            onChangeText={(teks) => onUbahNilai(index, teks)}
            multiline
            placeholder="Tulis catatan jika NG"
            placeholderTextColor={Colors.placeholder}
          />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  kartu: {
    gap: 4,
    marginBottom: Spacing.md,
    padding: Spacing.md,
    borderRadius: Spacing.radius.md,
    ...Spacing.curve,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
  },
  nama: { fontFamily: fonts.bold, fontSize: ukuranIsi, color: Colors.textPrimary },
  sub: { fontFamily: fonts.regular, fontSize: ukuranIsi, color: Colors.textSecondary },
  sampel: { marginTop: Spacing.sm },
  label: { marginBottom: 4, fontFamily: fonts.regular, fontSize: 12, color: Colors.textTertiary },
  input: {
    minHeight: 40,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Spacing.radius.md,
    ...Spacing.curve,
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    fontSize: ukuranIsi,
    fontFamily: fonts.regular,
    color: Colors.textPrimary,
    backgroundColor: slate[50],
    textAlignVertical: 'top',
    ...inputReset,
  },
});

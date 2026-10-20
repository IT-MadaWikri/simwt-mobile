/**
 * FieldJam — isian jam. Nilai berupa string 'HH:mm'. Bentuknya sama dengan
 * `FieldTanggal`. Android: dialog jam bawaan sistem (24 jam). iOS: pemilih
 * "compact" bawaan di baris. Web: `<input type="time">`.
 */
import React from 'react';
import { Platform, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import Icon from './Icon';
import Colors, { slate } from '../../../constants/Colors';
import Spacing from '../../../constants/Spacing';
import { fonts, ukuranIsi } from '../../../constants/Typography';

const dua = (n: number) => String(n).padStart(2, '0');
const keTanggal = (v: string) => {
  const [j, m] = (v || '09:00').split(':').map(Number);
  const d = new Date();
  d.setHours(j || 0, m || 0, 0, 0);
  return d;
};
const keString = (d: Date) => `${dua(d.getHours())}:${dua(d.getMinutes())}`;

interface FieldJamProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
}

export default function FieldJam({ label, value, onChange }: FieldJamProps) {
  const buka = () =>
    DateTimePickerAndroid.open({
      value: keTanggal(value),
      mode: 'time',
      is24Hour: true,
      onChange: (e, d) => {
        if (e.type === 'set' && d) onChange(keString(d));
      },
    });

  return (
    <View style={styles.wadah}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.kotak}>
        {Platform.OS === 'web' ? (
          // ponytail: react-native-web meneruskan elemen DOM apa adanya.
          React.createElement('input', {
            type: 'time',
            value,
            onChange: (e: any) => onChange(e.target.value),
            style: { flex: 1, border: 0, background: 'transparent', fontSize: ukuranIsi, outline: 'none' },
          })
        ) : Platform.OS === 'ios' ? (
          <DateTimePicker
            value={keTanggal(value)}
            mode="time"
            display="compact"
            onChange={(_, d) => d && onChange(keString(d))}
          />
        ) : (
          <TouchableOpacity style={styles.isi} onPress={buka} activeOpacity={0.7}>
            <Icon name="clock-outline" size={14} color={Colors.textTertiary} />
            <Text style={styles.teks}>{value || 'Pilih jam'}</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wadah: { flex: 1 },
  label: { fontSize: ukuranIsi, fontFamily: fonts.medium, color: Colors.textPrimary, marginBottom: 6 },
  kotak: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    minHeight: 40,
    paddingHorizontal: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Spacing.radius.md,
    ...Spacing.curve,
    backgroundColor: slate[50],
  },
  isi: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6, height: 40 },
  teks: { flex: 1, fontSize: ukuranIsi, fontFamily: fonts.regular, color: Colors.textPrimary },
});

/**
 * FieldTanggal — isian tanggal. Nilai berupa string 'YYYY-MM-DD' ('' = kosong).
 * Android: dialog tanggal bawaan sistem. iOS: pemilih "compact" bawaan di baris.
 * Web: `<input type="date">` bawaan peramban.
 */
import React from 'react';
import { Platform, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import Icon from './Icon';
import Colors, { slate } from '../../../constants/Colors';
import Spacing from '../../../constants/Spacing';
import { fonts, ukuranIsi } from '../../../constants/Typography';

const BULAN = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

const keTanggal = (v: string) => (v ? new Date(`${v}T00:00:00`) : new Date());
const keString = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const tampil = (v: string) => {
  const d = keTanggal(v);
  return `${d.getDate()} ${BULAN[d.getMonth()]} ${d.getFullYear()}`;
};

interface Props {
  label: string;
  value: string;
  onChange: (v: string) => void;
  /** Batas pilihan, format 'YYYY-MM-DD'. */
  min?: string;
  max?: string;
}

export default function FieldTanggal({ label, value, onChange, min, max }: Props) {
  const buka = () =>
    DateTimePickerAndroid.open({
      value: keTanggal(value),
      mode: 'date',
      minimumDate: min ? keTanggal(min) : undefined,
      maximumDate: max ? keTanggal(max) : undefined,
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
            type: 'date',
            value,
            min,
            max,
            onChange: (e: any) => onChange(e.target.value),
            style: { flex: 1, border: 0, background: 'transparent', fontSize: ukuranIsi, outline: 'none' },
          })
        ) : Platform.OS === 'ios' ? (
          <DateTimePicker
            value={keTanggal(value)}
            mode="date"
            display="compact"
            minimumDate={min ? keTanggal(min) : undefined}
            maximumDate={max ? keTanggal(max) : undefined}
            onChange={(_, d) => d && onChange(keString(d))}
          />
        ) : (
          <TouchableOpacity style={styles.isi} onPress={buka} activeOpacity={0.7}>
            <Icon name="calendar" size={14} color={Colors.textTertiary} />
            <Text style={[styles.teks, !value && { color: Colors.placeholder }]} numberOfLines={1}>
              {value ? tampil(value) : 'Pilih tanggal'}
            </Text>
          </TouchableOpacity>
        )}
        {value ? (
          <TouchableOpacity onPress={() => onChange('')} hitSlop={10} accessibilityLabel={`Hapus ${label}`}>
            <Icon name="close-circle" size={16} color={Colors.textTertiary} />
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wadah: {
    flex: 1,
  },
  label: {
    fontSize: ukuranIsi,
    fontFamily: fonts.medium,
    color: Colors.textPrimary,
    marginBottom: 6,
  },
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
  isi: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: 40,
  },
  teks: {
    flex: 1,
    fontSize: ukuranIsi,
    fontFamily: fonts.regular,
    color: Colors.textPrimary,
  },
});

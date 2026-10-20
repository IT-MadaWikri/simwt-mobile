/**
 * LencanaAngka — lencana jumlah yang selalu bulat sempurna: tinggi = lebar minimum = `ukuran`,
 * jari-jari setengahnya, dan tinggi baris teks dikunci sama dengan tingginya (tanpa padding
 * font bawaan Android) supaya angka tepat di tengah. Hanya angka dua digit ke atas ("99+")
 * yang melebar menjadi pil. Satu-satunya lencana angka di aplikasi.
 */
import React from 'react';
import { StyleProp, Text, View, ViewStyle } from 'react-native';
import Colors from '../../../constants/Colors';
import { fonts } from '../../../constants/Typography';

interface LencanaAngkaProps {
  jumlah: number;
  ukuran?: number;
  warna?: string;
  teks?: string;
  /** Warna tepi (mis. putih di atas ikon); tanpa tepi bila kosong. */
  tepi?: string;
  style?: StyleProp<ViewStyle>;
}

const TEBAL_TEPI = 1.5;

export default function LencanaAngka({
  jumlah,
  ukuran = 20,
  warna = Colors.danger,
  teks = Colors.white,
  tepi,
  style,
}: LencanaAngkaProps) {
  const label = jumlah > 99 ? '99+' : String(jumlah);
  const tebalTepi = tepi ? TEBAL_TEPI : 0;
  return (
    <View
      style={[
        {
          height: ukuran,
          minWidth: ukuran,
          borderRadius: ukuran / 2,
          backgroundColor: warna,
          paddingHorizontal: label.length > 1 ? 5 : 0,
          alignItems: 'center',
          justifyContent: 'center',
          ...(tepi ? { borderWidth: TEBAL_TEPI, borderColor: tepi } : null),
        },
        style,
      ]}
    >
      <Text
        style={{
          color: teks,
          fontFamily: fonts.bold,
          fontSize: ukuran <= 18 ? 10 : 12,
          lineHeight: ukuran - tebalTepi * 2,
          includeFontPadding: false,
          textAlign: 'center',
        }}
      >
        {label}
      </Text>
    </View>
  );
}

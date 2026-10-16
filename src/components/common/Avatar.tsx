/**
 * Avatar — lingkaran berisi huruf inisial nama, warnanya dipilih dari palet
 * secara deterministik (hash nama) supaya satu orang selalu mendapat warna
 * yang sama di semua layar. Bila `foto` ada, foto yang ditampilkan.
 */
import React from 'react';
import { Image, StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import Colors from '../../../constants/Colors';
import { fonts } from '../../../constants/Typography';

const PALET = [
  '#0ea5e9', '#6366f1', '#8b5cf6', '#d946ef', '#ec4899', '#e11d48',
  '#f97316', '#d97706', '#65a30d', '#059669', '#0d9488', '#0891b2',
] as const;

export function inisialNama(nama?: string): string {
  const kata = (nama ?? '').trim().split(/\s+/).filter(Boolean);
  if (kata.length === 0) return '?';
  const dua = kata.length === 1 ? kata[0].slice(0, 2) : kata[0][0] + kata[1][0];
  return dua.toUpperCase();
}

function warnaNama(nama?: string): string {
  let h = 0;
  for (const c of nama ?? '') h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return PALET[h % PALET.length];
}

interface AvatarProps {
  nama?: string;
  ukuran?: number;
  foto?: string;
  style?: StyleProp<ViewStyle>;
}

export default function Avatar({ nama, ukuran = 40, foto, style }: AvatarProps) {
  const bentuk = { width: ukuran, height: ukuran, borderRadius: ukuran / 2 };

  if (foto) {
    return <Image source={{ uri: foto }} style={[bentuk, style as any]} />;
  }

  return (
    <View style={[styles.pusat, bentuk, { backgroundColor: warnaNama(nama) }, style]}>
      <Text
        style={[
          styles.huruf,
          { fontSize: 12, lineHeight: ukuran, height: ukuran },
        ]}
      >
        {inisialNama(nama)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pusat: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Poppins punya ruang atas/bawah yang tidak simetris; padding font Android
  // dimatikan dan kotak teks dibuat setinggi lingkaran agar inisial pas di tengah.
  huruf: {
    fontFamily: fonts.bold,
    color: Colors.white,
    textAlign: 'center',
    textAlignVertical: 'center',
    includeFontPadding: false,
  },
});

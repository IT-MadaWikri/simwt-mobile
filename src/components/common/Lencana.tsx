/**
 * Lencana — label kecil berlatar pastel dengan teks tegas sewarna (dan ikon opsional).
 * Warna dipilih dari `lencana` di constants/Colors (`lencana.hijau`, `lencana.merah`, …).
 */
import React from 'react';
import { StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import Icon from './Icon';
import Spacing from '../../../constants/Spacing';
import { fonts } from '../../../constants/Typography';

interface LencanaProps {
  label: string;
  warna: { bg: string; fg: string };
  ikon?: string;
  /** Titik berwarna di depan label, alih-alih ikon. */
  titik?: boolean;
  maxLebar?: number;
  style?: StyleProp<ViewStyle>;
}

export default function Lencana({ label, warna, ikon, titik = false, maxLebar, style }: LencanaProps) {
  return (
    <View style={[styles.lencana, { backgroundColor: warna.bg }, style]}>
      {ikon ? <Icon name={ikon} size={12} color={warna.fg} /> : null}
      {titik ? <View style={[styles.titik, { backgroundColor: warna.fg }]} /> : null}
      <Text style={[styles.teks, { color: warna.fg }, maxLebar ? { maxWidth: maxLebar } : null]} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  lencana: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Spacing.radius.md,
    ...Spacing.curve,
  },
  titik: { width: 6, height: 6, borderRadius: 3 },
  teks: { fontFamily: fonts.medium, fontSize: 11 },
});

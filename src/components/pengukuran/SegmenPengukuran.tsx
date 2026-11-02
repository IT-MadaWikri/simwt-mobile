/** Tab Info / Dimensi / Visual pada layar input pengukuran. Presentasional. */
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Colors, { brand } from '../../../constants/Colors';
import Spacing from '../../../constants/Spacing';
import { fonts, ukuranIsi } from '../../../constants/Typography';

export type Segmen = 'info' | 'dimensi' | 'visual';

const DAFTAR: { kunci: Segmen; label: string }[] = [
  { kunci: 'info', label: 'Info' },
  { kunci: 'dimensi', label: 'Dimensi' },
  { kunci: 'visual', label: 'Visual' },
];

interface SegmenPengukuranProps {
  aktif: Segmen;
  onUbah: (segmen: Segmen) => void;
}

export default function SegmenPengukuran({ aktif, onUbah }: SegmenPengukuranProps) {
  return (
    <View style={styles.baris}>
      {DAFTAR.map((s) => {
        const on = s.kunci === aktif;
        return (
          <TouchableOpacity key={s.kunci} style={[styles.tab, on && styles.tabAktif]} onPress={() => onUbah(s.kunci)} activeOpacity={0.7}>
            <Text style={[styles.teks, on && styles.teksAktif]}>{s.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  baris: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: Colors.border, backgroundColor: Colors.white },
  tab: { flex: 1, alignItems: 'center', paddingVertical: Spacing.md, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabAktif: { borderBottomColor: brand[600] },
  teks: { fontFamily: fonts.medium, fontSize: ukuranIsi, color: Colors.textTertiary },
  teksAktif: { fontFamily: fonts.bold, color: brand[700] },
});

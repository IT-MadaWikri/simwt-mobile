/** Satu baris pengukuran terkirim pada riwayat — presentasional, tanpa data fetching. */
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Icon from '../common/Icon';
import LencanaJudgment from './LencanaJudgment';
import Colors from '../../../constants/Colors';
import Spacing from '../../../constants/Spacing';
import { fonts, fontsJudul, ukuranIsi, ukuranCatatan } from '../../../constants/Typography';
import { Judgement } from '../../types/pengukuran';

interface KartuTerkirimProps {
  namaPart: string;
  namaChecker: string;
  waktu: string;
  judgment: Judgement | null;
  onPress: () => void;
}

export default function KartuTerkirim({ namaPart, namaChecker, waktu, judgment, onPress }: KartuTerkirimProps) {
  return (
    <TouchableOpacity style={styles.baris} activeOpacity={0.6} onPress={onPress}>
      <View style={styles.isi}>
        <Text style={styles.judul} numberOfLines={2}>{namaPart}</Text>
        <Text style={styles.sub} numberOfLines={1}>Diukur oleh {namaChecker}</Text>
        <Text style={styles.waktu}>{waktu}</Text>
      </View>

      <LencanaJudgment judgment={judgment} />
      <Icon name="chevron-right" size={16} color={Colors.textTertiary} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  baris: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingHorizontal: Spacing.screenPadding,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.white,
  },
  isi: { flex: 1, gap: 2 },
  judul: { fontFamily: fontsJudul.semibold, fontSize: ukuranIsi, color: Colors.textPrimary },
  sub: { fontFamily: fonts.regular, fontSize: ukuranCatatan, color: Colors.textSecondary },
  waktu: { fontFamily: fonts.regular, fontSize: ukuranCatatan, color: Colors.textTertiary },
});

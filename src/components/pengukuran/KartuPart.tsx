/** Satu baris part pada daftar — presentasional, tanpa data fetching. */
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Icon from '../common/Icon';
import Colors, { brand } from '../../../constants/Colors';
import Spacing from '../../../constants/Spacing';
import { fonts } from '../../../constants/Typography';

interface KartuPartProps {
  nama: string;
  kode: string;
  bisnisPartner: string;
  jumlahProses: number;
  onPress: () => void;
}

export default function KartuPart({ nama, kode, bisnisPartner, jumlahProses, onPress }: KartuPartProps) {
  return (
    <TouchableOpacity style={styles.baris} activeOpacity={0.6} onPress={onPress}>
      <View style={styles.logo}>
        <Icon name="cog-outline" size={20} color={brand[700]} />
      </View>

      <View style={styles.isi}>
        <Text style={styles.judul} numberOfLines={2}>{nama}</Text>
        <Text style={styles.sub} numberOfLines={1}>{[kode, bisnisPartner].filter(Boolean).join(' · ')}</Text>
        <Text style={styles.proses}>{jumlahProses} proses</Text>
      </View>

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
  logo: {
    width: 42,
    height: 42,
    borderRadius: Spacing.radius.sm,
    ...Spacing.curve,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: brand[50],
  },
  isi: { flex: 1, gap: 2 },
  judul: { fontFamily: fonts.semibold, fontSize: 12, color: Colors.textPrimary },
  sub: { fontFamily: fonts.regular, fontSize: 12, color: Colors.textSecondary },
  proses: { fontFamily: fonts.regular, fontSize: 12, color: Colors.textTertiary },
});

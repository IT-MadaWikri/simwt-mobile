/** Satu baris draf pengukuran pada daftar draf — presentasional. */
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Icon from '../common/Icon';
import Colors, { brand } from '../../../constants/Colors';
import Spacing from '../../../constants/Spacing';
import { fonts, fontsJudul, ukuranIsi, ukuranCatatan } from '../../../constants/Typography';

interface KartuDrafProps {
  judul: string;
  keterangan: string;
  waktu: string;
  onPress: () => void;
  onHapus: () => void;
}

export default function KartuDraf({ judul, keterangan, waktu, onPress, onHapus }: KartuDrafProps) {
  return (
    <TouchableOpacity style={styles.baris} activeOpacity={0.6} onPress={onPress}>
      <View style={styles.ikon}>
        <Icon name="gauge" size={18} color={brand[700]} />
      </View>
      <View style={styles.isi}>
        <Text style={styles.judul} numberOfLines={1}>{judul}</Text>
        <Text style={styles.meta} numberOfLines={2}>{keterangan}</Text>
        <Text style={styles.waktu}>Disimpan {waktu}</Text>
      </View>
      <TouchableOpacity onPress={onHapus} hitSlop={10} accessibilityLabel="Hapus draf">
        <Icon name="delete-outline" size={18} color={Colors.textTertiary} />
      </TouchableOpacity>
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
  ikon: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: brand[50] },
  isi: { flex: 1, gap: 2 },
  judul: { fontFamily: fontsJudul.semibold, fontSize: ukuranIsi, color: Colors.textPrimary },
  meta: { fontFamily: fonts.regular, fontSize: ukuranCatatan, color: Colors.textSecondary },
  waktu: { fontFamily: fonts.regular, fontSize: ukuranCatatan, color: Colors.textTertiary },
});

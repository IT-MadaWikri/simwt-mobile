/** Satu baris part pada daftar — presentasional, tanpa data fetching. */
import React, { useState } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Icon from '../common/Icon';
import Colors, { brand } from '../../../constants/Colors';
import Spacing from '../../../constants/Spacing';
import { fonts } from '../../../constants/Typography';

interface KartuPartProps {
  id: number;
  nama: string;
  kode: string;
  bisnisPartner: string;
  jumlahProses: number;
  /** URL gambar part; null/kosong = tampilkan ikon. Gambar yang gagal dimuat juga jatuh ke ikon. */
  gambarUrl?: string | null;
  onPress: (id: number) => void;
}

function KartuPart({ id, nama, kode, bisnisPartner, jumlahProses, gambarUrl = null, onPress }: KartuPartProps) {
  const [gagal, setGagal] = useState(false);

  return (
    <TouchableOpacity style={styles.baris} activeOpacity={0.6} onPress={() => onPress(id)}>
      <View style={styles.logo}>
        {gambarUrl && !gagal ? (
          <Image source={{ uri: gambarUrl }} style={styles.gambar} resizeMode="cover" onError={() => setGagal(true)} />
        ) : (
          <Icon name="cog-outline" size={22} color={brand[700]} />
        )}
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

// Dibungkus memo: membuka sheet filter me-render ulang layar, baris yang tak berubah tak perlu ikut.
export default React.memo(KartuPart);

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
    width: 56,
    height: 56,
    borderRadius: Spacing.radius.sm,
    ...Spacing.curve,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: brand[50],
  },
  gambar: { width: '100%', height: '100%' },
  isi: { flex: 1, gap: 2 },
  judul: { fontFamily: fonts.semibold, fontSize: 12, color: Colors.textPrimary },
  sub: { fontFamily: fonts.regular, fontSize: 12, color: Colors.textSecondary },
  proses: { fontFamily: fonts.regular, fontSize: 12, color: Colors.textTertiary },
});

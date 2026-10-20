/**
 * BannerAksi — baris ajakan ringkas: kepala maskot, judul + keterangan, dan
 * tombol panah bulat di kanan. Seluruh baris bisa ditekan.
 */
import { Image, StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native';
import Icon from './Icon';
import PolaMemphis from './PolaMemphis';
import Colors, { brand, palet } from '../../../constants/Colors';
import Spacing from '../../../constants/Spacing';
import { fonts } from '../../../constants/Typography';

const KEPALA = {
  putri: require('../../../assets/images/maskot/kepala-putri.png'),
  putra: require('../../../assets/images/maskot/kepala-putra.png'),
};

const LATAR = { mint: brand[50], krem: palet.krem, limau: palet.limau } as const;

interface BannerAksiProps {
  judul: string;
  teks: string;
  onPress: () => void;
  tokoh?: keyof typeof KEPALA;
  warna?: keyof typeof LATAR;
  style?: ViewStyle;
}

export default function BannerAksi({ judul, teks, onPress, tokoh = 'putri', warna = 'mint', style }: BannerAksiProps) {
  return (
    <TouchableOpacity
      style={[styles.kartu, { backgroundColor: LATAR[warna] }, style]}
      activeOpacity={0.8}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${judul}. ${teks}`}
    >
      <PolaMemphis variasi={1} />
      <Image source={KEPALA[tokoh]} style={styles.kepala} resizeMode="contain" accessibilityIgnoresInvertColors />
      <View style={styles.isi}>
        <Text style={styles.judul} numberOfLines={1}>{judul}</Text>
        <Text style={styles.teks} numberOfLines={2}>{teks}</Text>
      </View>
      <View style={styles.panah}>
        <Icon name="arrow-right" size={18} color={Colors.ink} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  kartu: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginHorizontal: Spacing.screenPadding,
    marginBottom: Spacing.lg,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: Spacing.radius.xl,
    ...Spacing.curve,
    overflow: 'hidden',
  },
  kepala: { width: 44, height: 44 },
  isi: { flex: 1 },
  judul: {
    fontFamily: fonts.bold,
    fontSize: 12,
    color: Colors.ink,
  },
  teks: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: Colors.textSecondary,
  },
  panah: {
    width: 40,
    height: 40,
    borderRadius: Spacing.radius.full,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

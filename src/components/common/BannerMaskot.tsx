/**
 * BannerMaskot — kartu ajakan (CTA) besar: judul dengan satu frasa disorot
 * kuning, keterangan, tombol, dan maskot yang menyembul dari tepi atas kartu.
 * Presentasional: isi & tujuan tombol datang dari layar pemakainya.
 */
import { Image, StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native';
import Icon from './Icon';
import PolaMemphis from './PolaMemphis';
import { MASKOT, PoseMaskot, RASIO_MASKOT } from './KeadaanKosong';
import Colors, { brand, palet } from '../../../constants/Colors';
import Spacing from '../../../constants/Spacing';
import { fonts } from '../../../constants/Typography';

const LATAR = { mint: brand[100], krem: palet.krem, limau: palet.limau } as const;

interface BannerMaskotProps {
  judul: string;
  /** Frasa lanjutan judul yang diberi sorotan kuning. */
  sorot?: string;
  teks: string;
  pose?: PoseMaskot;
  warna?: keyof typeof LATAR;
  /** Teks ajakan di bawah keterangan (tautan, bukan tombol); seluruh kartu bisa diketuk. */
  label?: string;
  onPress?: () => void;
  style?: ViewStyle;
}

const TINGGI_MASKOT = 140;

export default function BannerMaskot({
  judul,
  sorot,
  teks,
  pose = 'ide',
  warna = 'mint',
  label,
  onPress,
  style,
}: BannerMaskotProps) {
  const lebarMaskot = TINGGI_MASKOT * RASIO_MASKOT[pose];

  return (
    <TouchableOpacity
      style={[styles.pembungkus, style]}
      activeOpacity={0.85}
      disabled={!onPress}
      onPress={onPress}
      accessibilityRole="button"
    >
      <View style={[styles.kartu, { backgroundColor: LATAR[warna], paddingRight: lebarMaskot + Spacing.xl }]}>
        <PolaMemphis variasi={0} />
        {/* Sapaan besar di beranda juga pengecualian 12px; judul hero di sini 16. */}
        <Text style={styles.judul}>
          {judul}
          {sorot ? (
            <>
              {'\n'}
              <Text style={styles.sorot}> {sorot} </Text>
            </>
          ) : null}
        </Text>
        <Text style={styles.teks}>{teks}</Text>
        {label ? (
          <View style={styles.ajakan}>
            <Text style={styles.labelAjakan}>{label}</Text>
            <Icon name="arrow-right" size={16} color={Colors.ink} />
          </View>
        ) : null}
      </View>
      <Image
        source={MASKOT[pose]}
        style={[styles.maskot, { width: lebarMaskot, height: TINGGI_MASKOT }]}
        resizeMode="contain"
        accessibilityIgnoresInvertColors
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  // Jarak atas memberi ruang bagi maskot yang menyembul keluar dari kartu.
  pembungkus: {
    marginHorizontal: Spacing.screenPadding,
    marginTop: Spacing.xxxl,
    marginBottom: Spacing.lg,
  },
  kartu: {
    minHeight: 120,
    justifyContent: 'center',
    gap: Spacing.sm,
    borderRadius: Spacing.radius.xl,
    ...Spacing.curve,
    overflow: 'hidden',
    padding: Spacing.lg,
  },
  judul: {
    fontFamily: fonts.bold,
    fontSize: 16,
    lineHeight: 24,
    color: Colors.ink,
  },
  // Sorotan ala stabilo: latar kuning di balik frasa.
  sorot: {
    backgroundColor: palet.kuning,
  },
  teks: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: Colors.textSecondary,
  },
  ajakan: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginTop: Spacing.xs,
  },
  labelAjakan: {
    fontFamily: fonts.bold,
    fontSize: 12,
    color: Colors.ink,
  },
  maskot: {
    position: 'absolute',
    right: Spacing.md,
    bottom: 0,
  },
});

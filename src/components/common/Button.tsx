/**
 * Button — satu-satunya tombol aksi di aplikasi, supaya ukurannya seragam.
 *
 * Tinggi 40, teks `ukuranIsi`, ikon 18, bentuk pil. Tanpa `label` (hanya `icon`)
 * jadi tombol bulat 40×40. Ukuran sengaja tidak bisa diubah per pemakaian;
 * lebar diatur lewat `block` (penuh) atau `style={gs.flex1}` (bagi rata di baris).
 *
 * Varian:
 *   primary — aksi utama (hijau)       danger — aksi merusak (merah)
 *   outline — aksi kedua, bergaris hijau   dangerOutline — keluar/hapus, putih bergaris merah
 *   muted   — netral, abu muda         secondary — putih bergaris (mis. "Simpan draf")
 *   ghost   — di atas latar gelap/foto
 */
import React, { useRef } from 'react';
import { Animated, Text, TouchableOpacity, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import Icon from './Icon';
import BrandSpinner from './BrandSpinner';
import Colors, { brand, slate } from '../../../constants/Colors';
import Spacing from '../../../constants/Spacing';
import { fonts, ukuranIsi } from '../../../constants/Typography';

type Varian = 'primary' | 'outline' | 'muted' | 'secondary' | 'danger' | 'dangerOutline' | 'ghost';

interface ButtonProps {
  label?: string;
  onPress?: () => void;
  /** Ikon di kiri teks (atau satu-satunya isi bila tanpa `label`). */
  icon?: string;
  /** Ikon di kanan teks, mis. panah "lanjut". */
  iconRight?: string;
  variant?: Varian;
  /** Tampilkan spinner dan matikan tombol. */
  loading?: boolean;
  disabled?: boolean;
  /** Melebar penuh (alignSelf: stretch). */
  block?: boolean;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
}

const WARNA: Record<Varian, { bg: string; border?: string; fg: string }> = {
  primary: { bg: Colors.primary, fg: Colors.textOnBrand },
  danger: { bg: Colors.danger, fg: Colors.textOnBrand },
  outline: { bg: 'transparent', border: brand[600], fg: brand[700] },
  dangerOutline: { bg: Colors.white, border: Colors.serviceRed, fg: Colors.danger },
  muted: { bg: slate[100], border: Colors.border, fg: Colors.textSecondary },
  secondary: { bg: Colors.white, border: Colors.border, fg: Colors.textPrimary },
  ghost: { bg: 'transparent', border: 'rgba(255,255,255,0.4)', fg: Colors.white },
};

export default function Button({
  label,
  onPress,
  icon,
  iconRight,
  variant = 'primary',
  loading,
  disabled,
  block,
  style,
  accessibilityLabel,
}: ButtonProps) {
  const w = WARNA[variant];
  // Umpan balik saat ditekan: mengecil + meredup, lalu memantul balik saat dilepas
  // (pegas yang sama dengan ikon grid layanan).
  const skala = useRef(new Animated.Value(1)).current;
  const tekan = () =>
    Animated.spring(skala, { toValue: 0.94, speed: 40, bounciness: 0, useNativeDriver: true }).start();
  const lepas = () =>
    Animated.spring(skala, { toValue: 1, speed: 14, bounciness: 18, useNativeDriver: true }).start();
  const mati = disabled || loading;
  // Yang dimatikan tampil pudar; primary/danger memakai abu agar jelas. Saat loading tetap berwarna.
  const abu = disabled && !loading && (variant === 'primary' || variant === 'danger');

  return (
    <TouchableOpacity
      style={[
        styles.dasar,
        { backgroundColor: w.bg },
        w.border ? { borderWidth: 1, borderColor: w.border } : null,
        !label && styles.bulat,
        block && styles.block,
        abu && { backgroundColor: Colors.disabled },
        mati && !abu && { opacity: 0.6 },
        style,
        { transform: [{ scale: skala }] },
      ]}
      onPress={onPress}
      onPressIn={tekan}
      onPressOut={lepas}
      disabled={mati}
      activeOpacity={0.65}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
    >
      {loading ? (
        <BrandSpinner size={20} color={w.fg} />
      ) : (
        <>
          {icon ? <Icon name={icon} size={18} color={w.fg} /> : null}
          {label ? <Text style={[styles.teks, { color: w.fg }]} numberOfLines={1}>{label}</Text> : null}
          {iconRight ? <Icon name={iconRight} size={18} color={w.fg} /> : null}
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  dasar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 40,
    paddingHorizontal: Spacing.lg,
    borderRadius: Spacing.radius.full,
    ...Spacing.curve,
  },
  bulat: {
    width: 40,
    paddingHorizontal: 0,
  },
  block: {
    alignSelf: 'stretch',
  },
  teks: {
    fontFamily: fonts.semibold,
    fontSize: ukuranIsi,
  },
});

/**
 * ServiceIcon — satu item pada grid layanan beranda.
 *
 * Ubin squircle datar: latar pastel dari hue layanan, glif tebal dalam versi
 * gelap hue yang sama (gaya Streamline Flex Solid). Keduanya diturunkan dari
 * `service.iconColor` (pasangan `UBIN` di Services.ts), jadi pemanggil tidak perlu warna tambahan.
 */
import LencanaAngka from './LencanaAngka';
import React, { useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import Icon from './Icon';
import IkonSolid from './IkonSolid';
import { useRouter } from 'expo-router';
import Colors, { brand } from '../../../constants/Colors';
import Spacing from '../../../constants/Spacing';
import Typography, { fonts } from '../../../constants/Typography';
import { gs } from '../../../constants/GlobalStyles';
import { ServiceItem, UBIN } from '../../../constants/Services';

/** Campur warna hex #rrggbb dengan `target` (putih/hitam); `bagian` 0 = warna asli, 1 = target. */
const campur = (hex: string, target: number, bagian: number) => {
  const n = parseInt(hex.slice(1), 16);
  const kanal = (geser: number) => Math.round(((n >> geser) & 255) * (1 - bagian) + target * bagian);
  return `rgb(${kanal(16)},${kanal(8)},${kanal(0)})`;
};

interface ServiceIconProps {
  service: ServiceItem;
  size?: 'small' | 'medium' | 'large';
  /** Menggantikan navigasi ke `service.route` (mis. untuk tombol "Lainnya"). */
  onPress?: () => void;
}

export default function ServiceIcon({ service, size = 'medium', onPress }: ServiceIconProps) {
  const router = useRouter();
  const skala = useRef(new Animated.Value(1)).current;

  // Bounce: mengecil saat disentuh, lalu memantul melewati 1 saat dilepas.
  const tekan = () =>
    Animated.spring(skala, { toValue: 0.85, speed: 40, bounciness: 0, useNativeDriver: true }).start();
  const lepas = () =>
    Animated.spring(skala, { toValue: 1, speed: 14, bounciness: 18, useNativeDriver: true }).start();

  const iconSize = size === 'small' ? 24 : size === 'large' ? 36 : 30;
  const containerSize = size === 'small' ? 44 : size === 'large' ? 64 : 56;
  // Hue di luar palet (mis. dari layar lain) jatuh ke turunan otomatis.
  const { latar: latarUbin, glif: warnaGlif } = UBIN[service.iconColor] ?? {
    latar: campur(service.iconColor, 255, 0.62),
    glif: campur(service.iconColor, 0, 0.5),
  };

  // Selalu ikuti `route` yang didefinisikan di constants/Services.ts —
  // dulu tujuan dirakit dari `id` dengan satu pengecualian ber-hardcode untuk
  // Kaizen, sehingga layanan yang punya layar sendiri harus menambah cabang if
  // baru di sini. Sekarang cukup mengisi `route` di satu berkas.
  const handlePress = onPress ?? (() => router.push(service.route as any));

  const renderBadge = () => {
    if (service.segera) {
      return (
        <View style={[styles.badge, { backgroundColor: Colors.textTertiary }]}>
          <Text style={styles.badgeText}>Soon</Text>
        </View>
      );
    }
    if (service.lencana) {
      return (
        <LencanaAngka jumlah={service.lencana} ukuran={18} style={styles.lencanaAngka} />
      );
    }
    return null;
  };

  return (
    <TouchableOpacity
      style={[styles.wrapper, service.segera && styles.nonaktif]}
      disabled={service.segera}
      onPress={handlePress}
      onPressIn={tekan}
      onPressOut={lepas}
      activeOpacity={0.7}
    >
      <Animated.View style={[styles.iconWrapper, { transform: [{ scale: skala }] }]}>
        <View style={[styles.ubin, { width: containerSize, height: containerSize, backgroundColor: latarUbin }]}>
          {service.ikonSolid ? (
            <IkonSolid name={service.ikonSolid} size={iconSize} color={warnaGlif} />
          ) : (
            <Icon name={service.icon} size={iconSize} color={warnaGlif} strokeWidth={2.4} />
          )}
        </View>
        {renderBadge()}
      </Animated.View>

      <Text style={[gs.caption, styles.label]} numberOfLines={2}>
        {service.name}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    width: '25%', // grid 4 kolom, pas di lebar layar mana pun
    marginBottom: Spacing.xl,
    paddingHorizontal: Spacing.xs,
  },
  // Layanan "segera hadir": diredupkan dan tidak bisa diketuk.
  nonaktif: {
    opacity: 0.55,
  },
  iconWrapper: {
    position: 'relative',
    marginBottom: Spacing.sm,
  },
  ubin: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: Spacing.radius.xl,
    ...Spacing.curve,
  },
  badge: {
    position: 'absolute',
    top: -6,
    left: -8,
    zIndex: 1,
    backgroundColor: brand[700],
    paddingHorizontal: Spacing.xs + 2,
    paddingVertical: 2,
    borderRadius: Spacing.radius.sm,
  },
  // Lencana angka ditaruh di pojok kanan atas, bukan kiri seperti "Soon".
  lencanaAngka: {
    position: 'absolute',
    top: -6,
    right: -8,
    zIndex: 1,
  },
  badgeText: {
    fontFamily: fonts.bold,
    fontSize: 10,
    color: Colors.white,
  },
  label: {
    fontFamily: fonts.medium,
    color: Colors.textPrimary,
    textAlign: 'center',
    lineHeight: Typography.sizes.xs * 1.45,
  },
});

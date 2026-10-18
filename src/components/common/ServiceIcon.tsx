/**
 * ServiceIcon — satu item pada grid layanan beranda.
 *
 * Bentuk grid 4 kolom dengan ubin squircle ini sengaja dipertahankan dari gaya
 * Gojek; yang berubah hanya font, radius, dan warna lencana agar mengikuti
 * karir-mwt.
 */
import React, { useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import Icon from './Icon';
import { BlurTargetView, BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import Colors, { brand } from '../../../constants/Colors';
import Spacing from '../../../constants/Spacing';
import Typography, { fonts } from '../../../constants/Typography';
import { gs } from '../../../constants/GlobalStyles';
import { ServiceItem } from '../../../constants/Services';

/** Campur warna hex #rrggbb dengan putih; `bagian` 0 = warna asli, 1 = putih. */
const cerahkan = (hex: string, bagian: number, alfa = 1) => {
  const n = parseInt(hex.slice(1), 16);
  const kanal = (geser: number) => Math.round(((n >> geser) & 255) * (1 - bagian) + 255 * bagian);
  return `rgba(${kanal(16)},${kanal(8)},${kanal(0)},${alfa})`;
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
  // Ubin belakang = bahan yang dikaburkan oleh ubin depan (wajib di Android lewat BlurTargetView).
  const sasaranBlur = useRef<View | null>(null);

  // Bounce: mengecil saat disentuh, lalu memantul melewati 1 saat dilepas.
  const tekan = () =>
    Animated.spring(skala, { toValue: 0.85, speed: 40, bounciness: 0, useNativeDriver: true }).start();
  const lepas = () =>
    Animated.spring(skala, { toValue: 1, speed: 14, bounciness: 18, useNativeDriver: true }).start();

  const iconSize = size === 'small' ? 20 : size === 'large' ? 30 : 24;
  const containerSize = size === 'small' ? 44 : size === 'large' ? 64 : 54;
  // Dua ubin kaca bertumpuk: ubin depan di kiri-bawah, ubin belakang yang lebih pucat bergeser ke kanan-atas.
  const ubin = containerSize - 10;
  // Efek kaca: ubin belakang pekat, ubin depan tembus pandang (warna belakang terlihat di baliknya)
  // dengan kilap putih di sudut kiri-atas dan tepi putih tipis.
  const belakang = [cerahkan(service.iconColor, 0.2), cerahkan(service.iconColor, 0)] as const;
  const depan = [cerahkan(service.iconColor, 0.1, 0.5), cerahkan(service.iconColor, 0, 0.32)] as const;

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
        <View style={[styles.badge, styles.lencanaAngka]}>
          <Text style={styles.badgeText}>{service.lencana > 99 ? '99+' : service.lencana}</Text>
        </View>
      );
    }
    if (service.id === 'database-aset') {
      return (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>Baru</Text>
        </View>
      );
    }
    if (service.id === 'tiket-masalah') {
      return (
        <View style={[styles.badge, { backgroundColor: Colors.danger }]}>
          <Text style={styles.badgeText}>Hot</Text>
        </View>
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
        <View style={{ width: containerSize, height: containerSize }}>
          <BlurTargetView ref={sasaranBlur} style={StyleSheet.absoluteFill}>
            <LinearGradient
              colors={belakang}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[styles.ubin, styles.ubinBelakang, { width: ubin, height: ubin }]}
            />
          </BlurTargetView>
          <BlurView
            blurTarget={sasaranBlur}
            blurMethod="dimezisBlurView"
            intensity={30}
            blurReductionFactor={4}
            tint="default"
            style={[styles.ubin, styles.ubinDepan, { width: ubin, height: ubin }]}
          >
            <LinearGradient
              colors={depan}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
            <LinearGradient
              colors={['rgba(255,255,255,0.3)', 'rgba(255,255,255,0)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 0.7, y: 0.7 }}
              style={StyleSheet.absoluteFill}
            />
            <Icon name={service.icon} size={iconSize} color={Colors.white} />
          </BlurView>
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
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: Spacing.radius.sm,
    ...Spacing.curve,
  },
  ubinBelakang: {
    top: 0,
    right: 0,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.7)',
  },
  ubinDepan: {
    bottom: 0,
    left: 0,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.75)',
    overflow: 'hidden',
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
  // Lencana angka ditaruh di pojok kanan atas, bukan kiri seperti "Baru"/"Hot".
  lencanaAngka: {
    left: undefined,
    right: -8,
    minWidth: 18,
    alignItems: 'center',
    backgroundColor: Colors.danger,
    borderRadius: 9,
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

/**
 * ServiceIcon — satu item pada grid layanan beranda.
 *
 * Bentuk grid 4 kolom dengan ubin squircle ini sengaja dipertahankan dari gaya
 * Gojek; yang berubah hanya font, radius, dan warna lencana agar mengikuti
 * karir-mwt.
 */
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Colors, { brand } from '../../../constants/Colors';
import Spacing, { Shadows } from '../../../constants/Spacing';
import Typography, { fonts } from '../../../constants/Typography';
import { gs } from '../../../constants/GlobalStyles';
import { ServiceItem } from '../../../constants/Services';

interface ServiceIconProps {
  service: ServiceItem;
  size?: 'small' | 'medium' | 'large';
}

export default function ServiceIcon({ service, size = 'medium' }: ServiceIconProps) {
  const router = useRouter();

  const iconSize = size === 'small' ? 24 : size === 'large' ? 36 : 30;
  const containerSize = size === 'small' ? 44 : size === 'large' ? 64 : 54;

  // Selalu ikuti `route` yang didefinisikan di constants/Services.ts —
  // dulu tujuan dirakit dari `id` dengan satu pengecualian ber-hardcode untuk
  // Kaizen, sehingga layanan yang punya layar sendiri harus menambah cabang if
  // baru di sini. Sekarang cukup mengisi `route` di satu berkas.
  const handlePress = () => {
    router.push(service.route as any);
  };

  const renderBadge = () => {
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
    <TouchableOpacity style={styles.wrapper} onPress={handlePress} activeOpacity={0.7}>
      <View style={styles.iconWrapper}>
        <View
          style={[
            styles.iconContainer,
            {
              backgroundColor: service.backgroundColor,
              width: containerSize,
              height: containerSize,
            },
          ]}
        >
          <MaterialCommunityIcons
            name={service.icon as any}
            size={iconSize}
            color={service.iconColor}
          />
        </View>
        {renderBadge()}
      </View>

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
  iconWrapper: {
    position: 'relative',
    marginBottom: Spacing.sm,
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: Spacing.radius.xl,
    ...Shadows.card,
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
  badgeText: {
    fontFamily: fonts.bold,
    fontSize: 9,
    color: Colors.white,
  },
  label: {
    fontFamily: fonts.medium,
    color: Colors.textPrimary,
    textAlign: 'center',
    lineHeight: Typography.sizes.xs * 1.45,
  },
});

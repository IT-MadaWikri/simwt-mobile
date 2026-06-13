/**
 * ServiceIcon — Gojek-style service grid item
 * Displays an icon with a colored background circle and label
 */
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Colors from '../../../constants/Colors';
import Spacing from '../../../constants/Spacing';
import { ServiceItem } from '../../../constants/Services';

interface ServiceIconProps {
  service: ServiceItem;
  size?: 'small' | 'medium' | 'large';
}

export default function ServiceIcon({ service, size = 'medium' }: ServiceIconProps) {
  const router = useRouter();

  const iconSize = size === 'small' ? 24 : size === 'large' ? 36 : 30;
  const containerSize = size === 'small' ? 44 : size === 'large' ? 64 : 54;

  const handlePress = () => {
    if (service.id === 'kaizen') {
      router.push('/kaizen' as any);
    } else {
      router.push(`/services/${service.id}` as any);
    }
  };

  // Simulate random badges for Gojek style (Baru, Hot, Promo)
  const renderBadge = () => {
    if (service.id === 'database-aset') return <View style={styles.badge}><Text style={styles.badgeText}>Baru</Text></View>;
    if (service.id === 'tiket-masalah') return <View style={[styles.badge, { backgroundColor: '#E91E63' }]}><Text style={styles.badgeText}>Hot</Text></View>;
    return null;
  };

  return (
    <TouchableOpacity
      style={styles.wrapper}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <View style={styles.iconWrapper}>
        <View
          style={[
            styles.iconContainer,
            {
              backgroundColor: service.backgroundColor,
              width: containerSize,
              height: containerSize,
              borderRadius: 18, // Squircle shape like Gojek
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
      <Text style={styles.label} numberOfLines={2}>
        {service.name}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    width: '25%', // Perfect 4-column grid on any device
    marginBottom: Spacing.xl,
    paddingHorizontal: 4,
  },
  iconWrapper: {
    position: 'relative',
    marginBottom: Spacing.sm,
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  badge: {
    position: 'absolute',
    top: -6,
    left: -8,
    backgroundColor: '#000', // Default black like Gojek
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    zIndex: 1,
  },
  badgeText: {
    color: Colors.white,
    fontSize: 9,
    fontWeight: '800',
  },
  label: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.textPrimary,
    textAlign: 'center',
    lineHeight: 16,
  },
});

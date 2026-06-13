/**
 * QuickStats — Dashboard-style stats cards showing key metrics
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Colors from '../../../constants/Colors';
import Spacing from '../../../constants/Spacing';
import SectionHeader from '../common/SectionHeader';

interface StatItem {
  icon: string;
  label: string;
  value: string;
  color: string;
  bgColor: string;
}

const STATS: StatItem[] = [
  {
    icon: 'ticket-outline',
    label: 'Tiket Open',
    value: '5',
    color: '#C62828',
    bgColor: '#FFEBEE',
  },
  {
    icon: 'clipboard-check-outline',
    label: 'Audit',
    value: '2',
    color: '#2E7D32',
    bgColor: '#E8F5E9',
  },
  {
    icon: 'lightbulb-on-outline',
    label: 'Kaizen',
    value: '8',
    color: '#F57F17',
    bgColor: '#FFF8E1',
  },
  {
    icon: 'calendar-check-outline',
    label: 'Kegiatan',
    value: '3',
    color: '#E65100',
    bgColor: '#FFF3E0',
  },
];

export default function QuickStats() {
  return (
    <View style={styles.container}>
      <SectionHeader title="Ringkasan" />
      <View style={styles.row}>
        {STATS.map((stat, index) => (
          <View key={index} style={styles.card}>
            <View style={[styles.iconBg, { backgroundColor: stat.bgColor }]}>
              <MaterialCommunityIcons
                name={stat.icon as any}
                size={20}
                color={stat.color}
              />
            </View>
            <Text style={styles.value}>{stat.value}</Text>
            <Text style={styles.label}>{stat.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.sectionGap,
  },
  row: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.screenPadding,
    gap: Spacing.sm,
  },
  card: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: Spacing.radius.md,
    padding: Spacing.md,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  iconBg: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  value: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  label: {
    fontSize: 10,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 2,
  },
});

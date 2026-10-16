/**
 * QuickStats — deretan kartu metrik ringkas di beranda.
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from '../common/Icon';
import Colors, { brand } from '../../../constants/Colors';
import Spacing from '../../../constants/Spacing';
import { gs } from '../../../constants/GlobalStyles';
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
    color: Colors.dangerDark,
    bgColor: Colors.serviceRed,
  },
  {
    icon: 'clipboard-check-outline',
    label: 'Audit',
    value: '2',
    color: brand[600],
    bgColor: brand[50],
  },
  {
    icon: 'lightbulb-on-outline',
    label: 'Kaizen',
    value: '8',
    color: '#b45309',
    bgColor: Colors.serviceAmber,
  },
  {
    icon: 'calendar-check-outline',
    label: 'Kegiatan',
    value: '3',
    color: '#c2410c',
    bgColor: Colors.serviceOrange,
  },
];

export default function QuickStats() {
  return (
    <View style={styles.section}>
      <SectionHeader title="Ringkasan" />

      <View style={[gs.row, gs.containerX, gs.gapSm]}>
        {STATS.map((stat) => (
          <View key={stat.label} style={[gs.card, styles.card]}>
            <View style={[styles.iconBg, { backgroundColor: stat.bgColor }]}>
              <Icon name={stat.icon as any} size={20} color={stat.color} />
            </View>
            <Text style={[gs.metric, styles.value]}>{stat.value}</Text>
            <Text style={[gs.caption, gs.textCenter]}>{stat.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: Spacing.lg,
  },
  card: {
    flex: 1,
    alignItems: 'center',
    padding: Spacing.md,
  },
  iconBg: {
    width: 36,
    height: 36,
    borderRadius: Spacing.radius.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  value: {
    fontSize: 12,
  },
});

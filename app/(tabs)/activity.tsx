/**
 * Activity Screen — Riwayat aktivitas user
 */
import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Colors from '../../constants/Colors';
import Spacing from '../../constants/Spacing';

interface Activity {
  id: string;
  title: string;
  description: string;
  icon: string;
  iconColor: string;
  iconBg: string;
  time: string;
  status: 'completed' | 'pending' | 'in_progress';
}

const MOCK_ACTIVITIES: Activity[] = [
  {
    id: '1',
    title: 'Tiket #1024 Disubmit',
    description: 'Printer lantai 3 tidak berfungsi',
    icon: 'ticket-confirmation-outline',
    iconColor: '#C62828',
    iconBg: '#FFEBEE',
    time: '2 jam lalu',
    status: 'pending',
  },
  {
    id: '2',
    title: 'Audit Selesai',
    description: 'Audit safety departemen produksi',
    icon: 'clipboard-check-outline',
    iconColor: '#2E7D32',
    iconBg: '#E8F5E9',
    time: '5 jam lalu',
    status: 'completed',
  },
  {
    id: '3',
    title: 'Kaizen Diajukan',
    description: 'Optimasi layout gudang B',
    icon: 'lightbulb-on-outline',
    iconColor: '#F57F17',
    iconBg: '#FFF8E1',
    time: 'Kemarin',
    status: 'in_progress',
  },
  {
    id: '4',
    title: 'Aset Baru Ditambahkan',
    description: 'Laptop Dell Latitude 5540 - IT Dept',
    icon: 'database-outline',
    iconColor: '#1565C0',
    iconBg: '#E3F2FD',
    time: 'Kemarin',
    status: 'completed',
  },
  {
    id: '5',
    title: 'Kegiatan Terdaftar',
    description: 'Training K3 - 15 Juni 2026',
    icon: 'calendar-check-outline',
    iconColor: '#E65100',
    iconBg: '#FFF3E0',
    time: '2 hari lalu',
    status: 'pending',
  },
];

const statusColors = {
  completed: Colors.success,
  pending: Colors.warning,
  in_progress: Colors.info,
};

const statusLabels = {
  completed: 'Selesai',
  pending: 'Pending',
  in_progress: 'Proses',
};

export default function ActivityScreen() {
  const renderItem = ({ item }: { item: Activity }) => (
    <View style={styles.card}>
      <View style={[styles.iconBg, { backgroundColor: item.iconBg }]}>
        <MaterialCommunityIcons
          name={item.icon as any}
          size={24}
          color={item.iconColor}
        />
      </View>
      <View style={styles.content}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.description} numberOfLines={1}>
          {item.description}
        </Text>
        <Text style={styles.time}>{item.time}</Text>
      </View>
      <View
        style={[
          styles.statusBadge,
          { backgroundColor: statusColors[item.status] + '20' },
        ]}
      >
        <Text
          style={[styles.statusText, { color: statusColors[item.status] }]}
        >
          {statusLabels[item.status]}
        </Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={MOCK_ACTIVITIES}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <Text style={styles.header}>Aktivitas Terbaru</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  list: {
    padding: Spacing.screenPadding,
  },
  header: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.lg,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: Spacing.radius.md,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  iconBg: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  description: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  time: {
    fontSize: 11,
    color: Colors.textTertiary,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Spacing.radius.full,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
  },
});

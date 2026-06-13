/**
 * Notification Screen — List notifikasi user
 */
import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Colors from '../../constants/Colors';
import Spacing from '../../constants/Spacing';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'danger';
  read: boolean;
  time: string;
}

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    title: 'Tiket Direspon',
    message: 'Tiket #1024 telah direspon oleh tim IT Support',
    type: 'info',
    read: false,
    time: '30 menit lalu',
  },
  {
    id: '2',
    title: 'Audit Reminder',
    message: 'Audit mingguan departemen QC dijadwalkan besok',
    type: 'warning',
    read: false,
    time: '1 jam lalu',
  },
  {
    id: '3',
    title: 'Kaizen Approved',
    message: 'Ide kaizen "Optimasi Layout Gudang" telah disetujui',
    type: 'success',
    read: true,
    time: '3 jam lalu',
  },
  {
    id: '4',
    title: 'Kegiatan Mendatang',
    message: 'Training K3 dijadwalkan 15 Juni 2026 di Aula Utama',
    type: 'info',
    read: true,
    time: 'Kemarin',
  },
  {
    id: '5',
    title: 'System Maintenance',
    message: 'Server maintenance dijadwalkan Sabtu, 14 Juni pukul 22:00',
    type: 'danger',
    read: true,
    time: '2 hari lalu',
  },
];

const typeConfig = {
  info: { icon: 'information-outline', color: Colors.info, bg: '#E3F2FD' },
  warning: { icon: 'alert-outline', color: Colors.warning, bg: '#FFF8E1' },
  success: { icon: 'check-circle-outline', color: Colors.success, bg: '#E8F5E9' },
  danger: { icon: 'alert-circle-outline', color: Colors.danger, bg: '#FFEBEE' },
};

export default function NotificationScreen() {
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const renderItem = ({ item }: { item: Notification }) => {
    const config = typeConfig[item.type];

    return (
      <TouchableOpacity
        style={[styles.card, !item.read && styles.unreadCard]}
        onPress={() => markAsRead(item.id)}
        activeOpacity={0.7}
      >
        {!item.read && <View style={styles.unreadDot} />}
        <View style={[styles.iconBg, { backgroundColor: config.bg }]}>
          <MaterialCommunityIcons
            name={config.icon as any}
            size={22}
            color={config.color}
          />
        </View>
        <View style={styles.content}>
          <Text style={[styles.title, !item.read && styles.unreadTitle]}>
            {item.title}
          </Text>
          <Text style={styles.message} numberOfLines={2}>
            {item.message}
          </Text>
          <Text style={styles.time}>{item.time}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <View style={styles.container}>
      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={styles.headerRow}>
            <Text style={styles.header}>Notifikasi</Text>
            {unreadCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{unreadCount}</Text>
              </View>
            )}
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons
              name="bell-off-outline"
              size={64}
              color={Colors.textTertiary}
            />
            <Text style={styles.emptyText}>Belum ada notifikasi</Text>
          </View>
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
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  header: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  badge: {
    backgroundColor: Colors.danger,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: Spacing.sm,
  },
  badgeText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '700',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
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
  unreadCard: {
    borderLeftWidth: 3,
    borderLeftColor: Colors.primary,
  },
  unreadDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
  },
  iconBg: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  unreadTitle: {
    fontWeight: '700',
  },
  message: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
    marginBottom: 6,
  },
  time: {
    fontSize: 11,
    color: Colors.textTertiary,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 80,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.textTertiary,
    marginTop: 16,
  },
});

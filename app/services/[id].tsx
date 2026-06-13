/**
 * Service Detail Screen — Dynamic route for all 10 services
 * Uses [id] dynamic segment to match service definitions
 */
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '../../constants/Colors';
import Spacing from '../../constants/Spacing';
import { SERVICES, ServiceItem } from '../../constants/Services';

export default function ServiceDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const service = SERVICES.find((s) => s.id === id);

  if (!service) {
    return (
      <View style={styles.notFound}>
        <MaterialCommunityIcons
          name="alert-circle-outline"
          size={64}
          color={Colors.textTertiary}
        />
        <Text style={styles.notFoundText}>Layanan tidak ditemukan</Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: service.name.replace('\n', ' '),
          headerStyle: { backgroundColor: Colors.white },
          headerTintColor: Colors.textPrimary,
        }}
      />
      <ScrollView 
        style={styles.container} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + Spacing.xxl }}
      >
        {/* Hero Section */}
        <View style={[styles.hero, { backgroundColor: service.backgroundColor }]}>
          <View
            style={[
              styles.heroIcon,
              { backgroundColor: service.iconColor + '20' },
            ]}
          >
            <MaterialCommunityIcons
              name={service.icon as any}
              size={48}
              color={service.iconColor}
            />
          </View>
          <Text style={[styles.heroTitle, { color: service.iconColor }]}>
            {service.name.replace('\n', ' ')}
          </Text>
          <Text style={styles.heroDescription}>{service.description}</Text>
        </View>

        {/* Content Area */}
        <View style={styles.content}>
          {/* Coming Soon Card */}
          <View style={styles.comingSoonCard}>
            <MaterialCommunityIcons
              name="rocket-launch-outline"
              size={56}
              color={Colors.primary}
            />
            <Text style={styles.comingSoonTitle}>Segera Hadir</Text>
            <Text style={styles.comingSoonText}>
              Fitur {service.name.replace('\n', ' ')} sedang dalam pengembangan.{'\n'}
              Nantikan update selanjutnya!
            </Text>
          </View>

          {/* Quick Actions */}
          <View style={styles.actionsSection}>
            <Text style={styles.sectionTitle}>Aksi Cepat</Text>
            {getQuickActions(service).map((action, index) => (
              <TouchableOpacity
                key={index}
                style={styles.actionItem}
                activeOpacity={0.7}
                onPress={() => {
                  if (action.route) {
                    router.push(action.route as any);
                  }
                }}
              >
                <View
                  style={[
                    styles.actionIcon,
                    { backgroundColor: service.backgroundColor },
                  ]}
                >
                  <MaterialCommunityIcons
                    name={action.icon as any}
                    size={22}
                    color={service.iconColor}
                  />
                </View>
                <View style={styles.actionContent}>
                  <Text style={styles.actionLabel}>{action.label}</Text>
                  <Text style={styles.actionSubtitle}>{action.subtitle}</Text>
                </View>
                <MaterialCommunityIcons
                  name="chevron-right"
                  size={22}
                  color={Colors.textTertiary}
                />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </>
  );
}

function getQuickActions(service: ServiceItem) {
  const defaultActions = [
    {
      icon: 'plus-circle-outline',
      label: 'Tambah Baru',
      subtitle: `Buat ${service.name.replace('\n', ' ')} baru`,
    },
    {
      icon: 'format-list-bulleted',
      label: 'Lihat Semua',
      subtitle: `Daftar ${service.name.replace('\n', ' ')}`,
    },
    {
      icon: 'chart-bar',
      label: 'Laporan',
      subtitle: 'Lihat statistik dan laporan',
    },
  ];

  // Custom actions per service
  const customActions: Record<string, any[]> = {
    'tiket-masalah': [
      { icon: 'plus-circle-outline', label: 'Buat Tiket Baru', subtitle: 'Laporkan masalah baru' },
      { icon: 'format-list-bulleted', label: 'Tiket Saya', subtitle: 'Lihat semua tiket Anda' },
      { icon: 'chart-bar', label: 'Statistik Tiket', subtitle: 'Overview status tiket' },
    ],
    'database-aset': [
      { icon: 'plus-circle-outline', label: 'Tambah Aset', subtitle: 'Registrasi aset baru' },
      { icon: 'magnify', label: 'Cari Aset', subtitle: 'Cari berdasarkan kode/nama' },
      { icon: 'qrcode-scan', label: 'Scan QR', subtitle: 'Scan QR code aset' },
    ],
    audit: [
      { icon: 'plus-circle-outline', label: 'Mulai Audit', subtitle: 'Buat checklist audit baru' },
      { icon: 'format-list-bulleted', label: 'Riwayat Audit', subtitle: 'Lihat audit sebelumnya' },
      { icon: 'file-document-outline', label: 'Template', subtitle: 'Kelola template audit' },
    ],
    'human-capital': [
      { icon: 'account-group', label: 'Data Karyawan', subtitle: 'Direktori dan daftar semua karyawan', route: '/services/hc/data-karyawan' },
      { icon: 'briefcase-account-outline', label: 'Rekrutment', subtitle: 'Manajemen lowongan dan pelamar', route: '/services/hc/rekrutment' },
    ],
  };

  return customActions[service.id] || defaultActions;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  hero: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: Spacing.screenPadding,
  },
  heroIcon: {
    width: 88,
    height: 88,
    borderRadius: 44,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 8,
  },
  heroDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  content: {
    padding: Spacing.screenPadding,
  },
  comingSoonCard: {
    backgroundColor: Colors.white,
    borderRadius: Spacing.radius.lg,
    padding: Spacing.xxl,
    alignItems: 'center',
    marginBottom: Spacing.sectionGap,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  comingSoonTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  comingSoonText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  actionsSection: {
    marginBottom: Spacing.sectionGap,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: Spacing.radius.md,
    padding: Spacing.lg,
    marginBottom: Spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  actionIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  actionContent: {
    flex: 1,
  },
  actionLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  actionSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  notFound: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  notFoundText: {
    fontSize: 16,
    color: Colors.textTertiary,
    marginTop: 16,
  },
});

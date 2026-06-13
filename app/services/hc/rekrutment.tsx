import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
  useWindowDimensions,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '../../../constants/Colors';
import Spacing from '../../../constants/Spacing';
import { rekrutmentService, RekrutmentDashboardResponse } from '../../../src/services/rekrutmentService';

export default function RekrutmentAdminScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dashboardData, setDashboardData] = useState<RekrutmentDashboardResponse | null>(null);

  const fetchDashboardData = async () => {
    try {
      const data = await rekrutmentService.getDashboardAdmin();
      setDashboardData(data);
    } catch (error) {
      console.error('Failed to fetch recruitment admin data', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  if (loading && !refreshing) {
    return (
      <View style={[styles.container, styles.centerContainer]}>
        <ActivityIndicator size="large" color="#1E88E5" />
        <Text style={styles.loadingText}>Memuat Dashboard Admin...</Text>
      </View>
    );
  }

  if (!dashboardData) {
    return (
      <View style={[styles.container, styles.centerContainer]}>
        <MaterialCommunityIcons name="alert-circle-outline" size={48} color={Colors.textTertiary} />
        <Text style={styles.errorText}>Gagal memuat data</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchDashboardData}>
          <Text style={styles.retryButtonText}>Coba Lagi</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const {
    totalLowongan = 0,
    totalPelamar = 0,
    jadwalHariIni = 0,
    suratPsikotesBelumApprove = [],
    suratPkwtBelumApprove = [],
    suratHasilTesBelumApprove = [],
    analisisMITA,
  } = dashboardData;

  const totalPending = suratPsikotesBelumApprove.length + suratPkwtBelumApprove.length + suratHasilTesBelumApprove.length;

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: 'Rekrutment',
          headerStyle: { backgroundColor: '#1565C0' },
          headerTintColor: Colors.white,
          headerShadowVisible: false,
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={{ marginLeft: 8, padding: 8 }}>
              <MaterialCommunityIcons name="arrow-left" size={24} color={Colors.white} />
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView
        style={styles.container}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + Spacing.xxl }]}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#1565C0']} />}
      >
        {/* Quick Actions Scroll */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.quickActionsRow}>
          <TouchableOpacity style={styles.actionBtnSolid}>
            <MaterialCommunityIcons name="plus" size={18} color={Colors.white} />
            <Text style={styles.actionBtnSolidText}>Posting Loker</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtnOutline}>
            <MaterialCommunityIcons name="format-list-bulleted" size={18} color={Colors.textPrimary} />
            <Text style={styles.actionBtnOutlineText}>Posisi & Pendidikan</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtnOutline}>
            <MaterialCommunityIcons name="cog-outline" size={18} color={Colors.textPrimary} />
            <Text style={styles.actionBtnOutlineText}>Pengaturan</Text>
          </TouchableOpacity>
        </ScrollView>

        <Text style={styles.sectionTitle}>Menu Utama</Text>
        <View style={styles.menuGrid}>
          {/* Loker */}
          <TouchableOpacity style={styles.menuCard}>
            <View style={[styles.menuIconBg, { backgroundColor: '#E3F2FD' }]}>
              <MaterialCommunityIcons name="briefcase-outline" size={28} color="#1565C0" />
            </View>
            <Text style={styles.menuCardText}>Lihat Semua Loker</Text>
          </TouchableOpacity>

          {/* Pelamar */}
          <TouchableOpacity style={styles.menuCard}>
            <View style={[styles.menuIconBg, { backgroundColor: '#F3E5F5' }]}>
              <MaterialCommunityIcons name="account-group-outline" size={28} color="#7B1FA2" />
            </View>
            <Text style={styles.menuCardText}>Lihat Semua Pelamar</Text>
          </TouchableOpacity>

          {/* Jadwal */}
          <TouchableOpacity style={styles.menuCard}>
            <View style={[styles.menuIconBg, { backgroundColor: '#FFF3E0' }]}>
              <MaterialCommunityIcons name="calendar-clock-outline" size={28} color="#E65100" />
            </View>
            <Text style={styles.menuCardText}>Lihat Semua Jadwal</Text>
          </TouchableOpacity>

          {/* Kalender */}
          <TouchableOpacity style={styles.menuCard}>
            <View style={[styles.menuIconBg, { backgroundColor: '#E8F5E9' }]}>
              <MaterialCommunityIcons name="calendar-month-outline" size={28} color="#2E7D32" />
            </View>
            <Text style={styles.menuCardText}>Lihat Kalender</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Informasi Approval</Text>
          <View style={styles.metricsGrid}>
            <View style={[styles.metricCard, { backgroundColor: '#E3F2FD' }]}>
              <MaterialCommunityIcons name="briefcase-outline" size={32} color="#1565C0" />
              <Text style={styles.metricNumber}>{totalLowongan}</Text>
              <Text style={styles.metricLabel}>Lowongan Aktif</Text>
            </View>
            <View style={[styles.metricCard, { backgroundColor: '#E8F5E9' }]}>
              <MaterialCommunityIcons name="account-group-outline" size={32} color="#2E7D32" />
              <Text style={styles.metricNumber}>{totalPelamar}</Text>
              <Text style={styles.metricLabel}>Total Pelamar</Text>
            </View>
          </View>

          <View style={styles.metricsGrid}>
            <View style={[styles.metricCard, { backgroundColor: '#FFF3E0' }]}>
              <MaterialCommunityIcons name="calendar-clock-outline" size={32} color="#E65100" />
              <Text style={styles.metricNumber}>{jadwalHariIni}</Text>
              <Text style={styles.metricLabel}>Jadwal Hari Ini</Text>
            </View>
            <View style={[styles.metricCard, { backgroundColor: totalPending > 0 ? '#FFEBEE' : '#F5F5F5' }]}>
              <MaterialCommunityIcons name="file-document-edit-outline" size={32} color={totalPending > 0 ? "#C62828" : "#757575"} />
              <Text style={[styles.metricNumber, { color: totalPending > 0 ? '#C62828' : '#757575' }]}>{totalPending}</Text>
              <Text style={styles.metricLabel}>Menunggu Approval</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  centerContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: Spacing.screenPadding,
    paddingBottom: Spacing.xxl,
  },
  loadingText: {
    marginTop: Spacing.md,
    color: Colors.textSecondary,
    fontSize: 14,
  },
  errorText: {
    marginTop: Spacing.sm,
    color: Colors.textSecondary,
    fontSize: 16,
  },
  retryButton: {
    marginTop: Spacing.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    backgroundColor: '#1565C0',
    borderRadius: Spacing.radius.sm,
  },
  retryButtonText: {
    color: Colors.white,
    fontWeight: '600',
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  metricCard: {
    flex: 1,
    padding: Spacing.lg,
    borderRadius: Spacing.radius.lg,
    alignItems: 'flex-start',
  },
  metricNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginTop: Spacing.md,
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  quickActionsRow: {
    gap: 12,
    marginBottom: Spacing.xl,
    paddingRight: Spacing.screenPadding,
  },
  actionBtnSolid: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1565C0',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
    gap: 6,
    shadowColor: '#1565C0',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  actionBtnSolidText: {
    color: Colors.white,
    fontWeight: '700',
    fontSize: 14,
  },
  actionBtnOutline: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 6,
  },
  actionBtnOutlineText: {
    color: Colors.textPrimary,
    fontWeight: '600',
    fontSize: 14,
  },
  menuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  menuCard: {
    width: '47%',
    backgroundColor: Colors.white,
    padding: Spacing.lg,
    borderRadius: Spacing.radius.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  menuIconBg: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  menuCardText: {
    color: Colors.textPrimary,
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
});

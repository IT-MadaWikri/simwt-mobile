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
import RenderHtml from 'react-native-render-html';
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
          headerTitle: 'Dashboard Rekrutment',
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
        {/* Main Metrics */}
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

        {/* MITA Analysis Section */}
        {analisisMITA && analisisMITA.analisis_mendalam && (
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <MaterialCommunityIcons name="robot-outline" size={24} color="#1565C0" />
              <Text style={styles.sectionTitle}>Analisis MITA Insight</Text>
            </View>

            <View style={styles.insightCard}>
              <Text style={styles.insightTitle}>Kondisi Saat Ini</Text>
              <RenderHtml
                contentWidth={width - Spacing.screenPadding * 4}
                source={{ html: analisisMITA.analisis_mendalam.kondisi }}
                tagsStyles={{
                  strong: { color: '#1565C0', fontWeight: 'bold' },
                  p: { fontSize: 14, color: Colors.textSecondary, lineHeight: 22, margin: 0 },
                }}
              />
            </View>

            {analisisMITA.analisis_mendalam.risiko && analisisMITA.analisis_mendalam.risiko.length > 0 && (
              <View style={[styles.insightCard, styles.riskCard]}>
                <View style={styles.riskHeader}>
                  <MaterialCommunityIcons name="alert-circle-outline" size={20} color="#D32F2F" />
                  <Text style={styles.riskTitleText}>Risiko Teridentifikasi</Text>
                </View>
                {analisisMITA.analisis_mendalam.risiko.map((risk: any, index: number) => (
                  <View key={index} style={styles.riskItem}>
                    <Text style={styles.riskItemTitle}>• {risk.judul}</Text>
                    <Text style={styles.riskItemDesc}>{risk.deskripsi}</Text>
                  </View>
                ))}
              </View>
            )}

            {analisisMITA.analisis_mendalam.rekomendasi && analisisMITA.analisis_mendalam.rekomendasi.length > 0 && (
              <View style={[styles.insightCard, styles.recommendationCard]}>
                <View style={styles.riskHeader}>
                  <MaterialCommunityIcons name="lightbulb-on-outline" size={20} color="#F57F17" />
                  <Text style={[styles.riskTitleText, { color: '#F57F17' }]}>Rekomendasi Aksi</Text>
                </View>
                {analisisMITA.analisis_mendalam.rekomendasi.map((rec: any, index: number) => (
                  <View key={index} style={styles.riskItem}>
                    <View style={styles.recHeader}>
                      <Text style={styles.riskItemTitle}>• {rec.aksi}</Text>
                      <View style={[styles.priorityBadge, rec.prioritas === 'High' ? styles.highPriority : styles.medPriority]}>
                        <Text style={[styles.priorityText, rec.prioritas === 'High' ? styles.highPriorityText : styles.medPriorityText]}>{rec.prioritas}</Text>
                      </View>
                    </View>
                    <Text style={styles.riskItemDesc}>{rec.detail}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}
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
  sectionContainer: {
    marginTop: Spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1565C0',
    marginLeft: 8,
  },
  insightCard: {
    backgroundColor: Colors.white,
    borderRadius: Spacing.radius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  insightTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  riskCard: {
    borderColor: '#FFCDD2',
    backgroundColor: '#FFEBEE',
  },
  riskHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  riskTitleText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#D32F2F',
    marginLeft: 8,
  },
  riskItem: {
    marginBottom: Spacing.md,
  },
  riskItemTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  riskItemDesc: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginLeft: 12,
  },
  recommendationCard: {
    borderColor: '#FFF9C4',
    backgroundColor: '#FFFDE7',
  },
  recHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  highPriority: {
    backgroundColor: '#FFEBEE',
  },
  medPriority: {
    backgroundColor: '#E3F2FD',
  },
  highPriorityText: {
    color: '#C62828',
    fontSize: 10,
    fontWeight: '700',
  },
  medPriorityText: {
    color: '#1565C0',
    fontSize: 10,
    fontWeight: '700',
  },
});

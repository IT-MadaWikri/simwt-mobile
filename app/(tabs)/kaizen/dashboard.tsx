import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors, { brand } from '../../../constants/Colors';
import Spacing from '../../../constants/Spacing';
import { kaizenService } from '../../../src/services/kaizenService';
import { KaizenDashboardData } from '../../../src/types/kaizen';
import { useAuth } from '../../../src/contexts/AuthContext';
import { useRouter } from 'expo-router';
import { fonts } from '../../../constants/Typography';
import LoadingSpinner from '../../../src/components/common/LoadingSpinner';

export default function KaizenDashboardScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const [dashboardData, setDashboardData] = useState<KaizenDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Filter states
  const [selectedTahun, setSelectedTahun] = useState<string>(new Date().getFullYear().toString());
  const [selectedPlant, setSelectedPlant] = useState<string>('');

  const fetchDashboard = async () => {
    try {
      const data = await kaizenService.getDashboard(selectedTahun, selectedPlant);
      setDashboardData(data);
    } catch (error) {
      console.error('Error fetching dashboard:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchDashboard();
  }, [selectedTahun, selectedPlant]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboard();
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.centerContainer}>
        <LoadingSpinner message="Memuat Ringkasan Kaizen..." />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView 
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + Spacing.xxl }]} 
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[brand[600]]} />}
      >
        
        {/* Quick Stats Carousel */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          contentContainerStyle={styles.statsCarousel}
        >
          <View style={[styles.statCard, { backgroundColor: brand[50], borderColor: brand[100] }]}>
            <View style={styles.statIconBg}>
              <MaterialCommunityIcons name="check-decagram" size={20} color={brand[700]} />
            </View>
            <Text style={styles.statLabel}>Kaizen Disetujui</Text>
            <Text style={[styles.statValue, { color: brand[700] }]}>{dashboardData?.jumlahDisetujui || 0}</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: brand[50], borderColor: brand[100] }]}>
            <View style={styles.statIconBg}>
              <MaterialCommunityIcons name="chart-line" size={20} color={brand[700]} />
            </View>
            <Text style={styles.statLabel}>Rata-rata/Bulan</Text>
            <Text style={[styles.statValue, { color: brand[700] }]}>{dashboardData?.rataRataPerBulan || 0}</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: Colors.serviceOrange, borderColor: Colors.serviceOrange }]}>
            <View style={styles.statIconBg}>
              <MaterialCommunityIcons name="percent" size={20} color="#c2410c" />
            </View>
            <Text style={styles.statLabel}>Tingkat Persetujuan</Text>
            <Text style={[styles.statValue, { color: '#c2410c' }]}>{dashboardData?.tingkatPenerimaan || 0}%</Text>
          </View>
        </ScrollView>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pencapaian Target Departemen</Text>
          {dashboardData?.departemenTargets?.map((dept, idx) => {
            const progress = dept.target > 0 ? Math.min((dept.aktual / dept.target) * 100, 100) : 0;
            return (
              <View key={idx} style={styles.progressCard}>
                <View style={styles.progressHeader}>
                  <Text style={styles.progressDeptName}>{dept.departemen?.nama || 'Unknown'}</Text>
                  <Text style={styles.progressText}>{dept.aktual} / {dept.target}</Text>
                </View>
                <View style={styles.progressBarBg}>
                  <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
                </View>
              </View>
            );
          })}
          {(!dashboardData?.departemenTargets || dashboardData.departemenTargets.length === 0) && (
            <Text style={styles.emptyText}>Tidak ada data target saat ini.</Text>
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.mitaContainer}>
            <View style={styles.mitaHeader}>
              <MaterialCommunityIcons name="robot-outline" size={24} color={Colors.white} />
              <Text style={styles.mitaTitle}>Mita AI Insights</Text>
            </View>
            <View style={styles.mitaBody}>
              <Text style={styles.mitaText}>
                Secara keseluruhan, tingkat persetujuan Kaizen berada di angka {dashboardData?.tingkatPenerimaan || 0}%. 
                Fokuskan pada departemen dengan pencapaian target terendah untuk meningkatkan partisipasi bulan ini.
              </Text>
            </View>
          </View>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  loadingText: {
    marginTop: 12,
    color: Colors.textSecondary,
    fontFamily: fonts.medium,
  },
  header: {
    backgroundColor: brand[600],
    paddingTop: Spacing.xl * 1.5,
    paddingBottom: Spacing.md,
    paddingHorizontal: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: fonts.bold,
    color: Colors.white,
  },
  scrollContent: {
    paddingBottom: Spacing.xxxl,
  },
  statsCarousel: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    gap: Spacing.md,
  },
  statCard: {
    width: 140,
    padding: Spacing.md,
    borderRadius: 16,
    borderWidth: 1,
  },
  statIconBg: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  statLabel: {
    fontSize: 11,
    fontFamily: fonts.semibold,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 24,
    fontFamily: fonts.extrabold,
  },
  section: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: fonts.extrabold,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  progressCard: {
    backgroundColor: Colors.white,
    padding: Spacing.md,
    borderRadius: 12,
    marginBottom: Spacing.sm,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressDeptName: {
    fontSize: 13,
    fontFamily: fonts.bold,
    color: Colors.textPrimary,
  },
  progressText: {
    fontSize: 12,
    fontFamily: fonts.bold,
    color: Colors.primary,
  },
  progressBarBg: {
    height: 8,
    backgroundColor: Colors.borderSubtle,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: brand[600],
    borderRadius: 4,
  },
  emptyText: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontStyle: 'italic',
  },
  mitaContainer: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
  },
  mitaHeader: {
    backgroundColor: '#4A148C', // Deep purple
    padding: Spacing.sm,
    paddingHorizontal: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  mitaTitle: {
    color: Colors.white,
    fontFamily: fonts.bold,
    fontSize: 14,
  },
  mitaBody: {
    padding: Spacing.md,
  },
  mitaText: {
    fontSize: 13,
    lineHeight: 20,
    color: Colors.textPrimary,
  },
});

import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '../../../constants/Colors';
import Spacing from '../../../constants/Spacing';
import { kaizenService } from '../../../src/services/kaizenService';
import { KaizenDashboardData } from '../../../src/types/kaizen';
import { useAuth } from '../../../src/contexts/AuthContext';
import { useRouter } from 'expo-router';

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
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Memuat Ringkasan Kaizen...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView 
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + Spacing.xxl }]} 
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#00AA13']} />}
      >
        
        {/* Quick Stats Carousel */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          contentContainerStyle={styles.statsCarousel}
        >
          <View style={[styles.statCard, { backgroundColor: '#E8F5E9', borderColor: '#C8E6C9' }]}>
            <View style={styles.statIconBg}>
              <MaterialCommunityIcons name="check-decagram" size={20} color="#2E7D32" />
            </View>
            <Text style={styles.statLabel}>Kaizen Disetujui</Text>
            <Text style={[styles.statValue, { color: '#2E7D32' }]}>{dashboardData?.jumlahDisetujui || 0}</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: '#E3F2FD', borderColor: '#BBDEFB' }]}>
            <View style={styles.statIconBg}>
              <MaterialCommunityIcons name="chart-line" size={20} color="#1565C0" />
            </View>
            <Text style={styles.statLabel}>Rata-rata/Bulan</Text>
            <Text style={[styles.statValue, { color: '#1565C0' }]}>{dashboardData?.rataRataPerBulan || 0}</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: '#FFF3E0', borderColor: '#FFE0B2' }]}>
            <View style={styles.statIconBg}>
              <MaterialCommunityIcons name="percent" size={20} color="#E65100" />
            </View>
            <Text style={styles.statLabel}>Tingkat Persetujuan</Text>
            <Text style={[styles.statValue, { color: '#E65100' }]}>{dashboardData?.tingkatPenerimaan || 0}%</Text>
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
              <MaterialCommunityIcons name="robot-outline" size={24} color="#FFF" />
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
    backgroundColor: '#F5F6F8',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F6F8',
  },
  loadingText: {
    marginTop: 12,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  header: {
    backgroundColor: '#00AA13',
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
    fontWeight: '700',
    color: '#FFF',
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
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800',
  },
  section: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
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
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
  },
  progressBarBg: {
    height: 8,
    backgroundColor: '#F0F0F0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#00AA13',
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
    borderColor: '#EAEAEC',
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
    color: '#FFF',
    fontWeight: '700',
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

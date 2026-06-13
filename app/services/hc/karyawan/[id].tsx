import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { karyawanService, Employee } from '../../../../src/services/karyawanService';
import Colors from '../../../../constants/Colors';
import Spacing from '../../../../constants/Spacing';

// Gojek-style primary colors
const GOJEK_GREEN = '#00AA13';
const GOJEK_GREEN_LIGHT = '#E8F5E9';
const GOJEK_DARK = '#1C1C1C';
const GOJEK_GREY = '#727272';
const GOJEK_BG = '#F5F6F8';

export default function EmployeeDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(true);
  const [employee, setEmployee] = useState<Employee | null>(null);

  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        if (id) {
          const data = await karyawanService.getEmployeeById(id);
          setEmployee(data);
        }
      } catch (error) {
        console.error('Failed to fetch employee details:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchEmployee();
  }, [id]);

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContainer]}>
        <ActivityIndicator size="large" color={GOJEK_GREEN} />
        <Text style={styles.loadingText}>Memuat Detail Karyawan...</Text>
      </View>
    );
  }

  if (!employee) {
    return (
      <View style={[styles.container, styles.centerContainer]}>
        <MaterialCommunityIcons name="account-off-outline" size={48} color={GOJEK_GREY} />
        <Text style={styles.errorText}>Data karyawan tidak ditemukan</Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>Kembali</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Parse specific fields based on Employee interface
  const fullName = employee.nama_lengkap || 'Tanpa Nama';
  const initial = fullName.charAt(0).toUpperCase();
  const roleName = typeof employee.jabatan === 'object' ? employee.jabatan?.nama : employee.jabatan;
  const status = employee.status_karyawan || 'Aktif';
  const isActive = status.toLowerCase() === 'aktif';

  // Format date helper if needed
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-';
    // Just returning raw string for now or basic format if it's YYYY-MM-DD
    return dateStr.substring(0, 10); 
  };

  // Calculate Masa Kerja
  const calculateMasaKerja = (startDateStr?: string) => {
    if (!startDateStr) return '-';
    
    const startDate = new Date(startDateStr);
    const endDate = new Date();
    
    if (isNaN(startDate.getTime())) return '-';

    let years = endDate.getFullYear() - startDate.getFullYear();
    let months = endDate.getMonth() - startDate.getMonth();
    let days = endDate.getDate() - startDate.getDate();

    if (days < 0) {
      months--;
    }

    if (months < 0) {
      years--;
      months += 12;
    }

    if (years <= 0 && months <= 0) {
      return '< 1 Bulan';
    }

    let result = '';
    if (years > 0) result += `${years} Tahun `;
    if (months > 0) result += `${months} Bulan`;

    return result.trim();
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: 'Detail Karyawan',
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
        showsVerticalScrollIndicator={false}
      >
        {/* Main Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.profileHeader}>
            {/* Avatar */}
            <View style={styles.avatarContainer}>
              {employee.foto_profil ? (
                <Image
                  source={{ uri: employee.foto_profil.startsWith('http') ? employee.foto_profil : `https://mwtpart.co.id/storage/${employee.foto_profil}` }}
                  style={styles.avatarImage}
                />
              ) : (
                <View style={styles.avatarFallback}>
                  <Text style={styles.avatarText}>{initial}</Text>
                </View>
              )}
            </View>

            {/* Basic Info */}
            <View style={styles.profileInfo}>
              <Text style={styles.profileName} numberOfLines={2}>{fullName}</Text>
              
              <View style={styles.badgesColumn}>
                {employee.nik && (
                  <View style={[styles.badge, styles.badgeBlue]}>
                    <MaterialCommunityIcons name="card-account-details-outline" size={12} color="#1565C0" />
                    <Text style={[styles.badgeText, { color: '#1565C0' }]}>{employee.nik}</Text>
                  </View>
                )}
                <View style={styles.badgesRowHorizontal}>
                  <View style={[styles.badge, styles.badgeGreenOutline]}>
                    <MaterialCommunityIcons name="account-tie-outline" size={12} color={GOJEK_GREEN} />
                    <Text style={[styles.badgeText, { color: GOJEK_GREEN }]} numberOfLines={1}>
                      {roleName || 'Staff'}
                    </Text>
                  </View>
                  <View style={[styles.badge, styles.badgeGreenSolid]}>
                    <View style={[styles.dot, { backgroundColor: isActive ? Colors.white : GOJEK_GREY }]} />
                    <Text style={[styles.badgeText, { color: Colors.white }]}>{status}</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>

          {/* Additional Info Row (Masa Kerja & Usia) */}
          <View style={styles.summaryRow}>
            <View style={styles.summaryBox}>
              <View style={styles.summaryLabelRow}>
                <MaterialCommunityIcons name="briefcase-outline" size={14} color="#9E9E9E" />
                <Text style={styles.summaryLabel}>MASA KERJA</Text>
              </View>
              <Text style={styles.summaryValue}>{calculateMasaKerja(employee.tanggal_masuk_kerja)}</Text>
            </View>
            <View style={styles.summaryBox}>
              <View style={styles.summaryLabelRow}>
                <MaterialCommunityIcons name="cake-variant-outline" size={14} color="#9E9E9E" />
                <Text style={styles.summaryLabel}>USIA</Text>
              </View>
              <Text style={styles.summaryValue}>{employee.umur ? `${employee.umur} Tahun` : '-'}</Text>
            </View>
          </View>
        </View>

        {/* Informasi Pribadi */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIconBg}>
              <MaterialCommunityIcons name="account-outline" size={20} color={GOJEK_GREEN} />
            </View>
            <Text style={styles.sectionTitle}>INFORMASI PRIBADI</Text>
            <View style={{ flex: 1 }} />
            <MaterialCommunityIcons name="dots-horizontal" size={24} color={GOJEK_GREEN} />
          </View>
          
          <View style={styles.gridContainer}>
            <View style={styles.gridItem}>
              <View style={styles.infoLabelRow}>
                <MaterialCommunityIcons name="card-account-details-outline" size={16} color={GOJEK_GREEN} />
                <Text style={styles.infoLabel}>NIK</Text>
              </View>
              <Text style={styles.infoValue}>{employee.nik || '-'}</Text>
            </View>
            <View style={styles.gridItem}>
              <View style={styles.infoLabelRow}>
                <MaterialCommunityIcons name="account-details-outline" size={16} color={GOJEK_GREEN} />
                <Text style={styles.infoLabel}>NAMA LENGKAP</Text>
              </View>
              <Text style={styles.infoValue}>{fullName}</Text>
            </View>
            <View style={styles.gridItem}>
              <View style={styles.infoLabelRow}>
                <MaterialCommunityIcons name="calendar-blank-outline" size={16} color={GOJEK_GREEN} />
                <Text style={styles.infoLabel}>TANGGAL LAHIR</Text>
              </View>
              <Text style={styles.infoValue}>{formatDate(employee.tanggal_lahir)}</Text>
            </View>
            <View style={styles.gridItem}>
              <View style={styles.infoLabelRow}>
                <MaterialCommunityIcons name="map-marker-outline" size={16} color={GOJEK_GREEN} />
                <Text style={styles.infoLabel}>TEMPAT LAHIR</Text>
              </View>
              <Text style={styles.infoValue}>{employee.tempat_lahir || '-'}</Text>
            </View>
          </View>

          <View style={styles.fullWidthItem}>
            <View style={styles.infoLabelRow}>
              <MaterialCommunityIcons name="home-outline" size={16} color={GOJEK_GREEN} />
              <Text style={styles.infoLabel}>ALAMAT DOMISILI</Text>
            </View>
            <Text style={styles.infoValue}>{employee.alamat || '-'}</Text>
          </View>
        </View>

        {/* Informasi Kepegawaian */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIconBg}>
              <MaterialCommunityIcons name="briefcase-outline" size={20} color={GOJEK_GREEN} />
            </View>
            <Text style={styles.sectionTitle}>INFORMASI KEPEGAWAIAN</Text>
            <View style={{ flex: 1 }} />
            <MaterialCommunityIcons name="dots-horizontal" size={24} color={GOJEK_GREEN} />
          </View>
          
          <View style={styles.gridContainer}>
            <View style={styles.gridItem}>
              <View style={styles.infoLabelRow}>
                <MaterialCommunityIcons name="account-tie-outline" size={16} color={GOJEK_GREEN} />
                <Text style={styles.infoLabel}>JABATAN</Text>
              </View>
              <Text style={styles.infoValue}>{roleName || '-'}</Text>
            </View>
            <View style={styles.gridItem}>
              <View style={styles.infoLabelRow}>
                <MaterialCommunityIcons name="calendar-check-outline" size={16} color={GOJEK_GREEN} />
                <Text style={styles.infoLabel}>TANGGAL MASUK KERJA</Text>
              </View>
              <Text style={styles.infoValue}>{formatDate(employee.tanggal_masuk_kerja)}</Text>
            </View>
          </View>
        </View>

        {/* Status Keaktifan */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIconBg}>
              <MaterialCommunityIcons name="check-circle-outline" size={20} color={GOJEK_GREEN} />
            </View>
            <Text style={styles.sectionTitle}>STATUS KEAKTIFAN</Text>
            <View style={{ flex: 1 }} />
            <MaterialCommunityIcons name="dots-horizontal" size={24} color={GOJEK_GREEN} />
          </View>
          
          <View style={styles.fullWidthItem}>
            <Text style={styles.infoLabel}>STATUS SAAT INI</Text>
            <View style={[styles.badge, styles.badgeGreenLight, { alignSelf: 'flex-start', marginTop: 6 }]}>
              <View style={[styles.dot, { backgroundColor: GOJEK_GREEN }]} />
              <Text style={[styles.badgeText, { color: GOJEK_GREEN }]}>{status}</Text>
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
    backgroundColor: GOJEK_BG,
  },
  centerContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  loadingText: {
    marginTop: Spacing.md,
    fontSize: 14,
    color: GOJEK_GREY,
  },
  errorText: {
    marginTop: Spacing.md,
    fontSize: 16,
    color: GOJEK_GREY,
    fontWeight: '600',
  },
  backBtn: {
    marginTop: Spacing.xl,
    paddingHorizontal: Spacing.xl,
    paddingVertical: 10,
    backgroundColor: GOJEK_GREEN,
    borderRadius: 24,
  },
  backBtnText: {
    color: Colors.white,
    fontWeight: '600',
  },
  headerContainer: {
    backgroundColor: GOJEK_BG,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  headerBackBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: GOJEK_GREEN,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: GOJEK_DARK,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  profileCard: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarContainer: {
    marginRight: 20,
  },
  avatarFallback: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#0A8852',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: GOJEK_GREEN_LIGHT,
  },
  avatarImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    borderColor: GOJEK_GREEN_LIGHT,
  },
  avatarText: {
    color: Colors.white,
    fontSize: 36,
    fontWeight: 'bold',
  },
  profileInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  profileName: {
    fontSize: 22,
    fontWeight: '900',
    color: GOJEK_DARK,
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  badgesColumn: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 8,
  },
  badgesRowHorizontal: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 6,
  },
  badgeBlue: {
    backgroundColor: '#E3F2FD',
    borderWidth: 1,
    borderColor: '#BBDEFB',
  },
  badgeGreenOutline: {
    backgroundColor: GOJEK_GREEN_LIGHT,
    borderWidth: 1,
    borderColor: '#C8E6C9',
  },
  badgeGreenSolid: {
    backgroundColor: '#00D161',
  },
  badgeGreenLight: {
    backgroundColor: GOJEK_GREEN_LIGHT,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    paddingTop: 0,
  },
  summaryBox: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EEEEEE',
    alignItems: 'center',
    backgroundColor: '#FCFCFC',
  },
  summaryLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 4,
  },
  summaryLabel: {
    fontSize: 11,
    color: '#9E9E9E',
    fontWeight: '700',
  },
  summaryValue: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0A8852',
  },
  sectionCard: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  sectionIconBg: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: GOJEK_GREEN_LIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: GOJEK_DARK,
    marginLeft: 12,
    letterSpacing: 0.5,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8, // Compensate for item padding
  },
  gridItem: {
    width: '50%',
    paddingHorizontal: 8,
    marginBottom: 16,
  },
  fullWidthItem: {
    marginBottom: 16,
  },
  infoLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 6,
  },
  infoLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#9E9E9E',
    textTransform: 'uppercase',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '700',
    color: GOJEK_DARK,
    marginTop: 2,
    lineHeight: 20,
  },
});

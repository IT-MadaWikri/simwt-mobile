import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import Icon from '../../../../src/components/common/Icon';
import Button from '../../../../src/components/common/Button';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { karyawanService, Employee } from '../../../../src/services/karyawanService';
import Colors, { brand, slate } from '../../../../constants/Colors';
import Spacing from '../../../../constants/Spacing';
import { fonts, judulAppBar } from '../../../../constants/Typography';
import AppBar from '../../../../src/components/common/AppBar';
import { SkeletonDetail } from '../../../../src/components/common/Skeleton';

// Gojek-style primary colors
const GOJEK_GREEN = brand[600];
const GOJEK_GREEN_LIGHT = brand[50];
const GOJEK_DARK = Colors.textPrimary;
const GOJEK_GREY = Colors.textSecondary;
const GOJEK_BG = Colors.background;

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
      <View style={styles.container}>
        <SkeletonDetail avatar="bulat" />
      </View>
    );
  }

  if (!employee) {
    return (
      <View style={[styles.container, styles.centerContainer]}>
        <Icon name="account-off-outline" size={48} color={GOJEK_GREY} />
        <Text style={styles.errorText}>Data karyawan tidak ditemukan</Text>
        <Button label="Kembali" onPress={() => router.back()} style={{ marginTop: Spacing.xl }} />
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
      <AppBar judul={'Detail Karyawan'} />

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
                    <Icon name="card-account-details-outline" size={12} color={brand[700]} />
                    <Text style={[styles.badgeText, { color: brand[700] }]}>{employee.nik}</Text>
                  </View>
                )}
                <View style={styles.badgesRowHorizontal}>
                  <View style={[styles.badge, styles.badgeGreenOutline]}>
                    <Icon name="account-tie-outline" size={12} color={GOJEK_GREEN} />
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
                <Icon name="briefcase-outline" size={14} color={Colors.textTertiary} />
                <Text style={styles.summaryLabel}>MASA KERJA</Text>
              </View>
              <Text style={styles.summaryValue}>{calculateMasaKerja(employee.tanggal_masuk_kerja)}</Text>
            </View>
            <View style={styles.summaryBox}>
              <View style={styles.summaryLabelRow}>
                <Icon name="cake-variant-outline" size={14} color={Colors.textTertiary} />
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
              <Icon name="account-outline" size={20} color={GOJEK_GREEN} />
            </View>
            <Text style={styles.sectionTitle}>INFORMASI PRIBADI</Text>
            <View style={{ flex: 1 }} />
            <Icon name="dots-horizontal" size={24} color={GOJEK_GREEN} />
          </View>
          
          <View style={styles.gridContainer}>
            <View style={styles.gridItem}>
              <View style={styles.infoLabelRow}>
                <Icon name="card-account-details-outline" size={16} color={GOJEK_GREEN} />
                <Text style={styles.infoLabel}>NIK</Text>
              </View>
              <Text style={styles.infoValue}>{employee.nik || '-'}</Text>
            </View>
            <View style={styles.gridItem}>
              <View style={styles.infoLabelRow}>
                <Icon name="account-details-outline" size={16} color={GOJEK_GREEN} />
                <Text style={styles.infoLabel}>NAMA LENGKAP</Text>
              </View>
              <Text style={styles.infoValue}>{fullName}</Text>
            </View>
            <View style={styles.gridItem}>
              <View style={styles.infoLabelRow}>
                <Icon name="calendar-blank-outline" size={16} color={GOJEK_GREEN} />
                <Text style={styles.infoLabel}>TANGGAL LAHIR</Text>
              </View>
              <Text style={styles.infoValue}>{formatDate(employee.tanggal_lahir)}</Text>
            </View>
            <View style={styles.gridItem}>
              <View style={styles.infoLabelRow}>
                <Icon name="map-marker-outline" size={16} color={GOJEK_GREEN} />
                <Text style={styles.infoLabel}>TEMPAT LAHIR</Text>
              </View>
              <Text style={styles.infoValue}>{employee.tempat_lahir || '-'}</Text>
            </View>
          </View>

          <View style={styles.fullWidthItem}>
            <View style={styles.infoLabelRow}>
              <Icon name="home-outline" size={16} color={GOJEK_GREEN} />
              <Text style={styles.infoLabel}>ALAMAT DOMISILI</Text>
            </View>
            <Text style={styles.infoValue}>{employee.alamat || '-'}</Text>
          </View>
        </View>

        {/* Informasi Kepegawaian */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIconBg}>
              <Icon name="briefcase-outline" size={20} color={GOJEK_GREEN} />
            </View>
            <Text style={styles.sectionTitle}>INFORMASI KEPEGAWAIAN</Text>
            <View style={{ flex: 1 }} />
            <Icon name="dots-horizontal" size={24} color={GOJEK_GREEN} />
          </View>
          
          <View style={styles.gridContainer}>
            <View style={styles.gridItem}>
              <View style={styles.infoLabelRow}>
                <Icon name="account-tie-outline" size={16} color={GOJEK_GREEN} />
                <Text style={styles.infoLabel}>JABATAN</Text>
              </View>
              <Text style={styles.infoValue}>{roleName || '-'}</Text>
            </View>
            <View style={styles.gridItem}>
              <View style={styles.infoLabelRow}>
                <Icon name="calendar-check-outline" size={16} color={GOJEK_GREEN} />
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
              <Icon name="check-circle-outline" size={20} color={GOJEK_GREEN} />
            </View>
            <Text style={styles.sectionTitle}>STATUS KEAKTIFAN</Text>
            <View style={{ flex: 1 }} />
            <Icon name="dots-horizontal" size={24} color={GOJEK_GREEN} />
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
    fontSize: 12,
    color: GOJEK_GREY,
  },
  errorText: {
    marginTop: Spacing.md,
    fontSize: 12,
    color: GOJEK_GREY,
    fontFamily: fonts.semibold,
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
    fontSize: 12,
    fontFamily: fonts.bold,
    color: GOJEK_DARK,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  profileCard: {
    backgroundColor: Colors.white,
    borderRadius: Spacing.radius.xl,
    ...Spacing.curve,
    padding: 20,
    marginBottom: 20,
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
    backgroundColor: brand[600],
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
    fontSize: 12,
    fontFamily: fonts.bold,
  },
  profileInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  profileName: {
    fontSize: 12,
    fontFamily: fonts.extrabold,
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
    borderRadius: Spacing.radius.full,
    gap: 6,
  },
  badgeBlue: {
    backgroundColor: brand[50],
    borderWidth: 1,
    borderColor: brand[100],
  },
  badgeGreenOutline: {
    backgroundColor: GOJEK_GREEN_LIGHT,
    borderWidth: 1,
    borderColor: brand[100],
  },
  badgeGreenSolid: {
    backgroundColor: '#00D161',
  },
  badgeGreenLight: {
    backgroundColor: GOJEK_GREEN_LIGHT,
  },
  badgeText: {
    fontSize: 10,
    fontFamily: fonts.bold,
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
    borderRadius: Spacing.radius.md,
    ...Spacing.curve,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
    alignItems: 'center',
    backgroundColor: slate[50],
  },
  summaryLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 4,
  },
  summaryLabel: {
    fontSize: 12,
    color: Colors.textTertiary,
    fontFamily: fonts.bold,
  },
  summaryValue: {
    fontSize: 12,
    fontFamily: fonts.extrabold,
    color: brand[600],
  },
  sectionCard: {
    backgroundColor: Colors.white,
    borderRadius: Spacing.radius.xl,
    ...Spacing.curve,
    padding: 20,
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: slate[50],
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
    fontSize: 12,
    fontFamily: fonts.extrabold,
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
    fontSize: 12,
    fontFamily: fonts.bold,
    color: Colors.textTertiary,
    textTransform: 'uppercase',
  },
  infoValue: {
    fontSize: 12,
    fontFamily: fonts.bold,
    color: GOJEK_DARK,
    marginTop: 2,
    lineHeight: 20,
  },
});

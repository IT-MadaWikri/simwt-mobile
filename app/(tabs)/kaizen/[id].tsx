import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  ActivityIndicator,
  Image,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '../../../constants/Colors';
import Spacing from '../../../constants/Spacing';
import { kaizenService } from '../../../src/services/kaizenService';
import { KaizenDetail } from '../../../src/types/kaizen';
import { useAuth } from '../../../src/contexts/AuthContext';

export default function KaizenDetailScreen() {
  const { user } = useAuth();
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const [data, setData] = useState<KaizenDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchDetail();
    }
  }, [id]);

  const fetchDetail = async () => {
    try {
      setLoading(true);
      const detailData = await kaizenService.getDetail(Number(id));
      setData(detailData);
    } catch (error) {
      console.error('Error fetching kaizen detail:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch(status?.toUpperCase()) {
      case 'DISETUJUI': return Colors.success;
      case 'DITOLAK': return Colors.danger;
      case 'DITERIMA': return '#FF9800';
      default: return Colors.textSecondary;
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        {/* Gojek style simple loader instead of big indicator */}
        <ActivityIndicator size="small" color={Colors.primary} />
        <Text style={{marginTop: 12, color: Colors.textSecondary, fontWeight: '500'}}>Menarik data kaizen...</Text>
      </View>
    );
  }

  if (!data || !data.kaizen) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Detail kaizen tidak ditemukan.</Text>
      </View>
    );
  }

  const { kaizen, manfaats, kategoriNilai, totalKategoriNilai, nilaiPanitia, nilaiFinal } = data;

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + Spacing.xxxl }]} showsVerticalScrollIndicator={false}>
        
        {/* Main Info Card */}
        <View style={styles.mainCard}>
          <View style={styles.headerRow}>
            <View style={[styles.badge, { backgroundColor: getStatusColor(kaizen.status) + '15' }]}>
              <View style={[styles.badgeDot, { backgroundColor: getStatusColor(kaizen.status) }]} />
              <Text style={[styles.badgeText, { color: getStatusColor(kaizen.status) }]}>{kaizen.status}</Text>
            </View>
            <Text style={styles.dateText}>
              {new Date(kaizen.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
            </Text>
          </View>
          <Text style={styles.title}>{kaizen.tema || 'Tanpa Tema'}</Text>
          
          <View style={styles.profileBox}>
            <View style={styles.profileAvatar}>
              <MaterialCommunityIcons name="account" size={24} color={Colors.primary} />
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{kaizen.nama_pelaksana}</Text>
              <Text style={styles.profileRole}>
                {kaizen.departemen?.nama || 
                 (kaizen as any).departemen?.nama_departemen ||
                 (kaizen as any).departemen_user?.nama || 
                 (kaizen as any).department?.nama || 
                 (kaizen as any).nama_departemen ||
                 'Unknown Department'}
              </Text>
            </View>
          </View>

          {kaizen.alasan ? (
            <View style={styles.alasanBox}>
              <MaterialCommunityIcons name="information" size={16} color={Colors.danger} style={{marginTop: 2}} />
              <View style={{marginLeft: 8, flex: 1}}>
                <Text style={styles.alasanTitle}>Catatan Penilai</Text>
                <Text style={styles.alasanText}>{kaizen.alasan}</Text>
              </View>
            </View>
          ) : null}
        </View>

        {/* Kondisi Before / After */}
        {(kaizen.detail_sebelum || kaizen.detail_sesudah || kaizen.foto_sebelum || kaizen.foto_sesudah) ? (
          <View style={styles.cardSection}>
            <Text style={styles.sectionTitleBold}>Kondisi Sebelum & Sesudah</Text>
            
            {/* Before */}
            <View style={styles.conditionBox}>
              <View style={styles.conditionHeader}>
                <View style={[styles.conditionDot, { backgroundColor: Colors.danger }]} />
                <Text style={styles.conditionLabel}>Sebelum</Text>
              </View>
              {typeof kaizen.foto_sebelum === 'string' && kaizen.foto_sebelum.length > 0 && (
                <Image 
                  source={{ uri: kaizen.foto_sebelum.startsWith('http') ? kaizen.foto_sebelum : `https://mwtpart.co.id/storage/${kaizen.foto_sebelum}` }} 
                  style={styles.conditionImage} 
                  resizeMode="cover" 
                />
              )}
              {kaizen.detail_sebelum ? (
                <Text style={styles.conditionText}>{kaizen.detail_sebelum}</Text>
              ) : null}
            </View>

            {/* After */}
            <View style={styles.conditionBox}>
              <View style={styles.conditionHeader}>
                <View style={[styles.conditionDot, { backgroundColor: Colors.success }]} />
                <Text style={styles.conditionLabel}>Sesudah</Text>
              </View>
              {typeof kaizen.foto_sesudah === 'string' && kaizen.foto_sesudah.length > 0 && (
                <Image 
                  source={{ uri: kaizen.foto_sesudah.startsWith('http') ? kaizen.foto_sesudah : `https://mwtpart.co.id/storage/${kaizen.foto_sesudah}` }} 
                  style={styles.conditionImage} 
                  resizeMode="cover" 
                />
              )}
              {kaizen.detail_sesudah ? (
                <Text style={styles.conditionText}>{kaizen.detail_sesudah}</Text>
              ) : null}
            </View>
          </View>
        ) : null}

        {/* Divider */}
        <View style={styles.divider} />

        {/* Manfaat List */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeaderRow}>
            <View style={styles.sectionIconBg}>
              <MaterialCommunityIcons name="lightbulb-on" size={18} color="#FF9800" />
            </View>
            <Text style={styles.sectionTitle}>Daftar Manfaat ({manfaats?.length || 0})</Text>
          </View>
          
          {manfaats?.map((manfaat: any, index: number) => (
            <View key={manfaat.id || index} style={styles.manfaatCard}>
              <View style={styles.manfaatHeader}>
                <View style={styles.manfaatIndexBadge}>
                  <Text style={styles.manfaatIndex}>{index + 1}</Text>
                </View>
                <Text style={styles.manfaatTitle}>{manfaat.judul || 'Manfaat'}</Text>
              </View>
              <Text style={styles.manfaatDesc}>{manfaat.keterangan || 'Tidak ada deskripsi'}</Text>
            </View>
          ))}
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Nilai PQCDSM */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeaderRow}>
            <View style={[styles.sectionIconBg, {backgroundColor: '#E8EAF6'}]}>
              <MaterialCommunityIcons name="chart-bar" size={18} color="#3F51B5" />
            </View>
            <Text style={styles.sectionTitle}>Penilaian Kategori (PQCDSM)</Text>
          </View>
          
          <View style={styles.pqcdsmContainer}>
            {kategoriNilai && Object.entries(kategoriNilai).map(([kategori, nilai]) => (
              <View key={kategori} style={styles.nilaiRow}>
                <Text style={styles.nilaiLabel}>{kategori}</Text>
                <Text style={styles.nilaiValue}>{nilai as number}</Text>
              </View>
            ))}
            <View style={[styles.nilaiRow, styles.nilaiTotalRow]}>
              <Text style={styles.nilaiTotalLabel}>Total Kategori</Text>
              <Text style={styles.nilaiTotalValue}>{totalKategoriNilai || 0}</Text>
            </View>
          </View>
        </View>

        {/* Nilai Final Gojek-Style Bottom Box */}
        {nilaiPanitia && (
          <View style={styles.finalScoreContainer}>
            <View style={styles.finalScoreInner}>
              <View style={{flex: 1}}>
                <Text style={styles.finalScoreTitle}>Skor Akhir Kaizen</Text>
                <Text style={styles.finalScoreDesc}>Gabungan panitia dan komite</Text>
              </View>
              <View style={styles.finalScoreCircle}>
                <Text style={styles.finalScoreNumber}>{nilaiFinal?.total_nilai || 0}</Text>
              </View>
            </View>
          </View>
        )}

        {/* Form Penilaian Komite (Hanya untuk Role Komite/Superadmin) */}
        {user?.role && ['super_admin', 'Superadmin', 'SuperAdmin', 'komite', 'Komite'].includes(user.role) && (
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeaderRow}>
              <View style={[styles.sectionIconBg, {backgroundColor: '#E8F5E9'}]}>
                <MaterialCommunityIcons name="clipboard-check-outline" size={18} color="#4CAF50" />
              </View>
              <Text style={styles.sectionTitle}>Penilaian Komite</Text>
            </View>
            
            <View style={styles.komiteFormContainer}>
              <Text style={styles.komiteFormDesc}>
                Silakan berikan penilaian berdasarkan kreativitas, inovasi, dan efisiensi dari kaizen ini.
              </Text>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Kreativitas & Inovasi Ide (1-10)</Text>
                <TextInput style={styles.input} placeholder="Masukkan nilai" keyboardType="numeric" />
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Manfaat Produktivitas & Efisiensi (1-10)</Text>
                <TextInput style={styles.input} placeholder="Masukkan nilai" keyboardType="numeric" />
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Upaya & Kesulitan (1-10)</Text>
                <TextInput style={styles.input} placeholder="Masukkan nilai" keyboardType="numeric" />
              </View>

              <TouchableOpacity style={styles.submitBtn} onPress={() => alert('Fitur Penilaian Komite sedang dikembangkan!')}>
                <Text style={styles.submitBtnText}>Simpan Penilaian</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F6F8',
  },
  scrollContent: {
    paddingBottom: Spacing.xxxl,
  },
  mainCard: {
    padding: Spacing.lg,
    paddingTop: Spacing.xl,
    backgroundColor: Colors.white,
  },
  divider: {
    height: 8,
    backgroundColor: '#F5F6F8',
    width: '100%',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  badgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '800',
  },
  dateText: {
    fontSize: 13,
    color: Colors.textTertiary,
    fontWeight: '500',
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.textPrimary,
    lineHeight: 30,
    letterSpacing: -0.5,
    marginBottom: Spacing.lg,
  },
  profileBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    padding: Spacing.md,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  profileAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  profileRole: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  cardSection: {
    padding: Spacing.lg,
    backgroundColor: Colors.white,
  },
  sectionTitleBold: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  conditionBox: {
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  conditionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  conditionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  conditionLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  conditionImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: Spacing.sm,
    backgroundColor: '#EAEAEA',
  },
  conditionText: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  alasanBox: {
    flexDirection: 'row',
    marginTop: Spacing.lg,
    padding: Spacing.md,
    backgroundColor: '#FFF5F5',
    borderRadius: 16,
  },
  alasanTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.danger,
    marginBottom: 4,
  },
  alasanText: {
    fontSize: 14,
    color: Colors.danger,
    lineHeight: 20,
    opacity: 0.9,
  },
  sectionContainer: {
    padding: Spacing.lg,
    backgroundColor: Colors.white,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  sectionIconBg: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#FFF3E0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.sm,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  manfaatCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  manfaatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  manfaatIndexBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#F5F6F8',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.sm,
  },
  manfaatIndex: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.textSecondary,
  },
  manfaatTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  manfaatDesc: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 22,
    marginLeft: 32, // align with text
  },
  pqcdsmContainer: {
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  nilaiRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#EAEAEC',
  },
  nilaiLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  nilaiValue: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  nilaiTotalRow: {
    borderBottomWidth: 0,
    backgroundColor: '#E8EAF6',
    borderRadius: 8,
    marginTop: 8,
    paddingVertical: 12,
  },
  nilaiTotalLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: '#3F51B5',
  },
  nilaiTotalValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#3F51B5',
  },
  finalScoreContainer: {
    padding: Spacing.lg,
    backgroundColor: Colors.white,
  },
  finalScoreInner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary + '15',
    padding: Spacing.lg,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.primary + '30',
  },
  finalScoreTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.primary,
    marginBottom: 4,
  },
  finalScoreDesc: {
    fontSize: 13,
    color: Colors.primary,
    opacity: 0.8,
  },
  finalScoreCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  finalScoreNumber: {
    fontSize: 24,
    fontWeight: '800',
    color: '#00AA13', // Gojek green text for the final score
  },
  komiteFormContainer: {
    marginTop: Spacing.sm,
  },
  komiteFormDesc: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
    lineHeight: 18,
  },
  inputGroup: {
    marginBottom: Spacing.md,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#EAEAEC',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: Colors.textPrimary,
    backgroundColor: '#FAFAFA',
  },
  submitBtn: {
    backgroundColor: '#00AA13',
    paddingVertical: 12,
    borderRadius: 24,
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  submitBtnText: {
    color: Colors.white,
    fontWeight: '800',
    fontSize: 14,
  },
  errorText: {
    color: Colors.textSecondary,
    fontSize: 15,
  },
});

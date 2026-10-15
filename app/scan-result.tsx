import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Icon from '../src/components/common/Icon';
import Colors from '../constants/Colors';
import Spacing from '../constants/Spacing';
import api from '../src/services/api';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { fonts } from '../constants/Typography';
import { dialog } from '../src/components/common/AppDialog';
import { SkeletonDetail } from '../src/components/common/Skeleton';

// API base dari konfig yang diminta user
const API_URL = 'https://api.mwtpart.co.id/api';

export default function ScanResultScreen() {
  const { nomor } = useLocalSearchParams<{ nomor: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (nomor) {
      fetchAssetData(nomor);
    } else {
      setError('Nomor aset tidak ditemukan.');
      setLoading(false);
    }
  }, [nomor]);

  const fetchAssetData = async (assetNumber: string) => {
    try {
      setLoading(true);
      setError('');
      // Memanggil API production dengan authenticated api client
      const response = await api.get(`/aset/${assetNumber}/scan`);
      if (response.data && response.data.dataAsset) {
        setData(response.data);
      } else {
        setError('Data aset tidak ditemukan.');
      }
    } catch (err: any) {
      console.error('Scan Error:', err.message);
      setError('Gagal mengambil data aset dari server.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
  };

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.background }}>
        <SkeletonDetail />
      </View>
    );
  }

  if (error || !data) {
    return (
      <View style={styles.centerContainer}>
        <Icon name="alert-circle-outline" size={60} color={Colors.danger} />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Kembali</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const { dataAsset, umurAset } = data;

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Title & Image Section */}
        <View style={styles.card}>
          <Text style={styles.mainTitle}>{dataAsset?.asset_name || '-'}</Text>
          <View style={styles.divider} />
          
          <View style={styles.imagePlaceholder}>
            {dataAsset?.aset_gambar && dataAsset.aset_gambar.length > 0 ? (
               <Text style={styles.placeholderText}>Ada {dataAsset.aset_gambar.length} gambar</Text>
            ) : (
               <Text style={styles.placeholderText}>Tidak ada gambar</Text>
            )}
          </View>
        </View>

        {/* Details Grid */}
        <View style={styles.card}>
          <View style={styles.gridContainer}>
            <View style={styles.gridColumn}>
              <View style={styles.gridItem}>
                <Text style={styles.itemLabel}>NOMOR ASET :</Text>
                <Text style={styles.itemValue}>{dataAsset?.asset_number || '-'}</Text>
              </View>
              <View style={styles.gridItem}>
                <Text style={styles.itemLabel}>ALIAS ASET :</Text>
                <Text style={styles.itemValue}>{dataAsset?.asset_alias || '-'}</Text>
              </View>
              <View style={styles.gridItem}>
                <Text style={styles.itemLabel}>MODEL ASET :</Text>
                <Text style={styles.itemValue}>{dataAsset?.asset_model || '-'}</Text>
              </View>
              <View style={styles.gridItem}>
                <Text style={styles.itemLabel}>STATUS PENGGUNAAN :</Text>
                <Text style={styles.itemValue}>{dataAsset?.asset_use || '-'}</Text>
              </View>
              <View style={styles.gridItem}>
                <Text style={styles.itemLabel}>KATEGORI :</Text>
                <Text style={styles.itemValue}>{dataAsset?.aset_kategori?.asset_category_name || '-'}</Text>
              </View>
              <View style={styles.gridItem}>
                <Text style={styles.itemLabel}>PLANT :</Text>
                <Text style={styles.itemValue}>{dataAsset?.plant?.nama || '-'}</Text>
              </View>
              <View style={styles.gridItem}>
                <Text style={styles.itemLabel}>USIA ASET :</Text>
                <Text style={styles.itemValue}>{umurAset || '-'}</Text>
              </View>
              <View style={styles.gridItem}>
                <Text style={styles.itemLabel}>DIUPDATE PADA :</Text>
                <Text style={styles.itemValue}>{formatDate(dataAsset?.updated_at)}</Text>
              </View>
            </View>

            <View style={styles.gridColumn}>
              <View style={styles.gridItem}>
                <Text style={styles.itemLabel}>NAMA ASET :</Text>
                <Text style={styles.itemValue}>{dataAsset?.asset_name || '-'}</Text>
              </View>
              <View style={styles.gridItem}>
                <Text style={styles.itemLabel}>MEREK ASET :</Text>
                <Text style={styles.itemValue}>{dataAsset?.asset_brand || '-'}</Text>
              </View>
              <View style={styles.gridItem}>
                <Text style={styles.itemLabel}>NOMOR SERI :</Text>
                <Text style={styles.itemValue}>{dataAsset?.asset_serial_number || '-'}</Text>
              </View>
              <View style={styles.gridItem}>
                <Text style={styles.itemLabel}>KONDISI :</Text>
                <Text style={styles.itemValue}>{dataAsset?.asset_condition || '-'}</Text>
              </View>
              <View style={styles.gridItem}>
                <Text style={styles.itemLabel}>DEPARTMENT PEMILIK :</Text>
                <Text style={styles.itemValue}>{dataAsset?.departemen_user?.nama || dataAsset?.departemen?.nama || '-'}</Text>
              </View>
              <View style={styles.gridItem}>
                <Text style={styles.itemLabel}>TANGGAL PEMBELIAN :</Text>
                <Text style={styles.itemValue}>{formatDate(dataAsset?.asset_purchase_date)}</Text>
              </View>
              <View style={styles.gridItem}>
                <Text style={styles.itemLabel}>DITAMBAHKAN PADA :</Text>
                <Text style={styles.itemValue}>{formatDate(dataAsset?.created_at)}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* History Section */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Riwayat perbaikan</Text>
          <View style={styles.divider} />
          
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderText, {flex: 2}]}>MASALAH</Text>
            <Text style={[styles.tableHeaderText, {flex: 1}]}>STATUS PERBAIKAN</Text>
          </View>
          
          {dataAsset?.tiket && dataAsset.tiket.length > 0 ? (
            dataAsset.tiket.map((t: any, idx: number) => (
              <View key={idx} style={styles.tableRow}>
                <Text style={[styles.tableCell, {flex: 2}]}>{t.judul || t.masalah || '-'}</Text>
                <Text style={[styles.tableCell, {flex: 1}]}>{t.status || 'OK'}</Text>
              </View>
            ))
          ) : (
            <View style={styles.tableRow}>
              <Text style={styles.tableCell}>Tidak ada riwayat perbaikan.</Text>
            </View>
          )}
        </View>

      </ScrollView>
      
      {/* Bottom Action */}
      <View style={[styles.bottomContainer, { paddingBottom: insets.bottom + Spacing.lg }]}>
        <TouchableOpacity 
          style={styles.primaryButton}
          onPress={() => dialog.alert('Lapor Masalah', 'Fitur ini akan membuka form pelaporan tiket.')}
        >
          <Text style={styles.primaryButtonText}>Laporkan masalah aset</Text>
        </TouchableOpacity>
      </View>
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
    padding: Spacing.xl,
  },
  loadingText: {
    marginTop: Spacing.md,
    fontSize: 16,
    color: Colors.textSecondary,
    fontFamily: fonts.medium,
  },
  errorText: {
    marginTop: Spacing.md,
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
  backButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: Spacing.radius.full,
  },
  backButtonText: {
    color: Colors.white,
    fontFamily: fonts.bold,
  },
  scrollContent: {
    padding: Spacing.md,
    paddingBottom: 100, // Ruang untuk tombol bawah
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: Spacing.radius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
  },
  mainTitle: {
    fontSize: 18,
    fontFamily: fonts.semibold,
    color: Colors.textPrimary,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.borderSubtle,
    marginVertical: Spacing.md,
  },
  imagePlaceholder: {
    paddingVertical: Spacing.xl,
  },
  placeholderText: {
    fontSize: 16,
    color: Colors.textTertiary,
  },
  gridContainer: {
    flexDirection: 'row',
  },
  gridColumn: {
    flex: 1,
    paddingRight: Spacing.sm,
  },
  gridItem: {
    marginBottom: Spacing.md,
  },
  itemLabel: {
    fontSize: 11,
    fontFamily: fonts.bold,
    color: Colors.textSecondary,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  itemValue: {
    fontSize: 15,
    color: Colors.textPrimary,
    fontFamily: fonts.regular,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: fonts.semibold,
    color: Colors.textPrimary,
  },
  tableHeader: {
    flexDirection: 'row',
    paddingBottom: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderSubtle,
  },
  tableHeaderText: {
    fontSize: 11,
    fontFamily: fonts.bold,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderSubtle,
  },
  tableCell: {
    fontSize: 15,
    color: Colors.textPrimary,
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.white,
    padding: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.borderSubtle,
  },
  primaryButton: {
    backgroundColor: '#0056B3', // Warna biru sesuai gambar user
    paddingVertical: 14,
    borderRadius: Spacing.radius.full,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: Colors.white,
    fontFamily: fonts.semibold,
    fontSize: 16,
  },
});

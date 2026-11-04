import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TextInput, TouchableOpacity } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import Icon from '../../../src/components/common/Icon';
import Lencana from '../../../src/components/common/Lencana';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors, { brand, lencana, slate } from '../../../constants/Colors';
import Spacing from '../../../constants/Spacing';
import { Employee, karyawanService } from '../../../src/services/karyawanService';
import { fonts, judulAppBar, ukuranIsi } from '../../../constants/Typography';
import AppBar from '../../../src/components/common/AppBar';
import KeadaanKosong from '../../../src/components/common/KeadaanKosong';
import { inputReset } from '../../../constants/GlobalStyles';
import { SkeletonDaftar } from '../../../src/components/common/Skeleton';

export default function HumanCapitalScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState('');
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const data = await karyawanService.getAllEmployees();
      setEmployees(data);
    } catch (error) {
      console.error('Failed to fetch employees', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredEmployees = employees.filter((emp) =>
    emp.nama_lengkap?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    emp.nik?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (typeof emp.jabatan === 'string' ? emp.jabatan.toLowerCase() : emp.jabatan?.nama?.toLowerCase())?.includes(searchQuery.toLowerCase())
  );

  const getJobTitle = (emp: Employee) => {
    if (typeof emp.jabatan === 'string') return emp.jabatan;
    if (emp.jabatan?.nama) return emp.jabatan.nama;
    return 'Posisi Tidak Diketahui';
  };

  const getDepartment = (emp: Employee) => {
    return emp.departemen?.nama || 'Departemen Tidak Diketahui';
  };

  const renderEmployee = ({ item }: { item: Employee }) => (
    <TouchableOpacity 
      style={styles.card} 
      onPress={() => router.push(`/services/hc/karyawan/${item.id}`)}
      activeOpacity={0.7}
    >
      {item.foto_profil ? (
        <Image
          source={{ uri: item.foto_profil.startsWith('http') ? item.foto_profil : `https://mwtpart.co.id/storage/${item.foto_profil}` }}
          style={styles.avatar}
        />
      ) : (
        <View style={styles.avatarFallback}>
          <Text style={styles.avatarInitial}>
            {item.nama_lengkap ? item.nama_lengkap.charAt(0).toUpperCase() : '?'}
          </Text>
        </View>
      )}
      
      <View style={styles.cardContent}>
        <Text style={styles.nameText} numberOfLines={1}>
          {item.nama_lengkap}
        </Text>
        <Text style={styles.roleText} numberOfLines={1}>
          {getJobTitle(item)}
        </Text>
        
        <View style={styles.badgesContainer}>
          {item.nik && (
            <Lencana label={item.nik} ikon="badge-account-horizontal-outline" warna={lencana.hijau} />
          )}
          <Lencana label={getDepartment(item)} ikon="domain" warna={lencana.ungu} maxLebar={120} />
        </View>
      </View>
      
      {/* Active Indicator */}
      {(item.status_karyawan === 'Aktif' || !item.status_karyawan) && (
         <View style={styles.activeDot} />
      )}
    </TouchableOpacity>
  );

  return (
    <>
      <AppBar judul={'Data Karyawan'} />
      <View style={styles.container}>
        <View style={styles.searchHeader}>
          <View style={styles.searchBar}>
            <Icon name="magnify" size={24} color={Colors.textTertiary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Cari nama, NIK, atau jabatan..."
              placeholderTextColor={Colors.placeholder}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Icon name="close-circle" size={20} color={Colors.textTertiary} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {loading ? (
          <SkeletonDaftar avatar="bulat" />
        ) : (
          <FlatList
            data={filteredEmployees}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderEmployee}
            contentContainerStyle={[styles.listContainer, { paddingBottom: insets.bottom + Spacing.xxl }]}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <KeadaanKosong pose="mikir" judul="Tidak Ditemukan" teks="Tidak ada karyawan yang cocok dengan pencarian Anda." />
            }
          />
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  searchHeader: {
    backgroundColor: Colors.white,
    paddingHorizontal: Spacing.screenPadding,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: slate[50],
    borderRadius: Spacing.radius.full,
    paddingHorizontal: Spacing.md,
    height: 44,
  },
  searchInput: {
    flex: 1,
    marginLeft: Spacing.sm,
    fontSize: ukuranIsi,
    color: Colors.textPrimary,
    ...inputReset,
  },
  listContainer: {
    padding: Spacing.screenPadding,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderRadius: Spacing.radius.md,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    alignItems: 'center',
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  avatarFallback: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#7e22ce',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitial: {
    color: Colors.white,
    fontSize: ukuranIsi,
    fontFamily: fonts.bold,
  },
  cardContent: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  nameText: {
    fontSize: ukuranIsi,
    fontFamily: fonts.bold,
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  roleText: {
    fontSize: ukuranIsi,
    color: Colors.textSecondary,
    marginBottom: 6,
  },
  badgesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  activeDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: brand[600], // Gojek Green
    borderWidth: 2,
    borderColor: Colors.white,
    position: 'absolute',
    top: Spacing.lg,
    left: Spacing.lg + 42, // Avatar width (56) + left padding - dot radius
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: Spacing.md,
    color: Colors.textSecondary,
    fontSize: ukuranIsi,
  },
});

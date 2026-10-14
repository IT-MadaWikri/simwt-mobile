import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TextInput, TouchableOpacity } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors, { brand, slate } from '../../../constants/Colors';
import Spacing from '../../../constants/Spacing';
import { Employee, karyawanService } from '../../../src/services/karyawanService';
import { fonts } from '../../../constants/Typography';
import LoadingSpinner from '../../../src/components/common/LoadingSpinner';
import { inputReset } from '../../../constants/GlobalStyles';

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
            <View style={[styles.badge, { backgroundColor: brand[50] }]}>
              <MaterialCommunityIcons name="badge-account-horizontal-outline" size={12} color={brand[700]} />
              <Text style={[styles.badgeText, { color: brand[700] }]}>{item.nik}</Text>
            </View>
          )}
          <View style={[styles.badge, { backgroundColor: Colors.servicePurple }]}>
            <MaterialCommunityIcons name="domain" size={12} color="#7e22ce" />
            <Text style={[styles.badgeText, { color: '#7e22ce' }]} numberOfLines={1}>
              {getDepartment(item)}
            </Text>
          </View>
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
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: 'Data Karyawan',
          headerStyle: { backgroundColor: Colors.white },
          headerTintColor: Colors.textPrimary,
          headerShadowVisible: false,
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={{ marginLeft: 8, padding: 8 }}>
              <MaterialCommunityIcons name="arrow-left" size={24} color={Colors.textPrimary} />
            </TouchableOpacity>
          ),
        }}
      />
      <View style={styles.container}>
        <View style={styles.searchHeader}>
          <View style={styles.searchBar}>
            <MaterialCommunityIcons name="magnify" size={24} color={Colors.textTertiary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Cari nama, NIK, atau jabatan..."
              placeholderTextColor={Colors.placeholder}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <MaterialCommunityIcons name="close-circle" size={20} color={Colors.textTertiary} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {loading ? (
          <View style={styles.centerContainer}>
            <LoadingSpinner message="Memuat Direktori Karyawan..." />
          </View>
        ) : (
          <FlatList
            data={filteredEmployees}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderEmployee}
            contentContainerStyle={[styles.listContainer, { paddingBottom: insets.bottom + Spacing.xxl }]}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <MaterialCommunityIcons name="account-search-outline" size={64} color={Colors.textTertiary} />
                <Text style={styles.emptyTitle}>Tidak Ditemukan</Text>
                <Text style={styles.emptySubtitle}>Tidak ada karyawan yang cocok dengan pencarian Anda.</Text>
              </View>
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
    fontSize: 15,
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
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
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
    fontSize: 24,
    fontFamily: fonts.bold,
  },
  cardContent: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  nameText: {
    fontSize: 16,
    fontFamily: fonts.bold,
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  roleText: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 6,
  },
  badgesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Spacing.radius.sm,
    gap: 4,
  },
  badgeText: {
    fontSize: 10,
    fontFamily: fonts.semibold,
    maxWidth: 120, // To prevent super long department names from overflowing
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
    fontSize: 14,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: Spacing.xxxl,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: fonts.bold,
    color: Colors.textPrimary,
    marginTop: Spacing.md,
  },
  emptySubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: Spacing.sm,
    paddingHorizontal: Spacing.xl,
  },
});

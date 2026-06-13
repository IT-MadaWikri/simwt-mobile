import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  TextInput,
  ActivityIndicator
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '../../../constants/Colors';
import Spacing from '../../../constants/Spacing';
import { kaizenService } from '../../../src/services/kaizenService';

export default function KaizenList() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [kaizens, setKaizens] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [status, setStatus] = useState('Status');
  const [urutkan, setUrutkan] = useState('A-Z');
  const [bulanTahun, setBulanTahun] = useState('');

  useEffect(() => {
    // Add debounce for search query
    const delayDebounceFn = setTimeout(() => {
      fetchData();
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, status, urutkan, bulanTahun]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const filters = {
        search: searchQuery,
        status: status !== 'Status' ? status : undefined,
        urutkan: urutkan,
        bulan_tahun: bulanTahun
      };
      const responseData = await kaizenService.getList(filters);
      
      // Assume paginated data or array
      setKaizens(responseData.data || responseData || []);
    } catch (error) {
      console.error("Error fetching kaizen list:", error);
      // Fallback
      setKaizens([]);
    } finally {
      setLoading(false);
    }
  };

  const renderFilterDropdown = (label: string, value: string) => (
    <TouchableOpacity style={styles.filterDropdown}>
      <Text style={styles.filterDropdownText}>{value}</Text>
      <MaterialCommunityIcons name="chevron-down" size={18} color={Colors.textSecondary} />
    </TouchableOpacity>
  );

  const renderKaizenCard = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={styles.card}
      activeOpacity={0.8}
      onPress={() => router.push(`/kaizen/${item.id}`)}
    >
      {/* Green left border */}
      <View style={styles.cardBorderLeft} />
      
      <View style={styles.cardContent}>
        {/* Top Row: Nomor & Status */}
        <View style={styles.cardRow}>
          <View>
            <Text style={styles.label}>NOMOR</Text>
            <Text style={styles.nomorText}>{item.nomor || 'No Nomor'}</Text>
          </View>
          <View style={styles.statusBadge}>
            <MaterialCommunityIcons name="check" size={14} color="#16A34A" />
            <Text style={styles.statusText}>{item.status}</Text>
          </View>
        </View>

        {/* Row 2: Plant & Departemen */}
        <View style={[styles.cardRow, { marginTop: Spacing.md }]}>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>PLANT</Text>
            <Text style={styles.valueText}>{item.plant_id?.nama || 'Plant 1'}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>DEPARTEMEN</Text>
            <Text style={styles.valueText}>{item.departemen_user?.nama || item.nama_departemen || 'Unknown'}</Text>
          </View>
        </View>

        {/* Row 3: Pelaksana & Saran Dari */}
        <View style={[styles.cardRow, { marginTop: Spacing.md }]}>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>PELAKSANA</Text>
            <Text style={styles.valueText}>{item.nama_pelaksana}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>SARAN DARI</Text>
            <Text style={styles.valueText}>{item.saran_dari || '-'}</Text>
          </View>
        </View>

        {/* Bottom Row: Tanggal */}
        <View style={[styles.cardRow, { marginTop: Spacing.md, borderTopWidth: 1, borderTopColor: '#F0F0F0', paddingTop: Spacing.sm }]}>
          <View>
            <Text style={styles.label}>TANGGAL SUBMIT</Text>
            <Text style={styles.valueText}>
              {new Date(item.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
            </Text>
          </View>
          <MaterialCommunityIcons name="dots-vertical" size={20} color={Colors.textTertiary} />
        </View>

      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header filter container */}
      <View style={styles.filterContainer}>
        <View style={styles.filterHeader}>
          <MaterialCommunityIcons name="filter-outline" size={18} color={Colors.textSecondary} />
          <Text style={styles.filterTitle}>FILTER & PENCARIAN</Text>
        </View>
        
        <View style={styles.filterRow}>
          <View style={styles.filterCol}>
            <Text style={styles.filterLabel}>Urutkan</Text>
            {renderFilterDropdown('Urutkan', urutkan)}
          </View>
          <View style={{ width: 8 }} />
          <View style={styles.filterCol}>
            <Text style={styles.filterLabel}>Status</Text>
            {renderFilterDropdown('Status', status)}
          </View>
          <View style={{ width: 8 }} />
          <View style={styles.filterCol}>
            <Text style={styles.filterLabel}>Bulan/Tahun</Text>
            <TouchableOpacity style={styles.filterDropdown}>
              <Text style={styles.filterDropdownText}>---------- ----</Text>
              <MaterialCommunityIcons name="calendar" size={18} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.searchRow}>
          <Text style={styles.filterLabel}>Pelaksana</Text>
          <View style={styles.searchInputContainer}>
            <TextInput 
              style={styles.searchInput}
              placeholder="Cari berdasarkan pelaksana"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            <MaterialCommunityIcons name="magnify" size={20} color={Colors.textSecondary} style={styles.searchIcon} />
          </View>
        </View>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <FlatList
          data={kaizens}
          keyExtractor={(item, idx) => item.id ? item.id.toString() : idx.toString()}
          renderItem={renderKaizenCard}
          contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + Spacing.xxl }]}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F6F8',
  },
  filterContainer: {
    backgroundColor: Colors.white,
    padding: Spacing.lg,
    paddingTop: Spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: '#EAEAEC',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: Spacing.md,
  },
  filterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  filterTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.textSecondary,
    marginLeft: 6,
    letterSpacing: 0.5,
  },
  filterRow: {
    flexDirection: 'row',
    marginBottom: Spacing.md,
  },
  filterCol: {
    flex: 1,
  },
  filterLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  filterDropdown: {
    borderWidth: 1,
    borderColor: '#EAEAEC',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FAFAFA',
  },
  filterDropdownText: {
    fontSize: 12,
    color: Colors.textPrimary,
  },
  searchRow: {
    marginBottom: Spacing.xs,
  },
  searchInputContainer: {
    borderWidth: 1,
    borderColor: '#EAEAEC',
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
    paddingHorizontal: 10,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 8,
    fontSize: 13,
    color: Colors.textPrimary,
  },
  searchIcon: {
    marginLeft: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: Spacing.md,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    marginBottom: Spacing.md,
    flexDirection: 'row',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardBorderLeft: {
    width: 6,
    backgroundColor: '#16A34A', // Green border
  },
  cardContent: {
    flex: 1,
    padding: Spacing.md,
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  label: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.textTertiary,
    marginBottom: 4,
  },
  nomorText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#2563EB', // Blue link color
  },
  statusBadge: {
    backgroundColor: '#DCFCE7', // Light green bg
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    color: '#16A34A',
    fontWeight: '800',
    fontSize: 10,
    marginLeft: 4,
  },
  valueText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
    textTransform: 'uppercase',
  },
});

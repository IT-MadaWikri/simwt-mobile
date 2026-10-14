import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView,
  Image
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors, { brand } from '../../../constants/Colors';
import Spacing from '../../../constants/Spacing';
import { fonts } from '../../../constants/Typography';

export default function KaizenMenuScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const menuItems = [
    {
      id: 'dashboard',
      title: 'Dashboard',
      subtitle: 'Ringkasan & performa Kaizen',
      icon: 'view-dashboard-outline',
      color: brand[600], // Gojek Green
      route: '/kaizen/dashboard'
    },
    {
      id: 'buat',
      title: 'Buat Kaizen',
      subtitle: 'Ajukan ide Kaizen baru',
      icon: 'plus-circle-outline',
      color: Colors.danger, // Gojek Red (Goride)
      route: '/kaizen/buat'
    },
    {
      id: 'list',
      title: 'Daftar Kaizen',
      subtitle: 'Lihat semua riwayat Kaizen',
      icon: 'format-list-bulleted',
      color: '#00AED6', // Gojek Blue (Gocar)
      route: '/kaizen/list'
    },
    {
      id: 'poin',
      title: 'Riwayat Poin',
      subtitle: 'Cek poin & penukaran gift',
      icon: 'star-circle-outline',
      color: Colors.warning, // Warning/Orange
      route: '/kaizen/poin'
    }
  ];

  return (
    <View style={styles.container}>
      {/* Header Profile / Hero */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          {/* `router.push('/')` MENUMPUK beranda baru di atas tumpukan alih-alih
              mundur — riwayatnya jadi menggunung dan tombol kembali sistem
              terasa salah arah. Mundur satu langkah kalau ada riwayatnya. */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => (router.canGoBack() ? router.back() : router.replace('/(tabs)'))}
          >
            <MaterialCommunityIcons name="arrow-left" size={24} color={Colors.white} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { marginBottom: 0, marginLeft: 8 }]}>Kaizen Center</Text>
        </View>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.headerSubtitle}>Tingkatkan efisiensi, mulai dari hal kecil.</Text>

          </View>
          <View style={styles.headerIconBg}>
            <MaterialCommunityIcons name="lightbulb-on" size={32} color={Colors.white} />
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + Spacing.xxl }]} showsVerticalScrollIndicator={false}>
        <View style={styles.menuGrid}>
          {menuItems.map((item) => (
            <TouchableOpacity 
              key={item.id} 
              style={styles.menuCard}
              activeOpacity={0.8}
              onPress={() => router.push(item.route as any)}
            >
              <View style={[styles.iconContainer, { backgroundColor: item.color + '15' }]}>
                <MaterialCommunityIcons name={item.icon as any} size={28} color={item.color} />
              </View>
              <View style={styles.menuTextContainer}>
                <Text style={styles.menuTitle}>{item.title}</Text>
                <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={24} color={Colors.textTertiary} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Bantuan Section */}
        <TouchableOpacity style={styles.helpCard} activeOpacity={0.8}>
          <View style={styles.helpIconBg}>
            <MaterialCommunityIcons name="headset" size={24} color={brand[600]} />
          </View>
          <View style={styles.helpTextContainer}>
            <Text style={styles.helpTitle}>Pusat Bantuan Kaizen</Text>
            <Text style={styles.helpSubtitle}>Panduan pengisian & syarat penilaian</Text>
          </View>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background, // Gojek background style
  },
  header: {
    backgroundColor: brand[600], // Gojek Solid Green
    paddingTop: Spacing.xl * 1.5, // Account for status bar
    paddingBottom: Spacing.xl,
    paddingHorizontal: Spacing.lg,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  backButton: {
    padding: 4,
    marginLeft: -4,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.md,
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: fonts.extrabold,
    color: Colors.white,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    fontFamily: fonts.medium,
  },
  headerIconBg: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: Spacing.lg,
    paddingTop: Spacing.xl,
  },
  menuGrid: {
    marginBottom: Spacing.xl,
  },
  menuCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    padding: Spacing.lg,
    borderRadius: 16,
    marginBottom: Spacing.md,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  menuTextContainer: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontFamily: fonts.extrabold,
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  menuSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontFamily: fonts.medium,
  },
  helpCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: brand[50],
    padding: Spacing.lg,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: brand[100],
  },
  helpIconBg: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  helpTextContainer: {
    flex: 1,
  },
  helpTitle: {
    fontSize: 15,
    fontFamily: fonts.bold,
    color: brand[700],
    marginBottom: 2,
  },
  helpSubtitle: {
    fontSize: 12,
    color: '#4CAF50',
    fontFamily: fonts.semibold,
  },
});

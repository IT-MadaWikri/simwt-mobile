/**
 * Layanan Autentikasi
 * Mengelola proses login, logout, dan pengambilan profil.
 */
// File profile.tsx code block starts here:
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Colors from '../../constants/Colors';
import Spacing from '../../constants/Spacing';
import { useAuth } from '../../src/contexts/AuthContext';
import { authService } from '../../src/services/authService';

interface MenuItem {
  icon: string;
  label: string;
  subtitle?: string;
  color?: string;
  onPress?: () => void;
  danger?: boolean;
}

/**
 * Komponen ProfileScreen
 * Halaman utama untuk melihat informasi profil pengguna dan menu pengaturan.
 */
export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [loadingLogout, setLoadingLogout] = useState(false);

  /**
   * Menangani proses keluar (Logout)
   * Akan menampilkan konfirmasi terlebih dahulu sebelum memanggil API logout.
   */
  const handleLogout = () => {
    Alert.alert(
      'Keluar dari Aplikasi',
      'Apakah Anda yakin ingin keluar?',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Keluar',
          style: 'destructive',
          onPress: async () => {
            setLoadingLogout(true);
            try {
              await logout(); // Memanggil endpoint POST /logout via authService
              router.replace('/login');
            } catch (error) {
              Alert.alert('Error', 'Gagal keluar dari aplikasi.');
              setLoadingLogout(false);
            }
          },
        },
      ]
    );
  };

  const menuItems: MenuItem[][] = [
    [
      { 
        icon: 'shield-lock-outline', 
        label: 'Keamanan Akun', 
        subtitle: 'Password & Autentikasi',
        onPress: () => Alert.alert('Keamanan Akun', 'Fitur ganti password sedang dikembangkan.')
      },
      { 
        icon: 'bell-outline', 
        label: 'Pengaturan Notifikasi', 
        subtitle: 'Atur pemberitahuan',
        onPress: () => Alert.alert('Segera Hadir', 'Fitur pengaturan notifikasi sedang dalam pengembangan.')
      },
    ],
    [
      { 
        icon: 'translate', 
        label: 'Bahasa', 
        subtitle: 'Indonesia',
        onPress: () => Alert.alert('Bahasa', 'Pilihan bahasa saat ini hanya Bahasa Indonesia.')
      },
      { 
        icon: 'human-capacity-increase', 
        label: 'Aksesibilitas', 
        subtitle: 'Ukuran teks & tema',
        onPress: () => Alert.alert('Aksesibilitas', 'Pengaturan aksesibilitas sedang dalam pengembangan.')
      },
    ],
    [
      { 
        icon: 'information-outline', 
        label: 'Tentang Aplikasi', 
        subtitle: 'Versi 1.0.0 (SIMWT)',
        onPress: () => Alert.alert('SIMWT Mobile', 'Versi 1.0.0\nDikembangkan oleh IT Mada Wikri Tunggal.')
      },
      { 
        icon: 'help-circle-outline', 
        label: 'Pusat Bantuan', 
        subtitle: 'FAQ & Hubungi Kami',
        onPress: () => Alert.alert('Pusat Bantuan', 'Silakan hubungi tim IT (Ext. 123) untuk bantuan.')
      },
    ],
  ];

  return (
    <View style={styles.container}>
      {/* Background Hijau (Top Banner) */}
      <View style={styles.greenBanner} />

      <ScrollView 
        contentContainerStyle={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
      >
        {/* Floating Profile Card */}
        <TouchableOpacity 
          style={styles.profileCard} 
          activeOpacity={0.8}
          onPress={() => router.push('/(tabs)/edit-profile')}
        >
          <View style={styles.profileCardInner}>
            <View style={styles.avatarContainer}>
              {/* Gambar avatar dummy atau inisial jika tidak ada gambar */}
              <View style={styles.avatarPlaceholder}>
                <MaterialCommunityIcons name="account" size={40} color={Colors.white} />
              </View>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.name}>{user?.nama_lengkap || user?.name || user?.username || 'Pengguna'}</Text>
              <Text style={styles.emailText}>{user?.email || 'email@mwtpart.co.id'}</Text>
              <Text style={styles.phoneText}>{user?.phone || '+6281234567890'}</Text> 
            </View>
            <View style={styles.editIconBtn}>
              <MaterialCommunityIcons name="pencil" size={20} color={Colors.textSecondary} />
            </View>
          </View>
        </TouchableOpacity>

        {/* Menu Sections */}
        <View style={styles.menuContainer}>
          {menuItems.map((section, sectionIndex) => (
          <View key={sectionIndex} style={styles.menuSection}>
            {section.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.menuItem,
                  index === section.length - 1 && styles.lastMenuItem,
                ]}
                onPress={item.onPress || (() => {})}
                activeOpacity={0.7}
              >
                <View style={styles.menuIconBg}>
                  <MaterialCommunityIcons
                    name={item.icon as any}
                    size={22}
                    color={Colors.primary}
                  />
                </View>
                <View style={styles.menuContent}>
                  <Text style={styles.menuLabel}>{item.label}</Text>
                  {item.subtitle ? (
                    <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
                  ) : null}
                </View>
                <MaterialCommunityIcons name="chevron-right" size={22} color={Colors.textTertiary} />
              </TouchableOpacity>
            ))}
          </View>
        ))}

        {/* Tombol Logout Terpisah (Gojek Style Logout Button) */}
        <TouchableOpacity 
          style={styles.logoutButton} 
          activeOpacity={0.8}
          onPress={handleLogout}
          disabled={loadingLogout}
        >
          {loadingLogout ? (
            <ActivityIndicator color={Colors.danger} />
          ) : (
            <>
              <MaterialCommunityIcons name="logout" size={22} color={Colors.danger} />
              <Text style={styles.logoutText}>Keluar dari Aplikasi</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>SIMWT Mobile by IT Mada Wikri Tunggal</Text>
        <Text style={styles.footerText}>Versi 1.0.0</Text>
      </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F6F8', // Latar belakang abu muda khas Gojek
  },
  greenBanner: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 180, // Tinggi banner hijau
    backgroundColor: '#00AA13', // Hijau solid Gojek
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  scrollContent: {
    paddingTop: 80, // Jarak agar card turun sedikit
    paddingBottom: Spacing.xxxl * 2,
  },
  profileCard: {
    marginHorizontal: Spacing.lg,
    backgroundColor: Colors.white,
    borderRadius: 24,
    padding: Spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 6,
    marginBottom: Spacing.xl,
  },
  profileCardInner: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    marginRight: Spacing.md,
  },
  avatarPlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  profileInfo: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  emailText: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  phoneText: {
    fontSize: 12,
    color: Colors.textTertiary,
  },
  editIconBtn: {
    padding: Spacing.sm,
  },
  menuContainer: {
    paddingHorizontal: Spacing.lg,
  },
  menuSection: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    marginBottom: Spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  lastMenuItem: {
    borderBottomWidth: 0,
  },
  menuIconBg: {
    width: 44,
    height: 44,
    borderRadius: 16, // Squircle icon
    backgroundColor: '#E8F5E9', // Hijau muda transparan
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  menuContent: {
    flex: 1,
  },
  menuLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  menuSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
    fontWeight: '500',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
    padding: Spacing.lg,
    borderRadius: 20,
    marginTop: Spacing.md,
    borderWidth: 1,
    borderColor: '#FFEBEE',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.danger,
    marginLeft: 8,
  },
  footer: {
    alignItems: 'center',
    paddingBottom: 40,
    paddingTop: 10,
  },
  footerText: {
    fontSize: 12,
    color: Colors.textTertiary,
    fontWeight: '500',
    marginTop: 4,
  },
});

/**
 * Layanan Autentikasi
 * Mengelola proses login, logout, dan pengambilan profil.
 */
// File profile.tsx code block starts here:
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Platform,
} from 'react-native';
import Icon from '../../src/components/common/Icon'
import Avatar from '../../src/components/common/Avatar';
import { useRouter } from 'expo-router';
import { biometric } from '../../src/utils/biometric';
import Colors, { brand, slate } from '../../constants/Colors';
import Spacing from '../../constants/Spacing';
import { useAuth } from '../../src/contexts/AuthContext';
import { authService } from '../../src/services/authService';
import { fonts } from '../../constants/Typography';
import { dialog } from '../../src/components/common/AppDialog';
import Button from '../../src/components/common/Button';

interface MenuItem {
  icon: string;
  label: string;
  subtitle?: string;
  color?: string;
  onPress?: () => void;
  danger?: boolean;
  isToggle?: boolean;
  toggleValue?: boolean;
  onToggle?: (val: boolean) => void;
}

/**
 * Komponen ProfileScreen
 * Halaman utama untuk melihat informasi profil pengguna dan menu pengaturan.
 */
export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [loadingLogout, setLoadingLogout] = useState(false);
  const [isBiometricEnabled, setIsBiometricEnabled] = useState(false);
  const [namaBiometrik, setNamaBiometrik] = useState('Sidik Jari');

  useEffect(() => {
    loadBiometricSetting();
  }, []);

  const loadBiometricSetting = async () => {
    setIsBiometricEnabled(await biometric.siapDipakai());
    setNamaBiometrik(await biometric.namaJenis());
  };

  /**
   * Menyalakan/mematikan masuk cepat.
   *
   * Menyalakan dari sini TIDAK bisa langsung menyimpan kredensial: aplikasi
   * sudah tidak memegang kata sandi setelah pengguna masuk. Karena itu jalur
   * "nyalakan" hanya mengarahkan — penyimpanannya terjadi di layar login,
   * tepat setelah masuk manual berhasil.
   */
  const toggleBiometric = async (value: boolean) => {
    if (!value) {
      await biometric.matikan();
      setIsBiometricEnabled(false);
      dialog.alert(
        'Masuk Cepat Dimatikan',
        'Kredensial yang tersimpan di perangkat sudah dihapus.'
      );
      return;
    }

    if (!(await biometric.didukung())) {
      dialog.alert(
        'Tidak Didukung',
        'Perangkat ini tidak punya sensor biometrik, atau belum ada sidik jari/wajah yang didaftarkan di pengaturan perangkat.'
      );
      return;
    }

    // Toggle sengaja dibiarkan mati — jangan tampilkan "aktif" padahal
    // kredensialnya belum ada; tombol di layar login akan gagal senyap.
    setIsBiometricEnabled(false);
    dialog.alert(
      `Aktifkan Masuk dengan ${namaBiometrik}`,
      `Keluar lalu masuk sekali lagi dengan kata sandi. Setelah berhasil, akan muncul tawaran untuk mengaktifkan ${namaBiometrik.toLowerCase()}.`
    );
  };

  /**
   * Menangani proses keluar (Logout)
   * Akan menampilkan konfirmasi terlebih dahulu sebelum memanggil API logout.
   */
  const handleLogout = async () => {
    const setuju = await dialog.confirm({
      title: 'Keluar dari Aplikasi',
      message: 'Apakah Anda yakin ingin keluar?',
      confirmText: 'Keluar',
      destructive: true,
    });
    if (!setuju) return;

    setLoadingLogout(true);
    try {
      await logout(); // Memanggil endpoint POST /logout via authService
      router.replace('/login');
    } catch (error) {
      dialog.alert('Gagal Keluar', 'Terjadi kesalahan saat keluar dari aplikasi.', 'danger');
      setLoadingLogout(false);
    }
  };

  const menuItems: MenuItem[][] = [
    [
      {
        icon: 'fingerprint',
        label: `Masuk dengan ${namaBiometrik}`,
        subtitle: isBiometricEnabled
          ? 'Aktif — kredensial tersimpan terenkripsi di perangkat'
          : 'Masuk tanpa mengetik kata sandi',
        isToggle: true,
        toggleValue: isBiometricEnabled,
        onToggle: toggleBiometric,
      },
      { 
        icon: 'shield-lock-outline', 
        label: 'Keamanan Akun', 
        subtitle: 'Password & Autentikasi',
        onPress: () => dialog.alert('Keamanan Akun', 'Fitur ganti password sedang dikembangkan.')
      },
      { 
        icon: 'bell-outline', 
        label: 'Pengaturan Notifikasi', 
        subtitle: 'Atur pemberitahuan',
        onPress: () => dialog.alert('Segera Hadir', 'Fitur pengaturan notifikasi sedang dalam pengembangan.')
      },
    ],
    [
      { 
        icon: 'translate', 
        label: 'Bahasa', 
        subtitle: 'Indonesia',
        onPress: () => dialog.alert('Bahasa', 'Pilihan bahasa saat ini hanya Bahasa Indonesia.')
      },
      { 
        icon: 'human-capacity-increase', 
        label: 'Aksesibilitas', 
        subtitle: 'Ukuran teks & tema',
        onPress: () => dialog.alert('Aksesibilitas', 'Pengaturan aksesibilitas sedang dalam pengembangan.')
      },
    ],
    [
      { 
        icon: 'information-outline', 
        label: 'Tentang Aplikasi', 
        subtitle: 'Versi 1.0.0 (SIMWT)',
        onPress: () => dialog.alert('SIMWT Mobile', 'Versi 1.0.0\nDikembangkan oleh IT Mada Wikri Tunggal.')
      },
      { 
        icon: 'help-circle-outline', 
        label: 'Pusat Bantuan', 
        subtitle: 'FAQ & Hubungi Kami',
        onPress: () => dialog.alert('Pusat Bantuan', 'Silakan hubungi tim IT (Ext. 123) untuk bantuan.')
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
              <Avatar nama={user?.nama_lengkap || user?.name || user?.username} ukuran={64} />
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.name}>{user?.nama_lengkap || user?.name || user?.username || 'Pengguna'}</Text>
              <Text style={styles.emailText}>{user?.email || 'email@mwtpart.co.id'}</Text>
              <Text style={styles.phoneText}>{user?.phone || '+6281234567890'}</Text> 
            </View>
            <View style={styles.editIconBtn}>
              <Icon name="pencil" size={20} color={Colors.textSecondary} />
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
                  <Icon
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
                {item.isToggle ? (
                  <Switch
                    value={item.toggleValue}
                    onValueChange={item.onToggle}
                    trackColor={{ false: Colors.border, true: brand[600] }}
                    thumbColor={Platform.OS === 'android' ? (item.toggleValue ? Colors.white : slate[50]) : ''}
                  />
                ) : (
                  <Icon name="chevron-right" size={22} color={Colors.textTertiary} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        ))}

        {/* Tombol Logout Terpisah (Gojek Style Logout Button) */}
        <Button
          variant="dangerOutline"
          icon="logout"
          label="Keluar dari Aplikasi"
          onPress={handleLogout}
          loading={loadingLogout}
          block
          style={{ marginTop: Spacing.md }}
        />
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
    backgroundColor: Colors.background, // Latar belakang abu muda khas Gojek
  },
  greenBanner: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 180, // Tinggi banner hijau
    backgroundColor: brand[600], // Hijau solid Gojek
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
    borderRadius: Spacing.radius.xl,
    ...Spacing.curve,
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  profileCardInner: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    marginRight: Spacing.md,
  },
  profileInfo: {
    flex: 1,
  },
  name: {
    fontSize: 12,
    fontFamily: fonts.extrabold,
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  emailText: {
    fontSize: 12,
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
    borderRadius: Spacing.radius.xl,
    ...Spacing.curve,
    marginBottom: Spacing.lg,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderSubtle,
  },
  lastMenuItem: {
    borderBottomWidth: 0,
  },
  menuIconBg: {
    width: 44,
    height: 44,
    borderRadius: 16, // Squircle icon
    backgroundColor: brand[50], // Hijau muda transparan
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  menuContent: {
    flex: 1,
  },
  menuLabel: {
    fontSize: 12,
    fontFamily: fonts.bold,
    color: Colors.textPrimary,
  },
  menuSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
    fontFamily: fonts.medium,
  },
  footer: {
    alignItems: 'center',
    paddingBottom: 40,
    paddingTop: 10,
  },
  footerText: {
    fontSize: 12,
    color: Colors.textTertiary,
    fontFamily: fonts.medium,
    marginTop: 4,
  },
});

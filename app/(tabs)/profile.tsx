/**
 * Setelan — avatar & identitas di tengah, kartu ajakan biometrik, lalu menu
 * dalam kelompok kartu putih. Logika biometrik & keluar ada di sini; tampilan
 * barisnya di `profil/BarisSetelan`.
 */
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import KartuPromo from '../../src/components/common/KartuPromo';
import BarisSetelan from '../../src/components/profil/BarisSetelan';
import Avatar from '../../src/components/common/Avatar';
import { biometric } from '../../src/utils/biometric';
import Colors, { gradasiLembut } from '../../constants/Colors';
import Spacing from '../../constants/Spacing';
import { useAuth } from '../../src/contexts/AuthContext';
import { fonts } from '../../constants/Typography';
import { dialog } from '../../src/components/common/AppDialog';
import Button from '../../src/components/common/Button';

export default function ProfileScreen() {
  const { user, logout, login } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
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
   * Aplikasi tidak memegang kata sandi setelah pengguna masuk, jadi menyalakan
   * dari sini berarti: pindai biometrik (memastikan pemegang perangkat) →
   * minta kata sandi sekali → verifikasi lewat login ke server (sekaligus
   * memperbarui sesi) → baru simpan terenkripsi. Kata sandi salah = tidak ada
   * yang tersimpan.
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

    if (!user?.username) {
      dialog.alert('Gagal', 'Data akun belum dimuat. Coba lagi sebentar lagi.', 'danger');
      return;
    }
    if (!(await biometric.konfirmasi(`Pindai ${namaBiometrik.toLowerCase()} untuk melanjutkan`))) return;

    const sandi = await dialog.prompt({
      title: `Aktifkan Masuk dengan ${namaBiometrik}`,
      message: 'Masukkan kata sandi akun Anda sekali. Disimpan terenkripsi di perangkat ini saja.',
      confirmText: 'Aktifkan',
      isian: { placeholder: 'Kata sandi', rahasia: true },
    });
    if (!sandi) return;

    try {
      await login(user.username, sandi);
      await biometric.nyalakan({ username: user.username, password: sandi });
      setIsBiometricEnabled(true);
      dialog.alert('Berhasil', `Masuk dengan ${namaBiometrik.toLowerCase()} sudah aktif.`, 'success');
    } catch (e: any) {
      dialog.alert('Gagal Mengaktifkan', e?.message || 'Kata sandi salah atau koneksi bermasalah.', 'danger');
    }
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

  const nama = user?.nama_lengkap || user?.name || user?.username || 'Pengguna';

  return (
    <View style={styles.container}>
      {/* Latar atas: gradasi lembut yang memudar ke warna halaman. */}
      <LinearGradient
        colors={[...gradasiLembut]}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={styles.latarAtas}
      />
      <LinearGradient
        colors={['rgba(244,251,247,0)', Colors.background]}
        pointerEvents="none"
        style={styles.latarAtas}
      />

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + Spacing.md }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.judulHalaman}>Setelan</Text>

        <View style={styles.identitas}>
          <Avatar nama={nama} foto={user?.avatar} ukuran={88} style={styles.avatar} />
          {/* Sapaan besar di beranda juga pengecualian 12px; nama di sini 20. */}
          <Text style={styles.nama} numberOfLines={1}>{nama}</Text>
          <Text style={styles.email} numberOfLines={1}>{user?.email || 'email@mwtpart.co.id'}</Text>
        </View>

        <View style={styles.menuContainer}>
          {!isBiometricEnabled ? (
            <KartuPromo
              ikon="fingerprint"
              label={`Aktifkan ${namaBiometrik}`}
              onPress={() => toggleBiometric(true)}
            />
          ) : null}

          <View style={styles.kelompok}>
            <BarisSetelan
              ikon="account-cog-outline"
              label="Kelola profil"
              onPress={() => router.push('/(tabs)/edit-profile')}
              terakhir={!isBiometricEnabled}
            />
            {/* Belum aktif → kartu ajakan di atas; sudah aktif → sakelar ini, untuk mematikannya. */}
            {isBiometricEnabled ? (
              <BarisSetelan
                ikon="fingerprint"
                label={`Masuk dengan ${namaBiometrik}`}
                sakelar={{ aktif: true, onUbah: toggleBiometric }}
                terakhir
              />
            ) : null}
          </View>

          <View style={styles.kelompok}>
            <BarisSetelan
              ikon="shield-lock-outline"
              label="Keamanan akun"
              onPress={() => dialog.alert('Keamanan Akun', 'Fitur ganti password sedang dikembangkan.')}
            />
            <BarisSetelan
              ikon="bell-outline"
              label="Pengaturan notifikasi"
              onPress={() => dialog.alert('Segera Hadir', 'Fitur pengaturan notifikasi sedang dalam pengembangan.')}
            />
            <BarisSetelan
              ikon="translate"
              label="Bahasa"
              nilai="Indonesia"
              onPress={() => dialog.alert('Bahasa', 'Pilihan bahasa saat ini hanya Bahasa Indonesia.')}
            />
            <BarisSetelan
              ikon="human-capacity-increase"
              label="Aksesibilitas"
              onPress={() => dialog.alert('Aksesibilitas', 'Pengaturan aksesibilitas sedang dalam pengembangan.')}
              terakhir
            />
          </View>

          <View style={styles.kelompok}>
            <BarisSetelan
              ikon="help-circle-outline"
              label="Pusat bantuan"
              onPress={() => dialog.alert('Pusat Bantuan', 'Silakan hubungi tim IT (Ext. 123) untuk bantuan.')}
            />
            <BarisSetelan
              ikon="information-outline"
              label="Tentang aplikasi"
              nilai="v1.0.0"
              onPress={() => dialog.alert('SIMWT Mobile', 'Versi 1.0.0\nDikembangkan oleh IT Mada Wikri Tunggal.')}
              terakhir
            />
          </View>

          <Button
            variant="dangerOutline"
            icon="logout"
            label="Keluar dari Aplikasi"
            onPress={handleLogout}
            loading={loadingLogout}
            block
          />
        </View>

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
    backgroundColor: Colors.background,
  },
  latarAtas: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 260,
  },
  scrollContent: {
    paddingBottom: Spacing.xxxl * 2,
  },
  judulHalaman: {
    textAlign: 'center',
    fontFamily: fonts.bold,
    fontSize: 12,
    color: Colors.textPrimary,
    marginBottom: Spacing.lg,
  },
  identitas: {
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  avatar: {
    borderWidth: 3,
    borderColor: Colors.white,
  },
  nama: {
    marginTop: Spacing.md,
    fontFamily: fonts.bold,
    fontSize: 20,
    color: Colors.textPrimary,
  },
  email: {
    marginTop: 2,
    fontFamily: fonts.regular,
    fontSize: 12,
    color: Colors.textTertiary,
  },
  menuContainer: {
    paddingHorizontal: Spacing.lg,
  },
  kelompok: {
    backgroundColor: Colors.white,
    borderRadius: Spacing.radius.xl,
    ...Spacing.curve,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
    overflow: 'hidden',
    marginBottom: Spacing.lg,
  },
  footer: {
    alignItems: 'center',
    paddingTop: Spacing.xl,
  },
  footerText: {
    fontSize: 12,
    color: Colors.textTertiary,
    fontFamily: fonts.medium,
    marginTop: 4,
  },
});

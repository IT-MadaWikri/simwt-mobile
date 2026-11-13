/**
 * Setelan — bar judul putih, kartu profil (avatar, nama, email, "Edit Profil"),
 * lalu menu dalam kelompok kartu putih berjudul di atas latar abu muda. Logika
 * biometrik & keluar ada di sini; tampilan barisnya di `profil/BarisSetelan`.
 */
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Icon from '../../src/components/common/Icon';
import BarisSetelan from '../../src/components/profil/BarisSetelan';
import Avatar from '../../src/components/common/Avatar';
import { biometric } from '../../src/utils/biometric';
import Colors, { brand, slate } from '../../constants/Colors';
import Spacing from '../../constants/Spacing';
import { useAuth } from '../../src/contexts/AuthContext';
import { fonts, fontsJudul, ukuranCatatan, ukuranIsi } from '../../constants/Typography';
import { dialog } from '../../src/components/common/AppDialog';
import Button from '../../src/components/common/Button';
import { versiAplikasi } from '../../src/utils/versiAplikasi';

const URL_KEBIJAKAN_PRIVASI = 'https://madawikri.co.id/kebijakan-privasi';

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
      <View style={[styles.bar, { paddingTop: insets.top }]}>
        <Text style={styles.judulHalaman}>Setelan</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.kartuProfil}>
          <Avatar nama={nama} foto={user?.avatar} ukuran={48} />
          <View style={styles.infoProfil}>
            <Text style={styles.nama} numberOfLines={1}>{nama}</Text>
            <Text style={styles.email} numberOfLines={1}>{user?.email || 'email@mwtpart.co.id'}</Text>
            <TouchableOpacity style={styles.tautan} onPress={() => router.push('/(tabs)/edit-profile')} hitSlop={8}>
              <Icon name="pencil" size={13} color={brand[700]} />
              <Text style={styles.teksTautan}>Edit Profil</Text>
            </TouchableOpacity>
          </View>
          <Button
            variant="dangerOutline"
            icon="logout"
            onPress={handleLogout}
            loading={loadingLogout}
            accessibilityLabel="Keluar dari Aplikasi"
          />
        </View>

        <Text style={styles.judulKelompok}>Akun</Text>
        <View style={styles.kelompok}>
          <BarisSetelan
            ikon="account-cog-outline"
            label="Kelola profil"
            onPress={() => router.push('/(tabs)/edit-profile')}
          />
          <BarisSetelan
            ikon="fingerprint"
            label={`Masuk dengan ${namaBiometrik}`}
            sakelar={{ aktif: isBiometricEnabled, onUbah: toggleBiometric }}
          />
          <BarisSetelan
            ikon="cellphone"
            label="Perangkat & sesi"
            onPress={() => router.push('/(tabs)/sesi-perangkat')}
            terakhir
          />
        </View>

        <Text style={styles.judulKelompok}>Dukungan</Text>
        <View style={styles.kelompok}>
          <BarisSetelan
            ikon="help-circle-outline"
            label="Pusat bantuan"
            onPress={() => dialog.alert('Pusat Bantuan', 'Silakan hubungi tim IT (Ext. 123) untuk bantuan.')}
          />
          <BarisSetelan
            ikon="shield-lock-outline"
            label="Kebijakan privasi"
            onPress={() =>
              Linking.openURL(URL_KEBIJAKAN_PRIVASI).catch(() =>
                dialog.alert('Gagal Membuka', 'Tautan tidak bisa dibuka di browser.', 'danger')
              )
            }
          />
          <BarisSetelan
            ikon="information-outline"
            label="Tentang aplikasi"
            nilai={`v${versiAplikasi}`}
            onPress={() => dialog.alert('SIMWT Mobile', `Versi ${versiAplikasi}
Dikembangkan oleh IT Mada Wikri Tunggal.

Ikon layanan: Streamline Flex oleh Streamline (streamlinehq.com), lisensi CC BY 4.0.`)}
            terakhir
          />
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>SIMWT Mobile by IT Mada Wikri Tunggal</Text>
          <Text style={styles.footerText}>Versi {versiAplikasi}</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: slate[100],
  },
  bar: {
    backgroundColor: Colors.white,
  },
  judulHalaman: {
    height: 56,
    textAlign: 'center',
    textAlignVertical: 'center',
    fontFamily: fontsJudul.bold,
    fontSize: 18,
    color: Colors.textPrimary,
  },
  scrollContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxxl * 2,
  },
  kartuProfil: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.lg,
    backgroundColor: Colors.white,
    borderRadius: Spacing.radius.xl,
    ...Spacing.curve,
  },
  infoProfil: {
    flex: 1,
  },
  nama: {
    fontFamily: fonts.bold,
    fontSize: 16,
    color: Colors.textPrimary,
  },
  email: {
    fontFamily: fonts.regular,
    fontSize: ukuranIsi,
    color: Colors.textTertiary,
  },
  tautan: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 4,
    marginTop: Spacing.xs,
  },
  teksTautan: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: brand[700],
  },
  judulKelompok: {
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
    fontFamily: fonts.medium,
    fontSize: ukuranIsi,
    color: Colors.textSecondary,
  },
  kelompok: {
    backgroundColor: Colors.white,
    borderRadius: Spacing.radius.xl,
    ...Spacing.curve,
    overflow: 'hidden',
  },
  footer: {
    alignItems: 'center',
    paddingTop: Spacing.xl,
  },
  footerText: {
    fontSize: ukuranCatatan,
    color: Colors.textTertiary,
    fontFamily: fonts.medium,
    marginTop: 4,
  },
});

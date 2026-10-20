/**
 * Masuk dengan sidik jari / Face ID.
 *
 * ── Cara kerjanya ────────────────────────────────────────────────────────
 * Sanctum tidak punya refresh token, dan `POST /logout` mencabut token di
 * server. Artinya token yang disimpan tidak bisa dipakai lagi setelah keluar,
 * sehingga "masuk dengan sidik jari" mau tidak mau berarti **menyimpan
 * kredensial** lalu memutarnya kembali setelah biometrik lolos.
 *
 * Kredensial disimpan lewat `expo-secure-store` (Keychain di iOS, Keystore di
 * Android) — bukan AsyncStorage, yang isinya teks biasa.
 *
 * ── Batasan yang disengaja ───────────────────────────────────────────────
 * 1. Pemeriksaan biometrik dijalankan oleh KODE APLIKASI ini
 *    (`LocalAuthentication.authenticateAsync`), bukan oleh keystore.
 *    Opsi `requireAuthentication` milik SecureStore — yang membuat keystore
 *    sendiri menolak membaca tanpa biometrik — sengaja TIDAK dipakai karena
 *    **tidak didukung di Expo Go** (Info.plist Expo Go tidak punya
 *    `NSFaceIDUsageDescription`), sehingga fitur ini akan mati total saat
 *    dikembangkan. Kalau nanti aplikasi dibuild sendiri (bukan Expo Go),
 *    nyalakan opsi itu di `OPSI_SIMPAN` untuk pertahanan berlapis.
 * 2. Di web fitur ini dimatikan sepenuhnya — tidak ada biometrik, dan
 *    menyimpan kata sandi di `localStorage` sebagai teks biasa tidak pantas.
 */
import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const KUNCI_KREDENSIAL = 'simwt_biometric_credentials';
/** Nama lama yang sudah dipakai layar Profil — dipertahankan agar setelan tidak hilang. */
const KUNCI_AKTIF = 'use_biometric';

/**
 * Kalau suatu saat aplikasi dibuild sendiri (bukan Expo Go), tambahkan
 * `requireAuthentication: true` di sini supaya keystore ikut menjaga.
 */
const OPSI_SIMPAN: SecureStore.SecureStoreOptions = {
  keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
};

export interface Kredensial {
  username: string;
  password: string;
}

export const biometric = {
  /** Perangkat punya sensor DAN pengguna sudah mendaftarkan sidik jari/wajah. */
  async didukung(): Promise<boolean> {
    if (Platform.OS === 'web') return false;
    try {
      const [adaPerangkat, terdaftar] = await Promise.all([
        LocalAuthentication.hasHardwareAsync(),
        LocalAuthentication.isEnrolledAsync(),
      ]);
      return adaPerangkat && terdaftar;
    } catch {
      return false;
    }
  },

  /** Nama jenis biometrik untuk ditampilkan ("Sidik Jari" / "Face ID" / "Sidik Jari / Wajah"). */
  async namaJenis(): Promise<string> {
    if (Platform.OS === 'web') return 'Biometrik';
    try {
      const jenis = await LocalAuthentication.supportedAuthenticationTypesAsync();
      const wajah = jenis.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION);
      const jari = jenis.includes(LocalAuthentication.AuthenticationType.FINGERPRINT);
      // Banyak HP Android punya keduanya; menyebut salah satu saja menyesatkan.
      if (wajah && jari) return 'Sidik Jari / Wajah';
      if (wajah) return Platform.OS === 'ios' ? 'Face ID' : 'Pengenalan Wajah';
      if (jari) return 'Sidik Jari';
      return 'Biometrik';
    } catch {
      return 'Biometrik';
    }
  },

  /** Minta pemindaian biometrik sekali untuk memastikan pemegang perangkat. `true` bila lolos. */
  async konfirmasi(pesan: string): Promise<boolean> {
    if (Platform.OS === 'web') return false;
    const hasil = await LocalAuthentication.authenticateAsync({
      promptMessage: pesan,
      cancelLabel: 'Batal',
      disableDeviceFallback: false,
      fallbackLabel: 'Gunakan PIN Perangkat',
    });
    return hasil.success;
  },

  /** Setelan pengguna: fitur ini dinyalakan atau tidak. */
  async aktif(): Promise<boolean> {
    try {
      return (await AsyncStorage.getItem(KUNCI_AKTIF)) === 'true';
    } catch {
      return false;
    }
  },

  /** Sudah ada kredensial tersimpan? Menentukan tombol bisa dipakai atau belum. */
  async siapDipakai(): Promise<boolean> {
    if (Platform.OS === 'web') return false;
    try {
      const tersimpan = await SecureStore.getItemAsync(KUNCI_KREDENSIAL, OPSI_SIMPAN);
      return !!tersimpan && (await this.aktif());
    } catch {
      return false;
    }
  },

  /**
   * Menyalakan fitur: simpan kredensial + tandai aktif.
   * Dipanggil tepat setelah masuk manual berhasil — hanya di saat itulah
   * kata sandi ada di tangan.
   */
  async nyalakan(kredensial: Kredensial): Promise<void> {
    if (Platform.OS === 'web') return;
    await SecureStore.setItemAsync(
      KUNCI_KREDENSIAL,
      JSON.stringify(kredensial),
      OPSI_SIMPAN
    );
    await AsyncStorage.setItem(KUNCI_AKTIF, 'true');
  },

  /** Mematikan fitur dan MENGHAPUS kredensial — bukan sekadar menyembunyikan tombol. */
  async matikan(): Promise<void> {
    await AsyncStorage.setItem(KUNCI_AKTIF, 'false');
    if (Platform.OS === 'web') return;
    try {
      await SecureStore.deleteItemAsync(KUNCI_KREDENSIAL, OPSI_SIMPAN);
    } catch {
      // Tidak ada yang perlu dilakukan kalau memang belum pernah tersimpan.
    }
  },

  /**
   * Minta verifikasi biometrik, lalu kembalikan kredensial bila lolos.
   *
   * `null` berarti gagal ATAU dibatalkan pengguna — pemanggil tidak perlu
   * membedakannya karena tindakannya sama: jangan masuk.
   */
  async verifikasiDanAmbil(): Promise<Kredensial | null> {
    if (Platform.OS === 'web') return null;

    const hasil = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Verifikasi identitas Anda untuk masuk',
      cancelLabel: 'Batal',
      // Dibiarkan false supaya pengguna bisa jatuh ke PIN/pola perangkat
      // kalau sensor sedang tidak mau membaca (jari basah, layar kotor).
      disableDeviceFallback: false,
      fallbackLabel: 'Gunakan PIN Perangkat',
    });

    if (!hasil.success) return null;

    const tersimpan = await SecureStore.getItemAsync(KUNCI_KREDENSIAL, OPSI_SIMPAN);
    if (!tersimpan) return null;

    try {
      return JSON.parse(tersimpan) as Kredensial;
    } catch {
      return null;
    }
  },
};

export default biometric;

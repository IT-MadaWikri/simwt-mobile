/**
 * API Configuration for SIMWT Mobile
 *
 * Semua nilai yang bisa berubah antar-lingkungan dibaca dari file `.env`
 * (lihat `.env.example` untuk template). Expo hanya mem-bundle variabel
 * berawalan `EXPO_PUBLIC_`, dan variabel itu WAJIB diakses lewat notasi titik
 * `process.env.EXPO_PUBLIC_X` supaya ikut di-inline saat bundling —
 * destructuring atau `process.env['X']` tidak akan tergantikan.
 *
 * Ada dua target backend:
 *   - LOKAL      : Laragon (C:\laragon\www\api-simwt) lewat vhost port 8000
 *   - PRODUCTION : nilai EXPO_PUBLIC_API_BASE_URL
 *
 * Kenapa port 8000 dan bukan `api-simwt.test`?
 * Domain `.test` hanya ada di file hosts laptop (127.0.0.1), jadi HP fisik
 * maupun emulator tidak bisa me-resolve-nya. Vhost di
 * `C:\laragon\etc\apache2\sites-enabled\api-simwt-lan.conf` mendengarkan di
 * port 8000 tanpa pencocokan Host header, sehingga bisa diakses lewat IP LAN
 * laptop berapa pun (IP DHCP boleh berubah).
 */
import Constants from 'expo-constants';
import { Platform } from 'react-native';

/** true = pakai Laravel lokal (Laragon), false = pakai server production. */
export const USE_LOCAL_API = process.env.EXPO_PUBLIC_USE_LOCAL_API !== 'false';

/** Port vhost LAN api-simwt di Laragon. Lihat api-simwt-lan.conf. */
const LOCAL_API_PORT = process.env.EXPO_PUBLIC_LOCAL_API_PORT || '8000';

/**
 * Dipakai kalau host dev server Expo tidak bisa dideteksi (mis. build
 * standalone/APK yang dipasang ke HP). Sesuaikan dengan IP Wi-Fi laptop.
 */
const LOCAL_FALLBACK_HOST = process.env.EXPO_PUBLIC_LOCAL_API_HOST || '192.168.1.3';

const PRODUCTION_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL || 'https://api.madawikri.co.id/api';

/**
 * Ambil hostname laptop dari dev server Expo (mis. "192.168.1.3:8081"),
 * supaya base URL ikut menyesuaikan otomatis saat IP laptop berubah.
 */
function resolveLocalHost(): string {
  const hostUri =
    Constants.expoConfig?.hostUri ??
    (Constants.expoGoConfig as { debuggerHost?: string } | undefined)?.debuggerHost;

  const host = hostUri?.split(':')[0];

  if (!host) {
    return LOCAL_FALLBACK_HOST;
  }

  // Emulator Android tidak bisa menjangkau host lewat 127.0.0.1 —
  // alamat khusus untuk mesin host adalah 10.0.2.2.
  if ((host === 'localhost' || host === '127.0.0.1') && Platform.OS === 'android') {
    return '10.0.2.2';
  }

  return host;
}

function resolveBaseUrl(): string {
  if (!USE_LOCAL_API) {
    return PRODUCTION_BASE_URL;
  }
  return `http://${resolveLocalHost()}:${LOCAL_API_PORT}/api`;
}

export const API_CONFIG = {
  BASE_URL: resolveBaseUrl(),

  /**
   * Header X-SIMMWT-KEY. Bukan rahasia — nilai EXPO_PUBLIC_* ikut ter-inline
   * sebagai teks biasa di dalam bundle aplikasi.
   */
  API_TOKEN: process.env.EXPO_PUBLIC_API_TOKEN || '',

  TIMEOUT: Number(process.env.EXPO_PUBLIC_API_TIMEOUT) || 30000,

  ENDPOINTS: {
    // Auth
    LOGIN: '/login',
    LOGOUT: '/logout',
    USER: '/user',
    UPDATE_EMAIL: '/update-email',
    VERIFY_EMAIL: '/verifikasi-email/kirim-ulang',

    // Dashboard
    DASHBOARD: '/dashboard',

    // Guest Portal
    GUEST_PORTAL_SESSIONS: '/guest-portal/sessions',
    GUEST_PORTAL_SESSIONS_STATUS: '/guest-portal/sessions/status',
    GUEST_PORTAL_SESSIONS_INFO: '/guest-portal/sessions/info',
    /** Prefix — route sebenarnya `/guest-portal/users/{username}`. */
    GUEST_PORTAL_USERS: '/guest-portal/users',

    // Karyawan
    KARYAWAN: '/karyawan',
    KARYAWAN_DETAIL: '/karyawan/lihat', // + /{idKaryawan}
    KARYAWAN_BIRTHDAY_TODAY: '/karyawan/birthday-today',

    // Aset
    ASET_SCAN: '/aset', // + /{nomor}/scan

    // Umum
    DEPARTEMEN: '/departemen',
    HEALTH: '/health',

    // Mita AI
    MITA_ASK: '/gemini/ask',
    MITA_CHAT_SEND: '/mita-chat/send',
    MITA_CLEAR: '/mita/clear',
    MITA_ANALYZE_DASHBOARD: '/mita/analyze-dashboard',
    MITA_ANALYZE_DATA: '/mita/analyze-data',
    MITA_ANALYZE_TICKETS: '/mita/analyze-tickets',
    MITA_HEALTH_CHECK: '/mita/health-check',
    MITA_ASSISTANCE: '/mita-assistance',

    // OEE
    OEE: '/oee',
    OEE_MESIN: '/oee/mesin',
    OEE_OUTPUT: '/oee/output',
    OEE_REJECT: '/oee/reject',

    /**
     * Rekrutmen / Karir.
     *
     * ⚠️ Seluruh endpoint `/rekrutment/*` (ejaan lama, tanpa "e") SUDAH DIHAPUS
     * dari api-simwt pada Juli 2026 bersama `RekrutmentController`. Jangan
     * ditambahkan lagi — semua ALUR KERJA admin HR (buat lowongan, atur jadwal,
     * ubah status lamaran, kirim surat) tetap milik monolith `sim-mwt` dan tidak
     * diekspos sebagai REST API.
     *
     * `/rekrutmen/dashboard` di bawah adalah endpoint BARU (Agustus 2026) yang
     * dibuat khusus untuk app mobile: read-only murni, cuma menyajikan angka
     * ringkas dari database rekrutmen. Bukan pengganti alur kerja HR.
     */
    REKRUTMEN_DASHBOARD: '/rekrutmen/dashboard',

    /** Portal karir publik — middleware VerifyWebToken, cukup X-SIMMWT-KEY. */
    KARIR: '/karir',
    KARIR_REFERENSI: '/karir/referensi',
    KARIR_DETAIL: '/karir', // + /{id_karir}
    KARIR_LAMARAN: '/karir', // + /{id_karir}/lamaran (POST)

    // API Utilities
    SHOLAT_TIMES: '/api/sholat/times',
    SHOLAT_CURRENT: '/api/sholat/current',
    ASET_AUTOCOMPLETE: '/api/aset-autocomplete',

    /**
     * Stok Opname — melayani metode yang berjalan sekarang (baca saja).
     * Endpoint tulis alur scan belum ada; lihat StoController di api-simwt.
     */
    STO_PERIODE: '/sto/periode', // + /{id}/lembar
    STO_LEMBAR: '/sto/lembar', // + /{id}/paket
    STO_JADWAL: '/sto/jadwal',
    STO_PART: '/sto/part', // + /{kode}

    // Kaizen
    KAIZEN_DASHBOARD: '/kaizen',
    KAIZEN_DATA: '/kaizen/data',
    KAIZEN_LIST: '/kaizen/list',
    KAIZEN_BUAT: '/kaizen/buat',
  },
};

export default API_CONFIG;

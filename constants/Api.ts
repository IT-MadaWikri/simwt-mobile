/**
 * API Configuration for SIMWT Mobile
 *
 * Base URL dibaca dari `.env` (lihat `.env.example`). Mau pindah target
 * (production / Laragon lokal) tinggal ganti nilai EXPO_PUBLIC_API_BASE_URL,
 * lalu restart Metro dengan `npx expo start -c`.
 *
 * Variabel WAJIB diakses lewat notasi titik `process.env.EXPO_PUBLIC_X`
 * supaya ikut di-inline saat bundling.
 */

export const API_CONFIG = {
  BASE_URL: process.env.EXPO_PUBLIC_API_BASE_URL || 'https://api.madawikri.co.id/api',

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
    LUPA_PASSWORD: '/lupa-password',
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
    KAIZEN_POIN: '/kaizen/saya/poin',
    KAIZEN_TOP: '/kaizen/saya/top',
    KAIZEN_REDEEM: '/kaizen/saya/redeem',
  },
};

export default API_CONFIG;

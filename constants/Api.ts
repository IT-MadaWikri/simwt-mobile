/**
 * API Configuration for SIMWT Mobile
 * Base URL: https://api.mwtpart.co.id/api
 */

export const API_CONFIG = {
  BASE_URL: 'https://api.mwtpart.co.id/api',
  API_TOKEN: 'Madawikri2026@!!@',
  TIMEOUT: 30000,

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
    GUEST_PORTAL_USERS: '/guest-portal/users',

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

    // Rekruitment
    REKRUITMENT: '/rekrutment/rekrutment',
    REKRUITMENT_LOWONGAN: '/rekrutment/lowongan',
    REKRUITMENT_PESERTA: '/rekrutment/peserta',
    REKRUITMENT_POSISI: '/rekrutment/posisi',
    REKRUITMENT_JADWAL: '/rekrutment/jadwal',
    REKRUITMENT_PELAMAR: '/rekrutment/pelamar',
    REKRUITMENT_CALENDAR: '/rekrutment/calendar-events',
    REKRUITMENT_PENDIDIKAN: '/rekrutment/pendidikan',

    // API Utilities
    SHOLAT_TIMES: '/api/sholat/times',
    SHOLAT_CURRENT: '/api/sholat/current',
    ASET_AUTOCOMPLETE: '/api/aset-autocomplete',

    // Kaizen
    KAIZEN_DASHBOARD: '/kaizen',
    KAIZEN_DATA: '/kaizen/data',

    // Public
    PUBLIC_KARIR: '/public/karir',
  },
};

export default API_CONFIG;

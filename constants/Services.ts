import Colors, { brand } from '../constants/Colors';

/**
 * SIMWT Mobile — Service Definitions
 * 10 layanan utama sesuai requirement
 */

export interface ServiceItem {
  id: string;
  name: string;
  icon: string;
  iconFamily: 'MaterialCommunityIcons' | 'Ionicons';
  backgroundColor: string;
  iconColor: string;
  route: string;
  description: string;
}

export const SERVICES: ServiceItem[] = [
  {
    id: 'database-aset',
    name: 'Database\nAset',
    icon: 'database-outline',
    iconFamily: 'MaterialCommunityIcons',
    backgroundColor: brand[50],
    iconColor: brand[700],
    route: '/services/database-aset',
    description: 'Manajemen data aset perusahaan',
  },
  {
    id: 'tiket-masalah',
    name: 'Tiket\nMasalah',
    icon: 'ticket-confirmation-outline',
    iconFamily: 'MaterialCommunityIcons',
    backgroundColor: Colors.serviceRed,
    iconColor: Colors.dangerDark,
    route: '/services/tiket-masalah',
    description: 'Sistem ticketing & helpdesk',
  },
  {
    id: 'audit',
    name: 'Audit',
    icon: 'clipboard-check-outline',
    iconFamily: 'MaterialCommunityIcons',
    backgroundColor: brand[50],
    iconColor: brand[700],
    route: '/services/audit',
    description: 'Proses audit internal',
  },
  {
    id: 'human-capital',
    name: 'Human\nCapital',
    icon: 'account-group-outline',
    iconFamily: 'MaterialCommunityIcons',
    backgroundColor: Colors.servicePurple,
    iconColor: '#7e22ce',
    route: '/services/human-capital',
    description: 'Manajemen SDM / HR',
  },
  {
    id: 'kaizen',
    name: 'Kaizen',
    icon: 'lightbulb-on-outline',
    iconFamily: 'MaterialCommunityIcons',
    backgroundColor: Colors.serviceAmber,
    iconColor: '#b45309',
    // Kaizen punya tumpukan layarnya sendiri di dalam tab, bukan halaman
    // layanan generik — karena itu rutenya keluar dari pola `/services/*`.
    route: '/kaizen',
    description: 'Continuous improvement',
  },
  {
    id: 'berita',
    name: 'Berita &\nNotifikasi',
    icon: 'newspaper-variant-outline',
    iconFamily: 'MaterialCommunityIcons',
    backgroundColor: '#E0F7FA',
    iconColor: '#00838F',
    route: '/services/berita',
    description: 'Berita dan pengumuman',
  },
  {
    id: 'kegiatan',
    name: 'Kegiatan',
    icon: 'calendar-check-outline',
    iconFamily: 'MaterialCommunityIcons',
    backgroundColor: Colors.serviceOrange,
    iconColor: '#c2410c',
    route: '/services/kegiatan',
    description: 'Jadwal kegiatan perusahaan',
  },
  {
    id: 'unifi-controller',
    name: 'Unifi\nController',
    icon: 'access-point-network',
    iconFamily: 'MaterialCommunityIcons',
    backgroundColor: Colors.serviceIndigo,
    iconColor: '#283593',
    route: '/services/unifi-controller',
    description: 'Network Management System',
  },
  {
    id: 'pengguna',
    name: 'Pengguna',
    icon: 'account-cog-outline',
    iconFamily: 'MaterialCommunityIcons',
    backgroundColor: '#E0F2F1',
    iconColor: '#00695C',
    route: '/services/pengguna',
    description: 'Manajemen user / akun',
  },
  {
    id: 'access-token',
    name: 'Access\nToken',
    icon: 'key-variant',
    iconFamily: 'MaterialCommunityIcons',
    backgroundColor: '#F9FBE7',
    iconColor: '#827717',
    route: '/services/access-token',
    description: 'Token management / API keys',
  },
  {
    id: 'stok-opname',
    name: 'Stok\nOpname',
    icon: 'clipboard-list-outline',
    iconFamily: 'MaterialCommunityIcons',
    backgroundColor: brand[50],
    iconColor: brand[600],
    route: '/services/sto',
    description: 'Periode, lembar, dan progres perhitungan stok',
  },
];

export default SERVICES;

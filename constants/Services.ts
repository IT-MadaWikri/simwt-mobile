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
    backgroundColor: '#E3F2FD',
    iconColor: '#1565C0',
    route: '/services/database-aset',
    description: 'Manajemen data aset perusahaan',
  },
  {
    id: 'tiket-masalah',
    name: 'Tiket\nMasalah',
    icon: 'ticket-confirmation-outline',
    iconFamily: 'MaterialCommunityIcons',
    backgroundColor: '#FFEBEE',
    iconColor: '#C62828',
    route: '/services/tiket-masalah',
    description: 'Sistem ticketing & helpdesk',
  },
  {
    id: 'audit',
    name: 'Audit',
    icon: 'clipboard-check-outline',
    iconFamily: 'MaterialCommunityIcons',
    backgroundColor: '#E8F5E9',
    iconColor: '#2E7D32',
    route: '/services/audit',
    description: 'Proses audit internal',
  },
  {
    id: 'human-capital',
    name: 'Human\nCapital',
    icon: 'account-group-outline',
    iconFamily: 'MaterialCommunityIcons',
    backgroundColor: '#F3E5F5',
    iconColor: '#7B1FA2',
    route: '/services/human-capital',
    description: 'Manajemen SDM / HR',
  },
  {
    id: 'kaizen',
    name: 'Kaizen',
    icon: 'lightbulb-on-outline',
    iconFamily: 'MaterialCommunityIcons',
    backgroundColor: '#FFF8E1',
    iconColor: '#F57F17',
    route: '/services/kaizen',
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
    backgroundColor: '#FFF3E0',
    iconColor: '#E65100',
    route: '/services/kegiatan',
    description: 'Jadwal kegiatan perusahaan',
  },
  {
    id: 'unifi-controller',
    name: 'Unifi\nController',
    icon: 'access-point-network',
    iconFamily: 'MaterialCommunityIcons',
    backgroundColor: '#E8EAF6',
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
];

export default SERVICES;

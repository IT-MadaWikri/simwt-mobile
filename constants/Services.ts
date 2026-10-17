import Colors, { brand } from '../constants/Colors';

/**
 * SIMWT Mobile — layanan di grid beranda.
 * Hanya modul yang dipakai saat ini (7). Layanan tanpa layar khusus dibuka
 * lewat halaman generik `app/services/[id].tsx` (aksinya diatur di sana).
 */

export interface ServiceItem {
  id: string;
  name: string;
  icon: string;
  backgroundColor: string;
  iconColor: string;
  route: string;
  description: string;
  /** Lencana angka merah di pojok ikon (mis. jumlah yang menunggu); 0/kosong = tidak tampil. */
  lencana?: number;
  /** Belum tersedia: tampil dengan badge "Soon" dan tidak bisa diketuk. */
  segera?: boolean;
}

export const SERVICES: ServiceItem[] = [
  {
    id: 'kaizen',
    name: 'Kaizen',
    icon: 'lightbulb-on-outline',
    backgroundColor: Colors.serviceAmber,
    iconColor: '#b45309',
    // Layar pertama tumpukan Kaizen adalah halaman menu (Kaizen saya / Butuh approval).
    route: '/kaizen',
    description: 'Continuous improvement',
  },
  {
    id: 'tiket-masalah',
    name: 'Tiket\nMasalah',
    icon: 'ticket-confirmation-outline',
    backgroundColor: Colors.serviceRed,
    iconColor: Colors.dangerDark,
    route: '/services/tiket-masalah',
    description: 'Sistem ticketing & helpdesk',
  },
  {
    id: 'database-aset',
    name: 'Aset',
    icon: 'database-outline',
    backgroundColor: brand[50],
    iconColor: brand[700],
    route: '/services/database-aset',
    description: 'Manajemen data aset perusahaan',
  },
  {
    id: 'skill-assessment',
    name: 'Skill\nAssessment',
    icon: 'star-circle-outline',
    backgroundColor: Colors.serviceIndigo,
    iconColor: '#283593',
    route: '/services/skill-assessment',
    description: 'Penilaian keterampilan karyawan produksi',
  },
  {
    id: 'control-stock',
    name: 'Control\nStock',
    icon: 'clipboard-list-outline',
    backgroundColor: Colors.serviceTeal,
    iconColor: '#0f766e',
    route: '/services/control-stock',
    description: 'Stok opname & kontrol stok',
  },
  {
    id: 'layanan-it',
    name: 'Layanan\nIT',
    icon: 'headset',
    backgroundColor: Colors.serviceBlue,
    iconColor: '#1d4ed8',
    route: '/services/layanan-it',
    description: 'Request akun, sistem & bantuan IT',
  },
  {
    id: 'layanan-hrd',
    name: 'Layanan\nHRD',
    icon: 'account-group-outline',
    backgroundColor: Colors.servicePurple,
    iconColor: '#7e22ce',
    route: '/services/layanan-hrd',
    description: 'Data karyawan, rekrutmen & layanan HRD',
  },
];

export default SERVICES;

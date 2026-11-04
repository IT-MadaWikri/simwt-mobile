import { ubin } from './Colors';
import type { NamaIkonSolid } from '../src/components/common/IkonSolid';

// Warna layanan: `ikon` = warna dasar yang cerah (ubin kaca di ServiceIcon diturunkan darinya,
// glifnya putih), `latar` = tint pucatnya untuk tempat lain (mis. halaman layanan).
const pucat = (hex: string) => {
  const n = parseInt(hex.slice(1), 16);
  const k = (g: number) => Math.round(((n >> g) & 255) * 0.15 + 255 * 0.85).toString(16).padStart(2, '0');
  return `#${k(16)}${k(8)}${k(0)}`;
};
const warna = (ikon: string) => ({ latar: pucat(ikon), ikon });
const WARNA = {
  jingga: warna('#ff9a2e'),
  koral: warna('#ff6a5c'),
  tosca: warna('#1fc2a8'),
  ungu: warna('#9a6bff'),
  biru: warna('#4a98ff'),
  pink: warna('#ff5d9a'),
  hijau: warna('#34c96b'),
  cyan: warna('#14b8d4'),
};

// Pasangan ubin datar per hue, berkunci warna `ikon` di atas (sumber nilai: `ubin` di Colors.ts).
export const UBIN: Record<string, { latar: string; glif: string }> = {
  [WARNA.jingga.ikon]: ubin.jingga,
  [WARNA.koral.ikon]: ubin.koral,
  [WARNA.tosca.ikon]: ubin.tosca,
  [WARNA.ungu.ikon]: ubin.ungu,
  [WARNA.biru.ikon]: ubin.biru,
  [WARNA.pink.ikon]: ubin.pink,
  [WARNA.hijau.ikon]: ubin.hijau,
  [WARNA.cyan.ikon]: ubin.cyan,
};

/**
 * SIMWT Mobile — layanan di grid beranda.
 * Hanya modul yang dipakai saat ini (7). Layanan tanpa layar khusus dibuka
 * lewat halaman generik `app/services/[id].tsx` (aksinya diatur di sana).
 */

export interface ServiceItem {
  id: string;
  name: string;
  icon: string;
  /** Ikon solid Streamline untuk ubin grid (lihat `IkonSolid`); bila kosong dipakai `icon` (Lucide). */
  ikonSolid?: NamaIkonSolid;
  backgroundColor: string;
  iconColor: string;
  route: string;
  description: string;
  /** Lencana angka merah di pojok ikon (mis. jumlah yang menunggu); 0/kosong = tidak tampil. */
  lencana?: number;
  /** Belum tersedia: tampil dengan badge "Soon" dan tidak bisa diketuk. */
  segera?: boolean;
  /** `kode` entri menu di web (`menu_items`); tile tampil hanya bila server mengizinkannya. Kosong = semua pengguna. */
  kodeMenu?: string;
}

export const SERVICES: ServiceItem[] = [
  {
    id: 'kaizen',
    name: 'Kaizen',
    icon: 'lightbulb-on-outline',
    ikonSolid: 'lightbulb',
    backgroundColor: WARNA.jingga.latar,
    iconColor: WARNA.jingga.ikon,
    // Layar pertama tumpukan Kaizen adalah halaman menu (Kaizen saya / Butuh approval).
    route: '/kaizen',
    description: 'Continuous improvement',
    kodeMenu: 'simmwt.kaizen',
  },
  {
    id: 'tiket-masalah',
    name: 'Tiket\nMasalah',
    icon: 'ticket-confirmation-outline',
    ikonSolid: 'tickets',
    backgroundColor: WARNA.koral.latar,
    iconColor: WARNA.koral.ikon,
    route: '/services/tiket',
    description: 'Sistem ticketing & helpdesk',
    kodeMenu: 'simmwt.tiket',
  },
  {
    id: 'database-aset',
    name: 'Aset',
    icon: 'database-outline',
    ikonSolid: 'database',
    backgroundColor: WARNA.tosca.latar,
    iconColor: WARNA.tosca.ikon,
    route: '/services/database-aset',
    description: 'Manajemen data aset perusahaan',
    kodeMenu: 'simmwt.aset',
  },
  {
    id: 'layanan-it',
    name: 'Layanan\nIT',
    icon: 'headset',
    ikonSolid: 'customer-support-5',
    backgroundColor: WARNA.pink.latar,
    iconColor: WARNA.pink.ikon,
    route: '/services/layanan-it',
    description: 'Request akun, sistem & bantuan IT',
  },
  {
    id: 'layanan-hrd',
    name: 'Layanan\nHRD',
    icon: 'account-group-outline',
    ikonSolid: 'user-collaborate-group',
    backgroundColor: WARNA.hijau.latar,
    iconColor: WARNA.hijau.ikon,
    route: '/services/layanan-hrd',
    description: 'Data karyawan, rekrutmen & layanan HRD',
  },
  {
    id: 'kegiatan',
    name: 'Kegiatan',
    icon: 'calendar-clock-outline',
    ikonSolid: 'blank-calendar',
    backgroundColor: WARNA.cyan.latar,
    iconColor: WARNA.cyan.ikon,
    route: '/services/kegiatan',
    description: 'Booking ruangan meeting & kegiatan kantor',
    kodeMenu: 'simmwt.kegiatan',
  },
  {
    id: 'pengukuran-qc',
    name: 'Pengukuran\nQC',
    icon: 'gauge',
    ikonSolid: 'dashboard-gauge-1',
    backgroundColor: WARNA.ungu.latar,
    iconColor: WARNA.ungu.ikon,
    route: '/services/pengukuran',
    description: 'Pengukuran part, draf & riwayat QC',
    kodeMenu: 'qc',
  },
];

export default SERVICES;

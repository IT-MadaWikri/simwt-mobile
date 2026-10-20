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
    backgroundColor: WARNA.jingga.latar,
    iconColor: WARNA.jingga.ikon,
    // Layar pertama tumpukan Kaizen adalah halaman menu (Kaizen saya / Butuh approval).
    route: '/kaizen',
    description: 'Continuous improvement',
  },
  {
    id: 'tiket-masalah',
    name: 'Tiket\nMasalah',
    icon: 'ticket-confirmation-outline',
    backgroundColor: WARNA.koral.latar,
    iconColor: WARNA.koral.ikon,
    route: '/services/tiket',
    description: 'Sistem ticketing & helpdesk',
  },
  {
    id: 'database-aset',
    name: 'Aset',
    icon: 'database-outline',
    backgroundColor: WARNA.tosca.latar,
    iconColor: WARNA.tosca.ikon,
    route: '/services/database-aset',
    description: 'Manajemen data aset perusahaan',
  },
  {
    id: 'skill-assessment',
    name: 'Skill\nAssessment',
    icon: 'star-circle-outline',
    backgroundColor: WARNA.ungu.latar,
    iconColor: WARNA.ungu.ikon,
    route: '/services/skill-assessment',
    description: 'Penilaian keterampilan karyawan produksi',
  },
  {
    id: 'control-stock',
    name: 'Control\nStock',
    icon: 'clipboard-list-outline',
    backgroundColor: WARNA.biru.latar,
    iconColor: WARNA.biru.ikon,
    route: '/services/control-stock',
    description: 'Stok opname & kontrol stok',
  },
  {
    id: 'layanan-it',
    name: 'Layanan\nIT',
    icon: 'headset',
    backgroundColor: WARNA.pink.latar,
    iconColor: WARNA.pink.ikon,
    route: '/services/layanan-it',
    description: 'Request akun, sistem & bantuan IT',
  },
  {
    id: 'layanan-hrd',
    name: 'Layanan\nHRD',
    icon: 'account-group-outline',
    backgroundColor: WARNA.hijau.latar,
    iconColor: WARNA.hijau.ikon,
    route: '/services/layanan-hrd',
    description: 'Data karyawan, rekrutmen & layanan HRD',
  },
];

export default SERVICES;

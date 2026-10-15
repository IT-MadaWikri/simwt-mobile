/**
 * Helper tampilan Kaizen yang dipakai bersama layar daftar & detail.
 */
import Colors, { brand, slate } from '../../constants/Colors';

/** Warna pil status. DITERIMA = menunggu penilaian. */
export const WARNA_STATUS: Record<string, { bg: string; fg: string; label: string }> = {
  DITERIMA: { bg: '#fffbeb', fg: '#b45309', label: 'Menunggu penilaian' },
  DISETUJUI: { bg: brand[50], fg: brand[700], label: 'Disetujui' },
  DITOLAK: { bg: '#fef2f2', fg: Colors.dangerDark, label: 'Ditolak' },
};

export const warnaStatus = (status: string) =>
  WARNA_STATUS[status] ?? { bg: slate[100], fg: Colors.textSecondary, label: status };

export const BULAN = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

/** "3 hari lalu", "2 bln lalu". */
export const relatif = (iso: string) => {
  const menit = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 60000));
  if (menit < 60) return `${menit || 1} mnt lalu`;
  const jam = Math.floor(menit / 60);
  if (jam < 24) return `${jam} jam lalu`;
  const hari = Math.floor(jam / 24);
  if (hari < 30) return `${hari} hari lalu`;
  const bulan = Math.floor(hari / 30);
  return bulan < 12 ? `${bulan} bln lalu` : `${Math.floor(bulan / 12)} thn lalu`;
};

/** Foto Kaizen bisa berupa URL penuh atau path storage relatif. */
export const urlFoto = (path?: string | null) =>
  !path ? null : path.startsWith('http') ? path : `https://mwtpart.co.id/storage/${path}`;

/** Ikon, gelar, dan 3 nada warna (terang, utama, gelap) per kategori PQCDSM. */
export const LENCANA: Record<string, { ikon: string; gelar: string; warna: readonly [string, string, string] }> = {
  Productivity: { ikon: 'rocket-launch-outline', gelar: 'Pendobrak Produktivitas', warna: ['#7cc4fa', '#3b9cf0', '#1f6fc4'] },
  Quality: { ikon: 'check-decagram', gelar: 'Penjaga Kualitas', warna: ['#c79bff', '#a46cf0', '#7440c2'] },
  Cost: { ikon: 'piggy-bank', gelar: 'Penghemat Biaya', warna: ['#ffc94d', '#ffa51f', '#d6790a'] },
  Delivery: { ikon: 'truck', gelar: 'Pengawal Pengiriman', warna: ['#6fe0cf', '#22c3ad', '#128f7e'] },
  Safety: { ikon: 'shield-lock-outline', gelar: 'Pelindung Keselamatan', warna: ['#ff8a80', '#f25a52', '#c23630'] },
  Morale: { ikon: 'heart', gelar: 'Penyemangat Tim', warna: ['#f7a3d2', '#e86cb0', '#b8417f'] },
};

/**
 * SIMWT Mobile — Sistem jarak, sudut, dan bayangan.
 *
 * Nilai radius disamakan dengan kelas Tailwind yang dipakai karir-mwt supaya
 * lengkung sudutnya terasa sama:
 *   rounded-lg  = 8   rounded-xl  = 12   rounded-2xl = 16
 *   rounded-3xl = 24  rounded-full = pil
 *
 * `.card-soft` di karir-mwt = rounded-2xl (16), `.field` = rounded-xl (12),
 * `.btn` = rounded-full.
 */

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,

  // Jarak khusus
  screenPadding: 16,
  cardPadding: 16,
  sectionGap: 24,
  itemGap: 12,

  /** Selaras dengan skala rounded-* Tailwind. */
  radius: {
    sm: 6,
    md: 8,
    lg: 12,
    xl: 16,
    xxl: 24,
    full: 999,
  },
};

/**
 * Bayangan. karir-mwt memakai `shadow-sm` untuk kartu diam dan bayangan brand
 * berwarna untuk tombol utama (`shadow-brand-600/25`) — keduanya ditiru di sini.
 *
 * Di Android hanya `elevation` yang berlaku; properti `shadow*` khusus iOS.
 * Warna bayangan tidak bisa diatur di Android sebelum API 28, jadi bayangan
 * hijau tombol akan tampil sebagai abu-abu di perangkat lama — itu wajar.
 */
export const Shadows = {
  /** Kartu diam — setara `shadow-sm`. */
  card: {
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  /** Elemen terangkat: bottom sheet, kartu sorot. */
  raised: {
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 14,
    elevation: 6,
  },
  /** Tombol utama — meniru `shadow-lg shadow-brand-600/25`. */
  brand: {
    shadowColor: '#05924e',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.28,
    shadowRadius: 12,
    elevation: 6,
  },
  none: {
    shadowColor: 'transparent',
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
} as const;

export default Spacing;

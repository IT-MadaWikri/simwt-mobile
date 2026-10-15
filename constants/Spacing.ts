/**
 * SIMWT Mobile — Sistem jarak, sudut, dan bayangan.
 *
 * ── Prinsip bentuk ───────────────────────────────────────────────────────
 * 1. **Tanpa bayangan.** Pemisah antar-elemen memakai warna latar dan garis
 *    tipis (`Colors.borderSubtle`), bukan shadow/elevation. Lihat `Shadows`.
 * 2. **Sudut besar & membulat.** Kartu 24, blok di dalam kartu 16,
 *    gambar/ubin kecil 12, field 20, sheet & dialog 28. Tombol, chip, badge,
 *    segmen dan kolom cari selalu pil (`full`). Setiap elemen bersudut juga
 *    memakai `Spacing.curve` (squircle iOS; Android memakai busur biasa).
 *    Elemen di dalam elemen bersudut: radius dalam = radius luar − jarak tepi.
 * 3. **Gradasi seminimal mungkin.** Pakai warna rata; gradasi hanya boleh
 *    bila benar-benar perlu (mis. selubung teks di atas foto: `scrim`).
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

  /**
   * Skala radius standar aplikasi. `xl` = kartu, `md` = blok di dalam kartu,
   * `sm` = gambar & ubin ikon, `lg` = field, `xxl` = bottom sheet & dialog,
   * `full` = tombol, chip, badge, segmen (pil).
   */
  radius: {
    sm: 12,
    md: 16,
    lg: 20,
    xl: 24,
    xxl: 28,
    screen: 48,
    full: 999,
  },

  /** Kelengkungan kontinu (squircle) ala iOS. Sebar bersama `borderRadius`. */
  curve: { borderCurve: 'continuous' as const },
};

/**
 * Bayangan — **dimatikan di seluruh aplikasi** (lihat prinsip bentuk di atas).
 * Key lama tetap ada supaya kode yang masih menyebarnya tidak patah, tetapi
 * semuanya bernilai kosong. Jangan menambah bayangan baru; pakai latar atau
 * `borderWidth: 1` + `Colors.borderSubtle` untuk memisahkan elemen.
 */
const NONE = {
  shadowColor: 'transparent',
  shadowOffset: { width: 0, height: 0 },
  shadowOpacity: 0,
  shadowRadius: 0,
  elevation: 0,
} as const;

export const Shadows = {
  card: NONE,
  raised: NONE,
  brand: NONE,
  none: NONE,
} as const;

export default Spacing;

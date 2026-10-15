/**
 * SIMWT Mobile — Palet warna.
 *
 * ── Arah desain: perpaduan Gojek × karir-mwt ─────────────────────────────
 * Aplikasi ini mempertahankan **ergonomi mobile ala Gojek** (grid ikon layanan
 * dengan ubin pastel, kartu putih di atas latar lembut, search bar pil, bottom
 * tab) tetapi memakai **identitas visual karir-mwt**: skala hijau brand,
 * netral slate, font Poppins, sudut membulat, dan tombol pil bergradien.
 *
 * Sumber nilai brand & netral adalah blok `@theme` di
 * `karir-mwt/app/globals.css` (token Tailwind v4) — kalau di sana berubah,
 * samakan di sini juga.
 *
 * Netral memakai skala **slate** Tailwind, persis seperti karir-mwt
 * (`text-slate-600`, `border-slate-200`, dst.) — bukan abu-abu netral murni;
 * slate sedikit kebiruan dan itu memang disengaja.
 *
 * Yang tetap dari Gojek: ubin ikon pastel (`service*` di bawah) dan latar
 * halaman yang lebih terang dari kartunya, supaya kartu terasa "mengambang".
 */

/** Skala hijau brand PT Mada Wikri Tunggal. Identik dengan --color-brand-* di karir-mwt. */
export const brand = {
  50: '#ecfdf3',
  100: '#d1fadf',
  200: '#a6f4c5',
  300: '#6ce9a6',
  400: '#32d583',
  500: '#12b76a',
  600: '#05924e',
  700: '#065b32',
  800: '#054a2a',
  900: '#043d23',
  950: '#011a0e',
} as const;

/**
 * Palet gradasi — empat warna berurutan dari terang ke gelap (mint → hijau →
 * teal → navy). Dipakai HANYA untuk `<LinearGradient>` (header beranda,
 * banner); elemen rata tetap memakai skala `brand`.
 */
export const palet = {
  mint: '#DDF4E7',
  hijau: '#67C090',
  teal: '#26667F',
  navy: '#124170',
} as const;

/** Skala netral Tailwind `slate`. */
export const slate = {
  50: '#f8fafc',
  100: '#f1f5f9',
  200: '#e2e8f0',
  300: '#cbd5e1',
  400: '#94a3b8',
  500: '#64748b',
  600: '#475569',
  700: '#334155',
  800: '#1e293b',
  900: '#0f172a',
} as const;

export const Colors = {
  brand,
  slate,

  /** Warna teks utama karir-mwt (--color-ink) — hijau sangat gelap, bukan hitam. */
  ink: '#0f1b14',

  // ── Brand (alias yang dipakai di seluruh aplikasi) ──────────────────
  primary: brand[600],
  primaryDark: brand[700],
  primaryDarker: brand[900],
  primaryLight: brand[50],
  /** Gradien tombol utama karir-mwt: from-brand-700 → to-brand-500. */
  primaryGradientStart: brand[700],
  primaryGradientEnd: brand[500],

  secondary: '#0f1b14',
  accent: brand[400],

  // ── Status ──────────────────────────────────────────────────────────
  danger: '#ef4444',
  dangerDark: '#dc2626',
  /** Dipakai karir-mwt untuk label "Ditutup" (text-rose-500). */
  rose: '#f43f5e',
  warning: '#f59e0b',
  success: brand[600],
  info: '#0ea5e9',

  // ── Netral ──────────────────────────────────────────────────────────
  white: '#ffffff',
  black: '#000000',
  /** Latar halaman bersuasana brand — `.section-bg` di karir-mwt. */
  background: '#f3faf7',
  /** Latar putih polos, dipakai kalau konten sudah penuh kartu. */
  backgroundPlain: '#ffffff',
  card: '#ffffff',

  // ── Warna teks (standar design system) ─────────────────────────────
  //   textPrimary   — judul, label, dan nilai/angka utama.
  //   textSecondary — body text: deskripsi, isi pesan, subjudul (abu-abu).
  //   textTertiary  — caption/meta: waktu, keterangan kecil, placeholder.
  // Jangan menulis hex/warna lain untuk teks biasa; pakai token ini
  // (atau gs.title / gs.body / gs.bodySm / gs.caption di GlobalStyles).
  textPrimary: '#0f1b14',
  textSecondary: slate[600],
  textTertiary: slate[400],
  textOnBrand: '#ffffff',

  border: slate[200],
  borderSubtle: slate[100],
  disabled: slate[300],
  placeholder: slate[400],

  // ── Latar ikon lembut ───────────────────────────────────────────────
  // karir-mwt memakai `bg-brand-50 text-brand-600` untuk kotak ikon. Varian
  // non-brand di bawah dipakai untuk membedakan kategori layanan di beranda.
  serviceBrand: brand[50],
  serviceBlue: '#eff6ff',
  serviceGreen: brand[50],
  serviceOrange: '#fff7ed',
  servicePurple: '#faf5ff',
  serviceRed: '#fef2f2',
  serviceTeal: '#f0fdfa',
  serviceAmber: '#fffbeb',
  serviceIndigo: '#eef2ff',
  serviceCyan: '#ecfeff',
  serviceLime: '#f7fee7',

  // ── Varian tema (dipakai komponen bawaan Expo) ──────────────────────
  light: {
    text: '#0f1b14',
    textSecondary: slate[600],
    background: '#f3faf7',
    card: '#ffffff',
    tint: brand[600],
    tabIconDefault: slate[400],
    tabIconSelected: brand[600],
    border: slate[200],
  },
  dark: {
    text: '#e8f5ee',
    textSecondary: slate[400],
    background: brand[950],
    card: brand[900],
    tint: brand[400],
    tabIconDefault: slate[500],
    tabIconSelected: brand[400],
    border: brand[800],
  },
};

export default Colors;

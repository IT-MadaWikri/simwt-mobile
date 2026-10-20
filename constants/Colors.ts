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

/** Skala hijau brand. Titik 400 = mint palet (#00FF99); 600+ digelapkan agar teks putih terbaca. */
export const brand = {
  50: '#ecfff6',
  100: '#c9ffe4',
  200: '#8dffc9',
  300: '#3dffb0',
  400: '#00ff99',
  500: '#00d67f',
  600: '#00894f',
  700: '#006b3e',
  800: '#00552f',
  900: '#00432a',
  950: '#00231a',
} as const;

/**
 * Palet — mint, hijau limau, krem, kuning. Dasar `gradasiPalet` (untuk
 * `<LinearGradient>`: banner, layar login); elemen rata tetap memakai skala `brand`.
 */
export const palet = {
  mint: '#00FF99',
  limau: '#B8FFA3',
  krem: '#FFFBA6',
  kuning: '#FFE600',
} as const;

/** Aksen kuning dari palet — untuk sorotan kecil, bukan latar luas. */
export const aksen = {
  krem: palet.krem,
  kuning: palet.kuning,
} as const;

/** Gradasi gabungan seluruh palet (mint → hijau limau → krem → kuning). Dipakai untuk `<LinearGradient>`. */
export const gradasiPalet = [palet.mint, palet.limau, palet.krem, palet.kuning] as const;

/** `gradasiPalet` dicampur ±50% putih — latar luas yang tidak terlalu kontras (mis. header beranda). */
export const gradasiLembut = ['#80FFCC', '#DBFFD1', '#FFFDD2', '#FFF280'] as const;

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
  ink: '#0c1b1a',

  // ── Brand (alias yang dipakai di seluruh aplikasi) ──────────────────
  primary: brand[600],
  primaryDark: brand[700],
  primaryDarker: brand[900],
  primaryLight: brand[50],
  /** Gradien tombol utama karir-mwt: from-brand-700 → to-brand-500. */
  primaryGradientStart: brand[700],
  primaryGradientEnd: brand[500],

  secondary: '#0c1b1a',
  accent: aksen.kuning,

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
  background: '#f4fbf7',
  /** Latar putih polos, dipakai kalau konten sudah penuh kartu. */
  backgroundPlain: '#ffffff',
  card: '#ffffff',

  // ── Warna teks (standar design system) ─────────────────────────────
  //   textPrimary   — judul, label, dan nilai/angka utama.
  //   textSecondary — body text: deskripsi, isi pesan, subjudul (abu-abu).
  //   textTertiary  — caption/meta: waktu, keterangan kecil, placeholder.
  // Jangan menulis hex/warna lain untuk teks biasa; pakai token ini
  // (atau gs.title / gs.body / gs.bodySm / gs.caption di GlobalStyles).
  textPrimary: '#0c1b1a',
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
    text: '#0c1b1a',
    textSecondary: slate[600],
    background: '#f4fbf7',
    card: '#ffffff',
    tint: brand[600],
    tabIconDefault: slate[400],
    tabIconSelected: brand[600],
    border: slate[200],
  },
  dark: {
    text: '#e6faf7',
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

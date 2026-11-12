/**
 * SIMWT Mobile — Sistem tipografi.
 *
 * Dua keluarga: **Inter** untuk teks isi (`fonts`) dan **Poppins** untuk judul
 * (`fontsJudul`, sama dengan portal karir `karir-mwt`). Keduanya dari
 * `@expo-google-fonts/*`, di-load di `app/_layout.tsx`; nama family di bawah
 * HARUS sama persis dengan key yang didaftarkan ke `useFonts()` di sana.
 * Teks yang bukan judul memakai `fonts`; style berjudul memakai `fontsJudul`.
 *
 * React Native tidak punya konsep "font global" seperti CSS `body { font-family }`,
 * jadi setiap style teks wajib menyebut `fontFamily` sendiri. Jangan menulis
 * `fontWeight` bersama Poppins — di Android bobot palsu (synthetic bold) akan
 * menimpa file font yang benar dan hasilnya tidak konsisten dengan iOS. Pakai
 * varian family-nya (`semibold`, `bold`, …), bukan `fontWeight`.
 *
 * Skala ukuran memakai standar umum aplikasi mobile: isi 14, catatan/caption 12,
 * judul kartu 16, judul app bar 18, lalu 20/24/28 untuk judul besar.
 */

/** Teks isi (body, label, nama, angka, tombol) — **Inter**. */
export const fonts = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semibold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
  extrabold: 'Inter_800ExtraBold',
} as const;

/** Judul (app bar, judul sheet/dialog/bagian/kartu, h1–h3) — **Poppins**. */
export const fontsJudul = {
  regular: 'Poppins_400Regular',
  medium: 'Poppins_500Medium',
  semibold: 'Poppins_600SemiBold',
  bold: 'Poppins_700Bold',
  extrabold: 'Poppins_800ExtraBold',
} as const;

/** Ukuran teks isi (body, input, label, tombol, nama) — 14px. */
export const ukuranIsi = 14;

/** Ukuran teks catatan (caption, meta, waktu, lencana, keterangan kecil) — 12px. */
export const ukuranCatatan = 12;

/** Gaya judul app bar — dipakai SEMUA header supaya ukurannya seragam. */
export const judulAppBar = { fontFamily: fontsJudul.bold, fontSize: 18 } as const;

export const Typography = {
  fonts,
  fontsJudul,

  /** Ukuran font (px): xs caption, sm/md isi, lg judul kartu, xl–display judul besar. */
  sizes: {
    xs: 12,
    sm: 14,
    md: 14,
    lg: 16,
    xl: 18,
    xxl: 20,
    xxxl: 24,
    display: 28,
  },

  /**
   * Disediakan untuk komponen pihak ketiga yang hanya menerima `fontWeight`.
   * Untuk teks biasa, pilih varian di `fonts` — jangan pakai ini bersama Poppins.
   */
  weights: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    extrabold: '800' as const,
  },

  /** Pengali line-height. Kalikan dengan ukuran font. */
  lineHeights: {
    tight: 1.2,
    normal: 1.45,
    relaxed: 1.65,
  },

  /**
   * Jarak antar huruf. `wide` meniru `tracking-[0.25em]` pada
   * `.section-eyebrow` karir-mwt (label kecil huruf kapital).
   */
  letterSpacing: {
    tight: -0.3,
    normal: 0,
    wide: 2.5,
  },
};

export default Typography;

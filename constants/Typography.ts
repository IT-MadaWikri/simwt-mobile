/**
 * SIMWT Mobile — Sistem tipografi.
 *
 * Memakai **Poppins**, font yang sama dengan portal karir `karir-mwt`
 * (di sana lewat `next/font/google`, di sini lewat `@expo-google-fonts/poppins`).
 * Font di-load di `app/_layout.tsx`; nama family di bawah HARUS sama persis
 * dengan key yang didaftarkan ke `useFonts()` di sana.
 *
 * React Native tidak punya konsep "font global" seperti CSS `body { font-family }`,
 * jadi setiap style teks wajib menyebut `fontFamily` sendiri. Jangan menulis
 * `fontWeight` bersama Poppins — di Android bobot palsu (synthetic bold) akan
 * menimpa file font yang benar dan hasilnya tidak konsisten dengan iOS. Pakai
 * varian family-nya (`semibold`, `bold`, …), bukan `fontWeight`.
 *
 * Skala ukuran mengikuti kebutuhan mobile ala Gojek (padat, mudah dipindai),
 * bukan skala desktop karir-mwt.
 */

export const fonts = {
  regular: 'Poppins_400Regular',
  medium: 'Poppins_500Medium',
  semibold: 'Poppins_600SemiBold',
  bold: 'Poppins_700Bold',
  extrabold: 'Poppins_800ExtraBold',
} as const;

export const Typography = {
  fonts,

  /** Ukuran font (px). */
  sizes: {
    xs: 11,
    sm: 12,
    md: 14,
    lg: 16,
    xl: 18,
    xxl: 22,
    xxxl: 28,
    display: 34,
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

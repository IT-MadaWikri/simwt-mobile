/**
 * SIMWT Mobile — Kelas style global.
 *
 * Ini padanan React Native dari blok `@layer components` di
 * `karir-mwt/app/globals.css` (`.btn`, `.btn-primary`, `.card-soft`, `.field`,
 * `.section-title`, `.section-eyebrow`, …). Tujuannya sama: satu sumber
 * kebenaran untuk tampilan, supaya layar tidak lagi menulis ulang warna,
 * radius, dan bayangan satu per satu.
 *
 * ── Cara pakai ───────────────────────────────────────────────────────────
 *   import { gs, gradients } from '../constants/GlobalStyles';
 *
 *   <View style={gs.cardSoft}>                    // satu kelas
 *   <Text style={[gs.h2, gs.textBrand]}>          // gabung, mirip className
 *   <View style={[gs.badge, gs.badgeBrand]}>
 *
 * Array style di RN berperan seperti daftar class di HTML: yang belakang
 * menimpa yang depan.
 *
 * ── Aturan main ──────────────────────────────────────────────────────────
 * 1. Style yang dipakai lebih dari satu layar HARUS pindah ke sini, jangan
 *    disalin. StyleSheet lokal di layar hanya untuk hal yang benar-benar khas
 *    layar itu (posisi absolut, tinggi tertentu, dsb).
 * 2. Jangan menulis kode warna mentah di layar — ambil dari `Colors`.
 * 3. Setiap style teks wajib menyebut `fontFamily`. RN tidak punya pewarisan
 *    font seperti CSS, jadi teks tanpa `fontFamily` akan jatuh ke font sistem
 *    dan langsung terlihat beda sendiri.
 * 4. Jangan pasangkan `fontWeight` dengan Poppins — pakai varian family
 *    (`fonts.semibold`, `fonts.bold`, …). Lihat catatan di `Typography.ts`.
 */
import { Platform, StyleSheet, TextStyle } from 'react-native';
import Colors, { brand, slate } from './Colors';
import Spacing from './Spacing';
import Typography, { fonts } from './Typography';

const { sizes, lineHeights, letterSpacing } = Typography;

/**
 * Mematikan cincin fokus bawaan browser pada input.
 *
 * Di web, `<TextInput>` dirender react-native-web menjadi `<input>` sungguhan,
 * dan browser menggambar outline sendiri saat elemen itu fokus — outline yang
 * digambar DI LUAR kotak elemen, sehingga menembus `overflow: 'hidden'` milik
 * pembungkusnya dan terlihat seperti garis kotak yang bocor melewati tepi
 * field. Di Android/iOS properti ini tidak ada dan diabaikan begitu saja.
 *
 * `outlineStyle` bukan bagian dari tipe style React Native (khusus RN Web),
 * jadi perlu di-cast. Ini satu-satunya tempat yang boleh melakukannya —
 * pakai `inputReset` ini, jangan menulis ulang cast-nya di layar.
 */
export const inputReset = Platform.select({
  web: { outlineStyle: 'none' } as unknown as TextStyle,
  default: {} as TextStyle,
});

export const gs = StyleSheet.create({
  // ══════════════════════════════════════════════════════════════════════
  // TATA LETAK
  // ══════════════════════════════════════════════════════════════════════

  /** Akar layar — latar lembut bersuasana brand, kartu "mengambang" di atasnya. */
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  /** Akar layar dengan latar putih polos, untuk halaman berisi formulir. */
  screenPlain: {
    flex: 1,
    backgroundColor: Colors.backgroundPlain,
  },
  /** Padding tepi standar — padanan `.container-x`. */
  containerX: {
    paddingHorizontal: Spacing.screenPadding,
  },
  /** Isi ScrollView: padding tepi + ruang napas di bawah. */
  scrollContent: {
    padding: Spacing.screenPadding,
    paddingBottom: Spacing.xxxl,
  },
  /** Jarak antar blok konten — padanan `.section`. */
  section: {
    marginBottom: Spacing.sectionGap,
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  /** Isi layar penuh & terpusat, untuk status memuat / kosong / gagal. */
  centerFill: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rowWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  flex1: {
    flex: 1,
  },
  gapXs: { gap: Spacing.xs },
  gapSm: { gap: Spacing.sm },
  gapMd: { gap: Spacing.md },
  gapLg: { gap: Spacing.lg },

  // ══════════════════════════════════════════════════════════════════════
  // TIPOGRAFI
  // ══════════════════════════════════════════════════════════════════════

  /** Teks dasar. Titik awal untuk teks apa pun yang tidak punya kelas khusus. */
  textBase: {
    fontFamily: fonts.regular,
    fontSize: sizes.md,
    lineHeight: sizes.md * lineHeights.normal,
    color: Colors.textPrimary,
  },
  h1: {
    fontFamily: fonts.extrabold,
    fontSize: sizes.xxxl,
    lineHeight: sizes.xxxl * lineHeights.tight,
    color: Colors.textPrimary,
    letterSpacing: letterSpacing.tight,
  },
  h2: {
    fontFamily: fonts.bold,
    fontSize: sizes.xxl,
    lineHeight: sizes.xxl * lineHeights.tight,
    color: Colors.textPrimary,
  },
  h3: {
    fontFamily: fonts.bold,
    fontSize: sizes.xl,
    lineHeight: sizes.xl * lineHeights.tight,
    color: Colors.textPrimary,
  },
  /** Judul kartu / baris daftar. */
  title: {
    fontFamily: fonts.semibold,
    fontSize: sizes.lg,
    lineHeight: sizes.lg * lineHeights.normal,
    color: Colors.textPrimary,
  },
  /** Judul blok konten — padanan `.section-title h2` (hijau, tebal). */
  sectionTitle: {
    fontFamily: fonts.bold,
    fontSize: sizes.xl,
    lineHeight: sizes.xl * lineHeights.tight,
    color: brand[700],
    marginBottom: Spacing.md,
  },
  /** Label kecil huruf kapital di atas judul — padanan `.section-eyebrow`. */
  sectionEyebrow: {
    fontFamily: fonts.semibold,
    fontSize: sizes.xs,
    color: brand[500],
    textTransform: 'uppercase',
    letterSpacing: letterSpacing.wide,
    marginBottom: Spacing.xs,
  },
  /** Teks isi standar — 12px (lihat `ukuranIsi`). */
  body: {
    fontFamily: fonts.regular,
    fontSize: sizes.sm,
    lineHeight: sizes.sm * lineHeights.relaxed,
    color: Colors.textSecondary,
  },
  bodySm: {
    fontFamily: fonts.regular,
    fontSize: sizes.sm,
    lineHeight: sizes.sm * lineHeights.normal,
    color: Colors.textSecondary,
  },
  caption: {
    fontFamily: fonts.regular,
    fontSize: sizes.xs,
    lineHeight: sizes.xs * lineHeights.normal,
    color: Colors.textTertiary,
  },
  /** Label di atas input. */
  label: {
    fontFamily: fonts.semibold,
    fontSize: sizes.sm,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  /** Angka besar di kartu statistik. */
  metric: {
    fontFamily: fonts.extrabold,
    fontSize: sizes.xxl,
    lineHeight: sizes.xxl * lineHeights.tight,
    color: Colors.textPrimary,
  },

  // Pengubah warna teks — gabungkan dengan kelas tipografi di atas.
  textBrand: { color: brand[600] },
  textBrandDark: { color: brand[700] },
  textMuted: { color: Colors.textSecondary },
  textFaint: { color: Colors.textTertiary },
  textOnBrand: { color: Colors.textOnBrand },
  textDanger: { color: Colors.danger },
  textWarning: { color: Colors.warning },
  textCenter: { textAlign: 'center' },
  textSemibold: { fontFamily: fonts.semibold },
  textBold: { fontFamily: fonts.bold },

  // ══════════════════════════════════════════════════════════════════════
  // KARTU — padanan `.card-soft`
  // ══════════════════════════════════════════════════════════════════════

  /** Kartu dasar: putih, sudut 2xl, garis tepi tipis, bayangan halus. */
  cardSoft: {
    backgroundColor: Colors.card,
    borderRadius: Spacing.radius.xl,
    ...Spacing.curve,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
  },
  /** Kartu yang sudah berisi padding — pemakaian paling umum. */
  card: {
    backgroundColor: Colors.card,
    borderRadius: Spacing.radius.xl,
    ...Spacing.curve,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
    padding: Spacing.cardPadding,
  },
  /** Kartu bernuansa brand, untuk menyorot satu hal penting. */
  cardBrand: {
    backgroundColor: brand[50],
    borderRadius: Spacing.radius.xl,
    ...Spacing.curve,
    borderWidth: 1,
    borderColor: brand[100],
    padding: Spacing.cardPadding,
  },
  cardRaised: {
    backgroundColor: Colors.card,
    borderRadius: Spacing.radius.xl,
    ...Spacing.curve,
    padding: Spacing.cardPadding,
  },

  /** Baris daftar di dalam kartu: label di kiri, nilai di kanan. */
  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.card,
    borderRadius: Spacing.radius.lg,
    ...Spacing.curve,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  listRowLabel: {
    flex: 1,
    marginRight: Spacing.sm,
    fontFamily: fonts.regular,
    fontSize: sizes.md,
    color: Colors.textPrimary,
  },
  listRowValue: {
    fontFamily: fonts.bold,
    fontSize: sizes.md,
    color: brand[600],
  },

  divider: {
    height: 1,
    backgroundColor: Colors.borderSubtle,
    marginVertical: Spacing.md,
  },

  // ══════════════════════════════════════════════════════════════════════
  // FORMULIR — padanan `.field`
  // ══════════════════════════════════════════════════════════════════════

  field: {
    width: '100%',
    borderRadius: Spacing.radius.lg,
    ...Spacing.curve,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.card,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    fontFamily: fonts.regular,
    fontSize: sizes.md,
    color: Colors.textPrimary,
    ...inputReset,
  },
  /** Tambahkan saat input sedang fokus (`focus:border-brand-500`). */
  fieldFocused: {
    borderColor: brand[500],
    backgroundColor: brand[50],
  },
  fieldError: {
    borderColor: Colors.danger,
  },
  /** Pembungkus input yang punya ikon di kiri. */
  fieldWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    borderRadius: Spacing.radius.lg,
    ...Spacing.curve,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.card,
    paddingHorizontal: Spacing.lg,
  },
  /** Input polos di dalam `fieldWrap` — tepinya sudah dipegang pembungkus. */
  fieldInner: {
    flex: 1,
    paddingVertical: Spacing.md,
    fontFamily: fonts.regular,
    fontSize: sizes.md,
    color: Colors.textPrimary,
    ...inputReset,
  },
  /** Search bar pil ala Gojek. */
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    borderRadius: Spacing.radius.full,
    ...Spacing.curve,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  errorText: {
    fontFamily: fonts.regular,
    fontSize: sizes.sm,
    color: Colors.danger,
    marginTop: Spacing.xs,
  },

  // ══════════════════════════════════════════════════════════════════════
  // LENCANA & CHIP
  // ══════════════════════════════════════════════════════════════════════

  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    alignSelf: 'flex-start',
    borderRadius: Spacing.radius.full,
    ...Spacing.curve,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
  },
  badgeBrand: { backgroundColor: brand[50] },
  badgeMuted: { backgroundColor: slate[100] },
  badgeDanger: { backgroundColor: '#fef2f2' },
  badgeWarning: { backgroundColor: '#fffbeb' },
  // Teks lencana/badge sengaja lebih kecil (10) dari teks isi (12) supaya muat di dalam pil.
  badgeText: {
    fontFamily: fonts.semibold,
    fontSize: 10,
  },
  badgeTextBrand: { color: brand[700] },
  badgeTextMuted: { color: Colors.textSecondary },
  badgeTextDanger: { color: Colors.dangerDark },
  badgeTextWarning: { color: '#b45309' },

  // ══════════════════════════════════════════════════════════════════════
  // UBIN IKON — bagian Gojek yang dipertahankan
  // ══════════════════════════════════════════════════════════════════════

  /** Kotak ikon kecil di dalam kartu — `bg-brand-50 text-brand-600`. */
  iconTile: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Spacing.radius.lg,
    ...Spacing.curve,
    backgroundColor: brand[50],
  },
  /** Ubin besar untuk grid layanan di beranda. */
  iconTileLg: {
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Spacing.radius.xl,
    ...Spacing.curve,
    backgroundColor: brand[50],
  },
  /** Avatar bulat. */
  avatar: {
    width: 44,
    height: 44,
    borderRadius: Spacing.radius.full,
    ...Spacing.curve,
    backgroundColor: brand[50],
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },

  // ══════════════════════════════════════════════════════════════════════
  // KEADAAN KOSONG / GAGAL
  // ══════════════════════════════════════════════════════════════════════

  emptyTitle: {
    fontFamily: fonts.semibold,
    fontSize: sizes.lg,
    color: Colors.textPrimary,
    marginTop: Spacing.md,
    textAlign: 'center',
  },
  emptyText: {
    fontFamily: fonts.regular,
    fontSize: sizes.sm,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
    textAlign: 'center',
  },
});

export default gs;

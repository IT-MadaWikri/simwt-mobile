/**
 * LoadingSpinner — satu pintu untuk semua keadaan "sedang memuat".
 *
 * Ada dua bentuk, dan keduanya dipanggil lewat komponen ini supaya tidak ada
 * lagi layar yang menulis `<ActivityIndicator>` sendiri dengan warna dan tata
 * letak berbeda-beda:
 *
 *   <LoadingSpinner fullScreen />     → layar penuh bergaya karir-mwt
 *                                       (LoadingScreen: cincin berputar,
 *                                       latar hijau gelap, garis progres)
 *   <LoadingSpinner message="..." />  → sisipan di dalam halaman
 *
 * Versi sisipan **memenuhi ruang induknya dan memusatkan diri** (`flex: 1`),
 * bukan menempel di atas. Sebelumnya ia hanya sebesar isinya, sehingga saat
 * dipakai sebagai keadaan memuat satu halaman penuh — misalnya layar Stok
 * Opname — spinner-nya nangkring di tepi atas alih-alih di tengah layar.
 * Kalau perlu menyisipkannya di dalam baris kecil, pakai `inline`.
 */
import React from 'react';
import { View, Text } from 'react-native';
import Spacing from '../../../constants/Spacing';
import { gs } from '../../../constants/GlobalStyles';
import BrandSpinner from './BrandSpinner';
import LoadingScreen from './LoadingScreen';

interface LoadingSpinnerProps {
  /** Tampilkan layar muat brand satu halaman penuh. */
  fullScreen?: boolean;
  /** Teks di bawah indikator (hanya versi sisipan). */
  message?: string;
  size?: 'small' | 'large';
  /** Jangan memenuhi ruang induk — untuk sisipan di dalam baris/tombol. */
  inline?: boolean;
  /** Judul pada versi layar penuh. */
  title?: string;
  /** Subjudul pada versi layar penuh. */
  subtitle?: string;
}

export default function LoadingSpinner({
  fullScreen = false,
  message,
  size = 'large',
  inline = false,
  title,
  subtitle,
}: LoadingSpinnerProps) {
  if (fullScreen) {
    return <LoadingScreen title={title} subtitle={subtitle} />;
  }

  return (
    <View style={inline ? [gs.center, { padding: Spacing.md }] : gs.centerFill}>
      <BrandSpinner size={size === 'small' ? 26 : 44} />
      {message ? (
        <Text style={[gs.bodySm, gs.textCenter, { marginTop: Spacing.md }]}>{message}</Text>
      ) : null}
    </View>
  );
}

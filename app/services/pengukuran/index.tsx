/**
 * Splash modul Pengukuran QC — layar pertama tumpukan, dibuka dari ikon di beranda. Tampil sebentar
 * seperti modul eksternal yang sedang dibuka, lalu menggantikan dirinya dengan menu (jadi tombol
 * kembali dari menu langsung ke beranda, bukan ke splash).
 */
import React, { useEffect } from 'react';
import { Stack, useRouter } from 'expo-router';
import SplashModul from '../../../src/components/common/SplashModul';

const DURASI_SPLASH = 1400;

export default function SplashPengukuranScreen() {
  const router = useRouter();

  // Pindah otomatis; bila pengguna kembali lebih dulu, pembersihan efek membatalkan pindahnya.
  useEffect(() => {
    const t = setTimeout(() => router.replace('/services/pengukuran/menu' as never), DURASI_SPLASH);
    return () => clearTimeout(t);
  }, [router]);

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SplashModul ikon="gauge" nama="Pengukuran QC" warna="#9a6bff" />
    </>
  );
}

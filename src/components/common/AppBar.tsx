/**
 * AppBar — app bar standar SIMMWT: hijau, judul putih 14px bold, tombol
 * kembali `TombolKembali`. Satu-satunya sumber gaya header di aplikasi.
 *
 * Di dalam layar:
 *   <AppBar judul="Data Karyawan" />
 *   <AppBar judul="Edit Pengguna" kanan={<TombolSimpan />} />
 *
 * Di `_layout.tsx` (berlaku untuk semua layar tumpukan itu):
 *   <Stack screenOptions={{ ...opsiAppBar, animation: ... }}>
 *
 * Halaman akar tab (tanpa riwayat untuk dimundurkan) pakai `gayaAppBar`,
 * yaitu gaya yang sama tanpa tombol kembali.
 */
import React from 'react';
import { Stack } from 'expo-router';
import TombolKembali from './TombolKembali';
import Colors from '../../../constants/Colors';
import Spacing from '../../../constants/Spacing';
import { judulAppBar } from '../../../constants/Typography';

export const gayaAppBar = {
  headerShown: true,
  headerStyle: { backgroundColor: '#31AAA9' },
  headerTintColor: Colors.white,
  headerTitleStyle: { ...judulAppBar, color: Colors.white },
  headerShadowVisible: false,
  // Header Tabs (bukan native-stack) menaruh headerLeft menempel ke tepi
  // layar; padding ini menyamakan posisinya. Native-stack mengabaikannya.
  headerLeftContainerStyle: { paddingLeft: Spacing.lg },
};

export const opsiAppBar = {
  ...gayaAppBar,
  headerLeft: () => <TombolKembali />,
};

interface AppBarProps {
  judul: string;
  /** Elemen di sisi kanan (mis. tombol simpan). */
  kanan?: React.ReactNode;
  /** Sembunyikan tombol kembali (halaman akar). */
  tanpaKembali?: boolean;
}

export default function AppBar({ judul, kanan, tanpaKembali }: AppBarProps) {
  return (
    <Stack.Screen
      options={{
        ...(tanpaKembali ? gayaAppBar : opsiAppBar),
        title: judul,
        headerRight: kanan ? () => kanan : undefined,
      }}
    />
  );
}

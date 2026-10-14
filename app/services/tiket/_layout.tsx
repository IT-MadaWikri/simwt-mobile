/**
 * Tumpukan layar Tiket Masalah: riwayat (index) → buat → detail ([nomor]).
 */
import React from 'react';
import { Stack } from 'expo-router';
import Colors from '../../../constants/Colors';
import { fonts } from '../../../constants/Typography';
import TombolKembali from '../../../src/components/common/TombolKembali';

export default function TiketLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: Colors.primary },
        headerTintColor: Colors.white,
        headerTitleStyle: { fontFamily: fonts.semibold },
        headerShadowVisible: false,
        // Layar PERTAMA tumpukan ini tidak dapat tombol kembali otomatis —
        // ia akar tumpukannya sendiri, walau tumpukan induk masih bisa
        // dimundurkan. Dipasang manual supaya tidak ada layar buntu.
        headerLeft: () => <TombolKembali />,
        // Selaras dengan Stack akar — lihat penjelasan di app/_layout.tsx.
        animation: 'ios_from_right',
        animationDuration: 260,
        gestureEnabled: true,
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Tiket Masalah' }} />
      <Stack.Screen name="buat" options={{ title: 'Buat Tiket' }} />
      <Stack.Screen name="[nomor]" options={{ title: 'Detail Tiket' }} />
    </Stack>
  );
}

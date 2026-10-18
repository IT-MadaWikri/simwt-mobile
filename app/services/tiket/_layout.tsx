/**
 * Tumpukan layar Tiket Masalah: menu (index) → Tiket Saya (saya) / buat → detail ([nomor]).
 */
import React from 'react';
import { Stack } from 'expo-router';
import Colors from '../../../constants/Colors';
import { fonts, judulAppBar } from '../../../constants/Typography';
import { opsiAppBar } from '../../../src/components/common/AppBar';

export default function TiketLayout() {
  return (
    <Stack
      screenOptions={{
        // App bar standar. Layar PERTAMA tumpukan ini tidak dapat tombol
        // kembali otomatis, jadi `opsiAppBar` memasang TombolKembali.
        ...opsiAppBar,
        // Selaras dengan Stack akar — lihat penjelasan di app/_layout.tsx.
        animation: 'ios_from_right',
        animationDuration: 260,
        gestureEnabled: true,
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Tiket Masalah' }} />
      <Stack.Screen name="saya" options={{ title: 'Tiket Saya' }} />
      <Stack.Screen name="buat" options={{ title: 'Buat Tiket' }} />
      <Stack.Screen name="[nomor]" options={{ title: 'Detail Tiket' }} />
    </Stack>
  );
}

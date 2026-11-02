/**
 * Tumpukan layar Pengukuran QC: menu (index) → daftar part (part) → pilih proses (part/[id]) → input;
 * draf (membuka input); riwayat terkirim (terkirim) → detail (terkirim/[id]).
 */
import React from 'react';
import { Stack } from 'expo-router';
import { opsiAppBar } from '../../../src/components/common/AppBar';

export default function PengukuranLayout() {
  return (
    <Stack
      screenOptions={{
        ...opsiAppBar,
        animation: 'ios_from_right',
        animationDuration: 260,
        gestureEnabled: true,
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Pengukuran QC' }} />
      <Stack.Screen name="part/index" options={{ title: 'Daftar Part' }} />
      <Stack.Screen name="part/[id]" options={{ title: 'Pilih Proses' }} />
      <Stack.Screen name="input" options={{ title: 'Input Pengukuran' }} />
      <Stack.Screen name="draf" options={{ title: 'Draf Pengukuran' }} />
      <Stack.Screen name="terkirim/index" options={{ title: 'Pengukuran Terkirim' }} />
      <Stack.Screen name="terkirim/[id]" options={{ title: 'Detail Pengukuran' }} />
    </Stack>
  );
}

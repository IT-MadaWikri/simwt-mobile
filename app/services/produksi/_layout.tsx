/**
 * Tumpukan layar Pencapaian Produksi: pilih pasangan (mesin ↔ dies) → form stroke.
 */
import React from 'react';
import { Stack } from 'expo-router';
import { opsiAppBar } from '../../../src/components/common/AppBar';

export default function ProduksiLayout() {
  return (
    <Stack
      screenOptions={{
        ...opsiAppBar,
        animation: 'ios_from_right',
        animationDuration: 260,
        gestureEnabled: true,
      }}
    >
      <Stack.Screen name="pilih" options={{ title: 'Pencapaian Produksi' }} />
      <Stack.Screen name="stroke" options={{ title: 'Pencapaian Produksi' }} />
      <Stack.Screen name="draf" options={{ title: 'Draf Pencapaian Produksi' }} />
    </Stack>
  );
}

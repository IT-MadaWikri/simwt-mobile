import React from 'react';
import { Stack } from 'expo-router';
import Colors from '../../../constants/Colors';
import { fonts, judulAppBar } from '../../../constants/Typography';
import { opsiAppBar } from '../../../src/components/common/AppBar';

export default function KaizenLayout() {
  return (
    <Stack
      screenOptions={{
        // App bar standar + TombolKembali (layar pertama tumpukan bersarang
        // tidak mendapat tombol kembali otomatis). Lihat AppBar.tsx.
        ...opsiAppBar,
        // Disamakan dengan Stack akar — lihat penjelasan pilihan
        // `ios_from_right` di app/_layout.tsx.
        animation: 'ios_from_right',
        animationDuration: 260,
        gestureEnabled: true,
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Kaizen Saya' }} />
      <Stack.Screen 
        name="buat" 
        options={{ 
          title: 'Buat Kaizen',
        }} 
      />
      <Stack.Screen 
        name="list" 
        options={{ 
          title: 'Daftar Kaizen',
        }} 
      />
      <Stack.Screen name="redeem" options={{ title: 'Redeem Poin' }} />
      <Stack.Screen 
        name="[id]" 
        options={{ 
          title: 'Detail Kaizen',
        }} 
      />
    </Stack>
  );
}

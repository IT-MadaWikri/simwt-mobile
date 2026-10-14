import React from 'react';
import { Stack } from 'expo-router';
import Colors from '../../../constants/Colors';
import { fonts } from '../../../constants/Typography';
import TombolKembali from '../../../src/components/common/TombolKembali';

export default function KaizenLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: Colors.primary,
        },
        headerTintColor: Colors.white,
        headerTitleStyle: {
          fontFamily: fonts.bold,
        },
        headerShadowVisible: false,
        // Sama seperti tumpukan Tiket: layar pertama tumpukan bersarang tidak
        // mendapat tombol kembali otomatis. Lihat TombolKembali.tsx.
        headerLeft: () => <TombolKembali />,
        // Disamakan dengan Stack akar — lihat penjelasan pilihan
        // `ios_from_right` di app/_layout.tsx.
        animation: 'ios_from_right',
        animationDuration: 260,
        gestureEnabled: true,
      }}
    >
      <Stack.Screen 
        name="index" 
        options={{ 
          headerShown: false, // Menu Kaizen uses custom header
        }} 
      />
      <Stack.Screen 
        name="dashboard" 
        options={{ 
          title: 'Dashboard',
          headerBackVisible: true,
        }} 
      />
      <Stack.Screen 
        name="buat" 
        options={{ 
          title: 'Buat',
          headerBackVisible: true,
        }} 
      />
      <Stack.Screen 
        name="list" 
        options={{ 
          title: 'Daftar Kaizen',
          headerBackVisible: true,
        }} 
      />
      <Stack.Screen 
        name="[id]" 
        options={{ 
          title: 'Detail Kaizen',
          headerBackVisible: true,
        }} 
      />
    </Stack>
  );
}

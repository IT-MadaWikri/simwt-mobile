/**
 * Tumpukan layar Chat: daftar percakapan (index) → ruang chat ([id]).
 * Header digambar masing-masing layar (ruang chat butuh header khusus
 * ala WhatsApp: avatar + nama + status di dalam bilah).
 */
import React from 'react';
import { Stack } from 'expo-router';

export default function ChatLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        // Selaras dengan Stack akar — lihat penjelasan di app/_layout.tsx.
        animation: 'ios_from_right',
        animationDuration: 260,
        gestureEnabled: true,
      }}
    />
  );
}

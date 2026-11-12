/**
 * TombolKembali — tombol kembali untuk `headerLeft` pada Stack.Screen.
 *
 * ── Kenapa tidak mengandalkan tombol bawaan ──────────────────────────────
 * React Navigation hanya menggambar tombol kembali otomatis kalau layar itu
 * BUKAN layar pertama pada tumpukannya sendiri. Begitu sebuah bagian punya
 * `_layout.tsx` (mis. `app/services/tiket/`), layar pertamanya menjadi akar
 * tumpukan BARU — jadi tidak ada tombol kembali, padahal tumpukan induknya
 * masih bisa dimundurkan.
 *
 * Komponen ini memakai `canGoBack()` untuk memilih: mundur satu langkah bila
 * ada riwayat, atau pulang ke beranda bila tidak ada. Dengan begitu pengguna
 * tidak pernah terjebak di layar tanpa jalan keluar.
 */
import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import Icon from './Icon';
import Colors from '../../../constants/Colors';
import Spacing from '../../../constants/Spacing';

interface TombolKembaliProps {
  /** Warna ikon — samakan dengan `headerTintColor` layarnya. */
  warna?: string;
  /** Tujuan bila tidak ada riwayat untuk dimundurkan. */
  cadangan?: string;
  /** Ikon tombol — `close` untuk layar yang ditutup, bukan dimundurkan. */
  ikon?: string;
  /** Latar lingkaran putih — untuk header transparan yang menimpa konten. */
  lingkaran?: boolean;
}

export default function TombolKembali({
  warna = Colors.textPrimary,
  cadangan = '/(tabs)',
  ikon = 'chevron-left',
  lingkaran = false,
}: TombolKembaliProps) {
  const router = useRouter();

  return (
    <TouchableOpacity
      onPress={() => (router.canGoBack() ? router.back() : router.replace(cadangan as any))}
      style={lingkaran ? styles.lingkaran : { paddingRight: Spacing.md, paddingVertical: Spacing.xs }}
      accessibilityRole="button"
      accessibilityLabel={ikon === 'close' ? 'Tutup' : 'Kembali'}
      hitSlop={8}
    >
      <Icon name={ikon} size={ikon === 'close' ? 24 : 28} color={warna} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  lingkaran: {
    width: 36,
    height: 36,
    borderRadius: Spacing.radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
  },
});

/**
 * BrandSpinner — pemuat kecil bergaya native OS.
 *
 * Membungkus `<ActivityIndicator>` bawaan: spinner Material di Android, roda
 * bergerigi di iOS. Dulu ini cincin buatan sendiri; sekarang mengikuti gaya
 * sistem, dengan warna brand. Nama & props dipertahankan supaya pemakainya
 * (Button, LoadingSpinner, Activity) tidak perlu diubah.
 */
import React from 'react';
import { ActivityIndicator, Platform } from 'react-native';
import { brand } from '../../../constants/Colors';

interface BrandSpinnerProps {
  /** Diameter (px). Android memakai angka persis; iOS hanya mengenal kecil/besar. */
  size?: number;
  /** Warna spinner. Default hijau brand. */
  color?: string;
}

export default function BrandSpinner({ size = 40, color = brand[500] }: BrandSpinnerProps) {
  return <ActivityIndicator size={Platform.OS === 'android' ? size : size > 28 ? 'large' : 'small'} color={color} />;
}

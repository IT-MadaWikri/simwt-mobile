/** Angka ringkasan menu Aset; null = belum atau gagal dimuat. */
import { useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { asetService } from '../services/asetService';
import { RingkasanAsetData } from '../types/aset';

/** `aktif` false = jangan memuat otomatis (hook dipakai di layar yang tidak selalu membutuhkannya). */
export function useRingkasanAset(aktif = true) {
  // Ringkasan hanya hiasan: gagal cukup tidak tampil (angka "–") atau tetap memakai angka terakhir di cache.
  const { data, refetch } = useQuery<RingkasanAsetData>({
    queryKey: ['aset', 'ringkasan'],
    queryFn: () => asetService.ringkasan(),
    enabled: aktif,
  });

  const muat = useCallback(async () => {
    await refetch();
  }, [refetch]);

  return { ringkasan: data ?? null, muat };
}

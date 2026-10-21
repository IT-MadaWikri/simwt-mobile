/** Angka ringkasan menu Aset; null = belum atau gagal dimuat. */
import { useCallback, useState } from 'react';
import { asetService } from '../services/asetService';
import { RingkasanAsetData } from '../types/aset';

export function useRingkasanAset() {
  const [ringkasan, setRingkasan] = useState<RingkasanAsetData | null>(null);

  // Ringkasan hanya hiasan: gagal cukup tidak tampil (angka "–"), tidak mengganggu menu di bawahnya.
  const muat = useCallback(async () => {
    try {
      setRingkasan(await asetService.ringkasan());
    } catch {
      setRingkasan(null);
    }
  }, []);

  return { ringkasan, muat };
}

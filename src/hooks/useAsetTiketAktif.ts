/** Aset (di departemen pengguna) yang punya tiket aktif; `aset` null = belum selesai dimuat. */
import { useCallback, useState } from 'react';
import { asetService } from '../services/asetService';
import { AsetTiketAktif } from '../types/aset';

export function useAsetTiketAktif() {
  const [aset, setAset] = useState<AsetTiketAktif[] | null>(null);
  const [error, setError] = useState('');

  const muat = useCallback(async () => {
    try {
      setAset(await asetService.tiketAktif());
      setError('');
    } catch (e) {
      setAset((lama) => lama ?? []);
      setError(e instanceof Error ? e.message : 'Gagal mengambil aset dengan tiket aktif.');
    }
  }, []);

  return { aset, error, muat };
}

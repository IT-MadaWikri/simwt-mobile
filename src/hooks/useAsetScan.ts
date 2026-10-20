/** Memuat detail aset hasil pindai. `muat` selalu mengambil ulang; respons yang basi diabaikan. */
import { useCallback, useRef, useState } from 'react';
import { asetService } from '../services/asetService';
import { DetailAset } from '../types/aset';

export function useAsetScan() {
  const [data, setData] = useState<DetailAset | null>(null);
  const [memuat, setMemuat] = useState(true);
  const [error, setError] = useState('');
  const permintaan = useRef(0);

  const muat = useCallback(async (nomor: string) => {
    const id = ++permintaan.current;
    setMemuat(true);
    setError('');
    setData(null);
    try {
      const hasil = await asetService.detail(nomor);
      if (id === permintaan.current) setData(hasil);
    } catch (e) {
      if (id === permintaan.current) setError(e instanceof Error ? e.message : 'Gagal mengambil data aset.');
    } finally {
      if (id === permintaan.current) setMemuat(false);
    }
  }, []);

  return { data, memuat, error, muat };
}

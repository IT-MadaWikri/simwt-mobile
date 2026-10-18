/** Detail satu tiket: memuat berdasarkan nomor dan mengekspos loading/error/data. */
import { useCallback, useEffect, useState } from 'react';
import { tiketService } from '../services/tiketService';
import { DetailTiket } from '../types/tiket';

export function useDetailTiket(nomor: string | undefined) {
  const [tiket, setTiket] = useState<DetailTiket | null>(null);
  const [memuat, setMemuat] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const muat = useCallback(async () => {
    if (!nomor) return;
    setMemuat(true);
    setError(null);
    try {
      setTiket(await tiketService.lihat(nomor));
    } catch (e: any) {
      // 403/404 dari server = tiket tidak ada atau bukan milik/wewenang akun ini.
      setTiket(null);
      setError(e?.response?.status === 403 ? 'Anda tidak berwenang melihat tiket ini.' : e?.message || null);
    } finally {
      setMemuat(false);
    }
  }, [nomor]);

  useEffect(() => {
    muat();
  }, [muat]);

  return { tiket, memuat, error, muat };
}

/**
 * Detail satu tiket: memuat berdasarkan nomor dan mengekspos loading/error/data.
 * `menyegarkan` untuk tarik-untuk-segarkan (terpisah dari `memuat` awal) dan
 * dijamin padam lewat batas waktu.
 */
import { useCallback, useEffect, useState } from 'react';
import { tiketService } from '../services/tiketService';
import { DetailTiket } from '../types/tiket';

const BATAS_SEGARKAN = 15000;

export function useDetailTiket(nomor: string | undefined) {
  const [tiket, setTiket] = useState<DetailTiket | null>(null);
  const [memuat, setMemuat] = useState(true);
  const [menyegarkan, setMenyegarkan] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const ambil = useCallback(async () => {
    if (!nomor) return;
    setError(null);
    try {
      setTiket(await tiketService.lihat(nomor));
    } catch (e: any) {
      // 403/404 dari server = tiket tidak ada atau bukan milik/wewenang akun ini.
      setTiket(null);
      setError(e?.response?.status === 403 ? 'Anda tidak berwenang melihat tiket ini.' : e?.message || null);
    }
  }, [nomor]);

  const muat = useCallback(async () => {
    setMemuat(true);
    await ambil();
    setMemuat(false);
  }, [ambil]);

  const segarkan = useCallback(() => {
    setMenyegarkan(true);
    const batas = setTimeout(() => setMenyegarkan(false), BATAS_SEGARKAN);
    ambil().finally(() => {
      clearTimeout(batas);
      setMenyegarkan(false);
    });
  }, [ambil]);

  useEffect(() => {
    muat();
  }, [muat]);

  return { tiket, memuat, menyegarkan, error, muat, segarkan };
}

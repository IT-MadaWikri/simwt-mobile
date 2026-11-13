/**
 * Daftar sesi login pengguna + aksi mengeluarkan perangkat lain.
 *
 * Sengaja TANPA cache persisten (bukan `useQuery`): daftar ini soal keamanan, jadi
 * harus selalu segar dari server. Spinner `menyegarkan` dipisah dari `memuat` dan
 * dijamin padam lewat batas waktu.
 */
import { useCallback, useEffect, useState } from 'react';
import { SesiPerangkat, sesiService } from '../services/sesiService';
import { pesanGalat } from '../services/akunService';

const BATAS_SEGARKAN = 15000;

export function useSesiPerangkat() {
  const [sesi, setSesi] = useState<SesiPerangkat[]>([]);
  const [memuat, setMemuat] = useState(true);
  const [menyegarkan, setMenyegarkan] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Id yang sedang dicabut; -1 = "semua perangkat lain".
  const [mencabut, setMencabut] = useState<number | null>(null);

  const muat = useCallback(async () => {
    try {
      setSesi(await sesiService.daftar());
      setError(null);
    } catch (e) {
      setError(pesanGalat(e, 'Gagal memuat daftar perangkat.'));
    }
  }, []);

  useEffect(() => {
    muat().finally(() => setMemuat(false));
  }, [muat]);

  const segarkan = useCallback(async () => {
    setMenyegarkan(true);
    const batas = setTimeout(() => setMenyegarkan(false), BATAS_SEGARKAN);
    try {
      await muat();
    } finally {
      clearTimeout(batas);
      setMenyegarkan(false);
    }
  }, [muat]);

  /** Melempar galat agar layar menampilkannya lewat dialog. */
  const cabut = useCallback(
    async (id: number | 'semua') => {
      setMencabut(id === 'semua' ? -1 : id);
      try {
        if (id === 'semua') await sesiService.cabutLain();
        else await sesiService.cabut(id);
        await muat();
      } catch (e) {
        throw new Error(pesanGalat(e, 'Gagal mengeluarkan perangkat.'));
      } finally {
        setMencabut(null);
      }
    },
    [muat]
  );

  return { sesi, memuat, menyegarkan, error, mencabut, segarkan, cabut, muat };
}

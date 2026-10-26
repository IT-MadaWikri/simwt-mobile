/**
 * Sisi baca Form Keluar Pabrik milik akun yang login: histori (`useKeluarPabrikSaya`), detail
 * (`useDetailKeluarPabrik`), dan lacak lewat nomor dokumen (`useLacakKeluarPabrik`). `menyegarkan` terpisah
 * dari `memuat` dan dijamin padam lewat batas waktu.
 */
import { useCallback, useEffect, useState } from 'react';
import { keluarPabrikService } from '../services/keluarPabrikService';
import { HasilLacakKeluarPabrik, KeluarPabrikDetail, KeluarPabrikRingkas } from '../types/layananHrd';

const BATAS_SEGARKAN = 15000;

/** Jalankan `muat` untuk tarik-untuk-segarkan: spinner lokal yang pasti padam walau request menggantung. */
function useSegarkan(muat: () => Promise<void>) {
  const [menyegarkan, setMenyegarkan] = useState(false);
  const segarkan = useCallback(() => {
    setMenyegarkan(true);
    const batas = setTimeout(() => setMenyegarkan(false), BATAS_SEGARKAN);
    muat().finally(() => {
      clearTimeout(batas);
      setMenyegarkan(false);
    });
  }, [muat]);
  return { menyegarkan, segarkan };
}

/** `muatUlang` dipakai saat layar kembali fokus (mis. setelah mengajukan) tanpa skeleton. */
export function useKeluarPabrikSaya() {
  const [daftar, setDaftar] = useState<KeluarPabrikRingkas[]>([]);
  const [memuat, setMemuat] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const muatUlang = useCallback(async () => {
    try {
      setDaftar(await keluarPabrikService.saya());
      setError(null);
    } catch (e: any) {
      setError(e?.message || 'Histori form tidak bisa dimuat.');
    } finally {
      setMemuat(false);
    }
  }, []);

  useEffect(() => {
    muatUlang();
  }, [muatUlang]);

  const cobaLagi = useCallback(() => {
    setMemuat(true);
    muatUlang();
  }, [muatUlang]);

  return { daftar, memuat, error, muatUlang, cobaLagi, ...useSegarkan(muatUlang) };
}

export function useDetailKeluarPabrik(id: number) {
  const [data, setData] = useState<KeluarPabrikDetail | null>(null);
  const [memuat, setMemuat] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const muat = useCallback(async () => {
    try {
      setData(await keluarPabrikService.detail(id));
      setError(null);
    } catch (e: any) {
      setError(
        e?.response?.status === 403
          ? 'Form ini bukan milik Anda.'
          : e?.response?.status === 404
            ? 'Form tidak ditemukan.'
            : e?.message || 'Detail form tidak bisa dimuat.'
      );
    } finally {
      setMemuat(false);
    }
  }, [id]);

  useEffect(() => {
    muat();
  }, [muat]);

  const cobaLagi = useCallback(() => {
    setMemuat(true);
    muat();
  }, [muat]);

  return { data, memuat, error, cobaLagi, ...useSegarkan(muat) };
}

export function useLacakKeluarPabrik() {
  const [nomor, setNomor] = useState('');
  const [hasil, setHasil] = useState<HasilLacakKeluarPabrik | null>(null);
  const [mencari, setMencari] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const lacak = async () => {
    if (!nomor.trim()) {
      setError('Masukkan nomor dokumen.');
      return;
    }
    setMencari(true);
    setError(null);
    setHasil(null);
    try {
      setHasil(await keluarPabrikService.lacak(nomor));
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || 'Form tidak bisa dilacak. Coba lagi.');
    } finally {
      setMencari(false);
    }
  };

  return { nomor, setNomor, hasil, mencari, error, lacak };
}

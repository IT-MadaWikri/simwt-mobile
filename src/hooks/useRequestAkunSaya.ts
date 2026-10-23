/**
 * Histori Request Akun milik akun yang login. `menyegarkan` terpisah dari `memuat` dan dijamin padam lewat
 * batas waktu; `muatUlang` dipakai saat layar kembali fokus (mis. setelah mengajukan) tanpa skeleton.
 */
import { useCallback, useEffect, useState } from 'react';
import { requestAkunService } from '../services/requestAkunService';
import { RequestAkunRingkas } from '../types/layananIt';

const BATAS_SEGARKAN = 15000;

export function useRequestAkunSaya() {
  const [daftar, setDaftar] = useState<RequestAkunRingkas[]>([]);
  const [memuat, setMemuat] = useState(true);
  const [menyegarkan, setMenyegarkan] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const muatUlang = useCallback(async () => {
    try {
      setDaftar(await requestAkunService.saya());
      setError(null);
    } catch (e: any) {
      setError(e?.message || 'Histori request tidak bisa dimuat.');
    } finally {
      setMemuat(false);
    }
  }, []);

  useEffect(() => {
    muatUlang();
  }, [muatUlang]);

  const segarkan = useCallback(() => {
    setMenyegarkan(true);
    const batas = setTimeout(() => setMenyegarkan(false), BATAS_SEGARKAN);
    muatUlang().finally(() => {
      clearTimeout(batas);
      setMenyegarkan(false);
    });
  }, [muatUlang]);

  const cobaLagi = useCallback(() => {
    setMemuat(true);
    muatUlang();
  }, [muatUlang]);

  return { daftar, memuat, menyegarkan, error, segarkan, muatUlang, cobaLagi };
}

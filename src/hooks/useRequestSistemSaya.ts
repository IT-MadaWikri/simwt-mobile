/** Histori Request Pembuatan Sistem milik akun yang login (pola sama dengan `useRequestAkunSaya`). */
import { useCallback, useEffect, useState } from 'react';
import { requestSistemService } from '../services/requestSistemService';
import { RequestSistemRingkas } from '../types/layananIt';

const BATAS_SEGARKAN = 15000;

export function useRequestSistemSaya() {
  const [daftar, setDaftar] = useState<RequestSistemRingkas[]>([]);
  const [memuat, setMemuat] = useState(true);
  const [menyegarkan, setMenyegarkan] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const muatUlang = useCallback(async () => {
    try {
      setDaftar(await requestSistemService.saya());
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

/** Detail satu Request Akun milik akun yang login, beserta jejak statusnya. */
import { useCallback, useEffect, useState } from 'react';
import { requestAkunService } from '../services/requestAkunService';
import { RequestAkunDetail } from '../types/layananIt';

const BATAS_SEGARKAN = 15000;

export function useDetailRequestAkun(id: number) {
  const [data, setData] = useState<RequestAkunDetail | null>(null);
  const [memuat, setMemuat] = useState(true);
  const [menyegarkan, setMenyegarkan] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const muat = useCallback(async () => {
    try {
      setData(await requestAkunService.detail(id));
      setError(null);
    } catch (e: any) {
      setError(
        e?.response?.status === 403
          ? 'Request ini bukan milik Anda.'
          : e?.response?.status === 404
            ? 'Request tidak ditemukan.'
            : e?.message || 'Detail request tidak bisa dimuat.'
      );
    } finally {
      setMemuat(false);
    }
  }, [id]);

  useEffect(() => {
    muat();
  }, [muat]);

  const segarkan = useCallback(() => {
    setMenyegarkan(true);
    const batas = setTimeout(() => setMenyegarkan(false), BATAS_SEGARKAN);
    muat().finally(() => {
      clearTimeout(batas);
      setMenyegarkan(false);
    });
  }, [muat]);

  const cobaLagi = useCallback(() => {
    setMemuat(true);
    muat();
  }, [muat]);

  return { data, memuat, menyegarkan, error, segarkan, cobaLagi };
}

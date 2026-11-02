/**
 * Pencarian checker (karyawan) untuk modal "Cari Checker": ketikan di-debounce, hasil di-cache.
 * `aktif` = modalnya terbuka; selama tertutup tidak ada yang dimuat.
 */
import { useCallback, useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { pengukuranService } from '../services/pengukuranService';

export function useCariChecker(aktif: boolean) {
  const [kataCari, setKataCari] = useState('');
  const [kata, setKata] = useState('');

  useEffect(() => {
    if (!aktif) return;
    const t = setTimeout(() => setKata(kataCari.trim()), 300);
    return () => clearTimeout(t);
  }, [kataCari, aktif]);

  const q = useQuery({
    queryKey: ['pengukuran', 'checker', kata],
    queryFn: () => pengukuranService.cariChecker(kata),
    enabled: aktif,
  });

  const reset = useCallback(() => {
    setKataCari('');
    setKata('');
  }, []);

  return { daftarChecker: q.data ?? [], kataCari, setKataCari, memuat: q.isFetching && q.data === undefined, reset };
}

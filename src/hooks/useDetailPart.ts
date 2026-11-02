/**
 * Detail satu part beserta standar pengukuran & drawing-nya. Part yang pernah dibuka langsung
 * tampil dari cache persisten sementara yang terbaru dimuat di latar.
 */
import { useCallback, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { pengukuranService } from '../services/pengukuranService';

const BATAS_SEGARKAN = 15000;

export function useDetailPart(idPart?: number | string | null) {
  const ada = idPart !== undefined && idPart !== null && idPart !== '';
  const [menyegarkan, setMenyegarkan] = useState(false);

  const q = useQuery({
    queryKey: ['pengukuran', 'part', 'detail', String(idPart)],
    queryFn: () => pengukuranService.detailPart(idPart as number | string),
    enabled: ada,
  });
  const { refetch } = q;

  const muat = useCallback(() => {
    refetch();
  }, [refetch]);

  const segarkan = useCallback(() => {
    setMenyegarkan(true);
    const batas = setTimeout(() => setMenyegarkan(false), BATAS_SEGARKAN);
    refetch().finally(() => {
      clearTimeout(batas);
      setMenyegarkan(false);
    });
  }, [refetch]);

  const detailPart = q.data ?? null;
  return {
    detailPart,
    menyegarkan,
    segarkan,
    memuat: ada && detailPart === null && q.isFetching,
    // Bila data lama masih ada, gagal menyegarkan tidak perlu menutupi isinya.
    error: detailPart || !q.error ? null : q.error.message || 'Gagal memuat detail part.',
    muat,
  };
}

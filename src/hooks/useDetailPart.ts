/**
 * Detail satu part beserta standar pengukuran & drawing-nya. Part yang pernah dibuka langsung
 * tampil dari cache persisten sementara yang terbaru dimuat di latar.
 */
import { useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { pengukuranService } from '../services/pengukuranService';

export function useDetailPart(idPart?: number | string | null) {
  const ada = idPart !== undefined && idPart !== null && idPart !== '';

  const q = useQuery({
    queryKey: ['pengukuran', 'part', 'detail', String(idPart)],
    queryFn: () => pengukuranService.detailPart(idPart as number | string),
    enabled: ada,
  });
  const { refetch } = q;

  const muat = useCallback(() => {
    refetch();
  }, [refetch]);

  const detailPart = q.data ?? null;
  return {
    detailPart,
    memuat: ada && detailPart === null && q.isFetching,
    // Bila data lama masih ada, gagal menyegarkan tidak perlu menutupi isinya.
    error: detailPart || !q.error ? null : q.error.message || 'Gagal memuat detail part.',
    muat,
  };
}

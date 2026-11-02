/**
 * Detail satu pengukuran terkirim. Yang pernah dibuka langsung tampil dari cache persisten sementara
 * yang terbaru dimuat di latar; `segarkan` memuat ulang untuk tarik-untuk-segarkan.
 */
import { useCallback, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { pengukuranService } from '../services/pengukuranService';

const BATAS_SEGARKAN = 15000;

export function useDetailTerkirim(id?: number | string | null) {
  const ada = id !== undefined && id !== null && id !== '';
  const [menyegarkan, setMenyegarkan] = useState(false);

  const q = useQuery({
    queryKey: ['pengukuran', 'terkirim', 'detail', String(id)],
    queryFn: () => pengukuranService.detailTerkirim(id as number | string),
    enabled: ada,
  });
  const { refetch } = q;

  const segarkan = useCallback(() => {
    setMenyegarkan(true);
    const batas = setTimeout(() => setMenyegarkan(false), BATAS_SEGARKAN);
    refetch().finally(() => {
      clearTimeout(batas);
      setMenyegarkan(false);
    });
  }, [refetch]);

  const detail = q.data ?? null;
  return {
    detail,
    memuat: ada && detail === null && q.isFetching,
    menyegarkan,
    // Bila data lama masih ada, gagal menyegarkan tidak perlu menutupi isinya.
    error: detail || !q.error ? null : q.error.message || 'Gagal memuat detail pengukuran.',
    segarkan,
    cobaLagi: segarkan,
  };
}

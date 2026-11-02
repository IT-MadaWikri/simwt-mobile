/**
 * Detail satu artikel berita (`GET /artikel/{id}`) beserta artikel terkait, dan suka (optimistis;
 * false bila gagal dan dikembalikan). Artikel yang pernah dibuka langsung tampil dari cache.
 */
import { useCallback, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { beritaService } from '../services/beritaService';
import { BeritaDetail } from '../types/berita';

export function useDetailBerita(id: number) {
  const queryClient = useQueryClient();
  const kunci = useMemo(() => ['berita', 'detail', id], [id]);

  const q = useQuery({ queryKey: kunci, queryFn: () => beritaService.detail(id) });
  const berita = q.data ?? null;
  const { refetch } = q;

  const muat = useCallback(() => {
    refetch();
  }, [refetch]);

  /** Suka/batal suka artikel ini (tanpa argumen) atau salah satu artikel terkait (`idTarget`). */
  const ubahSuka = useCallback(
    async (idTarget?: number): Promise<boolean> => {
      if (!berita) return false;
      const target = idTarget ?? berita.id;
      const sekarang = target === berita.id ? berita : berita.terkait.find((t) => t.id === target);
      if (!sekarang) return false;

      const awal = { disukai: sekarang.disukai, jumlahSuka: sekarang.jumlahSuka };
      const terapkan = (disukai: boolean, jumlahSuka: number) =>
        queryClient.setQueryData<BeritaDetail>(kunci, (b) => {
          if (!b) return b;
          return target === b.id
            ? { ...b, disukai, jumlahSuka }
            : { ...b, terkait: b.terkait.map((t) => (t.id === target ? { ...t, disukai, jumlahSuka } : t)) };
        });

      const suka = !awal.disukai;
      terapkan(suka, Math.max(0, awal.jumlahSuka + (suka ? 1 : -1)));
      try {
        const status = await beritaService.ubahSuka(target, suka);
        terapkan(status.disukai, status.jumlahSuka);
        return true;
      } catch {
        terapkan(awal.disukai, awal.jumlahSuka);
        return false;
      }
    },
    [berita, queryClient, kunci]
  );

  const e: any = q.error;
  return {
    berita,
    memuat: berita === null && q.isFetching,
    // Bila data lama masih ada, gagal menyegarkan tidak perlu menutupi artikelnya.
    error:
      berita || !e
        ? null
        : // 404 = artikel sudah diarsipkan/dihapus; selain itu gangguan jaringan/server.
          e.response?.status === 404
          ? 'Berita tidak ditemukan.'
          : e.message || 'Gagal memuat berita.',
    muat,
    ubahSuka,
  };
}

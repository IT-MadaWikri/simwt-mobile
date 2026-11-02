/**
 * Daftar berita: muat halaman pertama, gulir tanpa batas, tarik-untuk-segarkan, dan suka (optimistis).
 *
 * Datanya disimpan di cache persisten (lihat `utils/queryClient`), jadi daftar terakhir langsung
 * tampil saat aplikasi dibuka lagi sementara yang terbaru dimuat di latar.
 *
 * Spinner `menyegarkan` terpisah dari `memuat` dan dijamin padam lewat batas waktu. Suka diubah
 * langsung di cache lalu dikembalikan bila server menolak; `ubahSuka` mengembalikan false untuk
 * kegagalan itu supaya layar yang memanggil bisa menampilkannya.
 */
import { useCallback, useMemo, useState } from 'react';
import { InfiniteData, useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { beritaService } from '../services/beritaService';
import { Berita, HalamanBerita } from '../types/berita';

const BATAS_SEGARKAN = 15000;

type CacheBerita = InfiniteData<HalamanBerita, number>;

export function useDaftarBerita({ perHalaman = 20 }: { perHalaman?: number } = {}) {
  const queryClient = useQueryClient();
  const kunci = useMemo(() => ['berita', 'daftar', perHalaman], [perHalaman]);
  const [menyegarkan, setMenyegarkan] = useState(false);

  const q = useInfiniteQuery({
    queryKey: kunci,
    queryFn: ({ pageParam }) => beritaService.daftar({ page: pageParam, perHalaman }),
    initialPageParam: 1,
    getNextPageParam: (terakhir) => (terakhir.currentPage < terakhir.lastPage ? terakhir.currentPage + 1 : undefined),
  });
  const { refetch, fetchNextPage, hasNextPage, isFetchingNextPage } = q;

  const berita = useMemo(() => q.data?.pages.flatMap((h) => h.data) ?? [], [q.data]);

  /** Muat ulang dari halaman pertama saja: halaman lain yang sudah terbuka dibuang dulu, bukan ikut diambil ulang. */
  const muatUlang = useCallback(async () => {
    queryClient.setQueryData<CacheBerita>(kunci, (d) => d && { pages: d.pages.slice(0, 1), pageParams: d.pageParams.slice(0, 1) });
    await refetch();
  }, [queryClient, kunci, refetch]);

  const segarkan = useCallback(() => {
    setMenyegarkan(true);
    const batas = setTimeout(() => setMenyegarkan(false), BATAS_SEGARKAN);
    muatUlang().finally(() => {
      clearTimeout(batas);
      setMenyegarkan(false);
    });
  }, [muatUlang]);

  const cobaLagi = useCallback(() => {
    refetch();
  }, [refetch]);

  const muatBerikutnya = () => {
    if (q.isPending || isFetchingNextPage || menyegarkan || !hasNextPage) return;
    fetchNextPage();
  };

  const ubahSuka = useCallback(
    async (id: number): Promise<boolean> => {
      const awal = berita.find((b) => b.id === id);
      if (!awal) return false;
      const suka = !awal.disukai;
      const set = (disukai: boolean, jumlahSuka: number) =>
        queryClient.setQueryData<CacheBerita>(
          kunci,
          (d) =>
            d && {
              ...d,
              pages: d.pages.map((h) => ({
                ...h,
                data: h.data.map((b: Berita) => (b.id === id ? { ...b, disukai, jumlahSuka } : b)),
              })),
            }
        );

      set(suka, Math.max(0, awal.jumlahSuka + (suka ? 1 : -1)));
      try {
        const status = await beritaService.ubahSuka(id, suka);
        set(status.disukai, status.jumlahSuka);
        return true;
      } catch {
        set(awal.disukai, awal.jumlahSuka);
        return false;
      }
    },
    [berita, queryClient, kunci]
  );

  return {
    berita,
    // Skeleton hanya bila belum ada data sama sekali; data dari cache langsung tampil.
    memuat: q.data === undefined && q.isFetching && !menyegarkan,
    menyegarkan,
    memuatLebih: isFetchingNextPage,
    error: q.error ? q.error.message || 'Gagal memuat berita.' : null,
    muatUlang,
    cobaLagi,
    segarkan,
    muatBerikutnya,
    ubahSuka,
  };
}

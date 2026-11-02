/**
 * Daftar bergulir tanpa batas di atas cache persisten (lihat `utils/queryClient`): halaman diambil
 * lewat `ambilHalaman`, tarik-untuk-segarkan, dan muat ulang halaman pertama tanpa skeleton.
 *
 * Halaman berbentuk `{ items, total, page }`. Berhenti bila halaman kosong atau semua `total` baris
 * sudah termuat. Spinner `menyegarkan` terpisah dari `memuat` dan dijamin padam lewat batas waktu,
 * supaya permintaan yang tak kunjung selesai tidak menggantungkannya. `kunci` harus memuat semua
 * filter yang memengaruhi hasil.
 */
import { useCallback, useMemo, useRef, useState } from 'react';
import { InfiniteData, QueryKey, useInfiniteQuery, useQueryClient } from '@tanstack/react-query';

const BATAS_SEGARKAN = 15000;

interface Halaman<T> {
  items: T[];
  total: number;
  page: number;
}

export function useDaftarBergulir<T>({
  kunci,
  ambilHalaman,
  pesanGagal,
}: {
  kunci: QueryKey;
  ambilHalaman: (page: number) => Promise<Halaman<T>>;
  pesanGagal: string;
}) {
  const queryClient = useQueryClient();
  const [menyegarkan, setMenyegarkan] = useState(false);

  const q = useInfiniteQuery({
    queryKey: kunci,
    queryFn: ({ pageParam }) => ambilHalaman(pageParam),
    initialPageParam: 1,
    getNextPageParam: (terakhir, semua) => {
      if (terakhir.items.length === 0) return undefined;
      const termuat = semua.reduce((jumlah, h) => jumlah + h.items.length, 0);
      if (terakhir.total > 0 && termuat >= terakhir.total) return undefined;
      return terakhir.page + 1;
    },
  });
  const { refetch, fetchNextPage, hasNextPage, isFetchingNextPage, isFetching } = q;

  const items = useMemo(() => q.data?.pages.flatMap((h) => h.items) ?? [], [q.data]);
  const total = q.data?.pages[0]?.total ?? 0;

  // Lewat ref: `muatUlang` harus stabil, supaya efek fokus di pemanggil tidak jalan ulang tiap filter berganti.
  const kunciRef = useRef(kunci);
  kunciRef.current = kunci;
  /** Muat ulang dari halaman pertama saja, tanpa skeleton. */
  const muatUlang = useCallback(async () => {
    queryClient.setQueryData<InfiniteData<Halaman<T>, number>>(
      kunciRef.current,
      (d) => d && { pages: d.pages.slice(0, 1), pageParams: d.pageParams.slice(0, 1) }
    );
    // cancelRefetch false: bila muat awal masih berjalan, pakai itu, jangan batalkan lalu ulang.
    await refetch({ cancelRefetch: false });
  }, [queryClient, refetch]);

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

  return {
    items,
    total,
    isFetching,
    // Skeleton hanya bila belum ada data sama sekali; data dari cache langsung tampil.
    memuat: q.data === undefined && isFetching && !menyegarkan,
    menyegarkan,
    memuatLebih: isFetchingNextPage,
    error: q.error ? q.error.message || pesanGagal : null,
    muatUlang,
    segarkan,
    cobaLagi,
    muatBerikutnya,
  };
}

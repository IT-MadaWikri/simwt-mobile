/**
 * Daftar Kaizen milik akun yang login: pencarian (debounce), filter, urutan,
 * paginasi gulir tanpa batas, tarik-untuk-segarkan.
 *
 * Hanya mengurus data & state daftar; tampilannya ada di layar. Tiap kombinasi
 * filter punya cache sendiri (persisten, lihat `utils/queryClient`), jadi daftar
 * terakhir langsung tampil saat aplikasi dibuka lagi.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { InfiniteData, useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { kaizenService } from '../services/kaizenService';

const BATAS_SEGARKAN = 15000;

export interface NilaiFilter {
  status: string;
  dari: string;
  sampai: string;
}

export type ModeFilter = 'terapkan' | 'reset';

export function useDaftarKaizen() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  // Debounce hanya untuk ketikan pencarian; ganti status/tanggal/urutan langsung dimuat.
  const [cari, setCari] = useState('');
  const [status, setStatus] = useState('');
  // Urutan hanya menurut tanggal dibuat: TERBARU atau TERLAMA.
  const [urutkan, setUrutkan] = useState<'TERBARU' | 'TERLAMA'>('TERBARU');
  const [tanggalDari, setTanggalDari] = useState('');
  const [tanggalSampai, setTanggalSampai] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  // Sheet Filter menutup setelah daftar selesai dimuat; tombol yang ditekan menampilkan spinner selama itu.
  const [filterTerbuka, setFilterTerbuka] = useState(false);
  const [memuatFilter, setMemuatFilter] = useState<null | ModeFilter>(null);

  useEffect(() => {
    const t = setTimeout(() => setCari(search.trim()), 350);
    return () => clearTimeout(t);
  }, [search]);

  const kunci = useMemo(
    () => ['kaizen', 'daftar', { cari, status, urutkan, tanggalDari, tanggalSampai }],
    [cari, status, urutkan, tanggalDari, tanggalSampai]
  );

  const q = useInfiniteQuery({
    queryKey: kunci,
    queryFn: ({ pageParam }) => kaizenService.getList({ search: cari, status, urutkan, tanggalDari, tanggalSampai, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (terakhir) => (terakhir.current_page < terakhir.last_page ? terakhir.current_page + 1 : undefined),
  });
  const { refetch, fetchNextPage, hasNextPage, isFetchingNextPage, isFetching } = q;

  const kaizens = useMemo(() => q.data?.pages.flatMap((h) => h.data) ?? [], [q.data]);

  // Skeleton penuh hanya untuk muat pertama: kolom cari ada di dalam daftar, jadi daftar tidak boleh dilepas saat mengetik.
  const [pernahSelesai, setPernahSelesai] = useState(false);
  useEffect(() => {
    if (q.data !== undefined || q.isError) setPernahSelesai(true);
  }, [q.data, q.isError]);
  const awal = !pernahSelesai && q.data === undefined;

  const bukaFilter = useCallback(() => setFilterTerbuka(true), []);
  const tutupFilter = useCallback(() => setFilterTerbuka(false), []);

  const terapkanFilter = (n: NilaiFilter, mode: ModeFilter) => {
    if (n.status === status && n.dari === tanggalDari && n.sampai === tanggalSampai) {
      setFilterTerbuka(false);
      return;
    }
    setMemuatFilter(mode);
    setStatus(n.status);
    setTanggalDari(n.dari);
    setTanggalSampai(n.sampai);
  };

  // Daftar untuk filter baru selesai (atau langsung dari cache) → tutup sheet.
  useEffect(() => {
    if (memuatFilter && !isFetching) {
      setMemuatFilter(null);
      setFilterTerbuka(false);
    }
  }, [memuatFilter, isFetching]);

  // Lewat ref: `muatUlang` harus stabil. Bila kunci masuk dependensinya, efek fokus di pemanggil
  // ikut jalan tiap filter berganti dan daftar termuat dua kali.
  const kunciRef = useRef(kunci);
  kunciRef.current = kunci;
  /** Muat ulang dari halaman pertama saja, tanpa skeleton. */
  const muatUlang = useCallback(async () => {
    queryClient.setQueryData<InfiniteData<unknown, number>>(
      kunciRef.current,
      (d) => d && { pages: d.pages.slice(0, 1), pageParams: d.pageParams.slice(0, 1) }
    );
    // cancelRefetch false: bila muat awal masih berjalan, pakai itu, jangan batalkan lalu ulang.
    await refetch({ cancelRefetch: false });
  }, [queryClient, refetch]);

  const gantiUrutan = () => setUrutkan((u) => (u === 'TERBARU' ? 'TERLAMA' : 'TERBARU'));

  const segarkan = () => {
    setRefreshing(true);
    const batas = setTimeout(() => setRefreshing(false), BATAS_SEGARKAN);
    muatUlang().finally(() => {
      clearTimeout(batas);
      setRefreshing(false);
    });
  };

  const cobaLagi = () => {
    refetch();
  };

  const muatBerikutnya = () => {
    if (q.isPending || isFetchingNextPage || refreshing || !hasNextPage) return;
    fetchNextPage();
  };

  return {
    kaizens,
    error: q.error ? q.error.message || 'Gagal memuat Kaizen.' : null,
    awal,
    refreshing,
    loadingMore: isFetchingNextPage,
    // Skeleton menggantikan baris saat filter/pencarian dimuat; tarik-untuk-segarkan tetap memakai spinner bawaan.
    memuatDaftar: q.data === undefined && isFetching && !refreshing,
    search,
    setSearch,
    status,
    urutkan,
    gantiUrutan,
    tanggalDari,
    tanggalSampai,
    adaFilter: !!(search || status || tanggalDari || tanggalSampai),
    filterTerbuka,
    bukaFilter,
    tutupFilter,
    memuatFilter,
    terapkanFilter,
    segarkan,
    cobaLagi,
    muatBerikutnya,
    muatUlang,
  };
}

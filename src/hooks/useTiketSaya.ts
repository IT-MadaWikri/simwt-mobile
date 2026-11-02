/**
 * Daftar "Tiket Saya": pencarian (debounce), filter (status, tanggal diajukan), urutan, paginasi gulir
 * tanpa batas, dan tarik-untuk-segarkan — semuanya diproses server (`GET /tiket/saya`).
 *
 * Tiap kombinasi filter punya cache sendiri (persisten, lihat `utils/queryClient`), jadi daftar
 * terakhir langsung tampil saat aplikasi dibuka lagi. Spinner `menyegarkan` terpisah dari `memuat`
 * dan dijamin padam lewat batas waktu, supaya permintaan yang tak kunjung selesai tidak menggantungkannya.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { InfiniteData, useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { tiketService } from '../services/tiketService';
import { StatusTiket } from '../types/tiket';

const BATAS_SEGARKAN = 15000;
const JUMLAH_AWAL: Record<string, number> = { '': 0, PENDING: 0, PROSES: 0, RESOLVED: 0, OK: 0 };

export type FilterStatusTiket = StatusTiket | '';
export type ModeFilter = 'terapkan' | 'reset';

export function useTiketSaya({ perHalaman = 20 }: { perHalaman?: number } = {}) {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  // Debounce hanya untuk ketikan pencarian; ganti status/tanggal/urutan langsung dimuat.
  const [cari, setCari] = useState('');
  const [status, setStatus] = useState<FilterStatusTiket>('');
  const [tanggalDari, setTanggalDari] = useState('');
  const [tanggalSampai, setTanggalSampai] = useState('');
  const [urutkan, setUrutkan] = useState<'TERBARU' | 'TERLAMA'>('TERBARU');
  const [menyegarkan, setMenyegarkan] = useState(false);
  // Sheet Filter menutup setelah daftar selesai dimuat; tombol yang ditekan menampilkan spinner selama itu.
  const [filterTerbuka, setFilterTerbuka] = useState(false);
  const [memuatFilter, setMemuatFilter] = useState<null | ModeFilter>(null);

  useEffect(() => {
    const t = setTimeout(() => setCari(search.trim()), 350);
    return () => clearTimeout(t);
  }, [search]);

  const kunci = useMemo(
    () => ['tiket', 'saya', { cari, status, tanggalDari, tanggalSampai, urutkan, perHalaman }],
    [cari, status, tanggalDari, tanggalSampai, urutkan, perHalaman]
  );

  const q = useInfiniteQuery({
    queryKey: kunci,
    queryFn: ({ pageParam }) =>
      tiketService.tiketSaya({ search: cari, status, dari: tanggalDari, sampai: tanggalSampai, urutkan, page: pageParam, perHalaman }),
    initialPageParam: 1,
    getNextPageParam: (terakhir) => (terakhir.current_page < terakhir.last_page ? terakhir.current_page + 1 : undefined),
  });
  const { refetch, fetchNextPage, hasNextPage, isFetchingNextPage, isFetching } = q;

  const tiket = useMemo(() => q.data?.pages.flatMap((h) => h.data) ?? [], [q.data]);
  const jumlah = useMemo(() => ({ ...JUMLAH_AWAL, ...q.data?.pages.at(-1)?.jumlah }), [q.data]);

  // Lewat ref: `muatUlang` harus stabil, supaya efek fokus di pemanggil tidak jalan ulang tiap filter berganti.
  const kunciRef = useRef(kunci);
  kunciRef.current = kunci;
  /** Muat ulang dari halaman pertama saja, tanpa skeleton (mis. kembali dari "Buat Tiket"). */
  const muatUlang = useCallback(async () => {
    queryClient.setQueryData<InfiniteData<unknown, number>>(
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

  const bukaFilter = useCallback(() => setFilterTerbuka(true), []);
  const tutupFilter = useCallback(() => setFilterTerbuka(false), []);

  const terapkanFilter = (n: { status: FilterStatusTiket; dari: string; sampai: string }, mode: ModeFilter) => {
    // Tak ada yang berubah → tak ada pemuatan yang ditunggu, sheet langsung menutup.
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

  const gantiUrutan = useCallback(() => setUrutkan((u) => (u === 'TERBARU' ? 'TERLAMA' : 'TERBARU')), []);

  return {
    tiket,
    jumlah,
    search,
    setSearch,
    status,
    tanggalDari,
    tanggalSampai,
    filterTerbuka,
    bukaFilter,
    tutupFilter,
    memuatFilter,
    terapkanFilter,
    urutkan,
    gantiUrutan,
    adaFilter: !!(search.trim() || status || tanggalDari || tanggalSampai),
    // Skeleton menggantikan baris saat filter/pencarian dimuat; tarik-untuk-segarkan memakai spinner bawaan.
    memuat: q.data === undefined && isFetching && !menyegarkan,
    menyegarkan,
    memuatLebih: isFetchingNextPage,
    error: q.error ? q.error.message || 'Gagal memuat riwayat tiket.' : null,
    muatUlang,
    cobaLagi,
    segarkan,
    muatBerikutnya,
  };
}

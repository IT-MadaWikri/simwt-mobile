/**
 * Daftar Kaizen milik akun yang login: pencarian (debounce), filter, urutan,
 * paginasi gulir tanpa batas, tarik-untuk-segarkan.
 *
 * Hanya mengurus data & state daftar; tampilannya ada di layar. Respons lama
 * (filter sudah berganti) dibuang lewat `permintaanTerakhir` supaya daftar
 * tidak tertimpa.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { kaizenService } from '../services/kaizenService';
import { Kaizen } from '../types/kaizen';

export interface NilaiFilter {
  status: string;
  dari: string;
  sampai: string;
}

export type ModeFilter = 'terapkan' | 'reset';

export function useDaftarKaizen() {
  const [kaizens, setKaizens] = useState<Kaizen[]>([]);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [loading, setLoading] = useState(true);
  // Skeleton hanya untuk muat pertama: kolom cari ada di dalam daftar, jadi daftar tidak boleh dilepas saat mengetik.
  const [awal, setAwal] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  // Urutan hanya menurut tanggal dibuat: TERBARU atau TERLAMA.
  const [urutkan, setUrutkan] = useState<'TERBARU' | 'TERLAMA'>('TERBARU');
  const [tanggalDari, setTanggalDari] = useState('');
  const [tanggalSampai, setTanggalSampai] = useState('');

  // Sheet Filter menutup setelah daftar selesai dimuat; tombol yang ditekan menampilkan spinner selama itu.
  const [filterTerbuka, setFilterTerbuka] = useState(false);
  const [memuatFilter, setMemuatFilter] = useState<null | ModeFilter>(null);
  const menungguMuat = useRef(false);

  const bukaFilter = useCallback(() => setFilterTerbuka(true), []);
  const tutupFilter = useCallback(() => setFilterTerbuka(false), []);

  const terapkanFilter = (n: NilaiFilter, mode: ModeFilter) => {
    if (n.status === status && n.dari === tanggalDari && n.sampai === tanggalSampai) {
      setFilterTerbuka(false);
      return;
    }
    menungguMuat.current = true;
    setMemuatFilter(mode);
    setStatus(n.status);
    setTanggalDari(n.dari);
    setTanggalSampai(n.sampai);
  };

  const permintaanTerakhir = useRef(0);

  const muat = useCallback(
    async (halaman: number) => {
      const id = ++permintaanTerakhir.current;
      try {
        const hasil = await kaizenService.getList({ search: search.trim(), status, urutkan, tanggalDari, tanggalSampai, page: halaman });
        if (id !== permintaanTerakhir.current) return;
        setKaizens((lama) => (halaman === 1 ? hasil.data : [...lama, ...hasil.data]));
        setPage(hasil.current_page);
        setLastPage(hasil.last_page);
        setError(null);
      } catch (e: any) {
        if (id !== permintaanTerakhir.current) return;
        setError(e?.message || 'Gagal memuat Kaizen.');
      } finally {
        if (id === permintaanTerakhir.current) {
          setAwal(false);
          setLoading(false);
          if (menungguMuat.current) {
            menungguMuat.current = false;
            setMemuatFilter(null);
            setFilterTerbuka(false);
          }
          setRefreshing(false);
          setLoadingMore(false);
        }
      }
    },
    [search, status, urutkan, tanggalDari, tanggalSampai]
  );

  // Debounce hanya untuk ketikan pencarian; ganti status/tanggal/urutan langsung dimuat.
  // Skeleton baru muncul saat pemuatan benar-benar mulai, jadi mengetik tidak membuat daftar berkedip.
  const searchSebelumnya = useRef(search);
  useEffect(() => {
    const cariBerubah = searchSebelumnya.current !== search;
    searchSebelumnya.current = search;
    const t = setTimeout(() => {
      setLoading(true);
      muat(1);
    }, cariBerubah ? 350 : 0);
    return () => clearTimeout(t);
  }, [muat]);

  // Lewat ref: `muatUlang` harus stabil. Bila `muat` masuk dependensi efek fokus di pemanggil,
  // setiap filter berganti efek itu ikut jalan dan daftar termuat dua kali.
  const muatRef = useRef(muat);
  muatRef.current = muat;
  const muatUlang = useCallback(() => muatRef.current(1), []);

  const gantiUrutan = () => setUrutkan((u) => (u === 'TERBARU' ? 'TERLAMA' : 'TERBARU'));

  const segarkan = () => {
    setRefreshing(true);
    muat(1);
  };

  const cobaLagi = () => {
    setLoading(true);
    muat(1);
  };

  const muatBerikutnya = () => {
    if (loading || loadingMore || refreshing || page >= lastPage) return;
    setLoadingMore(true);
    muat(page + 1);
  };

  return {
    kaizens,
    error,
    awal,
    refreshing,
    loadingMore,
    // Skeleton menggantikan baris saat filter/pencarian dimuat; tarik-untuk-segarkan tetap memakai spinner bawaan.
    memuatDaftar: loading && !refreshing,
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

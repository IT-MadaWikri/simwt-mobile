/**
 * Daftar "Tiket Saya": pencarian (debounce), filter (status, tanggal diajukan), urutan, paginasi gulir
 * tanpa batas, dan tarik-untuk-segarkan — semuanya diproses server (`GET /tiket/saya`).
 *
 * Respons lama (filter sudah berganti) dibuang lewat `permintaanTerakhir` supaya daftar tidak tertimpa.
 * Spinner `menyegarkan` terpisah dari `memuat` dan dijamin padam lewat batas waktu, supaya
 * permintaan yang tak kunjung selesai tidak menggantungkannya.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { tiketService } from '../services/tiketService';
import { StatusTiket, TiketRingkas } from '../types/tiket';

const BATAS_SEGARKAN = 15000;
const JUMLAH_AWAL: Record<string, number> = { '': 0, PENDING: 0, PROSES: 0, RESOLVED: 0, OK: 0 };

export type FilterStatusTiket = StatusTiket | '';
export type ModeFilter = 'terapkan' | 'reset';

export function useTiketSaya({ perHalaman = 20 }: { perHalaman?: number } = {}) {
  const [tiket, setTiket] = useState<TiketRingkas[]>([]);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [jumlah, setJumlah] = useState<Record<string, number>>(JUMLAH_AWAL);
  const [loading, setLoading] = useState(true);
  const [menyegarkan, setMenyegarkan] = useState(false);
  const [memuatLebih, setMemuatLebih] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<FilterStatusTiket>('');
  const [tanggalDari, setTanggalDari] = useState('');
  const [tanggalSampai, setTanggalSampai] = useState('');
  const [urutkan, setUrutkan] = useState<'TERBARU' | 'TERLAMA'>('TERBARU');
  // Sheet Filter menutup setelah daftar selesai dimuat; tombol yang ditekan menampilkan spinner selama itu.
  const [filterTerbuka, setFilterTerbuka] = useState(false);
  const [memuatFilter, setMemuatFilter] = useState<null | ModeFilter>(null);
  const menungguMuat = useRef(false);
  const permintaanTerakhir = useRef(0);

  const muat = useCallback(
    async (halaman: number) => {
      const id = ++permintaanTerakhir.current;
      try {
        const hasil = await tiketService.tiketSaya({
          search: search.trim(),
          status,
          dari: tanggalDari,
          sampai: tanggalSampai,
          urutkan,
          page: halaman,
          perHalaman,
        });
        if (id !== permintaanTerakhir.current) return;
        setTiket((lama) => (halaman === 1 ? hasil.data : [...lama, ...hasil.data]));
        setPage(hasil.current_page);
        setLastPage(hasil.last_page);
        setJumlah({ ...JUMLAH_AWAL, ...hasil.jumlah });
        setError(null);
      } catch (e: any) {
        if (id !== permintaanTerakhir.current) return;
        setError(e?.message || 'Gagal memuat riwayat tiket.');
      } finally {
        if (id === permintaanTerakhir.current) {
          setLoading(false);
          if (menungguMuat.current) {
            menungguMuat.current = false;
            setMemuatFilter(null);
            setFilterTerbuka(false);
          }
          setMenyegarkan(false);
          setMemuatLebih(false);
        }
      }
    },
    [search, status, tanggalDari, tanggalSampai, urutkan, perHalaman]
  );

  // Debounce hanya untuk ketikan pencarian; ganti status/tanggal/urutan langsung dimuat.
  const searchSebelumnya = useRef(search);
  useEffect(() => {
    const cariBerubah = searchSebelumnya.current !== search;
    searchSebelumnya.current = search;
    const t = setTimeout(
      () => {
        setLoading(true);
        muat(1);
      },
      cariBerubah ? 350 : 0
    );
    return () => clearTimeout(t);
  }, [muat]);

  // Lewat ref: `muatUlang` harus stabil, supaya efek fokus di pemanggil tidak jalan ulang tiap filter berganti.
  const muatRef = useRef(muat);
  muatRef.current = muat;
  /** Muat ulang halaman pertama tanpa skeleton (mis. kembali dari "Buat Tiket"). */
  const muatUlang = useCallback(() => muatRef.current(1), []);

  const segarkan = useCallback(() => {
    setMenyegarkan(true);
    const batas = setTimeout(() => setMenyegarkan(false), BATAS_SEGARKAN);
    muatRef.current(1).finally(() => clearTimeout(batas));
  }, []);

  const cobaLagi = useCallback(() => {
    setLoading(true);
    muatRef.current(1);
  }, []);

  const muatBerikutnya = () => {
    if (loading || memuatLebih || menyegarkan || page >= lastPage) return;
    setMemuatLebih(true);
    muat(page + 1);
  };

  const bukaFilter = useCallback(() => setFilterTerbuka(true), []);
  const tutupFilter = useCallback(() => setFilterTerbuka(false), []);

  const terapkanFilter = (n: { status: FilterStatusTiket; dari: string; sampai: string }, mode: ModeFilter) => {
    // Tak ada yang berubah → tak ada pemuatan yang ditunggu, sheet langsung menutup.
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
    memuat: loading && !menyegarkan,
    menyegarkan,
    memuatLebih,
    error,
    muatUlang,
    cobaLagi,
    segarkan,
    muatBerikutnya,
  };
}

/**
 * Daftar aset departemen pengguna: pencarian (debounce 300 ms), filter kategori, paginasi gulir
 * tanpa batas, dan tarik-untuk-segarkan — semuanya diproses server (`GET /aset/daftar`). Respons
 * lama (kata kunci/kategori sudah berganti) dibuang lewat `permintaan`; spinner `menyegarkan`
 * dijamin padam lewat batas waktu.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { asetService } from '../services/asetService';
import { AsetRingkasan, KategoriAset, StatusAset } from '../types/aset';

const BATAS_SEGARKAN = 15000;
const PER_HALAMAN = 20;

/** `status` tetap selama layar hidup (datang dari kartu ringkasan); undefined = semua aset. */
export function useDaftarAset(status?: StatusAset) {
  const [aset, setAset] = useState<AsetRingkasan[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [kataKunci, setKataKunci] = useState('');
  const [kategoriId, setKategoriId] = useState<number | null>(null);
  const [opsiKategori, setOpsiKategori] = useState<KategoriAset[]>([]);
  const [filterTerbuka, setFilterTerbuka] = useState(false);
  const [memuat, setMemuat] = useState(true);
  const [memuatLebih, setMemuatLebih] = useState(false);
  const [menyegarkan, setMenyegarkan] = useState(false);
  const [error, setError] = useState('');
  const permintaan = useRef(0);

  const muat = useCallback(async (kata: string, kategori: number | null, halaman: number) => {
    const id = ++permintaan.current;
    try {
      const hasil = await asetService.daftar({ search: kata.trim(), kategori, status, page: halaman, perHalaman: PER_HALAMAN });
      if (id !== permintaan.current) return;
      setAset((lama) => (halaman === 1 ? hasil.data : [...lama, ...hasil.data]));
      setPage(hasil.current_page);
      setLastPage(hasil.last_page);
      setTotal(hasil.total);
      setOpsiKategori(hasil.kategori);
      setError('');
    } catch (e) {
      if (id !== permintaan.current) return;
      setError(e instanceof Error ? e.message : 'Gagal mengambil daftar aset.');
    } finally {
      if (id === permintaan.current) {
        setMemuat(false);
        setMemuatLebih(false);
      }
    }
  }, [status]);

  // Muat awal dan tiap kata kunci/kategori berubah (ditunda supaya tidak menembak server per ketukan).
  useEffect(() => {
    setMemuat(true);
    const t = setTimeout(() => muat(kataKunci, kategoriId, 1), 300);
    return () => clearTimeout(t);
  }, [kataKunci, kategoriId, muat]);

  const segarkan = useCallback(() => {
    setMenyegarkan(true);
    const batas = new Promise((selesai) => setTimeout(selesai, BATAS_SEGARKAN));
    Promise.race([muat(kataKunci, kategoriId, 1), batas]).finally(() => setMenyegarkan(false));
  }, [kataKunci, kategoriId, muat]);

  const muatLebihBanyak = useCallback(() => {
    if (memuat || memuatLebih || page >= lastPage) return;
    setMemuatLebih(true);
    muat(kataKunci, kategoriId, page + 1);
  }, [memuat, memuatLebih, page, lastPage, kataKunci, kategoriId, muat]);

  return {
    aset,
    total,
    kataKunci,
    setKataKunci,
    kategoriId,
    setKategoriId,
    opsiKategori,
    filterTerbuka,
    setFilterTerbuka,
    memuat,
    memuatLebih,
    menyegarkan,
    error,
    segarkan,
    muatLebihBanyak,
  };
}

/**
 * Daftar "Tiket Saya": memuat riwayat tiket milik akun; cari, filter (status,
 * tanggal diajukan), dan urutan diterapkan di sisi klien (server mengembalikan
 * maksimal 50), plus tarik-untuk-segarkan.
 *
 * Spinner `menyegarkan` terpisah dari `memuat` dan dijamin padam lewat batas
 * waktu, supaya permintaan yang tak kunjung selesai tidak menggantungkannya.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { saringTiket } from '../adapters/tiket';
import { tiketService } from '../services/tiketService';
import { StatusTiket, TiketRingkas } from '../types/tiket';

const BATAS_SEGARKAN = 15000;

export type FilterStatusTiket = StatusTiket | '';

export function useTiketSaya() {
  const [semua, setSemua] = useState<TiketRingkas[]>([]);
  const [memuat, setMemuat] = useState(true);
  const [menyegarkan, setMenyegarkan] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<FilterStatusTiket>('');
  const [tanggalDari, setTanggalDari] = useState('');
  const [tanggalSampai, setTanggalSampai] = useState('');
  const [urutkan, setUrutkan] = useState<'TERBARU' | 'TERLAMA'>('TERBARU');
  const permintaanTerakhir = useRef(0);

  const muat = useCallback(async () => {
    const id = ++permintaanTerakhir.current;
    try {
      const data = await tiketService.tiketSaya();
      if (id !== permintaanTerakhir.current) return;
      setSemua(data);
      setError(null);
    } catch (e: any) {
      if (id !== permintaanTerakhir.current) return;
      setError(e?.message || 'Gagal memuat riwayat tiket.');
    } finally {
      if (id === permintaanTerakhir.current) setMemuat(false);
    }
  }, []);

  // Muat pertama; layar memanggil `muat` lagi saat kembali fokus.
  useEffect(() => {
    muat();
  }, [muat]);

  const segarkan = useCallback(() => {
    setMenyegarkan(true);
    const batas = setTimeout(() => setMenyegarkan(false), BATAS_SEGARKAN);
    muat().finally(() => {
      clearTimeout(batas);
      setMenyegarkan(false);
    });
  }, [muat]);

  const muatUlang = useCallback(() => {
    setMemuat(true);
    return muat();
  }, [muat]);

  const tiket = useMemo(
    () => saringTiket(semua, { search, status, dari: tanggalDari, sampai: tanggalSampai, urutkan }),
    [semua, search, status, tanggalDari, tanggalSampai, urutkan]
  );

  const terapkanFilter = useCallback((n: { status: FilterStatusTiket; dari: string; sampai: string }) => {
    setStatus(n.status);
    setTanggalDari(n.dari);
    setTanggalSampai(n.sampai);
  }, []);

  const gantiUrutan = useCallback(() => setUrutkan((u) => (u === 'TERBARU' ? 'TERLAMA' : 'TERBARU')), []);

  /** Jumlah per status, untuk label chip filter. */
  const jumlah = useMemo(() => {
    const hitung: Record<string, number> = { '': semua.length, PENDING: 0, PROSES: 0, OK: 0 };
    semua.forEach((t) => {
      hitung[t.status_pengajuan] = (hitung[t.status_pengajuan] ?? 0) + 1;
    });
    return hitung;
  }, [semua]);

  const adaFilter = !!(search.trim() || status || tanggalDari || tanggalSampai);

  return {
    tiket,
    jumlah,
    search,
    setSearch,
    status,
    tanggalDari,
    tanggalSampai,
    terapkanFilter,
    urutkan,
    gantiUrutan,
    adaFilter,
    memuat,
    menyegarkan,
    error,
    muat,
    muatUlang,
    segarkan,
  };
}

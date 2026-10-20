/**
 * Daftar berita: muat halaman pertama, gulir tanpa batas, tarik-untuk-segarkan, dan suka (optimistis).
 *
 * Spinner `menyegarkan` terpisah dari `memuat` dan dijamin padam lewat batas waktu. Suka diubah
 * langsung di layar lalu dikembalikan bila server menolak; `ubahSuka` mengembalikan false untuk
 * kegagalan itu supaya layar yang memanggil bisa menampilkannya.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { beritaService } from '../services/beritaService';
import { Berita } from '../types/berita';

const BATAS_SEGARKAN = 15000;

export function useDaftarBerita({ perHalaman = 20 }: { perHalaman?: number } = {}) {
  const [berita, setBerita] = useState<Berita[]>([]);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [menyegarkan, setMenyegarkan] = useState(false);
  const [memuatLebih, setMemuatLebih] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const permintaanTerakhir = useRef(0);

  const muat = useCallback(
    async (halaman: number) => {
      const id = ++permintaanTerakhir.current;
      try {
        const hasil = await beritaService.daftar({ page: halaman, perHalaman });
        if (id !== permintaanTerakhir.current) return;
        setBerita((lama) => (halaman === 1 ? hasil.data : [...lama, ...hasil.data]));
        setPage(hasil.currentPage);
        setLastPage(hasil.lastPage);
        setError(null);
      } catch (e: any) {
        if (id !== permintaanTerakhir.current) return;
        setError(e?.message || 'Gagal memuat berita.');
      } finally {
        if (id === permintaanTerakhir.current) {
          setLoading(false);
          setMenyegarkan(false);
          setMemuatLebih(false);
        }
      }
    },
    [perHalaman]
  );

  useEffect(() => {
    muat(1);
  }, [muat]);

  // Lewat ref: `muatUlang` harus stabil supaya efek fokus di pemanggil tidak jalan ulang.
  const muatRef = useRef(muat);
  muatRef.current = muat;
  /** Muat ulang halaman pertama tanpa skeleton (mis. kembali ke beranda). */
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

  const ubahSuka = useCallback(
    async (id: number): Promise<boolean> => {
      const awal = berita.find((b) => b.id === id);
      if (!awal) return false;
      const suka = !awal.disukai;
      const set = (disukai: boolean, jumlahSuka: number) =>
        setBerita((l) => l.map((b) => (b.id === id ? { ...b, disukai, jumlahSuka } : b)));

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
    [berita]
  );

  return {
    berita,
    memuat: loading && !menyegarkan,
    menyegarkan,
    memuatLebih,
    error,
    muatUlang,
    cobaLagi,
    segarkan,
    muatBerikutnya,
    ubahSuka,
  };
}

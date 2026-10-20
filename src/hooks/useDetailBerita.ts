/**
 * Detail satu artikel berita (`GET /artikel/{id}`) beserta artikel terkait, dan suka (optimistis;
 * false bila gagal dan dikembalikan).
 */
import { useCallback, useEffect, useState } from 'react';
import { beritaService } from '../services/beritaService';
import { BeritaDetail } from '../types/berita';

export function useDetailBerita(id: number) {
  const [berita, setBerita] = useState<BeritaDetail | null>(null);
  const [memuat, setMemuat] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const muat = useCallback(() => {
    setMemuat(true);
    beritaService
      .detail(id)
      .then((b) => {
        setBerita(b);
        setError(null);
      })
      .catch((e: any) => {
        // 404 = artikel sudah diarsipkan/dihapus; selain itu gangguan jaringan/server.
        setError(e?.response?.status === 404 ? 'Berita tidak ditemukan.' : e?.message || 'Gagal memuat berita.');
      })
      .finally(() => setMemuat(false));
  }, [id]);

  useEffect(() => {
    muat();
  }, [muat]);

  /** Suka/batal suka artikel ini (tanpa argumen) atau salah satu artikel terkait (`idTarget`). */
  const ubahSuka = useCallback(
    async (idTarget?: number): Promise<boolean> => {
      if (!berita) return false;
      const target = idTarget ?? berita.id;
      const sekarang = target === berita.id ? berita : berita.terkait.find((t) => t.id === target);
      if (!sekarang) return false;

      const awal = { disukai: sekarang.disukai, jumlahSuka: sekarang.jumlahSuka };
      const terapkan = (disukai: boolean, jumlahSuka: number) =>
        setBerita((b) => {
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
    [berita]
  );

  return { berita, memuat, error, muat, ubahSuka };
}

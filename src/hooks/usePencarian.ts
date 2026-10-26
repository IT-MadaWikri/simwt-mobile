/**
 * Pencarian jarak jauh untuk sheet pilih: tunda 300 ms setelah berhenti mengetik, minimal `minHuruf`
 * huruf (0 = langsung muat saat sheet dibuka), hasil permintaan lama diabaikan.
 */
import { useEffect, useRef, useState } from 'react';

export function usePencarian<T>(cari: (q: string) => Promise<T[]>, aktif: boolean, minHuruf = 2) {
  const [q, setQ] = useState('');
  const [hasil, setHasil] = useState<T[]>([]);
  const [memuat, setMemuat] = useState(false);
  const [gagal, setGagal] = useState(false);
  const permintaan = useRef(0);
  // `cari` biasanya fungsi baru tiap render; simpan di ref supaya efek hanya bereaksi pada `q`/`aktif`.
  const pencari = useRef(cari);
  pencari.current = cari;

  // Sheet ditutup → bersihkan.
  useEffect(() => {
    if (!aktif) {
      setQ('');
      setHasil([]);
      setGagal(false);
    }
  }, [aktif]);

  useEffect(() => {
    if (!aktif) return;
    const kata = q.trim();
    if (kata.length < minHuruf) {
      setHasil([]);
      setMemuat(false);
      return;
    }
    const id = ++permintaan.current;
    setMemuat(true);
    const t = setTimeout(() => {
      pencari
        .current(kata)
        .then((data) => {
          if (id !== permintaan.current) return;
          setHasil(data);
          setGagal(false);
        })
        .catch(() => {
          if (id !== permintaan.current) return;
          setHasil([]);
          setGagal(true);
        })
        .finally(() => {
          if (id === permintaan.current) setMemuat(false);
        });
    }, q ? 300 : 0);
    return () => clearTimeout(t);
  }, [q, aktif, minHuruf]);

  return { q, setQ, hasil, memuat, gagal };
}

/**
 * Pencarian aset untuk form Buat Tiket: tunda 300 ms setelah berhenti mengetik,
 * minimal 2 huruf, hasil permintaan lama diabaikan.
 */
import { useEffect, useRef, useState } from 'react';
import { tiketService } from '../services/tiketService';
import { AsetRingkas } from '../types/tiket';

export function useCariAset(aktif: boolean) {
  const [q, setQ] = useState('');
  const [hasil, setHasil] = useState<AsetRingkas[]>([]);
  const [memuat, setMemuat] = useState(false);
  const [gagal, setGagal] = useState(false);
  const permintaan = useRef(0);

  // Sheet ditutup → bersihkan.
  useEffect(() => {
    if (!aktif) {
      setQ('');
      setHasil([]);
      setGagal(false);
    }
  }, [aktif]);

  useEffect(() => {
    const kata = q.trim();
    if (kata.length < 2) {
      setHasil([]);
      setMemuat(false);
      return;
    }
    const id = ++permintaan.current;
    setMemuat(true);
    const t = setTimeout(() => {
      tiketService
        .cariAset(kata)
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
    }, 300);
    return () => clearTimeout(t);
  }, [q]);

  return { q, setQ, hasil, memuat, gagal };
}

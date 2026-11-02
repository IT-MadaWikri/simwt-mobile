/**
 * Pencarian opsi untuk sheet Filter Part (proses dan bisnis partner): ketikan di-debounce, hasil
 * di-cache, dan baru jalan setelah `MIN_HURUF` karakter. `aktif` = sheet terbuka; saat tertutup
 * kata cari dikosongkan dan tidak ada yang dimuat.
 */
import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { pengukuranService } from '../services/pengukuranService';
import { OpsiBisnisPartner, ProsesPart } from '../types/pengukuran';

export const MIN_HURUF_OPSI = 2;

export interface OpsiCari<T> {
  kata: string;
  setKata: (kata: string) => void;
  hasil: T[];
  memuat: boolean;
  gagal: boolean;
}
const BATAS_HASIL = 20;

function useOpsi<T>(aktif: boolean, kunci: string, ambil: (kata: string) => Promise<T[]>) {
  const [kata, setKata] = useState('');
  const [kataTunda, setKataTunda] = useState('');

  useEffect(() => {
    if (!aktif) {
      setKata('');
      setKataTunda('');
      return;
    }
    const t = setTimeout(() => setKataTunda(kata.trim()), 350);
    return () => clearTimeout(t);
  }, [kata, aktif]);

  const boleh = aktif && kataTunda.length >= MIN_HURUF_OPSI;
  const q = useQuery({ queryKey: ['pengukuran', 'opsi', kunci, kataTunda], queryFn: () => ambil(kataTunda), enabled: boleh });

  return {
    kata,
    setKata,
    // Hasil lama disembunyikan selama kata belum cukup panjang.
    hasil: boleh ? (q.data ?? []) : [],
    memuat: boleh && q.isFetching,
    gagal: boleh && !!q.error,
  };
}

export function useOpsiFilterPart(aktif: boolean) {
  const proses = useOpsi<ProsesPart>(aktif, 'proses', (k) => pengukuranService.cariProses(k, BATAS_HASIL));
  const bisnisPartner = useOpsi<OpsiBisnisPartner>(aktif, 'bisnis-partner', (k) =>
    pengukuranService.cariBisnisPartner(k, BATAS_HASIL)
  );
  return { proses, bisnisPartner };
}

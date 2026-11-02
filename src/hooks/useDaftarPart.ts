/**
 * Daftar part produksi untuk Pengukuran QC: pencarian (debounce), filter proses & bisnis partner,
 * gulir tanpa batas, tarik-untuk-segarkan. Cache tiap kombinasi filter persisten, jadi daftar
 * terakhir langsung tampil saat aplikasi dibuka lagi.
 */
import { useEffect, useMemo, useState } from 'react';
import { pengukuranService } from '../services/pengukuranService';
import { FilterPart, Part } from '../types/pengukuran';
import { useDaftarBergulir } from './useDaftarBergulir';
import { ModeFilter, useSheetFilter } from './useSheetFilter';

export type { ModeFilter };

export interface NilaiFilterPart {
  proses: string[];
  bisnisPartner: number[];
}

const samaIsi = <T,>(a: T[], b: T[]) => a.length === b.length && a.every((x, i) => x === b[i]);

export function useDaftarPart() {
  const [search, setSearch] = useState('');
  // Debounce hanya untuk ketikan pencarian; ganti filter langsung dimuat.
  const [cari, setCari] = useState('');
  const [proses, setProses] = useState<string[]>([]);
  const [bisnisPartner, setBisnisPartner] = useState<number[]>([]);

  useEffect(() => {
    const t = setTimeout(() => setCari(search.trim()), 350);
    return () => clearTimeout(t);
  }, [search]);

  const filter = useMemo<FilterPart>(() => ({ search: cari, proses, bisnisPartner }), [cari, proses, bisnisPartner]);

  const daftar = useDaftarBergulir<Part>({
    kunci: ['pengukuran', 'part', filter],
    ambilHalaman: (page) => pengukuranService.daftarPart(filter, page),
    pesanGagal: 'Gagal memuat daftar part.',
  });
  const sheet = useSheetFilter(daftar.isFetching);

  const terapkanFilter = (n: NilaiFilterPart, mode: ModeFilter) => {
    // Tak ada yang berubah → tak ada pemuatan yang ditunggu, sheet langsung menutup.
    if (samaIsi(n.proses, proses) && samaIsi(n.bisnisPartner, bisnisPartner)) {
      sheet.tutupFilter();
      return;
    }
    sheet.tungguMuat(mode);
    setProses(n.proses);
    setBisnisPartner(n.bisnisPartner);
  };

  return {
    part: daftar.items,
    total: daftar.total,
    search,
    setSearch,
    proses,
    bisnisPartner,
    adaFilter: !!(search.trim() || proses.length || bisnisPartner.length),
    filterTerbuka: sheet.filterTerbuka,
    memuatFilter: sheet.memuatFilter,
    bukaFilter: sheet.bukaFilter,
    tutupFilter: sheet.tutupFilter,
    terapkanFilter,
    memuat: daftar.memuat,
    menyegarkan: daftar.menyegarkan,
    memuatLebih: daftar.memuatLebih,
    error: daftar.error,
    muatUlang: daftar.muatUlang,
    segarkan: daftar.segarkan,
    cobaLagi: daftar.cobaLagi,
    muatBerikutnya: daftar.muatBerikutnya,
  };
}

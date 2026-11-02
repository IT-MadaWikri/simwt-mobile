/**
 * Riwayat pengukuran terkirim: pencarian (debounce), filter tanggal & judgment, gulir tanpa batas,
 * tarik-untuk-segarkan. Cache tiap kombinasi filter persisten.
 *
 * ponytail: api-simwt belum punya parameter `judgment` di `GET /transaksi/pengukuran`, jadi judgment
 * disaring di aplikasi dan halaman berikutnya ditarik otomatis (maks `MAKS_HALAMAN_OTOMATIS`) bila
 * hasil saringan masih sedikit. Hapus penyaringan & penarik ini begitu backend menyaring judgment.
 */
import { useEffect, useMemo, useState } from 'react';
import { pengukuranService } from '../services/pengukuranService';
import { FilterTerkirim, PengukuranTerkirim } from '../types/pengukuran';
import { useDaftarBergulir } from './useDaftarBergulir';
import { ModeFilter, useSheetFilter } from './useSheetFilter';

export type { ModeFilter };

/** Saringan judgment yang hasilnya di bawah ini terus menarik halaman berikutnya. */
const AMBANG_HASIL_SARINGAN = 12;
const MAKS_HALAMAN_OTOMATIS = 6;

export interface NilaiFilterTerkirim {
  judgment: FilterTerkirim['judgment'];
  tanggalMulai: string;
  tanggalSelesai: string;
}

export function useDaftarTerkirim() {
  const [search, setSearch] = useState('');
  const [cari, setCari] = useState('');
  const [judgment, setJudgment] = useState<FilterTerkirim['judgment']>('');
  const [tanggalMulai, setTanggalMulai] = useState('');
  const [tanggalSelesai, setTanggalSelesai] = useState('');

  useEffect(() => {
    const t = setTimeout(() => setCari(search.trim()), 350);
    return () => clearTimeout(t);
  }, [search]);

  const filter = useMemo<FilterTerkirim>(
    () => ({ search: cari, judgment, tanggalMulai, tanggalSelesai }),
    [cari, judgment, tanggalMulai, tanggalSelesai]
  );

  const daftar = useDaftarBergulir<PengukuranTerkirim>({
    kunci: ['pengukuran', 'terkirim', filter],
    ambilHalaman: (page) => pengukuranService.daftarTerkirim(filter, page),
    pesanGagal: 'Gagal memuat riwayat pengukuran.',
  });
  const sheet = useSheetFilter(daftar.isFetching);

  const data = useMemo(
    () => (judgment ? daftar.items.filter((item) => (item.judgment || 'Pending') === judgment) : daftar.items),
    [daftar.items, judgment]
  );

  // Daftar kosong tidak pernah memicu onEndReached, jadi saringan yang hasilnya sedikit menarik sendiri.
  const { memuat, memuatLebih, muatBerikutnya } = daftar;
  const [halamanOtomatis, setHalamanOtomatis] = useState(0);
  useEffect(() => setHalamanOtomatis(0), [filter]);
  useEffect(() => {
    if (!judgment || memuat || memuatLebih) return;
    if (data.length >= AMBANG_HASIL_SARINGAN || halamanOtomatis >= MAKS_HALAMAN_OTOMATIS) return;
    setHalamanOtomatis((n) => n + 1);
    muatBerikutnya();
  }, [judgment, memuat, memuatLebih, data.length, halamanOtomatis, muatBerikutnya]);

  const terapkanFilter = (n: NilaiFilterTerkirim, mode: ModeFilter) => {
    if (n.judgment === judgment && n.tanggalMulai === tanggalMulai && n.tanggalSelesai === tanggalSelesai) {
      sheet.tutupFilter();
      return;
    }
    sheet.tungguMuat(mode);
    setJudgment(n.judgment);
    setTanggalMulai(n.tanggalMulai);
    setTanggalSelesai(n.tanggalSelesai);
  };

  return {
    terkirim: data,
    total: daftar.total,
    search,
    setSearch,
    judgment,
    tanggalMulai,
    tanggalSelesai,
    adaFilter: !!(search.trim() || judgment || tanggalMulai || tanggalSelesai),
    filterTerbuka: sheet.filterTerbuka,
    memuatFilter: sheet.memuatFilter,
    bukaFilter: sheet.bukaFilter,
    tutupFilter: sheet.tutupFilter,
    terapkanFilter,
    memuat,
    menyegarkan: daftar.menyegarkan,
    memuatLebih,
    error: daftar.error,
    muatUlang: daftar.muatUlang,
    segarkan: daftar.segarkan,
    cobaLagi: daftar.cobaLagi,
    muatBerikutnya,
  };
}

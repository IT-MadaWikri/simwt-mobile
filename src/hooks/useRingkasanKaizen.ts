/**
 * Ringkasan di atas daftar Kaizen: poin & rekap Hutang Kaizen, Top 5, dan
 * jumlah draf lokal. Gagal memuat tidak menghalangi daftar; kartunya cukup
 * menampilkan "-".
 */
import { useCallback, useMemo, useState } from 'react';
import { kaizenService } from '../services/kaizenService';
import { drafKaizen } from '../utils/drafKaizen';
import { KaizenPoin, KaizenTop } from '../types/kaizen';

const BULAN_PANJANG = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

export interface PengingatKaizen {
  bulan: string;
  /** true = Kaizen bulan itu sudah masuk. */
  sudah: boolean;
}

/** Periode berjalan dari rekap Hutang Kaizen: 'berjalan' = belum setor; 'ada' terakhir sebelum 'belum-mulai' = sudah setor. */
export function hitungPengingat(profil: KaizenPoin | null): PengingatKaizen | null {
  const k = profil?.hutang?.keadaan;
  if (!k) return null;
  let i = k.indexOf('berjalan');
  if (i >= 0) return { bulan: BULAN_PANJANG[i], sudah: false };
  i = k.findIndex((x) => x === 'belum-mulai');
  i = i < 0 ? 11 : i - 1;
  return i >= 0 && k[i] === 'ada' ? { bulan: BULAN_PANJANG[i], sudah: true } : null;
}

export function useRingkasanKaizen(nik?: string) {
  const [profil, setProfil] = useState<KaizenPoin | null>(null);
  const [top, setTop] = useState<KaizenTop | null>(null);
  const [jumlahDraf, setJumlahDraf] = useState(0);

  const muatPoin = useCallback(() => {
    kaizenService.getPoin().then(setProfil).catch(() => {});
    kaizenService.getTop().then(setTop).catch(() => {});
  }, []);

  const muatJumlahDraf = useCallback(() => {
    drafKaizen.daftar(nik).then((d) => setJumlahDraf(d.length));
  }, [nik]);

  const pengingat = useMemo(() => hitungPengingat(profil), [profil]);

  return { profil, top, jumlahDraf, pengingat, muatPoin, muatJumlahDraf };
}

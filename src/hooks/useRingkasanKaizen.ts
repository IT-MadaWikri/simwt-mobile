/**
 * Ringkasan di atas daftar Kaizen: poin & rekap Hutang Kaizen, Top 5, dan
 * jumlah draf lokal. Gagal memuat tidak menghalangi daftar; kartunya cukup
 * menampilkan "-".
 */
import { useCallback, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
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
  const [jumlahDraf, setJumlahDraf] = useState(0);

  // Poin & Top 5 ikut cache persisten: angka terakhir tampil dulu, gagal memuat tidak menghapusnya.
  const poin = useQuery<KaizenPoin>({ queryKey: ['kaizen', 'poin'], queryFn: () => kaizenService.getPoin() });
  const topQ = useQuery<KaizenTop>({ queryKey: ['kaizen', 'top'], queryFn: () => kaizenService.getTop() });
  const profil = poin.data ?? null;
  const top = topQ.data ?? null;
  const { refetch: muatUlangPoin } = poin;
  const { refetch: muatUlangTop } = topQ;

  const muatPoin = useCallback(() => {
    // cancelRefetch false: bila muat awal masih berjalan, pakai itu, jangan batalkan lalu ulang.
    muatUlangPoin({ cancelRefetch: false });
    muatUlangTop({ cancelRefetch: false });
  }, [muatUlangPoin, muatUlangTop]);

  const muatJumlahDraf = useCallback(() => {
    drafKaizen.daftar(nik).then((d) => setJumlahDraf(d.length));
  }, [nik]);

  const pengingat = useMemo(() => hitungPengingat(profil), [profil]);

  return { profil, top, jumlahDraf, pengingat, muatPoin, muatJumlahDraf };
}

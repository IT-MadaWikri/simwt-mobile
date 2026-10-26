/** Filter rentang tanggal untuk daftar di layar. Penyaringan data oleh pemakai (`dalamRentang`). */
import { useState } from 'react';

export function useFilterTanggal() {
  /** 'YYYY-MM-DD'; '' = tanpa batas. */
  const [dari, setDari] = useState('');
  const [sampai, setSampai] = useState('');

  return { dari, sampai, setDari, setSampai, aktif: !!(dari || sampai) };
}

/** Konstanta form Pengukuran QC. */
import type { FormInfo, Periode } from '../src/types/pengukuran';

export const DAFTAR_PERIODE_NON_FINAL: Periode[] = ['Awal', 'Tengah', 'Akhir'];

export const PETA_KUNCI_JAM_PERIODE: Record<Periode, 'waktuAwal' | 'waktuTengah' | 'waktuAkhir'> = {
  Awal: 'waktuAwal',
  Tengah: 'waktuTengah',
  Akhir: 'waktuAkhir',
};

export const PILIHAN_SHIFT = ['Shift 1', 'Shift 2', 'Shift 3'];

export const FORM_INFO_AWAL: FormInfo = {
  lotNumber: '',
  checkerName: '',
  shift: 'Shift 1',
  waktuAwal: '',
  waktuTengah: '',
  waktuAkhir: '',
};

/** Angka pengukuran wajib tepat dua desimal, mis. `12.50`. */
export const POLA_FORMAT_ANGKA_DUA_DESIMAL = /^-?\d+\.\d{2}$/;

/** Draf lebih tua dari ini dibuang otomatis. */
export const BATAS_HARI_DRAF = 7;

/** Nama proses yang hanya mengisi satu periode ('Awal') dan memakai nomor lot. */
export const PROSES_FINAL_INSPECTION = 'Final Inspection';

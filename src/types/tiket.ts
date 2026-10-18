/** Tipe domain modul Tiket Masalah. */

export type StatusTiket = 'PENDING' | 'PROSES' | 'OK';

/** Satu baris pada daftar "Tiket Saya" (`GET /tiket/saya`). */
export interface TiketRingkas {
  id: number;
  no_ticket: string;
  judul_masalah: string;
  status_pengajuan: StatusTiket;
  jenis: string | null;
  plant: string | null;
  tanggal_diajukan: string | null;
  tanggal_selesai: string | null;
}

/** Satu langkah pada linimasa detail tiket (hasil adapter, siap dirender). */
export interface LangkahLinimasa {
  id: string;
  judul: string;
  /** Baris tambahan di bawah judul (analisa, penanganan, PIC, …). */
  isi: string[];
  waktu: string | null;
  selesai: boolean;
}

/** Detail tiket yang sudah dirapikan oleh `adaptasiDetailTiket`. */
export interface DetailTiket {
  id: number;
  noTiket: string;
  judul: string;
  detail: string;
  status: StatusTiket;
  diajukanOleh: string;
  jenis: string | null;
  departemen: string | null;
  plant: string | null;
  aset: string | null;
  tanggalDiajukan: string | null;
  tanggalSelesai: string | null;
  /** Path/URL foto sebelum; null bila tidak ada. */
  fotoSebelum: string | null;
  fotoSesudah: string | null;
  linimasa: LangkahLinimasa[];
}

export interface OpsiRef {
  id: number;
  nama: string;
}

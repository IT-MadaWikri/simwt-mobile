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
  /** URL utuh foto sebelum; null bila tidak ada. */
  fotoSebelum: string | null;
  fotoSesudah: string | null;
  linimasa: LangkahLinimasa[];
}

export interface OpsiRef {
  id: number;
  nama: string;
}

/** Opsi pilihan generik untuk bottom sheet. */
export interface OpsiPilihan {
  id: number;
  label: string;
}

export interface JenisTiket {
  id: number;
  nama: string;
  kategori: { id: number; nama: string }[];
}

export interface DepartemenTiket {
  id: number;
  nama: string;
  kode: string;
  subs: { id: number; nama: string; kode: string }[];
}

/** Master data form Buat Tiket (`GET /tiket/buat`). */
export interface MasterBuatTiket {
  jenis: JenisTiket[];
  departemen: DepartemenTiket[];
  /** Area per id departemen/sub-departemen. */
  area: Record<string, { id: number; label: string }[]>;
}

export interface FotoTiket {
  uri: string;
  name: string;
  type: string;
}

/** Aset hasil pencarian untuk form Buat Tiket. */
export interface AsetRingkas {
  asset_number: string;
  asset_name: string;
  alias: string | null;
  asset_pic: string | null;
}

/** Isian form Buat Tiket; `null` = belum dipilih. */
export interface FormTiket {
  aset: AsetRingkas | null;
  idJenis: number | null;
  idKategori: number | null;
  idDepartemen: number | null;
  idSub: number | null;
  idArea: number | null;
  detail: string;
  foto: FotoTiket | null;
}

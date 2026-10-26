/** Tipe domain modul Tiket Masalah. */

export type StatusTiket = 'PENDING' | 'NEED_APPROVAL' | 'PROSES' | 'RESOLVED' | 'OK' | 'FATAL' | 'CANCEL';

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
  /** URL foto langkah (mis. foto sesudah yang ditolak pelapor), bila ada. */
  foto?: string | null;
  /** Sparepart yang diganti pada langkah ini (nama dan jumlah), bila ada. */
  sparepart?: string | null;
  /** Keterangan di atas foto. */
  keteranganFoto?: string;
}

/** Satu metrik waktu pada detail tiket (Total Downtime, Waktu Tunggu, …). */
export interface MetrikTiket {
  id: 'downtime' | 'tunggu' | 'proses' | 'perbaikan';
  label: string;
  keterangan: string;
  /** Durasi final dalam detik; null bila belum ada/belum bisa dihitung. */
  detik: number | null;
  /** ISO waktu mulai bila tahapnya masih berjalan (tampil sebagai jam berjalan); selain itu null. */
  berjalanSejak: string | null;
}

/** Detail tiket yang sudah dirapikan oleh `adaptasiDetailTiket`. */
export interface DetailTiket {
  id: number;
  noTiket: string;
  judul: string;
  detail: string;
  status: StatusTiket;
  diajukanOleh: string;
  /** PIC perbaikan (akun yang di-assign atau nama PIC); null bila belum ada. */
  pic: string | null;
  jenis: string | null;
  departemen: string | null;
  plant: string | null;
  aset: string | null;
  tanggalDiajukan: string | null;
  tanggalSelesai: string | null;
  /** Akun ini boleh mengonfirmasi/menolak penyelesaian (pelapor/Superadmin, saat RESOLVED). */
  bisaKonfirmasi: boolean;
  /** Batas konfirmasi sebelum otomatis OK (12 jam sejak selesai); hanya saat RESOLVED. */
  batasKonfirmasi: string | null;
  /** URL utuh foto sebelum; null bila tidak ada. */
  fotoSebelum: string | null;
  fotoSesudah: string | null;
  linimasa: LangkahLinimasa[];
  metrik: MetrikTiket[];
}

/** Saringan daftar Tiket Saya yang dikirim ke server (kosong = tidak disaring). */
export interface FilterTiketSaya {
  search?: string;
  status?: StatusTiket | '';
  /** 'YYYY-MM-DD' */
  dari?: string;
  sampai?: string;
  urutkan?: 'TERBARU' | 'TERLAMA';
  page?: number;
  perHalaman?: number;
}

/** Satu halaman Tiket Saya + jumlah per status ('' = semua) untuk saringan yang sama tanpa filter status. */
export interface HalamanTiketSaya {
  data: TiketRingkas[];
  current_page: number;
  last_page: number;
  total: number;
  jumlah: Record<string, number>;
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
  /** Tipe tiket di server: Mesin dan Dies punya alur khusus, sisanya IT. */
  tipe: 'it' | 'mesin' | 'dies';
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
  /** Pembacaan counter stroke (hanya tiket Dies); teks supaya bisa dikosongkan. */
  stroke: string;
  detail: string;
  foto: FotoTiket | null;
}

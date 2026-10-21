import type { StatusTiket } from './tiket';

/** Detail aset dari `GET /aset/{nomor}` (relasi Eloquent sudah snake_case). */
export interface DataAset {
  asset_name?: string;
  asset_number?: string;
  alias?: string;
  asset_model?: string;
  asset_brand?: string;
  asset_serial_number?: string;
  asset_use?: string;
  /** PIC / pengguna aset. */
  asset_pic?: string | null;
  asset_condition?: string;
  asset_purchase_date?: string;
  created_at?: string;
  updated_at?: string;
  aset_kategori?: { asset_category_name?: string } | null;
  plant?: { nama?: string } | null;
  departemen_user?: { nama?: string } | null;
  departemen?: { nama?: string } | null;
  asset_description?: string | null;
  /** Kolom JSON `extra_data`; bentuknya dirapikan `adaptasiExtraData`. */
  extra_data?: unknown;
  aset_gambar?: { url?: string | null; asset_image_path?: string | null }[];
  tiket?: { no_ticket?: string; judul_masalah?: string; status_pengajuan?: string; tanggal_diajukan?: string }[];
}

export interface DetailAset {
  dataAsset: DataAset;
  umurAset: string;
}

/** Satu baris label/nilai (spesifikasi teknis atau data lainnya). */
export interface BarisInfoAset {
  label: string;
  nilai: string;
}

/** Satu baris "aset dengan tiket aktif" dari `GET /aset/tiket-aktif`. */
export interface AsetTiketAktif {
  asset_number: string;
  asset_name: string;
  alias: string | null;
  asset_pic: string | null;
  jumlah_tiket: number;
  /** Tiket aktif terbaru pada aset ini. */
  no_ticket: string;
  judul_masalah: string;
  status_pengajuan: StatusTiket;
  tanggal_diajukan: string | null;
}

/** Satu baris pada daftar aset (`GET /aset/daftar`). */
export interface AsetRingkasan {
  asset_number: string;
  asset_name: string;
  alias: string | null;
  asset_pic: string | null;
  asset_condition: string | null;
  kategori: string | null;
}

/** Opsi filter kategori: kategori yang dipakai aset di lingkup pengguna, beserta jumlahnya. */
export interface KategoriAset {
  id: number;
  nama: string;
  jumlah: number;
}

export interface HalamanAset {
  data: AsetRingkasan[];
  current_page: number;
  last_page: number;
  total: number;
  kategori: KategoriAset[];
}

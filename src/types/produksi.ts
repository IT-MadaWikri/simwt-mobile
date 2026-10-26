/** Pencapaian Produksi (input stroke dies) — tipe untuk endpoint `/api/aset/.../produksi/*` di api-simwt. */

/** Aset hasil pencarian dies/mesin (`GET /aset/produksi/cari/{dies|mesin}`). */
export interface AsetPasangan {
  value: string;
  text: string;
  sub: string;
}

/** Part atau material hasil pencarian; `label` ("kode - nama") = teks yang disimpan ke log. */
export interface PartCari {
  id: number;
  kode?: string;
  nama?: string;
  label: string;
}

/** Karyawan hasil pencarian beserta leader dari pemetaan (null bila belum dipetakan). */
export interface KaryawanCari {
  nama_lengkap: string;
  nik: string;
  leader: string | null;
  leader_shift: number | null;
}

export interface AsetProduksi {
  asset_number: string;
  asset_name: string;
  alias: string | null;
}

export interface GudangProduksi {
  id: number;
  kode: string;
  nama: string;
}

/** Master data form dari `GET /aset/{nomor}/produksi/form`. */
export interface MasterProduksi {
  dies: AsetProduksi & { asset_stroke: number | string | null };
  mesin: AsetProduksi | null;
  departemen: string;
  sub_departemen: string[];
  /** Sub-departemen bawaan dari data mesin yang dipindai. */
  sub_departemen_mesin: string | null;
  proses: string[];
  gudang: GudangProduksi[];
  operator_default: string;
}

export interface BarisAlasanNg {
  alasan: string;
  qty: string;
}

/** Isian form; angka disimpan sebagai teks supaya bisa dikosongkan saat mengetik. */
export interface FormProduksi {
  operator: string;
  leader: string;
  shift: number | null;
  subDepartemen: string;
  part: PartCari | null;
  proses: string;
  subProses: string;
  kodeGudang: string;
  planning: string;
  capPerJam: string;
  jumlahOk: string;
  jumlahNg: string;
  strokeHariIni: string;
  material: PartCari | null;
  materialQty: string;
  alasanNg: BarisAlasanNg[];
  keterangan: string;
}

export type JenisCariProduksi = 'dies' | 'mesin' | 'part' | 'material' | 'alasan-ng' | 'karyawan';

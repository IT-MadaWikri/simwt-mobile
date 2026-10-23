/** Layanan IT — Request Akun (Form-IT-03): bentuk yang dipakai layar, bukan respons mentah server. */

export type StatusRequestAkun = 'pending_kabag' | 'pending_it' | 'selesai' | 'ditolak';

export type MetodePenyerahan = 'email' | 'langsung';

export interface RequestAkunRingkas {
  id: number;
  nomorDokumen: string;
  jenisPermintaan: string;
  /** Mis. "WebApps · SIMMWT", "Gmail". */
  sistem: string;
  status: StatusRequestAkun;
  statusLabel: string;
  departemen: string | null;
  plant: string | null;
  /** Terisi hanya bila ditolak. */
  catatanPenolakan: string | null;
  /** Cara akun diserahkan Tim IT; terisi hanya bila selesai. */
  metodePenyerahan: MetodePenyerahan | null;
  diajukanAt: string | null;
  selesaiAt: string | null;
}

export interface LangkahRequestAkun {
  aksi: string;
  aksiLabel: string;
  catatan: string | null;
  oleh: string | null;
  waktu: string | null;
}

export interface RequestAkunDetail extends RequestAkunRingkas {
  namaUser: string;
  usernameAkun: string | null;
  emailDiminta: string | null;
  detailAkses: string | null;
  keterangan: string;
  alasan: string;
  metodePreferensi: MetodePenyerahan | null;
  histori: LangkahRequestAkun[];
}

export interface HasilLacakRequestAkun extends RequestAkunRingkas {
  namaUser: string;
  nikTersamar: string;
  milikSaya: boolean;
}

export interface DepartemenOpsi {
  id: number;
  nama: string;
  /** Kosong = berlaku di semua plant. */
  plantIds: number[];
  subs: { id: number; nama: string; plantIds: number[] }[];
}

export interface OpsiRequestAkun {
  sistem: { nama: string; jenis: string[] }[];
  webapps: string[];
  metode: { nilai: MetodePenyerahan; label: string; keterangan: string; tersedia: boolean }[];
  plant: { id: number; nama: string }[];
  departemen: DepartemenOpsi[];
  /** null = akun belum terhubung ke data karyawan aktif. */
  pemohon: { nama: string; nik: string; idPlant: number | null; idDepartemen: number | null; subDepartemen: number | null } | null;
}

export interface FormRequestAkun {
  idPlant: number | null;
  idDepartemen: number | null;
  subDepartemen: number | null;
  sistem: string | null;
  jenis: string | null;
  webapps: string | null;
  webappsLainnya: string;
  namaSistemLainnya: string;
  emailDiminta: string;
  username: string;
  detailAkses: string;
  keterangan: string;
  alasan: string;
  metode: MetodePenyerahan | null;
}

export type GalatRequestAkun = Partial<
  Record<
    | 'plant'
    | 'departemen'
    | 'sub'
    | 'sistem'
    | 'jenis'
    | 'webapps'
    | 'webappsLainnya'
    | 'namaSistemLainnya'
    | 'emailDiminta'
    | 'username'
    | 'keterangan'
    | 'alasan'
    | 'metode',
    string
  >
>;

/** Request Pembuatan Sistem (Form-IT-04): persetujuan empat tingkat di web. */
export type StatusRequestSistem =
  | 'pending_kabag'
  | 'pending_manager_plant'
  | 'pending_it'
  | 'pending_manager_it'
  | 'disetujui'
  | 'ditolak';

export interface RequestSistemRingkas {
  id: number;
  nomorDokumen: string;
  namaAplikasi: string;
  status: StatusRequestSistem;
  statusLabel: string;
  departemen: string | null;
  plant: string | null;
  /** Terisi hanya bila ditolak. */
  catatanPenolakan: string | null;
  diajukanAt: string | null;
}

export interface LangkahRequestSistem {
  aksiLabel: string;
  catatan: string | null;
  oleh: string | null;
  waktu: string | null;
}

export interface RequestSistemDetail extends RequestSistemRingkas {
  namaUser: string;
  tujuan: string[];
  manfaat: string[];
  deskripsi: string | null;
  /** Keterangan hasil pemeriksaan Tim IT, bila sudah ada. */
  keteranganIt: string | null;
  histori: LangkahRequestSistem[];
}

export interface HasilLacakRequestSistem extends RequestSistemRingkas {
  namaUser: string;
  nikTersamar: string;
  milikSaya: boolean;
}

export interface FormRequestSistem {
  idPlant: number | null;
  idDepartemen: number | null;
  subDepartemen: number | null;
  namaAplikasi: string;
  /** Minimal 3 butir terisi (aturan web). */
  tujuan: string[];
  manfaat: string[];
  deskripsi: string;
}

export type GalatRequestSistem = Partial<Record<'plant' | 'departemen' | 'sub' | 'namaAplikasi' | 'tujuan' | 'manfaat', string>>;

/** Layanan HRD — Form Keluar Pabrik (Form-HRD-17): bentuk yang dipakai layar, bukan respons mentah server. */
import { DepartemenOpsi } from './layananIt';

export type StatusKeluarPabrik = 'menunggu' | 'disetujui' | 'ditolak';
export type JenisKeluar = 'dinas' | 'pribadi';
export type KategoriPemohon = 'staff_magang_pkl' | 'kabag';

export interface KeluarPabrikRingkas {
  id: number;
  nomorDokumen: string;
  status: StatusKeluarPabrik;
  statusLabel: string;
  jenisKeluar: JenisKeluar;
  kategori: KategoriPemohon;
  /** 'YYYY-MM-DD'. */
  tanggalKeluar: string;
  /** 'HH:mm'. */
  jamKeluar: string;
  jamKembali: string | null;
  departemen: string | null;
  plant: string | null;
  /** Terisi hanya bila ditolak. */
  catatanPenolakan: string | null;
  diajukanAt: string | null;
}

export interface LangkahKeluarPabrik {
  aksi: string;
  catatan: string | null;
  oleh: string | null;
  waktu: string | null;
}

export interface KeluarPabrikDetail extends KeluarPabrikRingkas {
  namaUser: string;
  alasan: string;
  catatanPersetujuan: string | null;
  disetujuiOleh: string | null;
  waktuKeluarAktual: string | null;
  waktuKembaliAktual: string | null;
  /** Tautan gerbang untuk QR Pass; null = belum disetujui / perjalanan sudah selesai. */
  gerbangUrl: string | null;
  histori: LangkahKeluarPabrik[];
}

export interface HasilLacakKeluarPabrik extends KeluarPabrikRingkas {
  namaUser: string;
  nikTersamar: string;
  milikSaya: boolean;
}

export interface OpsiKeluarPabrik {
  plant: { id: number; nama: string }[];
  departemen: DepartemenOpsi[];
  /** null = akun belum terhubung ke data karyawan aktif. */
  pemohon: {
    nama: string;
    nik: string;
    idPlant: number | null;
    idDepartemen: number | null;
    subDepartemen: number | null;
    kategori: KategoriPemohon;
  } | null;
}

export interface FormKeluarPabrik {
  kategori: KategoriPemohon;
  idPlant: number | null;
  idDepartemen: number | null;
  subDepartemen: number | null;
  /** 'YYYY-MM-DD'. */
  tanggal: string;
  /** 'HH:mm'. */
  jamKeluar: string;
  /** 'HH:mm'; '' = tidak kembali. */
  jamKembali: string;
  jenis: JenisKeluar | null;
  alasan: string;
}

export type GalatKeluarPabrik = Partial<
  Record<'plant' | 'departemen' | 'sub' | 'jenis' | 'alasan', string>
>;

/** Tahap pass di gerbang: `keluar` (belum keluar), `kembali` (sudah keluar, harus kembali), `selesai`. */
export type TahapGerbang = 'keluar' | 'kembali' | 'selesai';

/** Pass hasil pindai QR oleh petugas gerbang. `tahap` null = izin belum disetujui. */
export interface GerbangKeluarPabrik extends KeluarPabrikRingkas {
  namaUser: string;
  alasan: string;
  waktuKeluarAktual: string | null;
  waktuKembaliAktual: string | null;
  tahap: TahapGerbang | null;
  /** Menit lewat dari jam kembali (waktu server); 0 bila belum lewat atau bukan tahap kembali. */
  terlambatMenit: number;
}

export interface HasilGerbang {
  tipe: 'success' | 'info';
  judul: string;
  pesan: string;
}

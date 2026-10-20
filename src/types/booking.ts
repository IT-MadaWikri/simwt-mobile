/** Booking ruangan meeting ("Undangan Rapat") — bentuk yang dipakai layar, bukan respons mentah server. */

export type JenisRapat = 'offline' | 'online' | 'luar';

export interface Booking {
  id: number;
  jenis: JenisRapat;
  jenisLabel: string;
  /** null = rapat online / di luar perusahaan (tanpa ruangan). */
  idRuangan: number | null;
  /** Ruangan, "Online", atau lokasi bebas. */
  tempat: string;
  plant: string | null;
  departemen: string | null;
  namaPeminjam: string;
  namaKegiatan: string;
  linkMeeting: string | null;
  mulai: Date;
  selesai: Date;
  /** 0 Menunggu, 1 Terjadwal, 2 Segera Dimulai, 3 Berlangsung, 4 Segera Berakhir, 5 Selesai, 6 Dibatalkan. */
  status: number;
  statusLabel: string;
  peserta: string[];
}

export interface OpsiRuangan {
  id: number;
  nama: string;
  kapasitas: number;
  idPlant: number;
}

export interface MasterBooking {
  plant: { id: number; nama: string }[];
  ruangan: OpsiRuangan[];
  departemen: { id: number; nama: string; kode: string }[];
  /** Nilai awal isian dari akun yang login. */
  awal: { idPlant: number | null; namaPeminjam: string };
}

export interface FormBooking {
  jenis: JenisRapat;
  idPlant: number | null;
  idRuangan: number | null;
  idDepartemen: number | null;
  linkMeeting: string;
  lokasi: string;
  namaPeminjam: string;
  namaKegiatan: string;
  /** 'YYYY-MM-DD' */
  tanggal: string;
  /** 'HH:mm' */
  mulai: string;
  selesai: string;
  peserta: string[];
}

export type GalatBooking = Partial<Record<'plant' | 'ruangan' | 'link' | 'lokasi' | 'departemen' | 'peminjam' | 'kegiatan' | 'waktu', string>>;

/**
 * Daftar pengguna SIMWT — dipakai untuk memilih lawan bicara chat baru dan
 * untuk melengkapi halaman profil dengan data karyawan.
 *
 * Sumber: GET /pengguna (mengembalikan pengguna + relasi `karyawan`).
 */
import api from './api';

export interface KaryawanRingkas {
  id: number;
  nama_lengkap: string;
  email?: string | null;
  phone?: string | null;
  foto_profil?: string | null;
  jabatan?: string | { nama: string } | null;
  departemen?: string | { nama: string } | null;
  nik?: string | null;
  tanggal_masuk_kerja?: string | null;
  status_karyawan?: string | null;
}

export interface PenggunaRingkas {
  id: number;
  username: string;
  nama_lengkap: string;
  email?: string | null;
  nik?: string | null;
  plant?: number | null;
  id_departemen?: number | null;
  no_whatsapp?: string | null;
  karyawan?: KaryawanRingkas | null;
}

/** Ambil nama jabatan/departemen apa pun bentuknya (string atau objek). */
export function namaDari(nilai: string | { nama: string } | null | undefined): string | null {
  if (!nilai) return null;
  return typeof nilai === 'string' ? nilai : nilai.nama ?? null;
}

export const penggunaService = {
  /** Seluruh pengguna aktif. */
  async semua(): Promise<PenggunaRingkas[]> {
    const response = await api.get('/pengguna');
    return response.data?.data ?? [];
  },

  /**
   * Profil karyawan milik pengguna login — dicocokkan lewat daftar pengguna,
   * karena endpoint /user tidak menyertakan relasi karyawan.
   */
  async karyawanSaya(idPengguna: number): Promise<KaryawanRingkas | null> {
    const semua = await this.semua();
    return semua.find((item) => item.id === idPengguna)?.karyawan ?? null;
  },
};

export default penggunaService;

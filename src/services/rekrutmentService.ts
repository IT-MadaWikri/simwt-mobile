import api from './api';
import { API_CONFIG } from '../../constants/Api';

export interface Lowongan {
  id: number;
  judul_pekerjaan: string;
  status: string;
  tipe_waktu_pekerjaan: string;
  tipe_tempat_pekerjaan: string;
  tanggal_kedaluwarsa: string;
  departemen?: {
    nama: string;
  };
  plant?: {
    nama_plant: string;
    kota: string;
  };
  posisi?: {
    nama: string;
    level: string;
  };
}

/** Satu tahap pipeline lamaran, mis. { status: 'Diterima', jumlah: 2 }. */
export interface PipelineItem {
  status: string;
  jumlah: number;
}

export interface JadwalItem {
  id: number;
  judul: string;
  kategori: string;
  status: 'Selesai' | 'Berlangsung' | 'Belum Dimulai';
  metode: 'Online' | 'Offline';
  tanggal_mulai: string;
  tanggal_selesai: string;
}

export interface LowonganTeratas {
  id: number;
  judul_lowongan: string;
  kebutuhan: number;
  jumlah_pelamar: number;
  status: string;
  tanggal_kedaluwarsa: string;
  departemen: string | null;
  plant: string | null;
}

/**
 * Kontrak GET /rekrutmen/dashboard di api-simwt.
 * Lihat app/Http/Controllers/Api/RekrutmenDashboardController.php.
 */
export interface RekrutmentDashboardResponse {
  ringkasan: {
    lowongan_aktif: number;
    lowongan_total: number;
    pelamar_total: number;
    pelamar_30_hari: number;
    pelamar_diterima: number;
    pelamar_ditolak: number;
    jadwal_hari_ini: number;
    surat_belum_terkirim: number;
  };
  pipeline: PipelineItem[];
  surat_belum_terkirim: {
    interview: number;
    pkwt: number;
  };
  jadwal_hari_ini: JadwalItem[];
  lowongan_teratas: LowonganTeratas[];
}

export const rekrutmentService = {
  /**
   * Daftar lowongan karir yang sedang dibuka.
   * GET /karir — middleware VerifyWebToken, cukup header X-SIMMWT-KEY.
   */
  getLowongan: async (): Promise<Lowongan[]> => {
    const response = await api.get(API_CONFIG.ENDPOINTS.KARIR);
    return response.data?.data ?? response.data ?? [];
  },

  /**
   * Dashboard ringkas rekrutmen (read-only).
   * GET /rekrutmen/dashboard — butuh login Sanctum.
   *
   * Menggantikan endpoint lama `/rekrutment/rekrutment` yang dihapus dari
   * api-simwt pada Juli 2026. Endpoint baru ini murni baca: seluruh alur kerja
   * admin HR (buat lowongan, jadwal, ubah status, kirim surat) tetap milik
   * monolith `sim-mwt` dan tidak diekspos sebagai API.
   */
  getDashboardAdmin: async (): Promise<RekrutmentDashboardResponse> => {
    const response = await api.get(API_CONFIG.ENDPOINTS.REKRUTMEN_DASHBOARD);
    return response.data.data;
  },
};

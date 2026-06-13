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

export interface RekrutmentDashboardResponse {
  totalLowongan: number;
  totalPelamar: number;
  jadwalHariIni: number;
  suratPsikotesBelumApprove: any[];
  suratPkwtBelumApprove: any[];
  suratHasilTesBelumApprove: any[];
  analisisMITA: {
    metrik: {
      total_lowongan: number;
      total_pelamar: number;
      pelamar_diterima: number;
      pelamar_ditolak: number;
    };
    analisis_mendalam: {
      kondisi: string;
      risiko: { judul: string; deskripsi: string }[];
      rekomendasi: { prioritas: string; aksi: string; detail: string }[];
    };
  };
}

export const rekrutmentService = {
  getDashboardAdmin: async (): Promise<RekrutmentDashboardResponse> => {
    try {
      const response = await api.get(API_CONFIG.ENDPOINTS.REKRUITMENT);
      return response.data;
    } catch (error) {
      console.error('Error fetching recruitment admin dashboard:', error);
      throw error;
    }
  }
};

/**
 * Berita — artikel CMS dari `GET /artikel` (api-simwt). Penulisannya ada di web (sim-mwt).
 */
import api from './api';
import { adaptasiBerita, adaptasiDetailBerita } from '../adapters/berita';
import { BeritaDetail, HalamanBerita, StatusSuka } from '../types/berita';

export const beritaService = {
  async daftar({ page = 1, perHalaman = 20 }: { page?: number; perHalaman?: number } = {}): Promise<HalamanBerita> {
    const response = await api.get('/artikel', { params: { page, per_page: perHalaman } });
    const halaman = response.data?.data;
    return {
      data: ((halaman?.data ?? []) as unknown[]).map(adaptasiBerita),
      currentPage: halaman?.current_page ?? 1,
      lastPage: halaman?.last_page ?? 1,
    };
  },

  async detail(id: number): Promise<BeritaDetail> {
    const response = await api.get(`/artikel/${id}`);
    return adaptasiDetailBerita(response.data?.data);
  },

  /** Suka / batal suka (idempoten di server). Mengembalikan status terbaru dari server. */
  async ubahSuka(id: number, suka: boolean): Promise<StatusSuka> {
    const response = suka ? await api.put(`/artikel/${id}/suka`) : await api.delete(`/artikel/${id}/suka`);
    return {
      disukai: !!response.data?.data?.disukai,
      jumlahSuka: Number(response.data?.data?.jumlah_suka) || 0,
    };
  },
};

export default beritaService;

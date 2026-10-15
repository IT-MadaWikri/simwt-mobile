import api from './api';
import { API_CONFIG } from '../../constants/Api';
import { KaizenDashboardData, KaizenFilterData, KaizenDetail, KaizenListPage, KaizenPoin, KaizenTop, KaizenOpsiBuat, KaryawanRingkas } from '../types/kaizen';

class KaizenService {
  /**
   * Fetch Kaizen Dashboard stats and data
   */
  async getDashboard(tahun?: string, plant?: string): Promise<KaizenDashboardData> {
    const params = new URLSearchParams();
    if (tahun) params.append('tahun', tahun);
    if (plant) params.append('plant', plant);
    
    const url = `${API_CONFIG.ENDPOINTS.KAIZEN_DASHBOARD}?${params.toString()}`;
    const response = await api.get(url);
    
    // The API returns { success: true, data: { ... } }
    return response.data.data;
  }

  /**
   * Fetch filter data (plants, departemens, tahuns)
   */
  async getFilterData(tahun?: string, departemen?: string, plant?: string): Promise<KaizenFilterData> {
    const params = new URLSearchParams();
    if (tahun) params.append('tahun', tahun);
    if (departemen) params.append('departemen', departemen);
    if (plant) params.append('plant', plant);
    
    const url = `${API_CONFIG.ENDPOINTS.KAIZEN_DATA}?${params.toString()}`;
    const response = await api.get(url);
    
    return response.data;
  }

  /**
   * Fetch Kaizen Detail
   */
  async getDetail(id: number): Promise<KaizenDetail> {
    const url = `${API_CONFIG.ENDPOINTS.KAIZEN_DATA}/${id}`;
    const response = await api.get(url);
    
    return response.data;
  }
  /**
   * Daftar Kaizen milik akun yang login (dibatasi di server), 20 per halaman.
   * Mengembalikan objek paginasi Laravel: { data, current_page, last_page, total }.
   */
  async getList(filters: { status?: string; urutkan?: string; search?: string; page?: number }): Promise<KaizenListPage> {
    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);
    if (filters.urutkan) params.append('urutkan', filters.urutkan);
    if (filters.search) params.append('search', filters.search);
    params.append('page', String(filters.page ?? 1));

    const response = await api.get(`${API_CONFIG.ENDPOINTS.KAIZEN_LIST}?${params.toString()}`);
    return response.data.data;
  }

  /** Poin Kaizen akun yang login, katalog gift plant-nya, dan riwayat redeem. */
  async getPoin(): Promise<KaizenPoin> {
    const response = await api.get(API_CONFIG.ENDPOINTS.KAIZEN_POIN);
    return response.data.data;
  }

  /** Top 5 pelaksana & departemen tahun ini (jumlah Kaizen disetujui, plant pengguna). */
  async getTop(): Promise<KaizenTop> {
    const response = await api.get(API_CONFIG.ENDPOINTS.KAIZEN_TOP);
    return response.data.data;
  }

  /** Ajukan redeem; poin baru dipotong saat admin menyetujui. */
  async redeem(idGift: number): Promise<void> {
    await api.post(API_CONFIG.ENDPOINTS.KAIZEN_REDEEM, { id_gift: idGift });
  }

  /** Setujui Kaizen berstatus DITERIMA (butuh izin approve_kaizen). */
  async setujui(id: number): Promise<void> {
    await api.post(`/kaizen/${id}/approve`);
  }

  async tolak(id: number, alasan: string): Promise<void> {
    await api.post(`/kaizen/${id}/reject`, { alasan });
  }

  /** Nilai komite: { [kriteria.nama]: angka }. */
  async nilai(id: number, nilai: Record<string, number>): Promise<void> {
    await api.post(`/kaizen/${id}/penilaian`, nilai);
  }

  async batalkanNilai(id: number): Promise<void> {
    await api.post(`/kaizen/${id}/reset-nilai`);
  }

  /** Kategori manfaat, departemen yang boleh dipilih, dan plant akun. */
  async getOpsiBuat(): Promise<KaizenOpsiBuat> {
    const response = await api.get(`${API_CONFIG.ENDPOINTS.KAIZEN_BUAT}/opsi`);
    return response.data.data;
  }

  /** Cari karyawan berdasarkan nama atau NIK (min 2 huruf, maks 20 hasil). */
  async cariKaryawan(q: string): Promise<KaryawanRingkas[]> {
    const response = await api.get(`${API_CONFIG.ENDPOINTS.KAIZEN_BUAT}/karyawan`, { params: { q } });
    return response.data.data;
  }

  /** Kirim Kaizen beserta manfaat & foto (multipart); mengembalikan id & nomor. */
  async buat(data: FormData): Promise<{ id: number; nomor: string }> {
    const response = await api.post(API_CONFIG.ENDPOINTS.KAIZEN_BUAT, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.data;
  }
}

export const kaizenService = new KaizenService();

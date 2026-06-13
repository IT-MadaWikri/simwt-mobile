import api from './api';
import { API_CONFIG } from '../../constants/Api';
import { KaizenDashboardData, KaizenFilterData, KaizenDetail } from '../types/kaizen';

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
   * Fetch Kaizen List with filters
   */
  async getList(filters: { status?: string; urutkan?: string; bulan_tahun?: string; search?: string }): Promise<any> {
    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);
    if (filters.urutkan) params.append('urutkan', filters.urutkan);
    if (filters.bulan_tahun) params.append('bulan_tahun', filters.bulan_tahun);
    if (filters.search) params.append('search', filters.search);
    
    const url = `/kaizen/list?${params.toString()}`;
    const response = await api.get(url);
    
    return response.data.data;
  }
}

export const kaizenService = new KaizenService();

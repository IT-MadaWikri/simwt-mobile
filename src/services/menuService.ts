import api from './api';
import { API_CONFIG } from '../../constants/Api';

export const menuService = {
  /** Kode menu (tabel `menu_items` di web) yang boleh dilihat pengguna; sumber yang sama dengan navbar web. */
  async getKodeTampil(): Promise<string[]> {
    const response = await api.get<{ data: { kode: string[] } }>(API_CONFIG.ENDPOINTS.MENU);
    return response.data.data.kode;
  },
};

/** Aset — klien endpoint `/api/aset/*` di api-simwt. */
import api from './api';
import { DetailAset } from '../types/aset';

export const asetService = {
  /** Detail satu aset menurut nomornya (hasil pindai QR). Melempar Error berpesan Indonesia. */
  async detail(nomor: string): Promise<DetailAset> {
    let body;
    try {
      body = (await api.get(`/aset/${encodeURIComponent(nomor)}`)).data;
    } catch (err: any) {
      const status = err.response?.status;
      if (status === 404) throw new Error('Aset tidak ditemukan.');
      if (status === 403) throw new Error('Anda tidak punya akses ke aset ini.');
      throw new Error(err.isNetworkError ? err.message : 'Gagal mengambil data aset dari server.');
    }
    if (!body?.aset) throw new Error('Data aset tidak ditemukan.');
    return { dataAsset: body.aset, umurAset: body.umurAsetString };
  },
};

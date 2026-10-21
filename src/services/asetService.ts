/** Aset — klien endpoint `/api/aset/*` di api-simwt. */
import api from './api';
import { statusAman } from '../adapters/tiket';
import { AsetTiketAktif, DetailAset, HalamanAset, RingkasanAsetData, StatusAset } from '../types/aset';

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

  /** Aset di departemen pengguna yang masih punya tiket aktif, tiket terbaru lebih dulu. */
  async tiketAktif(): Promise<AsetTiketAktif[]> {
    try {
      const body = (await api.get('/aset/tiket-aktif')).data;
      return ((body?.data ?? []) as AsetTiketAktif[]).map((a) => ({ ...a, status_pengajuan: statusAman(a.status_pengajuan) }));
    } catch (err: any) {
      if (err.response?.status === 403) throw new Error('Anda tidak punya akses ke daftar aset.');
      throw new Error(err.isNetworkError ? err.message : 'Gagal mengambil aset dengan tiket aktif.');
    }
  },

  /** Angka ringkasan menu Aset (total, aktif, maintenance, …) untuk departemen pengguna. */
  async ringkasan(): Promise<RingkasanAsetData> {
    try {
      return (await api.get('/aset/ringkasan')).data.data;
    } catch (err: any) {
      if (err.response?.status === 403) throw new Error('Anda tidak punya akses ke data aset.');
      throw new Error(err.isNetworkError ? err.message : 'Gagal mengambil ringkasan aset.');
    }
  },

  /** Satu halaman aset di departemen pengguna; pencarian dan paginasi diproses server. */
  async daftar({ search, kategori, status, page, perHalaman }: { search?: string; kategori?: number | null; status?: StatusAset; page?: number; perHalaman?: number } = {}): Promise<HalamanAset> {
    try {
      const halaman = (await api.get('/aset/daftar', { params: { search: search || undefined, kategori: kategori || undefined, status, page, per_page: perHalaman } })).data?.data;
      return {
        data: halaman?.data ?? [],
        current_page: halaman?.current_page ?? 1,
        last_page: halaman?.last_page ?? 1,
        total: halaman?.total ?? 0,
        kategori: halaman?.kategori ?? [],
      };
    } catch (err: any) {
      if (err.response?.status === 403) throw new Error('Anda tidak punya akses ke daftar aset.');
      throw new Error(err.isNetworkError ? err.message : 'Gagal mengambil daftar aset.');
    }
  },
};

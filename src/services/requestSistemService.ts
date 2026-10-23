/**
 * Layanan IT — Request Pembuatan Sistem (Form-IT-04): klien endpoint `/api/layanan-it/request-sistem/*`
 * di api-simwt. Pilihan plant & departemen memakai `requestAkunService.opsi()`. Persetujuan empat tingkat
 * dan lampiran ada di web.
 */
import api from './api';
import {
  adaptasiDetailRequestSistem,
  adaptasiLacakRequestSistem,
  adaptasiRequestSistem,
  butirTerisi,
} from '../adapters/requestAkun';
import { FormRequestSistem, HasilLacakRequestSistem, RequestSistemDetail, RequestSistemRingkas } from '../types/layananIt';

/** Isian form → badan permintaan; butir tujuan/manfaat yang kosong tidak dikirim. */
export function buatPayloadRequestSistem(f: FormRequestSistem) {
  return {
    id_plant: f.idPlant,
    id_departemen: f.idDepartemen,
    sub_departemen: f.subDepartemen ?? undefined,
    nama_aplikasi: f.namaAplikasi.trim(),
    tujuan: butirTerisi(f.tujuan),
    manfaat: butirTerisi(f.manfaat),
    deskripsi: f.deskripsi.trim() || undefined,
  };
}

export const requestSistemService = {
  /** Ajukan request; mengembalikan id dan nomor dokumen. Melempar galat 422 dari server. */
  async kirim(form: FormRequestSistem): Promise<{ id: number; nomorDokumen: string }> {
    const response = await api.post('/layanan-it/request-sistem', buatPayloadRequestSistem(form));
    return { id: Number(response.data?.data?.id), nomorDokumen: response.data?.data?.nomor_dokumen ?? '' };
  },

  async saya(): Promise<RequestSistemRingkas[]> {
    const response = await api.get('/layanan-it/request-sistem/saya');
    return ((response.data?.data ?? []) as unknown[]).map(adaptasiRequestSistem);
  },

  async detail(id: number): Promise<RequestSistemDetail> {
    const response = await api.get(`/layanan-it/request-sistem/${id}`);
    return adaptasiDetailRequestSistem(response.data?.data);
  },

  async lacak(nomor: string): Promise<HasilLacakRequestSistem> {
    const response = await api.get('/layanan-it/request-sistem/lacak', { params: { nomor: nomor.trim() } });
    return adaptasiLacakRequestSistem(response.data?.data);
  },
};

export default requestSistemService;

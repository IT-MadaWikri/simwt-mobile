/**
 * Layanan HRD — Form Keluar Pabrik (Form-HRD-17): klien endpoint `/api/layanan-hrd/keluar-pabrik/*` di api-simwt.
 * Pemohon selalu karyawan pemilik akun yang login. Persetujuan, cetak, dan pencatatan gerbang ada di web.
 */
import api from './api';
import {
  adaptasiDetailKeluarPabrik,
  adaptasiKeluarPabrik,
  adaptasiLacakKeluarPabrik,
  adaptasiOpsiKeluarPabrik,
} from '../adapters/keluarPabrik';
import { FormKeluarPabrik, HasilLacakKeluarPabrik, KeluarPabrikDetail, KeluarPabrikRingkas, OpsiKeluarPabrik } from '../types/layananHrd';

export function buatPayloadKeluarPabrik(f: FormKeluarPabrik) {
  return {
    kategori_pemohon: f.kategori,
    id_plant: f.idPlant,
    id_departemen: f.idDepartemen,
    sub_departemen: f.subDepartemen ?? undefined,
    tanggal_keluar: f.tanggal,
    jam_keluar: f.jamKeluar,
    jam_kembali: f.jamKembali || undefined,
    jenis_keluar: f.jenis,
    alasan: f.alasan.trim(),
  };
}

export const keluarPabrikService = {
  async opsi(): Promise<OpsiKeluarPabrik> {
    const response = await api.get('/layanan-hrd/keluar-pabrik/opsi');
    return adaptasiOpsiKeluarPabrik(response.data?.data);
  },

  /** Ajukan form; mengembalikan id dan nomor dokumen. Melempar galat 422 dari server. */
  async kirim(form: FormKeluarPabrik): Promise<{ id: number; nomorDokumen: string }> {
    const response = await api.post('/layanan-hrd/keluar-pabrik', buatPayloadKeluarPabrik(form));
    return { id: Number(response.data?.data?.id), nomorDokumen: response.data?.data?.nomor_dokumen ?? '' };
  },

  async saya(): Promise<KeluarPabrikRingkas[]> {
    const response = await api.get('/layanan-hrd/keluar-pabrik/saya');
    return ((response.data?.data ?? []) as unknown[]).map(adaptasiKeluarPabrik);
  },

  async detail(id: number): Promise<KeluarPabrikDetail> {
    const response = await api.get(`/layanan-hrd/keluar-pabrik/${id}`);
    return adaptasiDetailKeluarPabrik(response.data?.data);
  },

  async lacak(nomor: string): Promise<HasilLacakKeluarPabrik> {
    const response = await api.get('/layanan-hrd/keluar-pabrik/lacak', { params: { nomor: nomor.trim() } });
    return adaptasiLacakKeluarPabrik(response.data?.data);
  },
};

export default keluarPabrikService;

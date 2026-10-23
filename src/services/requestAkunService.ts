/**
 * Layanan IT — Request Akun (Form-IT-03): klien endpoint `/api/layanan-it/request-akun/*` di api-simwt.
 * Pemohon selalu karyawan pemilik akun yang login. Persetujuan Kabag dan penyelesaian Tim IT ada di web.
 */
import api from './api';
import {
  adaptasiDetailRequestAkun,
  adaptasiLacakRequestAkun,
  adaptasiOpsiRequestAkun,
  adaptasiRequestAkun,
  pakaiDetailAkses,
} from '../adapters/requestAkun';
import { FormRequestAkun, HasilLacakRequestAkun, OpsiRequestAkun, RequestAkunDetail, RequestAkunRingkas } from '../types/layananIt';

/** Isian form → badan permintaan; field yang tidak relevan untuk sistem terpilih tidak dikirim. */
export function buatPayloadRequestAkun(f: FormRequestAkun) {
  return {
    id_plant: f.idPlant,
    id_departemen: f.idDepartemen,
    sub_departemen: f.subDepartemen ?? undefined,
    sistem_terdampak: f.sistem,
    jenis_permintaan: f.jenis,
    webapps_aplikasi: f.sistem === 'WebApps' ? f.webapps : undefined,
    webapps_aplikasi_lainnya: f.sistem === 'WebApps' && f.webapps === 'Lainnya' ? f.webappsLainnya.trim() : undefined,
    nama_sistem_lainnya: f.sistem === 'Lainnya' ? f.namaSistemLainnya.trim() : undefined,
    email_diminta: f.sistem === 'Gmail' ? f.emailDiminta.trim() : undefined,
    username_akun: f.sistem !== 'Gmail' ? f.username.trim() : undefined,
    detail_akses: pakaiDetailAkses(f.sistem) ? f.detailAkses.trim() || undefined : undefined,
    keterangan: f.keterangan.trim(),
    alasan: f.alasan.trim(),
    metode_penyerahan_preferensi: f.metode,
  };
}

export const requestAkunService = {
  async opsi(): Promise<OpsiRequestAkun> {
    const response = await api.get('/layanan-it/request-akun/opsi');
    return adaptasiOpsiRequestAkun(response.data?.data);
  },

  /** Ajukan request; mengembalikan id dan nomor dokumen. Melempar galat 422 dari server. */
  async kirim(form: FormRequestAkun): Promise<{ id: number; nomorDokumen: string }> {
    const response = await api.post('/layanan-it/request-akun', buatPayloadRequestAkun(form));
    return { id: Number(response.data?.data?.id), nomorDokumen: response.data?.data?.nomor_dokumen ?? '' };
  },

  async saya(): Promise<RequestAkunRingkas[]> {
    const response = await api.get('/layanan-it/request-akun/saya');
    return ((response.data?.data ?? []) as unknown[]).map(adaptasiRequestAkun);
  },

  async detail(id: number): Promise<RequestAkunDetail> {
    const response = await api.get(`/layanan-it/request-akun/${id}`);
    return adaptasiDetailRequestAkun(response.data?.data);
  },

  async lacak(nomor: string): Promise<HasilLacakRequestAkun> {
    const response = await api.get('/layanan-it/request-akun/lacak', { params: { nomor: nomor.trim() } });
    return adaptasiLacakRequestAkun(response.data?.data);
  },
};

export default requestAkunService;

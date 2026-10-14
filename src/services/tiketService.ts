/**
 * Tiket Masalah — klien endpoint `/api/tiket/*` di api-simwt.
 *
 * Status tiket: PENDING → PROSES → OK (selesai).
 */
import api from './api';

export interface TiketRingkas {
  id: number;
  no_ticket: string;
  judul_masalah: string;
  status_pengajuan: 'PENDING' | 'PROSES' | 'OK';
  jenis: string | null;
  plant: string | null;
  tanggal_diajukan: string | null;
  tanggal_selesai: string | null;
}

export interface OpsiRef {
  id: number;
  nama: string;
}

export interface MasterBuatTiket {
  jenisTicket: OpsiRef[];
  daftarDepartemen: OpsiRef[];
}

export const tiketService = {
  /** Riwayat tiket milik pengguna login (terbaru dulu). */
  async tiketSaya(): Promise<TiketRingkas[]> {
    const response = await api.get('/tiket/saya');
    return response.data?.data ?? [];
  },

  /** Master data untuk form buat tiket. */
  async masterBuat(): Promise<MasterBuatTiket> {
    const response = await api.get('/tiket/buat');
    return {
      jenisTicket: response.data?.jenisTicket ?? [],
      daftarDepartemen: response.data?.daftarDepartemen ?? [],
    };
  },

  /**
   * Buat tiket baru. `id_plant` & `diajukan_oleh` diisi server dari akun
   * login bila tidak dikirim — tetap dikirim eksplisit agar validasinya lolos.
   */
  async buat(data: {
    judul_masalah: string;
    detail_masalah: string;
    id_ticket_jenis: number;
    id_departemen: number;
    id_plant: number;
    diajukan_oleh: string;
    foto_sebelum?: { uri: string; name: string; type: string } | null;
  }): Promise<TiketRingkas | null> {
    const formData = new FormData();
    formData.append('judul_masalah', data.judul_masalah);
    formData.append('detail_masalah', data.detail_masalah);
    formData.append('id_ticket_jenis', String(data.id_ticket_jenis));
    formData.append('id_departemen', String(data.id_departemen));
    formData.append('id_plant', String(data.id_plant));
    formData.append('diajukan_oleh', data.diajukan_oleh);
    if (data.foto_sebelum) formData.append('foto_sebelum', data.foto_sebelum as any);

    const response = await api.post('/tiket/simpan-tiket', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data?.tiket ?? null;
  },

  /** Detail satu tiket (berisi relasi progress untuk timeline). */
  async lihat(noTicket: string): Promise<any> {
    const response = await api.get(`/tiket/lihat/${noTicket}`);
    return response.data?.tiket ?? null;
  },
};

export default tiketService;

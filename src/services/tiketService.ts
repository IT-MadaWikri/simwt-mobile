/**
 * Tiket Masalah — klien endpoint `/api/tiket/*` di api-simwt.
 *
 * Status tiket: PENDING → PROSES → RESOLVED (menunggu konfirmasi pelapor) → OK (selesai);
 * cabang: NEED_APPROVAL, FATAL, CANCEL.
 */
import api from './api';
import { adaptasiDetailTiket, statusAman } from '../adapters/tiket';
import { AsetRingkas, DetailTiket, FormTiket, MasterBuatTiket, TiketRingkas } from '../types/tiket';

export type { TiketRingkas };

/** Susun multipart dari isian form; field kosong tidak dikirim. */
export function buatPayloadTiket(form: FormTiket): FormData {
  const data = new FormData();
  if (form.aset) data.append('asset_number', form.aset.asset_number);
  data.append('id_ticket_jenis', String(form.idJenis));
  data.append('id_sub_jenis', String(form.idKategori));
  data.append('id_departemen', String(form.idDepartemen));
  if (form.idSub) data.append('sub_departemen', String(form.idSub));
  if (form.idArea) data.append('id_departemen_area', String(form.idArea));
  data.append('detail_masalah', form.detail.trim());
  if (form.foto) data.append('foto_sebelum', form.foto as any);
  return data;
}

export const tiketService = {
  /** Riwayat tiket milik pengguna login (terbaru dulu, maks. 50). */
  async tiketSaya(): Promise<TiketRingkas[]> {
    const response = await api.get('/tiket/saya');
    // Status yang belum dikenal dirapikan agar peta warna/label tidak undefined.
    return ((response.data?.data ?? []) as TiketRingkas[]).map((t) => ({ ...t, status_pengajuan: statusAman(t.status_pengajuan) }));
  },

  /** Detail satu tiket beserta progress, sudah dirapikan untuk layar. */
  async lihat(noTicket: string): Promise<DetailTiket | null> {
    const response = await api.get(`/tiket/lihat/${noTicket}`);
    return response.data?.tiket ? adaptasiDetailTiket(response.data.tiket) : null;
  },

  /** Pelapor menyatakan masalah teratasi: tiket RESOLVED -> OK. */
  async konfirmasiPelapor(noTicket: string): Promise<void> {
    await api.post(`/tiket/${noTicket}/konfirmasi-pelapor`);
  },

  /** Pelapor menolak penyelesaian: tiket kembali PROSES; `alasan` wajib (min. 5 karakter). */
  async reopenPelapor(noTicket: string, alasan: string): Promise<void> {
    await api.post(`/tiket/${noTicket}/reopen-pelapor`, { alasan_reopen: alasan });
  },

  /** Master data form buat tiket: jenis + kategori, departemen + sub, area. */
  async masterBuat(): Promise<MasterBuatTiket> {
    const response = await api.get('/tiket/buat');
    const data = response.data?.data;
    return {
      jenis: data?.jenis ?? [],
      departemen: data?.departemen ?? [],
      area: data?.area ?? {},
    };
  },

  /** Cari aset (nama, alias, PIC, nomor); server membalas maksimal 10. */
  async cariAset(kata: string): Promise<AsetRingkas[]> {
    const response = await api.get('/tiket/aset', { params: { q: kata } });
    return response.data?.data ?? [];
  },

  /** Kirim tiket baru. Pengaju & plant diambil server dari akun login. */
  async buat(form: FormTiket): Promise<{ id: number; no_ticket: string }> {
    const response = await api.post('/tiket/simpan-tiket', buatPayloadTiket(form), {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.tiket;
  },
};

export default tiketService;

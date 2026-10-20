/**
 * Booking ruangan meeting — klien endpoint `/api/booking-ruangan/*` di api-simwt.
 * Aturan (tanpa approval, cek bentrok ruangan) sama dengan booking mandiri di web.
 */
import api from './api';
import { adaptasiBooking, adaptasiMaster, gabungWaktu } from '../adapters/bookingRuangan';
import { Booking, FormBooking, MasterBooking } from '../types/booking';

/** Isian form → badan permintaan; field yang tidak relevan untuk jenis rapatnya tidak dikirim. */
export function buatPayloadBooking(f: FormBooking) {
  return {
    jenis_rapat: f.jenis,
    id_plant: f.jenis === 'luar' ? undefined : f.idPlant,
    id_ruangan: f.jenis === 'offline' ? f.idRuangan : undefined,
    link_meeting: f.jenis === 'online' ? f.linkMeeting.trim() : undefined,
    lokasi: f.jenis === 'luar' ? f.lokasi.trim() : undefined,
    id_departemen: f.idDepartemen,
    nama_peminjam: f.namaPeminjam.trim(),
    nama_kegiatan: f.namaKegiatan.trim(),
    waktu_mulai: gabungWaktu(f.tanggal, f.mulai),
    waktu_selesai: gabungWaktu(f.tanggal, f.selesai),
    peserta: f.peserta.map((p) => p.trim()).filter(Boolean),
  };
}

export const bookingRuanganService = {
  async master(): Promise<MasterBooking> {
    const response = await api.get('/booking-ruangan/master');
    return adaptasiMaster(response.data?.data);
  },

  /** Tanggal → id ruangan yang punya booking, untuk satu bulan ('YYYY-MM'). */
  async penanda(bulan: string): Promise<Record<string, number[]>> {
    const response = await api.get('/booking-ruangan/bulan', { params: { bulan } });
    return response.data?.data ?? {};
  },

  /** Booking pada satu tanggal ('YYYY-MM-DD'), urut jam mulai. */
  async jadwal(tanggal: string): Promise<Booking[]> {
    const response = await api.get('/booking-ruangan/jadwal', { params: { tanggal } });
    return ((response.data?.data ?? []) as any[]).map(adaptasiBooking);
  },

  /** Buat booking baru; mengembalikan id-nya. Melempar galat 422 (mis. ruangan bentrok) dari server. */
  async buat(form: FormBooking): Promise<number> {
    const response = await api.post('/booking-ruangan', buatPayloadBooking(form));
    return response.data?.data?.id;
  },
};

export default bookingRuanganService;

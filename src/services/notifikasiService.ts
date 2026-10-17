/**
 * Notifikasi — data nyata dari `GET /notifications/latest`.
 *
 * Bentuk aslinya adalah notifikasi bawaan Laravel: kolom `data` berisi JSON
 * bebas yang isinya berbeda-beda per jenis pengirim. Service ini meratakannya
 * menjadi satu bentuk yang stabil supaya layar tidak perlu tahu variasi itu.
 */
import api from './api';

export interface Notifikasi {
  id: string;
  /** Jenis mentah dari server, mis. "Info-Rekrutmen". */
  tipe: string;
  judul: string;
  pesan: string;
  /** Tautan tujuan (URL web) — bisa null. */
  tautan: string | null;
  /** Id Kaizen terkait (notifikasi Kaizen baru); notifikasi lama tidak punya. */
  idKaizen: number | null;
  waktu: string | null;
  dibaca: boolean;
}

/** Ikon & warna diturunkan dari kata kunci pada `type`. */
export function rupaNotifikasi(tipe: string): { icon: string; warna: 'brand' | 'warning' | 'danger' } {
  const kunci = tipe.toLowerCase();
  if (kunci.includes('rekrut')) return { icon: 'account-tie-outline', warna: 'brand' };
  if (kunci.includes('tiket') || kunci.includes('ticket')) return { icon: 'ticket-outline', warna: 'warning' };
  if (kunci.includes('kaizen')) return { icon: 'lightbulb-on-outline', warna: 'brand' };
  if (kunci.includes('aset') || kunci.includes('asset')) return { icon: 'database-outline', warna: 'brand' };
  if (kunci.includes('audit')) return { icon: 'clipboard-check-outline', warna: 'brand' };
  if (kunci.includes('error') || kunci.includes('gagal')) return { icon: 'alert-circle-outline', warna: 'danger' };
  return { icon: 'bell-outline', warna: 'brand' };
}

export const notifikasiService = {
  async terbaru(): Promise<Notifikasi[]> {
    const response = await api.get('/notifications/latest');
    const mentah: any[] = response.data?.notifications ?? [];

    // `data` bebas bentuk: field bisa berisi objek/array/angka. Dipaksa jadi
    // teks supaya <Text> tidak crash ("Objects are not valid as a React child").
    const teks = (v: unknown): string | null =>
      v == null ? null : typeof v === 'string' ? v : typeof v === 'object' ? null : String(v);

    return mentah.map((item) => ({
      id: String(item.id),
      tipe: teks(item.type) ?? 'Info',
      // Judul/pesan bisa berada di beberapa nama field tergantung pengirimnya.
      judul: teks(item.data?.judul) ?? teks(item.data?.title) ?? 'Pemberitahuan',
      pesan: teks(item.data?.pesan) ?? teks(item.data?.message) ?? '',
      tautan: teks(item.data?.link) ?? teks(item.data?.tautan),
      idKaizen: Number(item.data?.id_kaizen) || null,
      waktu: item.created_at ?? null,
      dibaca: !!item.read_at,
    }));
  },

  /** Jumlah notifikasi yang belum dibaca (untuk badge lonceng). */
  async jumlahBelumDibaca(): Promise<number> {
    const response = await api.get('/notifications/latest');
    return Number(response.data?.unread_count) || 0;
  },

  async tandaiSemuaDibaca(): Promise<void> {
    await api.post('/notifications/read-all');
  },

  async tandaiDibaca(id: string): Promise<void> {
    await api.post(`/notifications/${id}/read`);
  },

  async hapus(id: string): Promise<void> {
    await api.delete(`/notifications/${id}`);
  },

  /** Hapus SEMUA notifikasi akun ini di server (bukan hanya yang tampil di daftar). */
  async hapusSemua(): Promise<void> {
    await api.delete('/notifications');
  },
};

export default notifikasiService;

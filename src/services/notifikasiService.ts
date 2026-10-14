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

    return mentah.map((item) => ({
      id: String(item.id),
      tipe: item.type ?? 'Info',
      // Judul/pesan bisa berada di beberapa nama field tergantung pengirimnya.
      judul: item.data?.judul ?? item.data?.title ?? 'Pemberitahuan',
      pesan: item.data?.pesan ?? item.data?.message ?? '',
      tautan: item.data?.link ?? item.data?.tautan ?? null,
      waktu: item.created_at ?? null,
      dibaca: !!item.read_at,
    }));
  },
};

export default notifikasiService;

/**
 * Draf Pencapaian Produksi — disimpan di perangkat (AsyncStorage), satu daftar per pengguna.
 * Satu draf = satu isian yang belum dikirim; id-nya dipakai form untuk menimpa draf yang sama saat
 * disimpan ulang. Dibuka dari daftar draf (`/services/produksi/draf`).
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FormProduksi } from '../types/produksi';

export interface DrafProduksi {
  id: string;
  /** ms epoch, terakhir disimpan. */
  diubah: number;
  /** Langkah form (indeks dari 0) saat disimpan. */
  langkah: number;
  /** Nomor aset dies dan mesin yang dibuka, untuk membuka kembali form-nya. */
  nomor: string;
  mesin: string | null;
  /** Judul draf yang diisi pengguna, beserta nama dan shift pembuat (tampil di daftar). */
  judul: string;
  pembuat: string;
  shiftPembuat: number | null;
  /** Salinan nama untuk tampilan daftar. */
  namaDies: string;
  namaMesin: string | null;
  form: FormProduksi;
}

const kunci = (nik?: string | null) => `produksi_draf_list_${nik ?? 'anon'}`;

export const buatIdDrafProduksi = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

async function baca(nik?: string | null): Promise<DrafProduksi[]> {
  try {
    const mentah = await AsyncStorage.getItem(kunci(nik));
    const d = mentah ? JSON.parse(mentah) : [];
    // Draf format lama (tanpa id) dibuang.
    return Array.isArray(d) ? d.filter((x) => x?.id) : [];
  } catch {
    return [];
  }
}

export const drafProduksi = {
  /** Terbaru di atas. */
  async daftar(nik?: string | null) {
    return (await baca(nik)).sort((a, b) => b.diubah - a.diubah);
  },

  async ambil(nik: string | null | undefined, id: string) {
    return (await baca(nik)).find((d) => d.id === id) ?? null;
  },

  /** Menimpa draf ber-id sama, atau menambah baru. Melempar error bila gagal tersimpan. */
  async simpan(nik: string | null | undefined, draf: DrafProduksi) {
    const lain = (await baca(nik)).filter((d) => d.id !== draf.id);
    await AsyncStorage.setItem(kunci(nik), JSON.stringify([draf, ...lain]));
  },

  async hapus(nik: string | null | undefined, id: string) {
    try {
      const sisa = (await baca(nik)).filter((d) => d.id !== id);
      await AsyncStorage.setItem(kunci(nik), JSON.stringify(sisa));
    } catch {
      // Gagal menghapus draf tidak boleh menghalangi alur utama.
    }
  },
};

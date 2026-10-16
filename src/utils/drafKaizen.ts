/**
 * Draf Kaizen — disimpan di perangkat (AsyncStorage), satu daftar per pengguna.
 * Satu draf = satu isian yang belum dikirim; id-nya dipakai buat.tsx untuk
 * menimpa draf yang sama saat disimpan ulang.
 *
 * ponytail: uri foto menunjuk ke berkas cache, bila sistem membersihkannya
 * fotonya hilang dan perlu diunggah ulang.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface DrafKaizen {
  id: string;
  /** ms epoch, terakhir disimpan. */
  diubah: number;
  langkah: 1 | 2;
  /** Salinan tema untuk tampilan daftar. */
  tema: string;
  /** Isi formulir apa adanya: { form, fotos, manfaat }. */
  data: { form: any; fotos: any[]; manfaat: any[] };
}

const kunci = (nik?: string | null) => `kaizen_draf_list_${nik ?? 'anon'}`;

export const buatIdDraf = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

async function baca(nik?: string | null): Promise<DrafKaizen[]> {
  try {
    const mentah = await AsyncStorage.getItem(kunci(nik));
    const d = mentah ? JSON.parse(mentah) : [];
    return Array.isArray(d) ? d : [];
  } catch {
    return [];
  }
}

export const drafKaizen = {
  /** Terbaru di atas. */
  async daftar(nik?: string | null) {
    return (await baca(nik)).sort((a, b) => b.diubah - a.diubah);
  },

  async ambil(nik: string | null | undefined, id: string) {
    return (await baca(nik)).find((d) => d.id === id) ?? null;
  },

  /** Menimpa draf ber-id sama, atau menambah baru. Melempar error bila gagal tersimpan. */
  async simpan(nik: string | null | undefined, draf: DrafKaizen) {
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

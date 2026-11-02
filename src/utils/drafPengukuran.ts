/**
 * Draf Pengukuran QC — disimpan di perangkat (AsyncStorage), satu daftar per pengguna.
 * Satu draf = satu isian yang belum dikirim. Draf yang tidak disentuh lebih dari
 * `BATAS_HARI_DRAF` hari dibuang saat daftar dibaca.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BATAS_HARI_DRAF } from '../../constants/Pengukuran';
import { DrafPengukuran } from '../types/pengukuran';

type Nik = string | null | undefined;
/** Isi draf yang diisi pemanggil; `id`, `createdAt`, `updatedAt` diurus di sini. */
export type DataDraf = Omit<DrafPengukuran, 'id' | 'createdAt' | 'updatedAt'>;

const HARI_MS = 1000 * 60 * 60 * 24;

const kunci = (nik: Nik) => `pengukuran_draf_list_${nik ?? 'anon'}`;

export const buatIdDraf = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

async function baca(nik: Nik): Promise<DrafPengukuran[]> {
  try {
    const mentah = await AsyncStorage.getItem(kunci(nik));
    const d = mentah ? JSON.parse(mentah) : [];
    return Array.isArray(d) ? d : [];
  } catch {
    return [];
  }
}

const tulis = (nik: Nik, daftar: DrafPengukuran[]) => AsyncStorage.setItem(kunci(nik), JSON.stringify(daftar));

export const drafPengukuran = {
  /** Terbaru di atas; draf kedaluwarsa dibuang sekalian dari penyimpanan. */
  async daftar(nik: Nik): Promise<DrafPengukuran[]> {
    const semua = await baca(nik);
    const sekarang = Date.now();
    const segar = semua.filter((d) => (sekarang - new Date(d.updatedAt).getTime()) / HARI_MS < BATAS_HARI_DRAF);

    if (segar.length !== semua.length) {
      try {
        await tulis(nik, segar);
      } catch {
        // Gagal membersihkan tidak menghalangi daftar tampil.
      }
    }

    return segar.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  },

  async ambil(nik: Nik, id: string): Promise<DrafPengukuran | null> {
    return (await drafPengukuran.daftar(nik)).find((d) => d.id === id) ?? null;
  },

  /** Draf baru. Melempar error bila gagal tersimpan. */
  async simpan(nik: Nik, data: DataDraf): Promise<DrafPengukuran> {
    const sekarang = new Date().toISOString();
    const baru: DrafPengukuran = { ...data, id: buatIdDraf(), createdAt: sekarang, updatedAt: sekarang };
    await tulis(nik, [...(await baca(nik)), baru]);
    return baru;
  },

  /** Menimpa isi draf ber-id itu; null bila drafnya sudah tidak ada. Melempar error bila gagal tersimpan. */
  async perbarui(nik: Nik, id: string, data: DataDraf): Promise<DrafPengukuran | null> {
    const semua = await baca(nik);
    const lama = semua.find((d) => d.id === id);
    if (!lama) return null;

    const baru: DrafPengukuran = { ...lama, ...data, updatedAt: new Date().toISOString() };
    await tulis(
      nik,
      semua.map((d) => (d.id === id ? baru : d))
    );
    return baru;
  },

  async hapus(nik: Nik, id: string): Promise<void> {
    try {
      await tulis(
        nik,
        (await baca(nik)).filter((d) => d.id !== id)
      );
    } catch {
      // Gagal menghapus draf tidak boleh menghalangi alur utama.
    }
  },
};

/**
 * Sesi perangkat — daftar token login milik pengguna dan pencabutannya.
 *
 *   GET    /sesi        → {data: [{id, perangkat|null, login_pada, terakhir_dipakai, saat_ini}]}
 *   DELETE /sesi/{id}   → keluarkan satu perangkat lain
 *   DELETE /sesi        → keluarkan semua perangkat lain
 */
import { Platform } from 'react-native';
import api from './api';

export interface SesiPerangkat {
  id: number;
  /** Label dari saat login (mis. "Android 14"); null untuk sesi lama/aplikasi lain. */
  perangkat: string | null;
  loginPada: string | null;
  terakhirDipakai: string | null;
  saatIni: boolean;
}

/**
 * Label perangkat yang dikirim saat login. ponytail: hanya OS + versi (tanpa
 * `expo-device` agar tak perlu rebuild native); tambah model HP bila perlu.
 */
export function labelPerangkat(): string {
  const os = Platform.OS === 'ios' ? 'iOS' : Platform.OS === 'android' ? 'Android' : 'Web';
  return Platform.OS === 'web' ? os : `${os} ${Platform.Version}`;
}

export const sesiService = {
  async daftar(): Promise<SesiPerangkat[]> {
    const response = await api.get('/sesi');
    const mentah: any[] = response.data?.data ?? [];
    return mentah.map((s) => ({
      id: Number(s.id),
      perangkat: s.perangkat ?? null,
      loginPada: s.login_pada ?? null,
      terakhirDipakai: s.terakhir_dipakai ?? null,
      saatIni: !!s.saat_ini,
    }));
  },

  async cabut(id: number): Promise<void> {
    await api.delete(`/sesi/${id}`);
  },

  async cabutLain(): Promise<void> {
    await api.delete('/sesi');
  },
};

export default sesiService;

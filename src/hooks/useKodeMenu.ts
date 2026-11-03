/**
 * Kode menu yang boleh dilihat pengguna (izin diputuskan server, sama dengan navbar web).
 * Ikut cache persisten: daftar terakhir tampil dulu saat app dibuka, lalu disegarkan di latar.
 * `undefined` selama belum pernah berhasil dimuat.
 */
import { useQuery } from '@tanstack/react-query';
import { menuService } from '../services/menuService';

export function useKodeMenu() {
  const { data } = useQuery<string[]>({ queryKey: ['menu', 'kode'], queryFn: () => menuService.getKodeTampil() });
  return data;
}

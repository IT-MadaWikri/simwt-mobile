/**
 * Cache data server yang tetap ada setelah aplikasi ditutup (TanStack Query +
 * AsyncStorage). Layar yang memakai `useQuery` langsung menampilkan data
 * terakhir saat dibuka lagi, lalu menyegarkannya di latar.
 *
 * Cache dihapus saat logout / 401 (`storage.clearAll`) supaya data satu akun
 * tidak terlihat oleh akun berikutnya di perangkat yang sama.
 */
import { QueryClient } from '@tanstack/react-query';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const UMUR_CACHE_MS = 1000 * 60 * 60 * 24;

const KUNCI_CACHE = 'simwt_query_cache';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // gcTime harus >= umur cache persisten, kalau tidak entri dibuang sebelum sempat dipulihkan.
      gcTime: UMUR_CACHE_MS,
      staleTime: 1000 * 60 * 5,
      // Jangan retry 3x bawaan: saat jaringan lag, spinner pull-to-refresh menggantung ~40 detik.
      retry: 1,
      retryDelay: 1500,
    },
  },
});

export const persister = createAsyncStoragePersister({
  storage: AsyncStorage,
  key: KUNCI_CACHE,
});

/** Kosongkan cache memori dan salinan di AsyncStorage. */
export async function hapusCache(): Promise<void> {
  try {
    await queryClient.cancelQueries();
    queryClient.clear();
    await AsyncStorage.removeItem(KUNCI_CACHE);
  } catch {
    // best-effort: jangan sampai logout gagal karena cache
  }
}

/**
 * Saluran kecil antara lapisan API dan UI untuk masalah jaringan.
 *
 * `services/api.ts` hanya MELAPORKAN (timeout / tidak ada koneksi); `useAlertJaringan`
 * (dipasang sekali di akar aplikasi) yang memutuskan menampilkannya. Dengan begitu api.ts
 * tidak perlu mengimpor komponen UI — pola yang sama dengan `picuSesiBerakhir` di mobile-ird.
 */
export type JenisMasalahJaringan = 'timeout' | 'offline';

type Pendengar = (jenis: JenisMasalahJaringan) => void;

let pendengar: Pendengar | null = null;

/** Daftarkan satu pendengar; mengembalikan fungsi untuk melepasnya. */
export function daftarkanPendengarJaringan(fn: Pendengar): () => void {
  pendengar = fn;
  return () => {
    if (pendengar === fn) pendengar = null;
  };
}

export function laporkanMasalahJaringan(jenis: JenisMasalahJaringan): void {
  pendengar?.(jenis);
}

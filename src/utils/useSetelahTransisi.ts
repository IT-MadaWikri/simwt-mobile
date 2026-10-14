/**
 * Menunda pekerjaan berat sampai animasi perpindahan halaman selesai.
 *
 * ── Kenapa ini perlu ─────────────────────────────────────────────────────
 * Layar yang memuat data di `useEffect`/`useFocusEffect` mulai bekerja pada
 * frame yang SAMA dengan animasi masuknya. Permintaan jaringan, `JSON.parse`
 * riwayat, dan render awal daftar semuanya berebut thread JS dengan transisi
 * — hasilnya perpindahan terasa tersendat.
 *
 * ── Kenapa ada jaring pengaman ───────────────────────────────────────────
 * `InteractionManager.runAfterInteractions` menunggu SELURUH interaksi yang
 * terdaftar selesai. Kalau ada satu saja pegangan interaksi yang tidak pernah
 * dilepas — animasi berulang tanpa akhir, gestur yang tidak tuntas, atau
 * perilaku react-native-web yang berbeda dari native — callback-nya TIDAK
 * PERNAH dipanggil. Akibatnya layar berhenti di keadaan "memuat" selamanya:
 * spinner berputar tapi datanya tidak pernah diminta.
 *
 * Karena itu pekerjaannya juga dijadwalkan lewat timer sebagai cadangan, dan
 * yang menang duluan dipakai. Menunda demi kelancaran itu bagus; menggantung
 * selamanya tidak pernah sepadan.
 */
import { useEffect } from 'react';
import { InteractionManager } from 'react-native';

/** Batas tunggu sebelum pekerjaan dipaksa jalan (ms). */
const BATAS_TUNGGU = 350;

/**
 * Jalankan `kerja` setelah transisi selesai — atau setelah `BATAS_TUNGGU`,
 * mana yang lebih dulu. Mengembalikan fungsi pembatalan.
 */
export function jalankanSetelahTransisi(kerja: () => void): () => void {
  let sudahJalan = false;

  const jalankanSekali = () => {
    if (sudahJalan) return;
    sudahJalan = true;
    kerja();
  };

  const tugas = InteractionManager.runAfterInteractions(jalankanSekali);
  const cadangan = setTimeout(jalankanSekali, BATAS_TUNGGU);

  return () => {
    // Tandai sudah jalan supaya callback yang telat tidak menyentuh state
    // milik layar yang sudah dilepas.
    sudahJalan = true;
    tugas.cancel();
    clearTimeout(cadangan);
  };
}

/** Versi hook untuk pekerjaan sekali saat layar dipasang. */
export function useSetelahTransisi(kerja: () => void, deps: unknown[] = []) {
  useEffect(() => {
    return jalankanSetelahTransisi(kerja);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

export default useSetelahTransisi;

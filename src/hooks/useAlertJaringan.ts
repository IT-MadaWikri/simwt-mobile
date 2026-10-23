/**
 * Alert global saat request timeout / jaringan bermasalah. Dipasang SEKALI di akar aplikasi
 * (`app/_layout.tsx`); `services/api.ts` yang melaporkan kejadiannya.
 *
 * Aturan supaya tidak mengganggu:
 *  - satu alert per `JEDA_MS` — banyak request yang gagal bersamaan hanya memunculkan satu dialog;
 *  - tidak muncul bila dialog lain sedang terbuka: slot `AppDialog` hanya satu, dialog baru
 *    akan MENIMPA yang lama (mis. konfirmasi "Setujui?") dan menggantung Promise-nya.
 */
import { useEffect } from 'react';
import { dialog, adaDialogTerbuka } from '../components/common/AppDialog';
import { daftarkanPendengarJaringan, JenisMasalahJaringan } from '../utils/masalahJaringan';

const JEDA_MS = 20000;

const PESAN: Record<JenisMasalahJaringan, { judul: string; isi: string }> = {
  timeout: {
    judul: 'Koneksi Lambat',
    isi: 'Server terlalu lama merespons.',
  },
  offline: {
    judul: 'Jaringan Bermasalah',
    isi: 'Tidak dapat terhubung ke server.',
  },
};

export function useAlertJaringan() {
  useEffect(() => {
    let terakhir = 0;
    return daftarkanPendengarJaringan((jenis) => {
      const sekarang = Date.now();
      if (sekarang - terakhir < JEDA_MS || adaDialogTerbuka()) return;
      terakhir = sekarang;
      dialog.alert(PESAN[jenis].judul, PESAN[jenis].isi, 'danger');
    });
  }, []);
}

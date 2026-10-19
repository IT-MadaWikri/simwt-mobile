/**
 * Aksi pelapor pada tiket RESOLVED: konfirmasi selesai atau reopen. Keduanya mengembalikan
 * true bila berhasil (pemanggil menyegarkan detail), false bila gagal (`galat` terisi).
 */
import { useState } from 'react';
import { tiketService } from '../services/tiketService';

export function useKonfirmasiTiket(noTicket: string) {
  const [mengirim, setMengirim] = useState(false);
  const [galat, setGalat] = useState<string | null>(null);

  const jalankan = async (aksi: () => Promise<void>): Promise<boolean> => {
    setMengirim(true);
    setGalat(null);
    try {
      await aksi();
      return true;
    } catch (e: any) {
      const galatApi = e?.response?.data?.errors;
      setGalat(
        (galatApi && (Object.values(galatApi)[0] as string[])?.[0]) ||
          e?.response?.data?.message ||
          e?.message ||
          'Permintaan belum bisa diproses. Coba lagi.'
      );
      return false;
    } finally {
      setMengirim(false);
    }
  };

  return {
    mengirim,
    galat,
    hapusGalat: () => setGalat(null),
    konfirmasi: () => jalankan(() => tiketService.konfirmasiPelapor(noTicket)),
    reopen: (alasan: string) => jalankan(() => tiketService.reopenPelapor(noTicket, alasan.trim())),
  };
}

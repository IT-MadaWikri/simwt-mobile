/**
 * useLupaPassword — kirim tautan reset password (alur sama dengan web).
 * Mengekspos `mengirim`, `error`, dan `pesan` (jawaban server setelah terkirim).
 */
import { useState } from 'react';
import { authService } from '../services/authService';

export function useLupaPassword() {
  const [mengirim, setMengirim] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pesan, setPesan] = useState<string | null>(null);

  const kirim = async (identitas: string) => {
    const bersih = identitas.trim();
    if (!bersih) {
      setError('Username atau NIK wajib diisi.');
      return;
    }

    setMengirim(true);
    setError(null);
    try {
      setPesan(await authService.kirimLinkReset(bersih));
    } catch (err: any) {
      setPesan(null);
      setError(
        err?.response?.data?.errors?.identitas?.[0] ||
          err?.message ||
          'Tautan belum bisa dikirim. Coba lagi sebentar lagi.'
      );
    } finally {
      setMengirim(false);
    }
  };

  return { mengirim, error, pesan, kirim };
}

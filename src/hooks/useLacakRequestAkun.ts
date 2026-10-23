/** Lacak Request Akun lewat nomor dokumen (ringkasan publik; `milikSaya` = boleh membuka detail lengkap). */
import { useState } from 'react';
import { requestAkunService } from '../services/requestAkunService';
import { HasilLacakRequestAkun } from '../types/layananIt';

export function useLacakRequestAkun() {
  const [nomor, setNomor] = useState('');
  const [hasil, setHasil] = useState<HasilLacakRequestAkun | null>(null);
  const [mencari, setMencari] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const lacak = async () => {
    if (!nomor.trim()) {
      setError('Masukkan nomor dokumen.');
      return;
    }
    setMencari(true);
    setError(null);
    setHasil(null);
    try {
      setHasil(await requestAkunService.lacak(nomor));
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || 'Request tidak bisa dilacak. Coba lagi.');
    } finally {
      setMencari(false);
    }
  };

  return { nomor, setNomor, hasil, mencari, error, lacak };
}

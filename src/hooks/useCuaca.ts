import { useEffect, useState } from 'react';
import { cuacaService, type CuacaLokasi } from '../services/cuacaService';

/** Cuaca saat ini; `cuaca` null selama memuat atau bila gagal (widget bersifat opsional). */
export function useCuaca(): { cuaca: CuacaLokasi | null; loading: boolean } {
  const [cuaca, setCuaca] = useState<CuacaLokasi | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let batal = false;
    cuacaService
      .saatIni()
      .then((c) => !batal && setCuaca(c))
      .catch(() => {}) // best-effort: tanpa cuaca, beranda tetap utuh
      .finally(() => !batal && setLoading(false));
    return () => {
      batal = true;
    };
  }, []);

  return { cuaca, loading };
}

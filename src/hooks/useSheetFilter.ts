/**
 * Sheet Filter yang menutup setelah daftar selesai dimuat; tombol yang ditekan (`memuatFilter`)
 * menampilkan spinner selama itu. `sedangMemuat` = daftar sedang mengambil data.
 */
import { useCallback, useEffect, useState } from 'react';

export type ModeFilter = 'terapkan' | 'reset';

export function useSheetFilter(sedangMemuat: boolean) {
  const [filterTerbuka, setFilterTerbuka] = useState(false);
  const [memuatFilter, setMemuatFilter] = useState<null | ModeFilter>(null);

  const bukaFilter = useCallback(() => setFilterTerbuka(true), []);
  const tutupFilter = useCallback(() => setFilterTerbuka(false), []);

  /** Filter sudah berubah dan daftar akan dimuat: tunggu selesai (atau langsung dari cache) baru menutup. */
  const tungguMuat = useCallback((mode: ModeFilter) => setMemuatFilter(mode), []);

  useEffect(() => {
    if (memuatFilter && !sedangMemuat) {
      setMemuatFilter(null);
      setFilterTerbuka(false);
    }
  }, [memuatFilter, sedangMemuat]);

  return { filterTerbuka, memuatFilter, bukaFilter, tutupFilter, tungguMuat };
}

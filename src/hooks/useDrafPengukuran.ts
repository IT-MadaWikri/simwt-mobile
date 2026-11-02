/**
 * Daftar draf Pengukuran QC milik akun yang login (tersimpan di perangkat): muat, cari, hapus.
 * `muat` dipanggil pemanggil saat layar fokus supaya daftar selalu segar.
 */
import { useCallback, useMemo, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { drafPengukuran } from '../utils/drafPengukuran';
import { DrafPengukuran } from '../types/pengukuran';

export function useDrafPengukuran() {
  const { user } = useAuth();
  const nik = user?.nik;
  const [draf, setDraf] = useState<DrafPengukuran[] | null>(null);
  const [search, setSearch] = useState('');

  const muat = useCallback(() => {
    drafPengukuran.daftar(nik).then(setDraf);
  }, [nik]);

  const hapus = useCallback(
    async (id: string) => {
      await drafPengukuran.hapus(nik, id);
      muat();
    },
    [nik, muat]
  );

  const tampil = useMemo(() => {
    const kata = search.trim().toLowerCase();
    if (!kata) return draf ?? [];
    return (draf ?? []).filter((d) =>
      [d.draftName, d.draftDescription, d.partCode, d.partName, d.customer].some((t) => (t || '').toLowerCase().includes(kata))
    );
  }, [draf, search]);

  return { draf: tampil, jumlah: draf?.length ?? 0, memuat: draf === null, search, setSearch, muat, hapus };
}

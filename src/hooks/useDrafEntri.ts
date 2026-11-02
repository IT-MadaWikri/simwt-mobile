/**
 * Alur simpan/perbarui draf pada layar input pengukuran. Draf yang dibuka dari daftar draf diperbarui
 * (bukan digandakan); draf baru dibuat saat pertama kali disimpan. Nama ditanyakan lewat dialog.
 */
import { useCallback, useRef, useState } from 'react';
import { dialog } from '../components/common/AppDialog';
import { DataDraf, drafPengukuran } from '../utils/drafPengukuran';
import { DrafPengukuran } from '../types/pengukuran';

type IsiDraf = Omit<DataDraf, 'draftName' | 'draftDescription'>;

export function useDrafEntri({
  nik,
  namaDefault,
  kumpulkan,
}: {
  nik?: string | null;
  /** Nama yang dipakai bila kolom nama dikosongkan. */
  namaDefault: string;
  /** Isi draf dari state form saat ini; null bila datanya belum siap. */
  kumpulkan: () => IsiDraf | null;
}) {
  const [idAktif, setIdAktif] = useState('');
  const [menyimpan, setMenyimpan] = useState(false);
  // Nama & keterangan draf yang dibuka tidak ada di state form, jadi disimpan di sini untuk pembaruan berikutnya.
  const meta = useRef({ nama: '', keterangan: '' });

  const hidrasi = useCallback((draf: DrafPengukuran) => {
    setIdAktif(draf.id);
    meta.current = { nama: draf.draftName, keterangan: draf.draftDescription };
  }, []);

  /** Simpan atau perbarui draf; menghasilkan true bila tersimpan. */
  const simpan = useCallback(async (): Promise<boolean> => {
    if (menyimpan) return false;
    const isi = kumpulkan();
    if (!isi) return false;

    const masukan = await dialog.prompt({
      title: idAktif ? 'Perbarui draf' : 'Simpan draf',
      message: 'Beri nama agar draf mudah ditemukan.',
      confirmText: 'Simpan',
      isian: { placeholder: meta.current.nama || namaDefault, wajib: false, maxLength: 80 },
    });
    if (masukan === null) return false;

    setMenyimpan(true);
    try {
      const data: DataDraf = {
        ...isi,
        draftName: masukan.trim() || meta.current.nama || namaDefault,
        draftDescription: meta.current.keterangan,
      };
      const tersimpan = idAktif
        ? ((await drafPengukuran.perbarui(nik, idAktif, data)) ?? (await drafPengukuran.simpan(nik, data)))
        : await drafPengukuran.simpan(nik, data);
      hidrasi(tersimpan);
      await dialog.alert('Draf tersimpan', `"${tersimpan.draftName}" bisa dilanjutkan dari daftar draf.`, 'success');
      return true;
    } catch (e) {
      await dialog.alert('Draf gagal disimpan', e instanceof Error ? e.message : 'Coba lagi.', 'danger');
      return false;
    } finally {
      setMenyimpan(false);
    }
  }, [menyimpan, kumpulkan, idAktif, namaDefault, nik, hidrasi]);

  /** Hapus draf aktif setelah pengukurannya terkirim. */
  const hapusAktif = useCallback(async () => {
    if (idAktif) await drafPengukuran.hapus(nik, idAktif);
  }, [idAktif, nik]);

  return { idAktif, menyimpan, hidrasi, simpan, hapusAktif };
}

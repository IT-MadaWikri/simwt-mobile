/**
 * Daftar karyawan yang berulang tahun hari ini + aksi "Beri Selamat".
 *
 * Server menandai tiap baris dengan `diri` (milik pengguna ini) dan
 * `sudah_diucapkan` (ucapan hari ini sudah terkirim), jadi tombol tetap benar
 * setelah aplikasi dibuka ulang. Galat pengiriman ditampilkan lewat AppDialog.
 */
import { useCallback, useEffect, useState } from 'react';
import { dialog } from '../components/common/AppDialog';
import { Employee, karyawanService } from '../services/karyawanService';

export function useUlangTahunHariIni() {
  const [daftar, setDaftar] = useState<Employee[]>([]);
  const [idMengirim, setIdMengirim] = useState<number | null>(null);
  // Id yang sukses diucapkan pada sesi ini (menimpa data server yang dimuat lebih dulu).
  const [idTerkirim, setIdTerkirim] = useState<number[]>([]);

  useEffect(() => {
    karyawanService.getBirthdaysToday().then(setDaftar);
  }, []);

  const beriSelamat = useCallback(
    async (id: number) => {
      if (idMengirim !== null) return;
      setIdMengirim(id);
      try {
        await karyawanService.beriUcapanUlangTahun(id);
        setIdTerkirim((lama) => [...lama, id]);
      } catch (e: any) {
        dialog.alert(
          'Ucapan gagal dikirim',
          e?.response?.data?.message || e?.message || 'Terjadi kesalahan. Coba lagi nanti.',
          'danger'
        );
      } finally {
        setIdMengirim(null);
      }
    },
    [idMengirim]
  );

  const sudahDiucapkan = useCallback(
    (item: Employee) => !!item.sudah_diucapkan || idTerkirim.includes(item.id),
    [idTerkirim]
  );

  return { daftar, idMengirim, sudahDiucapkan, beriSelamat };
}

export default useUlangTahunHariIni;

/**
 * Lacak request Layanan IT lewat nomor dokumen — mencoba Request Pembuatan Sistem dulu (urutan sama dengan
 * portal web), lalu Request Akun. Hasil dinormalkan ke satu bentuk (`HasilLacak`) agar layar tak perlu
 * membedakan jenisnya; `milikSaya` = boleh membuka detail lengkap.
 */
import { useState } from 'react';
import { requestAkunService } from '../services/requestAkunService';
import { requestSistemService } from '../services/requestSistemService';

export interface HasilLacak {
  jenis: 'akun' | 'sistem';
  id: number;
  nomorDokumen: string;
  /** Jenis permintaan (akun) atau nama aplikasi (sistem). */
  judul: string;
  /** Sistem terdampak (akun); kosong untuk sistem. */
  sistem: string | null;
  status: string;
  statusLabel: string;
  namaUser: string;
  nikTersamar: string;
  departemen: string | null;
  plant: string | null;
  diajukanAt: string | null;
  catatanPenolakan: string | null;
  /** Cara akun diserahkan Tim IT, bila request akun sudah selesai. */
  metodePenyerahan: string | null;
  selesaiAt: string | null;
  milikSaya: boolean;
}

export function useLacakRequest() {
  const [nomor, setNomor] = useState('');
  const [hasil, setHasil] = useState<HasilLacak | null>(null);
  const [mencari, setMencari] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cari = async (kata: string): Promise<HasilLacak> => {
    try {
      const s = await requestSistemService.lacak(kata);
      return {
        jenis: 'sistem', id: s.id, nomorDokumen: s.nomorDokumen, judul: s.namaAplikasi, sistem: null, status: s.status, statusLabel: s.statusLabel,
        namaUser: s.namaUser, nikTersamar: s.nikTersamar, departemen: s.departemen, plant: s.plant, diajukanAt: s.diajukanAt,
        catatanPenolakan: s.catatanPenolakan, metodePenyerahan: null, selesaiAt: null, milikSaya: s.milikSaya,
      };
    } catch (e: any) {
      if (e?.response?.status !== 404) throw e;
    }
    const a = await requestAkunService.lacak(kata);
    return {
      jenis: 'akun', id: a.id, nomorDokumen: a.nomorDokumen, judul: a.jenisPermintaan, sistem: a.sistem, status: a.status, statusLabel: a.statusLabel,
      namaUser: a.namaUser, nikTersamar: a.nikTersamar, departemen: a.departemen, plant: a.plant, diajukanAt: a.diajukanAt,
      catatanPenolakan: a.catatanPenolakan, metodePenyerahan: a.metodePenyerahan, selesaiAt: a.selesaiAt, milikSaya: a.milikSaya,
    };
  };

  const lacak = async () => {
    if (!nomor.trim()) {
      setError('Masukkan nomor dokumen.');
      return;
    }
    setMencari(true);
    setError(null);
    setHasil(null);
    try {
      setHasil(await cari(nomor));
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || 'Request tidak bisa dilacak. Coba lagi.');
    } finally {
      setMencari(false);
    }
  };

  return { nomor, setNomor, hasil, mencari, error, lacak };
}

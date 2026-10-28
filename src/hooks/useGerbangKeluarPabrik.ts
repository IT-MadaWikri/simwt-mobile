/**
 * Pemindai gerbang Form Keluar Pabrik: `muat` mengambil pratinjau pass dari token QR, `catat` mencatat keluar/kembali
 * (sesuai tahap pass) lalu menyimpan pass terbaru dan `hasil`. Respons yang basi (pindai ulang) diabaikan.
 */
import { useCallback, useRef, useState } from 'react';
import { keluarPabrikService } from '../services/keluarPabrikService';
import { GerbangKeluarPabrik, HasilGerbang } from '../types/layananHrd';

export function useGerbangKeluarPabrik() {
  const [pass, setPass] = useState<GerbangKeluarPabrik | null>(null);
  const [hasil, setHasil] = useState<HasilGerbang | null>(null);
  const [memuat, setMemuat] = useState(true);
  const [mencatat, setMencatat] = useState(false);
  const [error, setError] = useState('');
  const token = useRef('');
  const permintaan = useRef(0);

  const muat = useCallback(async (nilai: string) => {
    const id = ++permintaan.current;
    token.current = nilai;
    setMemuat(true);
    setError('');
    setPass(null);
    setHasil(null);
    try {
      const data = await keluarPabrikService.gerbang(nilai);
      if (id === permintaan.current) setPass(data);
    } catch (e: any) {
      if (id === permintaan.current) {
        setError(e?.response?.status === 404 ? 'QR Pass tidak dikenali.' : e?.response?.data?.message || e?.message || 'Pass tidak bisa dimuat.');
      }
    } finally {
      if (id === permintaan.current) setMemuat(false);
    }
  }, []);

  const catat = useCallback(async () => {
    const id = permintaan.current;
    setMencatat(true);
    setError('');
    try {
      const r = await keluarPabrikService.catatGerbang(token.current);
      if (id === permintaan.current) {
        setPass(r.pass);
        setHasil(r.hasil);
      }
    } catch (e: any) {
      if (id === permintaan.current) setError(e?.response?.data?.message || e?.message || 'Gagal mencatat. Coba lagi.');
    } finally {
      if (id === permintaan.current) setMencatat(false);
    }
  }, []);

  return { pass, hasil, memuat, mencatat, error, muat, catat };
}

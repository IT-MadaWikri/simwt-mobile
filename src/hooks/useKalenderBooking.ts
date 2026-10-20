/**
 * Kalender booking ruangan: bulan yang tampil, tanggal terpilih, titik penanda
 * sebulan, dan daftar booking pada tanggal terpilih.
 *
 * Respons lama (tanggal/bulan sudah berganti) dibuang lewat penghitung
 * permintaan. `menyegarkan` terpisah dari `memuat` dan dijamin padam lewat batas
 * waktu. Tiap layar ini kembali fokus (mis. setelah membuat booking) datanya
 * dimuat ulang tanpa skeleton.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { bookingRuanganService } from '../services/bookingRuanganService';
import { kunciBulan, penandaKalender } from '../adapters/bookingRuangan';
import { geserBulan, kunciTanggal } from '../utils/kalender';
import { Booking } from '../types/booking';

const BATAS_SEGARKAN = 15000;

export function useKalenderBooking() {
  const [terpilih, setTerpilih] = useState(() => new Date());
  const [tampil, setTampil] = useState(() => ({ tahun: new Date().getFullYear(), bulan: new Date().getMonth() }));
  const [penanda, setPenanda] = useState<Record<string, string[]>>({});
  const [booking, setBooking] = useState<Booking[]>([]);
  const [memuat, setMemuat] = useState(true);
  const [menyegarkan, setMenyegarkan] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const permintaanJadwal = useRef(0);
  const permintaanPenanda = useRef(0);

  const kunciPilih = kunciTanggal(terpilih);
  const kunciTampil = kunciBulan(tampil.tahun, tampil.bulan);

  const muatJadwal = useCallback(async () => {
    const id = ++permintaanJadwal.current;
    try {
      const hasil = await bookingRuanganService.jadwal(kunciPilih);
      if (id !== permintaanJadwal.current) return;
      setBooking(hasil);
      setError(null);
    } catch (e: any) {
      if (id !== permintaanJadwal.current) return;
      setBooking([]);
      setError(e?.message || 'Gagal memuat jadwal booking.');
    } finally {
      if (id === permintaanJadwal.current) setMemuat(false);
    }
  }, [kunciPilih]);

  const muatPenanda = useCallback(async () => {
    const id = ++permintaanPenanda.current;
    try {
      const hasil = await bookingRuanganService.penanda(kunciTampil);
      if (id === permintaanPenanda.current) setPenanda(penandaKalender(hasil));
    } catch {
      // Titik penanda hanya pelengkap; jadwal harian sudah menampilkan galatnya sendiri.
    }
  }, [kunciTampil]);

  useEffect(() => {
    setMemuat(true);
    muatJadwal();
  }, [muatJadwal]);

  useEffect(() => {
    muatPenanda();
  }, [muatPenanda]);

  const sudahFokus = useRef(false);
  useFocusEffect(
    useCallback(() => {
      if (sudahFokus.current) {
        muatJadwal();
        muatPenanda();
      }
      sudahFokus.current = true;
    }, [muatJadwal, muatPenanda])
  );

  const segarkan = useCallback(() => {
    setMenyegarkan(true);
    const batas = setTimeout(() => setMenyegarkan(false), BATAS_SEGARKAN);
    Promise.all([muatJadwal(), muatPenanda()]).finally(() => {
      clearTimeout(batas);
      setMenyegarkan(false);
    });
  }, [muatJadwal, muatPenanda]);

  // Memilih tanggal di bulan lain (mis. lewat geser pekan) membawa bulan yang tampil ikut pindah.
  const pilih = useCallback((d: Date) => {
    setTerpilih(d);
    setTampil({ tahun: d.getFullYear(), bulan: d.getMonth() });
  }, []);

  const geser = useCallback((delta: number) => setTampil((t) => geserBulan(t.tahun, t.bulan, delta)), []);

  return { terpilih, pilih, tampil, geser, penanda, booking, memuat, menyegarkan, error, segarkan, cobaLagi: muatJadwal };
}

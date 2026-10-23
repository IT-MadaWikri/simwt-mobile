/**
 * Form Booking Ruangan: memuat master (plant, ruangan, departemen), menyimpan
 * isian, menurunkan pilihan ruangan dari plant, memvalidasi seperti server
 * (`galat` per field), dan mengirim. Galat 422 server (mis. ruangan bentrok)
 * dipetakan ke `galatServer` agar pesannya sama dengan web.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { bookingRuanganService } from '../services/bookingRuanganService';
import { FORM_BOOKING_KOSONG, galatBooking } from '../adapters/bookingRuangan';
import { FormBooking, MasterBooking } from '../types/booking';

interface Opsi {
  id: number;
  label: string;
}

/** `tanggalAwal`: 'YYYY-MM-DD' yang terisi sejak form dibuka (tanggal terpilih di kalender). */
export function useBuatBooking(tanggalAwal: string) {
  const [master, setMaster] = useState<MasterBooking | null>(null);
  const [memuat, setMemuat] = useState(true);
  const [errorMuat, setErrorMuat] = useState<string | null>(null);
  const [form, setForm] = useState<FormBooking>(() => FORM_BOOKING_KOSONG(tanggalAwal));
  const [mengirim, setMengirim] = useState(false);
  const [galatServer, setGalatServer] = useState<string | null>(null);
  const sudahIsiAwal = useRef(false);

  const muatMaster = useCallback(async () => {
    setMemuat(true);
    setErrorMuat(null);
    try {
      const m = await bookingRuanganService.master();
      setMaster(m);
      // Nilai awal dari akun, sekali saja — jangan menimpa ketikan saat master dimuat ulang.
      if (!sudahIsiAwal.current) {
        sudahIsiAwal.current = true;
        setForm((f) => ({ ...f, idPlant: m.awal.idPlant, namaPeminjam: m.awal.namaPeminjam }));
      }
    } catch (e: any) {
      setErrorMuat(e?.message || 'Data formulir tidak bisa diambil dari server.');
    } finally {
      setMemuat(false);
    }
  }, []);

  useEffect(() => {
    muatMaster();
  }, [muatMaster]);

  const opsiPlant: Opsi[] = useMemo(() => (master?.plant ?? []).map((p) => ({ id: p.id, label: p.nama })), [master]);
  const opsiRuangan: Opsi[] = useMemo(
    () =>
      (master?.ruangan ?? [])
        .filter((r) => r.idPlant === form.idPlant)
        .map((r) => ({ id: r.id, label: `${r.nama} · maks. ${r.kapasitas} orang` })),
    [master, form.idPlant]
  );
  const opsiDepartemen: Opsi[] = useMemo(
    () => (master?.departemen ?? []).map((d) => ({ id: d.id, label: d.nama })),
    [master]
  );
  const labelDari = (opsi: Opsi[], id: number | null) => opsi.find((o) => o.id === id)?.label ?? null;

  const ubah = useCallback(<K extends keyof FormBooking>(kunci: K, nilai: FormBooking[K]) => {
    setGalatServer(null);
    setForm((lama) => {
      const baru = { ...lama, [kunci]: nilai };
      if (kunci === 'idPlant') baru.idRuangan = null; // ruangan mengikuti plant
      return baru;
    });
  }, []);

  const tambahPeserta = (nama: string) => {
    if (!form.peserta.includes(nama)) ubah('peserta', [...form.peserta, nama]);
  };
  const hapusPeserta = (indeks: number) => ubah('peserta', form.peserta.filter((_, i) => i !== indeks));

  const galat = useMemo(() => galatBooking(form), [form]);

  /** Kirim; mengembalikan id booking bila berhasil, null bila gagal (`galatServer` terisi). */
  const kirim = async (): Promise<number | null> => {
    setMengirim(true);
    setGalatServer(null);
    try {
      return await bookingRuanganService.buat(form);
    } catch (e: any) {
      const galatApi = e?.response?.data?.errors;
      setGalatServer(
        (galatApi && (Object.values(galatApi)[0] as string[])?.[0]) ||
          e?.response?.data?.message ||
          e?.message ||
          'Booking belum bisa dibuat. Coba lagi.'
      );
      return null;
    } finally {
      setMengirim(false);
    }
  };

  return {
    memuat,
    errorMuat,
    muatMaster,
    form,
    ubah,
    opsiPlant,
    opsiRuangan,
    opsiDepartemen,
    labelDari,
    tambahPeserta,
    hapusPeserta,
    galat,
    mengirim,
    galatServer,
    kirim,
  };
}

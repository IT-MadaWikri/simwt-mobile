/**
 * Form Request Akun: memuat pilihan (sistem, departemen per plant, metode penyerahan) beserta nilai awal
 * dari data karyawan, menyimpan isian, membersihkan pilihan turunan saat induknya berganti, memvalidasi
 * seperti server (`galat` per field), dan mengirim. Galat 422 server dipetakan ke `galatServer`.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { requestAkunService } from '../services/requestAkunService';
import {
  FORM_REQUEST_AKUN_KOSONG,
  departemenUntukPlant,
  galatRequestAkun,
  jenisUntukSistem,
  subUntukPlant,
} from '../adapters/requestAkun';
import { FormRequestAkun, OpsiRequestAkun } from '../types/layananIt';

interface Opsi {
  id: number;
  label: string;
}

/** Daftar teks → opsi `SheetPilihan` (id = urutan). */
const opsiTeks = (daftar: string[]): Opsi[] => daftar.map((label, id) => ({ id, label }));

export function useBuatRequestAkun() {
  const [opsi, setOpsi] = useState<OpsiRequestAkun | null>(null);
  const [memuat, setMemuat] = useState(true);
  const [errorMuat, setErrorMuat] = useState<string | null>(null);
  const [form, setForm] = useState<FormRequestAkun>(FORM_REQUEST_AKUN_KOSONG);
  const [mengirim, setMengirim] = useState(false);
  const [galatServer, setGalatServer] = useState<string | null>(null);
  const sudahIsiAwal = useRef(false);

  const muatOpsi = useCallback(async () => {
    setMemuat(true);
    setErrorMuat(null);
    try {
      const o = await requestAkunService.opsi();
      setOpsi(o);
      // Nilai awal dari data karyawan, sekali saja — jangan menimpa isian saat pilihan dimuat ulang.
      if (!sudahIsiAwal.current && o.pemohon) {
        sudahIsiAwal.current = true;
        const emailTersedia = o.metode.some((m) => m.nilai === 'email' && m.tersedia);
        setForm((f) => ({
          ...f,
          idPlant: o.pemohon?.idPlant ?? null,
          idDepartemen: o.pemohon?.idDepartemen ?? null,
          subDepartemen: o.pemohon?.subDepartemen ?? null,
          metode: emailTersedia ? 'email' : 'langsung',
        }));
      }
    } catch (e: any) {
      setErrorMuat(e?.message || 'Data formulir tidak bisa diambil dari server.');
    } finally {
      setMemuat(false);
    }
  }, []);

  useEffect(() => {
    muatOpsi();
  }, [muatOpsi]);

  const ubah = useCallback(
    <K extends keyof FormRequestAkun>(kunci: K, nilai: FormRequestAkun[K]) => {
      setGalatServer(null);
      setForm((lama) => {
        const baru = { ...lama, [kunci]: nilai };
        // Pilihan turunan dikosongkan bila tidak lagi berlaku untuk induk barunya.
        if (kunci === 'idPlant' && opsi) {
          const dept = departemenUntukPlant(opsi.departemen, baru.idPlant).find((d) => d.id === baru.idDepartemen);
          if (!dept) baru.idDepartemen = null;
          if (!subUntukPlant(dept, baru.idPlant).some((s) => s.id === baru.subDepartemen)) baru.subDepartemen = null;
        }
        if (kunci === 'idDepartemen') baru.subDepartemen = null;
        if (kunci === 'sistem') {
          if (!jenisUntukSistem(opsi, baru.sistem).includes(baru.jenis ?? '')) baru.jenis = null;
          if (baru.sistem !== 'WebApps') baru.webapps = null;
        }
        return baru;
      });
    },
    [opsi]
  );

  const deptTerpilih = opsi?.departemen.find((d) => d.id === form.idDepartemen);
  const opsiPlant: Opsi[] = useMemo(() => (opsi?.plant ?? []).map((p) => ({ id: p.id, label: p.nama })), [opsi]);
  const opsiDepartemen: Opsi[] = useMemo(
    () => departemenUntukPlant(opsi?.departemen ?? [], form.idPlant).map((d) => ({ id: d.id, label: d.nama })),
    [opsi, form.idPlant]
  );
  const opsiSub: Opsi[] = subUntukPlant(deptTerpilih, form.idPlant).map((s) => ({ id: s.id, label: s.nama }));
  const opsiSistem = useMemo(() => opsiTeks((opsi?.sistem ?? []).map((s) => s.nama)), [opsi]);
  const opsiJenis = useMemo(() => opsiTeks(jenisUntukSistem(opsi, form.sistem)), [opsi, form.sistem]);
  const opsiWebapps = useMemo(() => opsiTeks(opsi?.webapps ?? []), [opsi]);

  const galat = useMemo(() => galatRequestAkun(form, opsi), [form, opsi]);

  /** Kirim; mengembalikan id & nomor dokumen bila berhasil, null bila gagal (`galatServer` terisi). */
  const kirim = async (): Promise<{ id: number; nomorDokumen: string } | null> => {
    setMengirim(true);
    setGalatServer(null);
    try {
      return await requestAkunService.kirim(form);
    } catch (e: any) {
      const galatApi = e?.response?.data?.errors;
      setGalatServer(
        (galatApi && (Object.values(galatApi)[0] as string[])?.[0]) ||
          e?.response?.data?.message ||
          e?.message ||
          'Request belum bisa dikirim. Coba lagi.'
      );
      return null;
    } finally {
      setMengirim(false);
    }
  };

  return {
    memuat,
    errorMuat,
    muatOpsi,
    opsi,
    form,
    ubah,
    opsiPlant,
    opsiDepartemen,
    opsiSub,
    opsiSistem,
    opsiJenis,
    opsiWebapps,
    galat,
    mengirim,
    galatServer,
    kirim,
  };
}

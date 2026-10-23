/**
 * Form Request Pembuatan Sistem: memuat pilihan (plant, departemen) dan nilai awal dari data karyawan
 * (endpoint opsi Request Akun), menyimpan isian termasuk daftar tujuan & manfaat yang bisa ditambah/dihapus,
 * memvalidasi seperti server (`galat` per field), dan mengirim. Galat 422 server dipetakan ke `galatServer`.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { requestAkunService } from '../services/requestAkunService';
import { requestSistemService } from '../services/requestSistemService';
import { FORM_REQUEST_SISTEM_KOSONG, departemenUntukPlant, galatRequestSistem, subUntukPlant } from '../adapters/requestAkun';
import { FormRequestSistem, OpsiRequestAkun } from '../types/layananIt';

type DaftarButir = 'tujuan' | 'manfaat';

interface Opsi {
  id: number;
  label: string;
}

export function useBuatRequestSistem() {
  const [opsi, setOpsi] = useState<OpsiRequestAkun | null>(null);
  const [memuat, setMemuat] = useState(true);
  const [errorMuat, setErrorMuat] = useState<string | null>(null);
  const [form, setForm] = useState<FormRequestSistem>(FORM_REQUEST_SISTEM_KOSONG);
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
        setForm((f) => ({
          ...f,
          idPlant: o.pemohon?.idPlant ?? null,
          idDepartemen: o.pemohon?.idDepartemen ?? null,
          subDepartemen: o.pemohon?.subDepartemen ?? null,
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
    <K extends keyof FormRequestSistem>(kunci: K, nilai: FormRequestSistem[K]) => {
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
        return baru;
      });
    },
    [opsi]
  );

  const ubahButir = (daftar: DaftarButir, indeks: number, teks: string) => ubah(daftar, form[daftar].map((b, i) => (i === indeks ? teks : b)));
  const tambahButir = (daftar: DaftarButir) => ubah(daftar, [...form[daftar], '']);
  const hapusButir = (daftar: DaftarButir, indeks: number) => ubah(daftar, form[daftar].filter((_, i) => i !== indeks));

  const deptTerpilih = opsi?.departemen.find((d) => d.id === form.idDepartemen);
  const opsiPlant: Opsi[] = useMemo(() => (opsi?.plant ?? []).map((p) => ({ id: p.id, label: p.nama })), [opsi]);
  const opsiDepartemen: Opsi[] = useMemo(
    () => departemenUntukPlant(opsi?.departemen ?? [], form.idPlant).map((d) => ({ id: d.id, label: d.nama })),
    [opsi, form.idPlant]
  );
  const opsiSub: Opsi[] = subUntukPlant(deptTerpilih, form.idPlant).map((s) => ({ id: s.id, label: s.nama }));

  const galat = useMemo(() => galatRequestSistem(form, opsi), [form, opsi]);

  /**
   * Kirim; mengembalikan id & nomor dokumen bila berhasil, null bila gagal (`galatServer` terisi).
   * `deskripsiHtml`: isi editor teks kaya, yang tidak disimpan di `form` (editornya tak terkontrol).
   */
  const kirim = async (deskripsiHtml: string): Promise<{ id: number; nomorDokumen: string } | null> => {
    setMengirim(true);
    setGalatServer(null);
    try {
      return await requestSistemService.kirim({ ...form, deskripsi: deskripsiHtml });
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
    ubahButir,
    tambahButir,
    hapusButir,
    opsiPlant,
    opsiDepartemen,
    opsiSub,
    galat,
    mengirim,
    galatServer,
    kirim,
  };
}

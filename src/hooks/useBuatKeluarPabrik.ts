/**
 * Form Keluar Pabrik: memuat pilihan (plant, departemen per plant) beserta nilai awal dari data karyawan,
 * menyimpan isian, membersihkan pilihan turunan saat induknya berganti, memvalidasi seperti server
 * (`galat` per field), dan mengirim. Galat 422 server dipetakan ke `galatServer`.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { keluarPabrikService } from '../services/keluarPabrikService';
import { departemenUntukPlant, formKeluarPabrikKosong, galatKeluarPabrik, subUntukPlant } from '../adapters/keluarPabrik';
import { FormKeluarPabrik, OpsiKeluarPabrik } from '../types/layananHrd';

export function useBuatKeluarPabrik() {
  const [opsi, setOpsi] = useState<OpsiKeluarPabrik | null>(null);
  const [memuat, setMemuat] = useState(true);
  const [errorMuat, setErrorMuat] = useState<string | null>(null);
  const [form, setForm] = useState<FormKeluarPabrik>(formKeluarPabrikKosong);
  const [mengirim, setMengirim] = useState(false);
  const [galatServer, setGalatServer] = useState<string | null>(null);
  const sudahIsiAwal = useRef(false);

  const muatOpsi = useCallback(async () => {
    setMemuat(true);
    setErrorMuat(null);
    try {
      const o = await keluarPabrikService.opsi();
      setOpsi(o);
      // Nilai awal dari data karyawan, sekali saja — jangan menimpa isian saat pilihan dimuat ulang.
      if (!sudahIsiAwal.current && o.pemohon) {
        sudahIsiAwal.current = true;
        setForm((f) => ({
          ...f,
          kategori: o.pemohon?.kategori ?? f.kategori,
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
    <K extends keyof FormKeluarPabrik>(kunci: K, nilai: FormKeluarPabrik[K]) => {
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

  const deptTerpilih = opsi?.departemen.find((d) => d.id === form.idDepartemen);
  const opsiPlant = useMemo(() => (opsi?.plant ?? []).map((p) => ({ id: p.id, label: p.nama })), [opsi]);
  const opsiDepartemen = useMemo(
    () => departemenUntukPlant(opsi?.departemen ?? [], form.idPlant).map((d) => ({ id: d.id, label: d.nama })),
    [opsi, form.idPlant]
  );
  const opsiSub = subUntukPlant(deptTerpilih, form.idPlant).map((s) => ({ id: s.id, label: s.nama }));

  const galat = useMemo(() => galatKeluarPabrik(form, opsi), [form, opsi]);

  /** Kirim; mengembalikan id & nomor dokumen bila berhasil, null bila gagal (`galatServer` terisi). */
  const kirim = async (): Promise<{ id: number; nomorDokumen: string } | null> => {
    setMengirim(true);
    setGalatServer(null);
    try {
      return await keluarPabrikService.kirim(form);
    } catch (e: any) {
      const galatApi = e?.response?.data?.errors;
      setGalatServer(
        (galatApi && (Object.values(galatApi)[0] as string[])?.[0]) ||
          e?.response?.data?.message ||
          e?.message ||
          'Form belum bisa dikirim. Coba lagi.'
      );
      return null;
    } finally {
      setMengirim(false);
    }
  };

  return { memuat, errorMuat, muatOpsi, opsi, form, ubah, opsiPlant, opsiDepartemen, opsiSub, galat, mengirim, galatServer, kirim };
}

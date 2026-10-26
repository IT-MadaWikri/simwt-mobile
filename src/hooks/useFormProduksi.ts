/**
 * Form Pencapaian Produksi untuk satu dies: memuat master data, menyimpan isian, menurunkan proses dari
 * part, menghitung total/AR/akumulasi stroke, memvalidasi seperti server (`galat` per field), dan mengirim.
 *
 * Form dibagi beberapa langkah (`LANGKAH`) dengan galat per langkah, dan bisa disimpan sebagai draf di
 * perangkat. `idDrafAwal` membuka form dengan isian dari draf itu; tanpa itu form baru yang, bila
 * disimpan, menjadi draf baru. Memilih operator mengisi leader dan shift dari pemetaan karyawan (bila ada).
 * Galat 422 dari server dipetakan ke `galatServer`.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { produksiService } from '../services/produksiService';
import { buatIdDrafProduksi, DrafProduksi, drafProduksi } from '../utils/drafProduksi';
import { FormProduksi, KaryawanCari, MasterProduksi, PartCari } from '../types/produksi';

export const DAFTAR_SHIFT = [1, 2, 3];

/** Metadata draf yang diisi pengguna di sheet Simpan ke Draft. */
export interface MetaDraf {
  judul: string;
  nama: string;
  shift: number | null;
}

/** Langkah form beserta kunci `galat` yang diperiksa pada langkah itu. */
export const LANGKAH: { judul: string; kunci: string[] }[] = [
  { judul: 'Pelaksana', kunci: ['operator', 'shift', 'subDepartemen', 'leader'] },
  { judul: 'Produksi', kunci: ['part', 'proses'] },
  { judul: 'Capaian', kunci: ['planning', 'capPerJam', 'jumlahOk', 'jumlahNg', 'material', 'materialQty'] },
  { judul: 'Stroke', kunci: ['strokeHariIni'] },
];

const FORM_KOSONG: FormProduksi = {
  operator: '',
  leader: '',
  shift: null,
  subDepartemen: '',
  part: null,
  proses: '',
  subProses: '',
  kodeGudang: '',
  planning: '',
  capPerJam: '',
  jumlahOk: '',
  jumlahNg: '',
  strokeHariIni: '',
  material: null,
  materialQty: '',
  alasanNg: [],
  keterangan: '',
};

const angka = (teks: string) => Number(teks.replace(',', '.'));
const bulat = (teks: string) => /^\d+$/.test(teks.trim());
const desimal = (teks: string) => /^\d+([.,]\d+)?$/.test(teks.trim());

/** Pesan galat pertama dari respons server (422: per field, lainnya: `message`). */
export function pesanGalatServer(e: any, cadangan: string): string {
  const galatApi = e?.response?.data?.errors;
  return (galatApi && (Object.values(galatApi)[0] as string[])?.[0]) || e?.response?.data?.message || e?.message || cadangan;
}

export function useFormProduksi(nomorDies: string, mesin: string | null, idDrafAwal?: string) {
  const { user } = useAuth();
  const idDraf = useRef(idDrafAwal || buatIdDrafProduksi());
  const [langkah, setLangkah] = useState(0);
  const [master, setMaster] = useState<MasterProduksi | null>(null);
  const [memuat, setMemuat] = useState(true);
  const [errorMuat, setErrorMuat] = useState<string | null>(null);
  const [form, setForm] = useState<FormProduksi>(FORM_KOSONG);
  const [opsiProses, setOpsiProses] = useState<string[]>([]);
  const [petunjukProses, setPetunjukProses] = useState('Pilih part dulu supaya daftar proses menyesuaikan.');
  const [mengirim, setMengirim] = useState(false);
  const [galatServer, setGalatServer] = useState<string | null>(null);
  // Judul, nama, dan shift pembuat draf; nama & shift terisi otomatis dari data karyawan yang login.
  const [metaDraf, setMetaDraf] = useState<MetaDraf>({ judul: '', nama: user?.nama_lengkap || user?.name || '', shift: null });

  /** Pulihkan isian dari draf; daftar proses disesuaikan lagi dengan part-nya. */
  const terapkanDraf = async (d: DrafProduksi) => {
    setMetaDraf({ judul: d.judul ?? '', nama: d.pembuat ?? '', shift: d.shiftPembuat ?? null });
    setForm({ ...FORM_KOSONG, ...d.form });
    setLangkah(Math.min(Math.max(d.langkah, 0), LANGKAH.length - 1));
    if (!d.form.part) return;
    try {
      const hasil = await produksiService.prosesPart(d.form.part.id);
      setOpsiProses(hasil.daftar);
      setPetunjukProses(hasil.sesuai_part ? 'Proses disesuaikan dengan pemetaan part ini.' : 'Part ini belum dipetakan ke proses, semua proses ditampilkan.');
    } catch {
      // Daftar proses bawaan tetap dipakai; server tetap memvalidasi saat kirim.
    }
  };

  /**
   * Isi otomatis dari data karyawan yang login (dicari lewat NIK): nama & shift untuk draf, serta operator,
   * leader, dan shift form bila masih kosong. Best-effort — gagal cukup dilewati, pengguna mengisi sendiri.
   */
  const isiDariSaya = (operatorBawaan: string) => {
    if (!user?.nik) return;
    produksiService
      .cari<KaryawanCari>('karyawan', user.nik)
      .then((hasil) => {
        const saya = hasil.find((k) => k.nik === user.nik);
        if (!saya) return;
        setMetaDraf((m) => ({ ...m, nama: saya.nama_lengkap, shift: m.shift ?? saya.leader_shift }));
        setForm((lama) => ({
          ...lama,
          operator: !lama.operator || lama.operator === operatorBawaan ? saya.nama_lengkap : lama.operator,
          leader: lama.leader || saya.leader || '',
          shift: lama.shift ?? saya.leader_shift,
        }));
      })
      .catch(() => {});
  };

  const muatMaster = useCallback(async () => {
    setMemuat(true);
    setErrorMuat(null);
    try {
      const data = await produksiService.form(nomorDies, mesin);
      setMaster(data);
      setOpsiProses(data.proses);
      setForm({ ...FORM_KOSONG, operator: data.operator_default ?? '', subDepartemen: data.sub_departemen_mesin ?? '' });
      const draf = idDrafAwal ? await drafProduksi.ambil(user?.nik, idDrafAwal) : null;
      if (draf) await terapkanDraf(draf);
      isiDariSaya(data.operator_default);
    } catch (e: any) {
      setErrorMuat(e?.message || 'Gagal memuat formulir.');
    } finally {
      setMemuat(false);
    }
  }, [nomorDies, mesin, idDrafAwal, user?.nik]);

  useEffect(() => {
    muatMaster();
  }, [muatMaster]);

  const ubah = useCallback(<K extends keyof FormProduksi>(kunci: K, nilai: FormProduksi[K]) => {
    setGalatServer(null);
    setForm((lama) => ({ ...lama, [kunci]: nilai }));
  }, []);

  /** Operator terpilih: leader & shift ikut terisi dari pemetaan, kalau ada. */
  const pilihOperator = (k: KaryawanCari) => {
    setGalatServer(null);
    setForm((lama) => ({
      ...lama,
      operator: k.nama_lengkap,
      leader: k.leader ?? lama.leader,
      shift: k.leader_shift ?? lama.shift,
    }));
  };

  /** Part terpilih: daftar proses menyesuaikan pemetaan part; proses lama dibuang bila tak lagi tersedia. */
  const pilihPart = async (part: PartCari) => {
    ubah('part', part);
    try {
      const hasil = await produksiService.prosesPart(part.id);
      setOpsiProses(hasil.daftar);
      setPetunjukProses(hasil.sesuai_part ? 'Proses disesuaikan dengan pemetaan part ini.' : 'Part ini belum dipetakan ke proses, semua proses ditampilkan.');
      setForm((lama) => (hasil.daftar.includes(lama.proses) ? lama : { ...lama, proses: hasil.daftar.length === 1 ? hasil.daftar[0] : '' }));
    } catch {
      // Daftar proses lama tetap dipakai; server tetap memvalidasi saat kirim.
    }
  };

  const tambahAlasanNg = (alasan: string, qty: string) =>
    ubah('alasanNg', [...form.alasanNg, { alasan: alasan.trim().toUpperCase(), qty }]);
  const hapusAlasanNg = (indeks: number) => ubah('alasanNg', form.alasanNg.filter((_, i) => i !== indeks));

  const total = useMemo(() => (bulat(form.jumlahOk) ? Number(form.jumlahOk) : 0) + (bulat(form.jumlahNg) ? Number(form.jumlahNg) : 0), [form.jumlahOk, form.jumlahNg]);
  const ar = useMemo(() => {
    const planning = bulat(form.planning) ? Number(form.planning) : 0;
    if (!planning) return null;
    const ok = bulat(form.jumlahOk) ? Number(form.jumlahOk) : 0;
    const ng = bulat(form.jumlahNg) ? Number(form.jumlahNg) : 0;
    return { netto: Math.round(((ok - ng) / planning) * 10000) / 100, ok: Math.round((ok / planning) * 10000) / 100 };
  }, [form.planning, form.jumlahOk, form.jumlahNg]);
  const akumulasi = useMemo(() => {
    const awal = Number(master?.dies.asset_stroke ?? 0) || 0;
    return awal + (desimal(form.strokeHariIni) ? angka(form.strokeHariIni) : 0);
  }, [master, form.strokeHariIni]);

  const galat = useMemo(() => {
    const g: Record<string, string> = {};
    if (!form.operator.trim()) g.operator = 'Pilih nama operator.';
    if (!form.shift) g.shift = 'Pilih shift.';
    if (!form.subDepartemen) g.subDepartemen = 'Pilih sub departemen.';
    if (!form.leader.trim()) g.leader = 'Pilih nama leader.';
    if (!form.part) g.part = 'Pilih part yang sedang jalan.';
    if (!form.proses) g.proses = 'Pilih proses part.';
    if (!bulat(form.planning) || Number(form.planning) < 1) g.planning = 'Isi planning hari ini (minimal 1).';
    if (form.capPerJam.trim() && !bulat(form.capPerJam)) g.capPerJam = 'Cap/jam harus angka bulat.';
    if (!bulat(form.jumlahOk)) g.jumlahOk = 'Isi jumlah OK.';
    if (!bulat(form.jumlahNg)) g.jumlahNg = 'Isi jumlah NG (0 bila tidak ada).';
    if (!desimal(form.strokeHariIni)) g.strokeHariIni = 'Isi stroke hari ini.';
    if (form.material && !desimal(form.materialQty)) g.materialQty = 'Isi qty supply material.';
    if (!form.material && form.materialQty.trim()) g.material = 'Pilih material untuk qty ini.';
    return g;
  }, [form]);

  const galatLangkah = (indeks: number): Record<string, string> =>
    Object.fromEntries(LANGKAH[indeks].kunci.filter((k) => galat[k]).map((k) => [k, galat[k]]));

  /** Ada isian yang layak disimpan; operator/shift/sub-departemen terisi bawaan jadi tidak dihitung. */
  const kotor = !!(
    form.part || form.proses || form.subProses || form.kodeGudang || form.planning || form.capPerJam || form.jumlahOk ||
    form.jumlahNg || form.strokeHariIni || form.material || form.alasanNg.length || form.keterangan
  );

  const hapusDraf = () => drafProduksi.hapus(user?.nik, idDraf.current);
  /** Menimpa draf form ini (id sama); melempar error bila perangkat gagal menyimpan. */
  const simpanDraf = () =>
    drafProduksi.simpan(user?.nik, {
      id: idDraf.current,
      diubah: Date.now(),
      langkah,
      nomor: nomorDies,
      mesin,
      judul: metaDraf.judul.trim() || `Draf ${master?.dies.alias || master?.dies.asset_name || nomorDies}`,
      pembuat: metaDraf.nama.trim(),
      shiftPembuat: metaDraf.shift,
      namaDies: master?.dies.alias || master?.dies.asset_name || nomorDies,
      namaMesin: master?.mesin ? master.mesin.alias || master.mesin.asset_name : null,
      form,
    });

  /** Berhasil → akumulasi stroke dies yang baru (draf dibuang); gagal → null dan `galatServer` terisi. */
  const kirim = async (): Promise<number | null> => {
    setMengirim(true);
    setGalatServer(null);
    try {
      const akumulasi = await produksiService.simpan(nomorDies, form, mesin);
      hapusDraf();
      return akumulasi;
    } catch (e: any) {
      setGalatServer(pesanGalatServer(e, 'Pencapaian belum bisa disimpan. Coba lagi.'));
      return null;
    } finally {
      setMengirim(false);
    }
  };

  return {
    master,
    memuat,
    errorMuat,
    muatMaster,
    form,
    ubah,
    pilihOperator,
    pilihPart,
    tambahAlasanNg,
    hapusAlasanNg,
    opsiProses,
    petunjukProses,
    total,
    ar,
    akumulasi,
    galat,
    galatLangkah,
    langkah,
    setLangkah,
    kotor,
    metaDraf,
    setMetaDraf,
    simpanDraf,
    hapusDraf,
    mengirim,
    galatServer,
    kirim,
  };
}

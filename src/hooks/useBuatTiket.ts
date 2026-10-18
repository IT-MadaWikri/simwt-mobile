/**
 * Form Buat Tiket (tiket IT): memuat master data, menyimpan isian, menurunkan
 * pilihan bertingkat (kategori ← jenis, sub-departemen & area ← departemen),
 * memvalidasi seperti server (`galat` per field), mengambil foto, dan mengirim.
 *
 * Pilihan bertingkat direset otomatis saat induknya berganti. Galat 422 dari
 * server dipetakan ke `galatServer` agar layar menampilkan pesan yang sama
 * dengan web.
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import { tiketService } from '../services/tiketService';
import { FormTiket, MasterBuatTiket, OpsiPilihan } from '../types/tiket';

const SISI_MAKS = 1600;

const FORM_KOSONG: FormTiket = {
  idJenis: null,
  idKategori: null,
  idDepartemen: null,
  idSub: null,
  idArea: null,
  detail: '',
  foto: null,
};

export type SumberFoto = 'kamera' | 'galeri';

export function useBuatTiket() {
  const [master, setMaster] = useState<MasterBuatTiket | null>(null);
  const [memuat, setMemuat] = useState(true);
  const [errorMuat, setErrorMuat] = useState<string | null>(null);
  const [form, setForm] = useState<FormTiket>(FORM_KOSONG);
  const [mengirim, setMengirim] = useState(false);
  const [galatServer, setGalatServer] = useState<string | null>(null);

  const muatMaster = useCallback(async () => {
    setMemuat(true);
    setErrorMuat(null);
    try {
      setMaster(await tiketService.masterBuat());
    } catch (e: any) {
      setErrorMuat(e?.message || 'Data formulir tidak bisa diambil dari server.');
    } finally {
      setMemuat(false);
    }
  }, []);

  useEffect(() => {
    muatMaster();
  }, [muatMaster]);

  const jenis = master?.jenis.find((j) => j.id === form.idJenis) ?? null;
  const departemen = master?.departemen.find((d) => d.id === form.idDepartemen) ?? null;

  const opsiJenis: OpsiPilihan[] = useMemo(
    () => (master?.jenis ?? []).map((j) => ({ id: j.id, label: j.nama })),
    [master]
  );
  const opsiKategori: OpsiPilihan[] = useMemo(
    () => (jenis?.kategori ?? []).map((k) => ({ id: k.id, label: k.nama })),
    [jenis]
  );
  const opsiDepartemen: OpsiPilihan[] = useMemo(
    () => (master?.departemen ?? []).map((d) => ({ id: d.id, label: `${d.kode} · ${d.nama}` })),
    [master]
  );
  const opsiSub: OpsiPilihan[] = useMemo(
    () => (departemen?.subs ?? []).map((s) => ({ id: s.id, label: `${s.kode} · ${s.nama}` })),
    [departemen]
  );
  // Area mengikuti sub-departemen bila dipilih, kalau tidak departemennya.
  const opsiArea: OpsiPilihan[] = useMemo(() => {
    const kunci = form.idSub ?? form.idDepartemen;
    return kunci ? (master?.area[String(kunci)] ?? []).map((a) => ({ id: a.id, label: a.label })) : [];
  }, [master, form.idSub, form.idDepartemen]);

  const labelDari = (opsi: OpsiPilihan[], id: number | null) => opsi.find((o) => o.id === id)?.label ?? null;

  const ubah = useCallback(<K extends keyof FormTiket>(kunci: K, nilai: FormTiket[K]) => {
    setGalatServer(null);
    setForm((lama) => {
      const baru = { ...lama, [kunci]: nilai };
      if (kunci === 'idJenis') baru.idKategori = null;
      if (kunci === 'idDepartemen') {
        baru.idSub = null;
        baru.idArea = null;
      }
      if (kunci === 'idSub') baru.idArea = null;
      return baru;
    });
  }, []);

  /** Galat per field (kosong = aman); layar menampilkannya setelah percobaan kirim pertama. */
  const galat = useMemo(() => {
    const g: Partial<Record<'jenis' | 'kategori' | 'departemen' | 'sub' | 'detail', string>> = {};
    if (!form.idJenis) g.jenis = 'Jenis masalah wajib dipilih.';
    if (!form.idKategori) g.kategori = 'Kategori masalah wajib dipilih.';
    if (!form.idDepartemen) g.departemen = 'Departemen wajib dipilih.';
    if (form.idDepartemen && opsiSub.length > 0 && !form.idSub) g.sub = 'Pilih salah satu sub-departemen.';
    if (!form.detail.trim()) g.detail = 'Detail masalah wajib diisi.';
    return g;
  }, [form, opsiSub.length]);

  /** Ambil foto dari kamera/galeri; diperkecil ke sisi terpanjang 1600 px dan dikompres JPEG. */
  const ambilFoto = async (sumber: SumberFoto): Promise<string | null> => {
    const izin =
      sumber === 'kamera'
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!izin.granted) return `Aplikasi butuh izin ${sumber === 'kamera' ? 'kamera' : 'galeri'} untuk menambah foto.`;

    const opsi: ImagePicker.ImagePickerOptions = { mediaTypes: ['images'], quality: 0.9 };
    const hasil =
      sumber === 'kamera'
        ? await ImagePicker.launchCameraAsync(opsi)
        : await ImagePicker.launchImageLibraryAsync(opsi);
    if (hasil.canceled) return null;

    const asli = hasil.assets[0];
    const konteks = ImageManipulator.manipulate(asli.uri);
    if (Math.max(asli.width, asli.height) > SISI_MAKS) {
      konteks.resize(asli.width >= asli.height ? { width: SISI_MAKS } : { height: SISI_MAKS });
    }
    const gambar = await konteks.renderAsync();
    const simpan = await gambar.saveAsync({ format: SaveFormat.JPEG, compress: 0.8 });
    ubah('foto', { uri: simpan.uri, name: 'foto_sebelum.jpg', type: 'image/jpeg' });
    return null;
  };

  /** Kirim; mengembalikan nomor tiket bila berhasil, null bila gagal (`galatServer` terisi). */
  const kirim = async (): Promise<string | null> => {
    setMengirim(true);
    setGalatServer(null);
    try {
      return (await tiketService.buat(form)).no_ticket;
    } catch (e: any) {
      const galatApi = e?.response?.data?.errors;
      setGalatServer(
        (galatApi && (Object.values(galatApi)[0] as string[])?.[0]) ||
          e?.response?.data?.message ||
          e?.message ||
          'Tiket belum bisa dikirim. Coba lagi.'
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
    opsiJenis,
    opsiKategori,
    opsiDepartemen,
    opsiSub,
    opsiArea,
    labelDari,
    galat,
    ambilFoto,
    mengirim,
    galatServer,
    kirim,
  };
}

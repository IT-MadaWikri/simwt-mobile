/**
 * Form Buat Tiket (tiket IT): memuat master data, menyimpan isian, menurunkan
 * pilihan bertingkat (kategori ← jenis, sub-departemen & area ← departemen),
 * memvalidasi seperti server (`galat` per field), mengatur foto (kamera/galeri →
 * editor crop), dan mengirim.
 *
 * Pilihan bertingkat direset otomatis saat induknya berganti. Galat 422 dari
 * server dipetakan ke `galatServer` agar layar menampilkan pesan yang sama
 * dengan web.
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { tiketService } from '../services/tiketService';
import { FotoKaizen } from '../components/kaizen/EditorFoto';
import { AsetRingkas, FormTiket, MasterBuatTiket, OpsiPilihan } from '../types/tiket';

const FORM_KOSONG: FormTiket = {
  aset: null,
  idJenis: null,
  idKategori: null,
  idDepartemen: null,
  idSub: null,
  idArea: null,
  stroke: '',
  detail: '',
  foto: null,
};

export type SumberFoto = 'kamera' | 'galeri';

/**
 * `asetAwal`: aset yang sudah terpilih sejak form dibuka (mis. dari hasil pindai QR).
 * `jenisNama`: nama jenis yang dipilih otomatis ("Mesin"/"Dies"); dikunci bila `asetAwal` ada, seperti di web.
 */
export function useBuatTiket(asetAwal: AsetRingkas | null = null, jenisNama = '') {
  const [master, setMaster] = useState<MasterBuatTiket | null>(null);
  const [memuat, setMemuat] = useState(true);
  const [errorMuat, setErrorMuat] = useState<string | null>(null);
  const [form, setForm] = useState<FormTiket>({ ...FORM_KOSONG, aset: asetAwal });
  const [mengirim, setMengirim] = useState(false);
  const [galatServer, setGalatServer] = useState<string | null>(null);

  // Foto: `fotoAtur` menyimpan posisi crop (untuk dibuka ulang); hasilnya masuk ke `form.foto`.
  const [fotoAtur, setFotoAtur] = useState<FotoKaizen | null>(null);
  const [editorTerbuka, setEditorTerbuka] = useState(false);

  const muatMaster = useCallback(async () => {
    setMemuat(true);
    setErrorMuat(null);
    try {
      const data = await tiketService.masterBuat();
      setMaster(data);
      const awal = jenisNama ? data.jenis.find((j) => j.nama === jenisNama) : undefined;
      if (awal) setForm((lama) => (lama.idJenis ? lama : { ...lama, idJenis: awal.id }));
    } catch (e: any) {
      setErrorMuat(e?.message || 'Data formulir tidak bisa diambil dari server.');
    } finally {
      setMemuat(false);
    }
  }, [jenisNama]);

  useEffect(() => {
    muatMaster();
  }, [muatMaster]);

  const jenis = master?.jenis.find((j) => j.id === form.idJenis) ?? null;
  const strokeAktif = jenis?.tipe === 'dies';
  const jenisTerkunci = !!asetAwal && !!jenisNama && jenis?.nama === jenisNama;
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
    const g: Partial<Record<'jenis' | 'kategori' | 'departemen' | 'sub' | 'detail' | 'stroke', string>> = {};
    if (!form.idJenis) g.jenis = 'Jenis masalah wajib dipilih.';
    if (!form.idKategori) g.kategori = 'Kategori masalah wajib dipilih.';
    if (!form.idDepartemen) g.departemen = 'Departemen wajib dipilih.';
    if (form.idDepartemen && opsiSub.length > 0 && !form.idSub) g.sub = 'Pilih salah satu sub-departemen.';
    if (!form.detail.trim()) g.detail = 'Detail masalah wajib diisi.';
    if (strokeAktif && form.stroke.trim() && !/^\d+([.,]\d+)?$/.test(form.stroke.trim())) g.stroke = 'Jumlah stroke harus berupa angka.';
    return g;
  }, [form, opsiSub.length, strokeAktif]);

  /** Ambil foto dari kamera/galeri lalu buka editor crop. Mengembalikan pesan bila izin ditolak. */
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

    const a = hasil.assets[0];
    setFotoAtur({ uri: a.uri, width: a.width, height: a.height, rasio: 'asli', zoom: 1, nx: 0, ny: 0, tag: 'sebelum' });
    setEditorTerbuka(true);
    return null;
  };

  /** Editor selesai: hasil crop menjadi foto yang dikirim. */
  const selesaiFoto = (fotos: FotoKaizen[]) => {
    const f = fotos[0];
    if (f?.hasil) {
      setFotoAtur(f);
      ubah('foto', { uri: f.hasil.uri, name: 'foto_sebelum.jpg', type: 'image/jpeg' });
    }
    setEditorTerbuka(false);
  };

  /** Editor dibatalkan: foto baru dibuang, foto lama (bila ada) tetap. */
  const batalFoto = () => {
    setEditorTerbuka(false);
    if (!form.foto) setFotoAtur(null);
  };

  const bukaEditorFoto = () => {
    if (fotoAtur) setEditorTerbuka(true);
  };

  const hapusFoto = () => {
    ubah('foto', null);
    setFotoAtur(null);
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
    strokeAktif,
    jenisTerkunci,
    labelDari,
    galat,
    ambilFoto,
    fotoAtur,
    editorTerbuka,
    selesaiFoto,
    batalFoto,
    bukaEditorFoto,
    hapusFoto,
    mengirim,
    galatServer,
    kirim,
  };
}

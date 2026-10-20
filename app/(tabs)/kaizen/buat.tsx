/**
 * Buat Kaizen — wizard 2 langkah, setara formulir website (sim-mwt):
 *   1. Kaizen: tema, pelaksana & pemberi saran (bottom sheet cari karyawan),
 *      kontak, departemen (hanya bila pilihannya > 1), plant akun, kondisi
 *      sebelum/sesudah, dan satu kolom foto (maks 2, di-crop & ditandai
 *      Sebelum/Sesudah).
 *   2. Manfaat: minimal satu, ditambah/diubah lewat bottom sheet.
 * Semuanya dikirim sekali ke `POST /kaizen/buat` (multipart).
 */
import LencanaAngka from '../../../src/components/common/LencanaAngka';
import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from '../../../src/components/common/Icon';
import Avatar from '../../../src/components/common/Avatar';
import BottomSheet from '../../../src/components/common/BottomSheet';
import Button from '../../../src/components/common/Button';
import { SkeletonForm } from '../../../src/components/common/Skeleton';
import { dialog } from '../../../src/components/common/AppDialog';
import SheetKaryawan from '../../../src/components/kaizen/SheetKaryawan';
import EditorFoto, { FotoKaizen, TagFoto } from '../../../src/components/kaizen/EditorFoto';
import Colors, { brand, slate } from '../../../constants/Colors';
import Spacing from '../../../constants/Spacing';
import { fonts, ukuranIsi } from '../../../constants/Typography';
import { gs, inputReset } from '../../../constants/GlobalStyles';
import { useAuth } from '../../../src/contexts/AuthContext';
import { kaizenService } from '../../../src/services/kaizenService';
import SliderManfaat from '../../../src/components/kaizen/SliderManfaat';
import { KaizenOpsiBuat, KaryawanRingkas } from '../../../src/types/kaizen';
import { LENCANA } from '../../../src/utils/kaizen';
import { drafKaizen, buatIdDraf } from '../../../src/utils/drafKaizen';

type Orang = { nama: string; nik: string };

interface Manfaat {
  kategori: number | null;
  sebelum: string;
  sesudah: string;
  hemat: string;
  pelaksanaan: 'Internal' | 'Eksternal';
  area: string;
  pic: Orang | null;
}

const MANFAAT_KOSONG: Manfaat = {
  kategori: null,
  sebelum: '',
  sesudah: '',
  hemat: '',
  pelaksanaan: 'Internal',
  area: '',
  pic: null,
};

const RE_WA = /^08[0-9]{8,11}$/;
/** Nomor dari data karyawan ditulis bermacam bentuk (+62…, 62…); rapikan ke 08… supaya lolos RE_WA. */
const rapikanWa = (n?: string | null) => (n ?? '').replace(/[^0-9]/g, '').replace(/^62/, '0');
const RE_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Aturan langkah 1, sama dgn FormBuatkaizen di website. */
function cekLangkah1(f: {
  tema: string;
  pelaksana: Orang | null;
  nomor_whatsapp: string;
  email: string;
  detail_sebelum: string;
  detail_sesudah: string;
}, fotos: FotoKaizen[]) {
  const e: Record<string, string> = {};
  if (!f.tema.trim()) e.tema = 'Tema wajib diisi.';
  if (!f.pelaksana?.nik) e.pelaksana = 'Pilih pelaksana dari daftar karyawan.';
  if (!RE_WA.test(f.nomor_whatsapp.trim())) e.nomor_whatsapp = 'Diawali 08, 10-13 angka.';
  if (!RE_EMAIL.test(f.email.trim())) e.email = 'Format email tidak valid.';
  if (!f.detail_sebelum.trim()) e.detail_sebelum = 'Kondisi sebelum wajib diisi.';
  if (!f.detail_sesudah.trim()) e.detail_sesudah = 'Kondisi sesudah wajib diisi.';
  if (!fotos.some((x) => x.tag === 'sesudah')) e.foto = 'Foto bertanda Sesudah wajib ada.';
  return e;
}

function cekManfaat(m: Manfaat) {
  const e: Record<string, string> = {};
  if (!m.kategori) e.kategori = 'Pilih kategori.';
  if (!m.sebelum.trim()) e.sebelum = 'Wajib diisi.';
  if (!m.sesudah.trim()) e.sesudah = 'Wajib diisi.';
  if (!m.hemat.trim()) e.hemat = 'Wajib diisi.';
  if (!m.area.trim()) e.area = 'Wajib diisi.';
  if (!m.pic?.nik) e.pic = 'Pilih PIC dari daftar karyawan.';
  return e;
}

/** Kolom isian: label, input, penghitung opsional, dan pesan galat di bawahnya. */
function Kolom({
  label,
  wajib,
  galat,
  maks,
  value,
  ...props
}: React.ComponentProps<typeof TextInput> & { label: string; wajib?: boolean; galat?: string; maks?: number; value: string }) {
  return (
    <View style={styles.field}>
      <View style={gs.rowBetween}>
        <Text style={styles.label}>
          {label}
          {wajib ? <Text style={styles.wajib}> *</Text> : null}
        </Text>
        {maks ? <Text style={styles.hitung}>{value.length}/{maks}</Text> : null}
      </View>
      <TextInput
        style={[styles.input, props.multiline && styles.textArea, galat ? styles.inputGalat : null]}
        placeholderTextColor={Colors.placeholder}
        maxLength={maks}
        value={value}
        {...props}
      />
      {galat ? <Text style={styles.galat}>{galat}</Text> : null}
    </View>
  );
}

/** Baris orang terpilih (avatar + nama + NIK) dengan tombol Ganti/Pilih. */
function BarisOrang({
  label,
  wajib,
  orang,
  galat,
  onPilih,
  onHapus,
}: {
  label: string;
  wajib?: boolean;
  orang: Orang | null;
  galat?: string;
  onPilih: () => void;
  onHapus?: () => void;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>
        {label}
        {wajib ? <Text style={styles.wajib}> *</Text> : <Text style={styles.opsional}> (opsional)</Text>}
      </Text>
      <TouchableOpacity
        style={[styles.orang, galat ? styles.inputGalat : null]}
        activeOpacity={0.7}
        onPress={onPilih}
      >
        {orang ? (
          <>
            <Avatar nama={orang.nama} ukuran={32} />
            <View style={gs.flex1}>
              <Text style={styles.namaOrang} numberOfLines={1}>{orang.nama}</Text>
              <Text style={styles.nikOrang} numberOfLines={1}>{orang.nik}</Text>
            </View>
            {onHapus ? (
              <TouchableOpacity onPress={onHapus} hitSlop={10} accessibilityLabel={`Hapus ${label}`}>
                <Icon name="close" size={16} color={Colors.textTertiary} />
              </TouchableOpacity>
            ) : (
              <Text style={styles.ganti}>Ganti</Text>
            )}
          </>
        ) : (
          <>
            <View style={styles.ikonCari}>
              <Icon name="account-search-outline" size={16} color={Colors.textTertiary} />
            </View>
            <Text style={[gs.flex1, styles.placeholderOrang]}>Cari nama atau NIK</Text>
            <Icon name="chevron-right" size={16} color={Colors.textTertiary} />
          </>
        )}
      </TouchableOpacity>
      {galat ? <Text style={styles.galat}>{galat}</Text> : null}
    </View>
  );
}

export default function BuatKaizenScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollView>(null);

  // PIC area setelah Kaizen diisi pengguna yang sedang membuat; bisa diganti lewat pencarian.
  const saya: Orang | null = user?.nik ? { nama: user.nama_lengkap || user.name, nik: user.nik } : null;

  const [opsi, setOpsi] = useState<KaizenOpsiBuat | null>(null);
  const [gagalOpsi, setGagalOpsi] = useState(false);
  const [langkah, setLangkah] = useState<1 | 2>(1);
  const [mengirim, setMengirim] = useState(false);
  const [galat, setGalat] = useState<Record<string, string>>({});

  const [form, setForm] = useState({
    tema: '',
    pelaksana: (user?.nik ? { nama: user.nama_lengkap || user.name, nik: user.nik } : null) as Orang | null,
    saran: null as Orang | null,
    nomor_whatsapp: rapikanWa(user?.phone),
    email: user?.email || '',
    id_departemen: null as number | null,
    detail_sebelum: '',
    detail_sesudah: '',
  });
  const [fotos, setFotos] = useState<FotoKaizen[]>([]);
  const [manfaat, setManfaat] = useState<Manfaat[]>([]);

  const [sheetOrang, setSheetOrang] = useState<null | 'pelaksana' | 'saran' | 'pic'>(null);
  const [sheetSumber, setSheetSumber] = useState(false);
  const [editor, setEditor] = useState<{ fotos: FotoKaizen[]; awal: number } | null>(null);
  const [draf, setDraf] = useState<{ data: Manfaat; index: number | null; galat: Record<string, string> } | null>(null);

  // Draf disimpan di perangkat (src/utils/drafKaizen). Dibuka dari daftar draf lewat
  // param `draf`; tanpa param ini draf baru, dan menyimpan lagi menimpa draf yang sama.
  const { draf: idDrafAwal } = useLocalSearchParams<{ draf?: string }>();
  const idDraf = useRef(idDrafAwal || buatIdDraf());

  const pulihkanDraf = async () => {
    if (!idDrafAwal) return;
    const d = await drafKaizen.ambil(user?.nik, idDrafAwal);
    if (!d) return;
    setForm((f) => ({ ...f, ...d.data.form }));
    setFotos(d.data.fotos ?? []);
    setManfaat(d.data.manfaat ?? []);
    setLangkah(d.langkah === 2 ? 2 : 1);
  };

  const simpanDrafKaizen = async () => {
    if (!kondisi.current.kotor) {
      dialog.alert('Belum Ada Isian', 'Isi dulu sesuatu sebelum menyimpan draf.');
      return;
    }
    try {
      await drafKaizen.simpan(user?.nik, {
        id: idDraf.current,
        diubah: Date.now(),
        langkah,
        tema: form.tema.trim(),
        data: { form, fotos, manfaat },
      });
    } catch {
      dialog.alert('Gagal Menyimpan', 'Draf tidak bisa disimpan di perangkat ini.', 'danger');
      return;
    }
    selesai.current = true;
    await dialog.alert('Draf Tersimpan', 'Lanjutkan kapan saja dari menu "Draft Kaizen Anda".', 'success');
    router.back();
  };

  const muatOpsi = () => {
    setGagalOpsi(false);
    kaizenService
      .getOpsiBuat()
      .then((o) => {
        setOpsi(o);
        setForm((f) => ({ ...f, id_departemen: f.id_departemen ?? o.id_departemen }));
        pulihkanDraf();
      })
      .catch(() => setGagalOpsi(true));
  };
  useEffect(muatOpsi, []);

  // WA & email ada di data karyawan (HARIS), bukan di akun pengguna: ambil untuk pelaksana bawaan
  // (diri sendiri) dan isi hanya bila masih kosong, supaya tidak menimpa yang sudah diketik/dipulihkan dari draf.
  useEffect(() => {
    const nik = user?.nik;
    if (!nik) return;
    let batal = false;
    kaizenService
      .cariKaryawan(nik)
      .then((hasil) => {
        const saya = hasil.find((k) => k.nik === nik);
        if (batal || !saya) return;
        setForm((f) => ({ ...f, nomor_whatsapp: f.nomor_whatsapp || rapikanWa(saya.phone), email: f.email || saya.email || '' }));
      })
      .catch(() => {});
    return () => {
      batal = true;
    };
  }, [user?.nik]);

  // Kembali dari langkah 2 = ke langkah 1; keluar dgn isian terisi = konfirmasi.
  const selesai = useRef(false);
  const kondisi = useRef({ langkah, kotor: false });
  kondisi.current = {
    langkah,
    kotor: !!(form.tema || form.detail_sebelum || form.detail_sesudah || fotos.length || manfaat.length),
  };
  useEffect(
    () =>
      navigation.addListener('beforeRemove', (e) => {
        if (selesai.current) return;
        if (kondisi.current.langkah === 2) {
          e.preventDefault();
          setLangkah(1);
          return;
        }
        if (!kondisi.current.kotor) return;
        e.preventDefault();
        dialog
          .confirm({
            title: 'Buang Kaizen ini?',
            message: 'Isian yang sudah kamu tulis akan hilang.',
            confirmText: 'Buang',
            cancelText: 'Lanjut mengisi',
            destructive: true,
          })
          .then((ya) => ya && navigation.dispatch(e.data.action));
      }),
    [navigation]
  );

  const ubah = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) => {
    setForm((f) => ({ ...f, [k]: v }));
    if (galat[k as string]) setGalat((g) => ({ ...g, [k]: '' }));
  };

  const pilihOrang = (k: KaryawanRingkas) => {
    const orang = { nama: k.nama, nik: k.nik };
    if (sheetOrang === 'pelaksana') {
      // Seperti website: WA & email hanya diisi bila masih kosong, tidak menimpa.
      setForm((f) => ({
        ...f,
        pelaksana: orang,
        nomor_whatsapp: f.nomor_whatsapp || rapikanWa(k.phone),
        email: f.email || k.email || '',
      }));
      setGalat((g) => ({ ...g, pelaksana: '' }));
    } else if (sheetOrang === 'saran') {
      ubah('saran', orang);
    } else if (sheetOrang === 'pic' && draf) {
      setDraf({ ...draf, data: { ...draf.data, pic: orang }, galat: { ...draf.galat, pic: '' } });
    }
  };

  // --- Foto ---------------------------------------------------------------
  const tambahFoto = async (sumber: 'kamera' | 'galeri') => {
    const sisa = 2 - fotos.length;
    if (sisa <= 0) return;
    const izin =
      sumber === 'kamera'
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!izin.granted) {
      dialog.alert('Izin Ditolak', `Aplikasi butuh izin ${sumber === 'kamera' ? 'kamera' : 'galeri'} untuk menambah foto.`);
      return;
    }
    const opsiPicker: ImagePicker.ImagePickerOptions = {
      mediaTypes: ['images'],
      quality: 0.9,
      allowsMultipleSelection: sumber === 'galeri' && sisa > 1,
      selectionLimit: sisa,
    };
    const hasil =
      sumber === 'kamera'
        ? await ImagePicker.launchCameraAsync(opsiPicker)
        : await ImagePicker.launchImageLibraryAsync(opsiPicker);
    if (hasil.canceled) return;

    const terpakai = new Set(fotos.map((x) => x.tag));
    const baru: FotoKaizen[] = hasil.assets.slice(0, sisa).map((a) => {
      const tag: TagFoto = !terpakai.has('sebelum') ? 'sebelum' : 'sesudah';
      terpakai.add(tag);
      return { uri: a.uri, width: a.width, height: a.height, rasio: 'asli', zoom: 1, nx: 0, ny: 0, tag };
    });
    setEditor({ fotos: [...fotos, ...baru], awal: fotos.length });
  };

  const hapusFoto = (i: number) => setFotos((d) => d.filter((_, j) => j !== i));

  // --- Langkah ------------------------------------------------------------
  const lanjut = () => {
    const e = cekLangkah1(form, fotos);
    setGalat(e);
    if (Object.values(e).some(Boolean)) {
      scrollRef.current?.scrollTo({ y: 0, animated: true });
      dialog.alert('Belum Lengkap', 'Lengkapi isian yang bertanda merah.');
      return;
    }
    setLangkah(2);
    scrollRef.current?.scrollTo({ y: 0, animated: false });
  };

  const simpanDraf = () => {
    if (!draf) return;
    const e = cekManfaat(draf.data);
    if (Object.keys(e).length) {
      setDraf({ ...draf, galat: e });
      return;
    }
    setManfaat((d) => (draf.index === null ? [...d, draf.data] : d.map((x, i) => (i === draf.index ? draf.data : x))));
    setDraf(null);
  };

  // Manfaat dikelompokkan per kategori: kartu menampilkan jumlahnya, rinciannya di sheet.
  const [sheetKategori, setSheetKategori] = useState<number | null | undefined>(undefined);
  const kelompokManfaat = Array.from(
    manfaat
      .reduce((peta, m, i) => peta.set(m.kategori, [...(peta.get(m.kategori) ?? []), { m, i }]), new Map<number | null, { m: Manfaat; i: number }[]>())
      .entries()
  );
  const butirSheet = sheetKategori === undefined ? [] : manfaat.map((m, i) => ({ m, i })).filter((x) => x.m.kategori === sheetKategori);

  const hapusManfaat = async (i: number) => {
    const ya = await dialog.confirm({ title: 'Hapus manfaat ini?', confirmText: 'Hapus', destructive: true });
    if (!ya) return;
    setManfaat((d) => d.filter((_, j) => j !== i));
    // Kelompok yang habis: tutup sheet-nya.
    if (butirSheet.length <= 1) setSheetKategori(undefined);
  };

  const kirim = async () => {
    if (!manfaat.length) {
      dialog.alert('Belum Ada Manfaat', 'Tambahkan minimal satu manfaat.');
      return;
    }
    const ya = await dialog.confirm({
      title: 'Kirim Kaizen?',
      message: 'Setelah dikirim, Kaizen akan masuk ke panitia untuk dinilai.',
      confirmText: 'Kirim',
      cancelText: 'Periksa lagi',
    });
    if (!ya) return;
    const data = new FormData();
    data.append('tema', form.tema.trim());
    data.append('nama_pelaksana', form.pelaksana!.nama);
    data.append('nik_nama_pelaksana', form.pelaksana!.nik);
    if (form.saran) {
      data.append('disarankan_oleh', form.saran.nama);
      data.append('nik_disarankan_oleh', form.saran.nik);
    }
    data.append('nomor_whatsapp', form.nomor_whatsapp.trim());
    data.append('email', form.email.trim());
    if (form.id_departemen) data.append('id_departemen', String(form.id_departemen));
    data.append('detail_sebelum', form.detail_sebelum.trim());
    data.append('detail_sesudah', form.detail_sesudah.trim());
    fotos.forEach((x) => {
      const h = x.hasil ?? { uri: x.uri };
      data.append(`foto_${x.tag}`, { uri: h.uri, name: `foto_${x.tag}.jpg`, type: 'image/jpeg' } as any);
    });
    manfaat.forEach((m, i) => {
      data.append(`manfaat[${i}][kategori]`, String(m.kategori));
      data.append(`manfaat[${i}][sebelum]`, m.sebelum.trim());
      data.append(`manfaat[${i}][sesudah]`, m.sesudah.trim());
      data.append(`manfaat[${i}][hemat]`, m.hemat.trim());
      data.append(`manfaat[${i}][pelaksanaan]`, m.pelaksanaan);
      data.append(`manfaat[${i}][area]`, m.area.trim());
      data.append(`manfaat[${i}][pic]`, m.pic!.nama);
    });

    try {
      setMengirim(true);
      const hasil = await kaizenService.buat(data);
      selesai.current = true;
      drafKaizen.hapus(user?.nik, idDraf.current);
      await dialog.alert('Kaizen Terkirim', `Nomor Kaizen kamu ${hasil.nomor}. Tunggu penilaian dari panitia ya.`, 'success');
      router.back();
    } catch (err: any) {
      const errors: Record<string, string[]> | undefined = err.response?.data?.errors;
      // Galat isian langkah 1 dikembalikan ke kolomnya supaya mudah diperbaiki.
      if (errors) {
        const peta: Record<string, string> = {
          nik_nama_pelaksana: 'pelaksana',
          nama_pelaksana: 'pelaksana',
          foto_sesudah: 'foto',
          foto_sebelum: 'foto',
        };
        const e: Record<string, string> = {};
        Object.entries(errors).forEach(([k, v]) => {
          if (!k.startsWith('manfaat')) e[peta[k] ?? k] = v[0];
        });
        if (Object.keys(e).length) {
          setGalat(e);
          setLangkah(1);
        }
      }
      dialog.alert(
        'Gagal Mengirim',
        err.response?.data?.message || err.message || 'Terjadi kesalahan saat mengirim Kaizen.',
        'danger'
      );
    } finally {
      setMengirim(false);
    }
  };

  // --- Tampilan -----------------------------------------------------------
  if (!opsi) {
    return (
      <View style={[gs.screen, { backgroundColor: Colors.white }]}>
        {gagalOpsi ? (
          <View style={styles.gagal}>
            <Text style={gs.emptyTitle}>Gagal memuat formulir</Text>
            <Button label="Coba lagi" onPress={muatOpsi} />
          </View>
        ) : (
          <SkeletonForm />
        )}
      </View>
    );
  }

  const kategoriNama = (id: number | null) => opsi.kategori.find((k) => k.id === id)?.kategori ?? '';
  const ikonKategori = (id: number | null) => LENCANA[kategoriNama(id)] ?? { ikon: 'lightbulb-on-outline', warna: ['#e2e8f0', '#94a3b8', '#475569'] as const };

  const langkah1 = (
    <>
      <Text style={styles.judulBagian}>Ide perbaikan</Text>
      <View style={styles.kartu}>
        <Kolom
          label="Tema / Judul"
          wajib
          maks={255}
          placeholder="Contoh: Mengurangi waktu setup mesin press"
          value={form.tema}
          onChangeText={(v) => ubah('tema', v)}
          galat={galat.tema}
        />
        <BarisOrang
          label="Disarankan oleh"
          orang={form.saran}
          onPilih={() => setSheetOrang('saran')}
          onHapus={form.saran ? () => ubah('saran', null) : undefined}
        />
      </View>

      <Text style={styles.judulBagian}>Pelaksana</Text>
      <View style={styles.kartu}>
        <BarisOrang
          label="Pelaksana"
          wajib
          orang={form.pelaksana}
          galat={galat.pelaksana}
          onPilih={() => setSheetOrang('pelaksana')}
        />
        <View style={[gs.row, { gap: Spacing.sm, alignItems: 'flex-start' }]}>
          <View style={gs.flex1}>
            <Kolom
              label="No. WhatsApp"
              wajib
              placeholder="08…"
              keyboardType="phone-pad"
              value={form.nomor_whatsapp}
              onChangeText={(v) => ubah('nomor_whatsapp', v.replace(/[^0-9]/g, ''))}
              galat={galat.nomor_whatsapp}
            />
          </View>
          <View style={gs.flex1}>
            <Kolom
              label="Email"
              wajib
              placeholder="nama@email.com"
              keyboardType="email-address"
              autoCapitalize="none"
              value={form.email}
              onChangeText={(v) => ubah('email', v)}
              galat={galat.email}
            />
          </View>
        </View>
        {opsi.departemen.length > 1 ? (
          <View style={styles.field}>
            <Text style={styles.label}>Departemen</Text>
            <View style={styles.chips}>
              {opsi.departemen.map((d) => {
                const on = d.id === form.id_departemen;
                return (
                  <TouchableOpacity
                    key={d.id}
                    style={[styles.chip, on && styles.chipAktif]}
                    onPress={() => ubah('id_departemen', d.id)}
                  >
                    <Text style={[styles.teksChip, on && styles.teksChipAktif]}>{d.nama}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        ) : null}
        <View style={[gs.row, styles.plant]}>
          <Icon name="office-building-outline" size={14} color={Colors.textTertiary} />
          <Text style={styles.teksPlant}>
            {[opsi.departemen.length === 1 ? opsi.departemen[0].nama : null, opsi.plant?.nama ? `Plant ${opsi.plant.nama}` : null]
              .filter(Boolean)
              .join(' · ') || 'Plant mengikuti akun'}
          </Text>
        </View>
      </View>

      <Text style={styles.judulBagian}>Kondisi</Text>
      <View style={styles.kartu}>
        <Kolom
          label="Sebelum Kaizen"
          wajib
          maks={500}
          multiline
          placeholder="Apa masalahnya sebelum diperbaiki?"
          value={form.detail_sebelum}
          onChangeText={(v) => ubah('detail_sebelum', v)}
          galat={galat.detail_sebelum}
        />
        <Kolom
          label="Sesudah Kaizen"
          wajib
          maks={500}
          multiline
          placeholder="Apa hasilnya setelah diperbaiki?"
          value={form.detail_sesudah}
          onChangeText={(v) => ubah('detail_sesudah', v)}
          galat={galat.detail_sesudah}
        />
      </View>

      <View style={[gs.rowBetween, { alignItems: 'flex-end' }]}>
        <Text style={styles.judulBagian}>Foto</Text>
        <Text style={[styles.hitung, { marginBottom: Spacing.sm }]}>{fotos.length}/2</Text>
      </View>
      <View style={styles.kartu}>
        <View style={styles.gridFoto}>
          {fotos.map((x, i) => (
            <TouchableOpacity
              key={x.uri}
              style={styles.ubinFoto}
              activeOpacity={0.85}
              onPress={() => setEditor({ fotos, awal: i })}
            >
              <Image source={{ uri: x.hasil?.uri ?? x.uri }} style={styles.gambar} />
              <View style={[styles.tagFoto, x.tag === 'sesudah' && { backgroundColor: Colors.primary }]}>
                <Text style={styles.teksTag}>{x.tag === 'sebelum' ? 'Sebelum' : 'Sesudah'}</Text>
              </View>
              <TouchableOpacity style={styles.hapusFoto} onPress={() => hapusFoto(i)} hitSlop={8} accessibilityLabel="Hapus foto">
                <Icon name="close" size={14} color={Colors.white} />
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
          {fotos.length < 2 ? (
            <TouchableOpacity
              style={[styles.ubinFoto, styles.ubinTambah, fotos.length === 0 && styles.ubinKosong]}
              activeOpacity={0.8}
              onPress={() => setSheetSumber(true)}
            >
              <Icon name="camera-plus-outline" size={22} color={brand[700]} />
              <Text style={styles.teksSumber}>{fotos.length ? 'Tambah foto' : 'Upload foto'}</Text>
            </TouchableOpacity>
          ) : null}
        </View>
        <Text style={[styles.ket, galat.foto ? { color: Colors.danger } : null]}>
          {galat.foto || 'Maks 2 foto. Tap foto untuk crop & menandai Sebelum / Sesudah. Foto Sesudah wajib.'}
        </Text>
      </View>
    </>
  );

  const langkah2 = (
    <>
      <View style={styles.ringkas}>
        <Text style={styles.ringkasLabel}>Kaizen</Text>
        <Text style={styles.ringkasTema} numberOfLines={2}>{form.tema}</Text>
      </View>

      <View style={[gs.rowBetween, { alignItems: 'flex-end' }]}>
        <Text style={styles.judulBagian}>Manfaat</Text>
        <Text style={[styles.hitung, { marginBottom: Spacing.sm }]}>{manfaat.length} ditambahkan</Text>
      </View>
      <View style={styles.kartu}>
        {manfaat.length === 0 ? (
          <Text style={styles.kosongManfaat}>
            Belum ada manfaat. Ceritakan dampak Kaizen ini, misalnya waktu, biaya, atau keselamatan yang membaik.
          </Text>
        ) : (
          kelompokManfaat.map(([kategori, butir]) => {
            const l = ikonKategori(kategori);
            return (
              <TouchableOpacity
                key={kategori ?? 'x'}
                style={styles.kartuManfaat}
                activeOpacity={0.6}
                onPress={() => setSheetKategori(kategori)}
              >
                <View style={[styles.logoManfaat, { backgroundColor: l.warna[1] }]}>
                  <Icon name={l.ikon} size={16} color={Colors.white} />
                </View>
                <Text style={[styles.judulManfaat, gs.flex1]} numberOfLines={1}>{kategoriNama(kategori)}</Text>
                <LencanaAngka jumlah={butir.length} ukuran={24} warna={brand[50]} teks={brand[700]} />
                <Icon name="chevron-right" size={16} color={Colors.textTertiary} />
              </TouchableOpacity>
            );
          })
        )}
      </View>

      <Button
        variant="outline"
        icon="plus"
        label="Tambah manfaat"
        onPress={() => setDraf({ data: { ...MANFAAT_KOSONG, pic: saya }, index: null, galat: {} })}
        block
      />
    </>
  );

  const d = draf?.data;
  const ubahDraf = (k: keyof Manfaat, v: any) =>
    draf && setDraf({ ...draf, data: { ...draf.data, [k]: v }, galat: { ...draf.galat, [k]: '' } });

  return (
    <KeyboardAvoidingView
      style={[gs.screen, { backgroundColor: Colors.white }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
    >
      <View style={styles.langkah}>
        {[
          { n: 1, label: 'Kaizen' },
          { n: 2, label: 'Manfaat' },
        ].map((s) => {
          const on = langkah >= s.n;
          return (
            <View key={s.n} style={gs.flex1}>
              <View style={[styles.batang, on && styles.batangAktif]} />
              <Text style={[styles.teksLangkah, on && styles.teksLangkahAktif]}>
                {s.n}. {s.label}
              </Text>
            </View>
          );
        })}
      </View>

      <ScrollView
        ref={scrollRef}
        contentContainerStyle={styles.isi}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {langkah === 1 ? langkah1 : langkah2}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + Spacing.sm }]}>
        {langkah === 2 ? (
          <Button variant="secondary" icon="arrow-left" onPress={() => setLangkah(1)} disabled={mengirim} accessibilityLabel="Kembali" />
        ) : null}
        <Button variant="secondary" icon="content-save-outline" label="Simpan draf" onPress={simpanDrafKaizen} disabled={mengirim} />
        <Button
          label={langkah === 1 ? 'Lanjut ke Manfaat' : 'Kirim Kaizen'}
          iconRight={langkah === 1 ? 'arrow-right' : 'send'}
          onPress={langkah === 1 ? lanjut : kirim}
          loading={mengirim}
          style={gs.flex1}
        />
      </View>

      <SheetKaryawan
        visible={sheetOrang !== null}
        judul={sheetOrang === 'pelaksana' ? 'Pilih Pelaksana' : sheetOrang === 'saran' ? 'Disarankan Oleh' : 'Pilih PIC'}
        onClose={() => setSheetOrang(null)}
        onPilih={pilihOrang}
      />

      <BottomSheet visible={sheetSumber} onClose={() => setSheetSumber(false)} title="Upload foto">
        {[
          { sumber: 'kamera' as const, ikon: 'camera-plus-outline', label: 'Ambil dari kamera' },
          { sumber: 'galeri' as const, ikon: 'image', label: `Pilih dari galeri${fotos.length === 0 ? ' (maks 2)' : ''}` },
        ].map((o) => (
          <TouchableOpacity
            key={o.sumber}
            style={styles.barisSumber}
            activeOpacity={0.6}
            onPress={() => {
              setSheetSumber(false);
              // Beri waktu sheet tertutup sebelum picker sistem terbuka.
              setTimeout(() => tambahFoto(o.sumber), 250);
            }}
          >
            <View style={styles.ikonSumber}>
              <Icon name={o.ikon} size={18} color={brand[700]} />
            </View>
            <Text style={styles.teksBarisSumber}>{o.label}</Text>
          </TouchableOpacity>
        ))}
      </BottomSheet>

      <EditorFoto
        visible={editor !== null}
        fotos={editor?.fotos ?? []}
        awal={editor?.awal ?? 0}
        onBatal={() => setEditor(null)}
        onSelesai={(hasil) => {
          setFotos(hasil);
          setEditor(null);
          setGalat((g) => ({ ...g, foto: '' }));
        }}
      />

      <BottomSheet
        visible={sheetKategori !== undefined && draf === null && butirSheet.length > 0}
        onClose={() => setSheetKategori(undefined)}
        title={`Manfaat ${kategoriNama(sheetKategori ?? null)}`}
        subtitle={`${butirSheet.length} manfaat ditambahkan`}
      >
        <SliderManfaat
          key={String(sheetKategori)}
          items={butirSheet.map(({ m, i }) => {
            const l = ikonKategori(m.kategori);
            return {
              ikon: l.ikon,
              warna: l.warna[2],
              tipe: m.pelaksanaan,
              hemat: m.hemat,
              sebelum: m.sebelum,
              sesudah: m.sesudah,
              area: m.area,
              pic: m.pic?.nama ?? null,
              aksi: (
                <View style={styles.aksiButir}>
                  <Button
                    variant="outline"
                    icon="pencil"
                    label="Ubah"
                    onPress={() => setDraf({ data: m, index: i, galat: {} })}
                    style={gs.flex1}
                  />
                  <Button variant="dangerOutline" icon="delete-outline" onPress={() => hapusManfaat(i)} accessibilityLabel="Hapus manfaat" />
                </View>
              ),
            };
          })}
        />
      </BottomSheet>

      <BottomSheet
        visible={draf !== null && sheetOrang === null}
        onClose={() => setDraf(null)}
        title={draf?.index === null ? 'Tambah Manfaat' : 'Ubah Manfaat'}
        penuh
      >
        {d && draf ? (
          <View style={styles.isiSheet}>
            <View style={styles.field}>
              <Text style={styles.label}>
                Kategori manfaat<Text style={styles.wajib}> *</Text>
              </Text>
              <View style={styles.chips}>
                {opsi.kategori.map((k) => {
                  const on = d.kategori === k.id;
                  const l = LENCANA[k.kategori];
                  return (
                    <TouchableOpacity
                      key={k.id}
                      style={[styles.chip, styles.chipIkon, on && { backgroundColor: l?.warna[1] ?? Colors.textPrimary, borderColor: l?.warna[1] ?? Colors.textPrimary }]}
                      onPress={() => ubahDraf('kategori', k.id)}
                    >
                      {l ? <Icon name={l.ikon} size={14} color={on ? Colors.white : l.warna[2]} /> : null}
                      <Text style={[styles.teksChip, on && styles.teksChipAktif]}>{k.kategori}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
              {draf.galat.kategori ? <Text style={styles.galat}>{draf.galat.kategori}</Text> : null}
            </View>
            <Kolom label="Kondisi sebelum" wajib maks={255} placeholder="Bagaimana kondisinya sebelum Kaizen?" value={d.sebelum} onChangeText={(v) => ubahDraf('sebelum', v)} galat={draf.galat.sebelum} />
            <Kolom label="Hasil sesudah" wajib maks={255} placeholder="Bagaimana hasilnya sesudah Kaizen?" value={d.sesudah} onChangeText={(v) => ubahDraf('sesudah', v)} galat={draf.galat.sesudah} />
            <Kolom label="Penghematan yang dihasilkan" wajib maks={255} placeholder="Contoh: Rp 2 juta/bulan, 15 menit/shift" value={d.hemat} onChangeText={(v) => ubahDraf('hemat', v)} galat={draf.galat.hemat} />
            <View style={styles.field}>
              <Text style={styles.label}>Pelaksanaan</Text>
              <View style={styles.segmen}>
                {(['Internal', 'Eksternal'] as const).map((p) => {
                  const on = d.pelaksanaan === p;
                  return (
                    <TouchableOpacity key={p} style={[styles.ruas, on && styles.ruasAktif]} onPress={() => ubahDraf('pelaksanaan', p)}>
                      <Text style={[styles.teksRuas, on && styles.teksRuasAktif]}>
                        {p === 'Internal' ? 'Dalam perusahaan' : 'Luar perusahaan'}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
            <Kolom label="Area / tempat" wajib maks={255} placeholder="Nama area atau tempat Kaizen" value={d.area} onChangeText={(v) => ubahDraf('area', v)} galat={draf.galat.area} />
            <BarisOrang label="PIC area setelah Kaizen" wajib orang={d.pic} galat={draf.galat.pic} onPilih={() => setSheetOrang('pic')} />
            <Button label={draf.index === null ? 'Tambahkan' : 'Simpan perubahan'} onPress={simpanDraf} block />
          </View>
        ) : null}
      </BottomSheet>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  langkah: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
    backgroundColor: Colors.white,
  },
  batang: {
    height: 4,
    borderRadius: Spacing.radius.full,
    backgroundColor: slate[200],
  },
  batangAktif: {
    backgroundColor: Colors.primary,
  },
  teksLangkah: {
    marginTop: 6,
    fontSize: 12,
    fontFamily: fonts.semibold,
    color: Colors.textTertiary,
  },
  teksLangkahAktif: {
    color: Colors.textPrimary,
  },
  isi: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  isiSheet: {
    paddingHorizontal: Spacing.lg,
  },
  judulBagian: {
    fontSize: 12,
    fontFamily: fonts.semibold,
    color: Colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: Spacing.sm,
  },
  // Bagian formulir langsung di atas latar putih layar, tanpa kartu.
  kartu: {
    marginBottom: Spacing.lg,
  },
  field: {
    marginBottom: Spacing.md,
  },
  label: {
    fontSize: ukuranIsi,
    fontFamily: fonts.medium,
    color: Colors.textPrimary,
    marginBottom: 6,
  },
  wajib: {
    color: Colors.danger,
  },
  opsional: {
    color: Colors.textTertiary,
    fontFamily: fonts.regular,
  },
  hitung: {
    fontSize: 12,
    fontFamily: fonts.regular,
    color: Colors.textTertiary,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Spacing.radius.md,
    ...Spacing.curve,
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    fontSize: ukuranIsi,
    fontFamily: fonts.regular,
    color: Colors.textPrimary,
    backgroundColor: slate[50],
    ...inputReset,
  },
  textArea: {
    minHeight: 84,
    textAlignVertical: 'top',
  },
  inputGalat: {
    borderColor: Colors.danger,
  },
  galat: {
    marginTop: 4,
    fontSize: 12,
    fontFamily: fonts.regular,
    color: Colors.danger,
  },
  orang: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Spacing.radius.md,
    ...Spacing.curve,
    backgroundColor: slate[50],
  },
  ikonCari: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  namaOrang: {
    fontSize: ukuranIsi,
    fontFamily: fonts.semibold,
    color: Colors.textPrimary,
  },
  nikOrang: {
    fontSize: 12,
    fontFamily: fonts.regular,
    color: Colors.textTertiary,
  },
  placeholderOrang: {
    fontSize: ukuranIsi,
    fontFamily: fonts.regular,
    color: Colors.placeholder,
  },
  ganti: {
    fontSize: ukuranIsi,
    fontFamily: fonts.semibold,
    color: brand[700],
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  chip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: Spacing.radius.full,
    ...Spacing.curve,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
  },
  chipIkon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  chipAktif: {
    backgroundColor: Colors.textPrimary,
    borderColor: Colors.textPrimary,
  },
  teksChip: {
    fontSize: ukuranIsi,
    fontFamily: fonts.medium,
    color: Colors.textSecondary,
  },
  teksChipAktif: {
    color: Colors.white,
    fontFamily: fonts.semibold,
  },
  plant: {
    gap: 6,
    marginBottom: Spacing.sm,
  },
  teksPlant: {
    fontSize: 12,
    fontFamily: fonts.regular,
    color: Colors.textTertiary,
  },
  gridFoto: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  ubinFoto: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: Spacing.radius.md,
    ...Spacing.curve,
    overflow: 'hidden',
    backgroundColor: slate[100],
  },
  ubinKosong: {
    aspectRatio: undefined,
    height: 88,
    flexDirection: 'row',
  },
  ubinTambah: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: brand[200],
    backgroundColor: brand[50],
  },
  gambar: {
    width: '100%',
    height: '100%',
  },
  tagFoto: {
    position: 'absolute',
    left: 6,
    bottom: 6,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: Spacing.radius.full,
    ...Spacing.curve,
    backgroundColor: 'rgba(15,23,42,0.75)',
  },
  teksTag: {
    fontSize: 12,
    fontFamily: fonts.semibold,
    color: Colors.white,
  },
  hapusFoto: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  barisSumber: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  ikonSumber: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: brand[50],
  },
  teksBarisSumber: {
    fontSize: 12,
    fontFamily: fonts.semibold,
    color: Colors.textPrimary,
  },
  teksSumber: {
    fontSize: ukuranIsi,
    fontFamily: fonts.semibold,
    color: brand[700],
  },
  ket: {
    marginTop: Spacing.sm,
    marginBottom: Spacing.sm,
    fontSize: 12,
    fontFamily: fonts.regular,
    color: Colors.textTertiary,
  },
  ringkas: {
    marginBottom: Spacing.lg,
  },
  ringkasLabel: {
    fontSize: 12,
    fontFamily: fonts.regular,
    color: Colors.textTertiary,
  },
  ringkasTema: {
    marginTop: 2,
    fontSize: 12,
    fontFamily: fonts.semibold,
    color: Colors.textPrimary,
  },
  kosongManfaat: {
    paddingVertical: Spacing.md,
    fontSize: ukuranIsi,
    fontFamily: fonts.regular,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  kartuManfaat: {
    ...gs.card,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  aksiButir: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
  logoManfaat: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  judulManfaat: {
    fontSize: 12,
    fontFamily: fonts.semibold,
    color: Colors.textPrimary,
  },
  segmen: {
    flexDirection: 'row',
    padding: 3,
    borderRadius: Spacing.radius.full,
    ...Spacing.curve,
    backgroundColor: slate[100],
  },
  ruas: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 7,
    borderRadius: Spacing.radius.full,
    ...Spacing.curve,
  },
  ruasAktif: {
    backgroundColor: Colors.white,
  },
  teksRuas: {
    fontSize: ukuranIsi,
    fontFamily: fonts.medium,
    color: Colors.textSecondary,
  },
  teksRuasAktif: {
    color: Colors.textPrimary,
    fontFamily: fonts.semibold,
  },
  footer: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.borderSubtle,
  },
  gagal: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
  },
});

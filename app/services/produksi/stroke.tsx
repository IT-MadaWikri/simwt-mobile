/**
 * Form Pencapaian Produksi untuk satu dies — setara halaman input stroke di web, dibagi menjadi 4 langkah
 * (Pelaksana → Produksi → Capaian → Stroke). Dibuka dari alur scan (`pilih`) dengan `nomor` = dies dan
 * `mesin` = nomor mesin. Isian bisa disimpan sebagai draf di perangkat: tersimpan otomatis saat keluar
 * dengan isian terisi, dan dilanjutkan dari daftar draf (`draf.tsx`, param `draf`). Logika di
 * `useFormProduksi`.
 */
import React, { useEffect, useRef, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AppBar from '../../../src/components/common/AppBar';
import Button from '../../../src/components/common/Button';
import Icon from '../../../src/components/common/Icon';
import FieldPilihan from '../../../src/components/common/FieldPilihan';
import FieldTeks from '../../../src/components/common/FieldTeks';
import SheetPilihan from '../../../src/components/common/SheetPilihan';
import SheetCari, { ItemCari } from '../../../src/components/common/SheetCari';
import SheetMenuDraf from '../../../src/components/produksi/SheetMenuDraf';
import SheetSimpanDraf from '../../../src/components/produksi/SheetSimpanDraf';
import { useAuth } from '../../../src/contexts/AuthContext';
import { drafProduksi } from '../../../src/utils/drafProduksi';
import { SkeletonForm } from '../../../src/components/common/Skeleton';
import { dialog } from '../../../src/components/common/AppDialog';
import Colors, { slate } from '../../../constants/Colors';
import Spacing from '../../../constants/Spacing';
import { fonts, ukuranIsi } from '../../../constants/Typography';
import { gs } from '../../../constants/GlobalStyles';
import { DAFTAR_SHIFT, LANGKAH, useFormProduksi } from '../../../src/hooks/useFormProduksi';
import { usePencarian } from '../../../src/hooks/usePencarian';
import { useTinggiKeyboard } from '../../../src/hooks/useTinggiKeyboard';
import { produksiService } from '../../../src/services/produksiService';
import { JenisCariProduksi, KaryawanCari, PartCari } from '../../../src/types/produksi';

type Sheet = 'operator' | 'leader' | 'shift' | 'sub' | 'part' | 'proses' | 'subProses' | 'gudang' | 'material' | 'alasan' | null;

/** Sheet pencarian jarak jauh → jenis pencarian di server. */
const JENIS_CARI: Partial<Record<NonNullable<Sheet>, JenisCariProduksi>> = {
  operator: 'karyawan',
  leader: 'karyawan',
  part: 'part',
  material: 'material',
  alasan: 'alasan-ng',
};

const TEKS_CARI: Partial<Record<NonNullable<Sheet>, { judul: string; placeholder: string }>> = {
  operator: { judul: 'Pilih Operator', placeholder: 'Ketik nama atau NIK' },
  leader: { judul: 'Pilih Leader', placeholder: 'Ketik nama atau NIK' },
  part: { judul: 'Pilih Part', placeholder: 'Ketik kode atau nama part' },
  material: { judul: 'Pilih Material', placeholder: 'Ketik kode atau nama material' },
  alasan: { judul: 'Alasan NG', placeholder: 'Pilih atau ketik alasan NG' },
};

const format = (n: number) => n.toLocaleString('id-ID', { maximumFractionDigits: 2 });
/** Daftar teks → opsi `SheetPilihan` (id = indeks). */
const opsiDari = (daftar: string[]) => daftar.map((label, id) => ({ id, label }));

export default function StrokeScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const tinggiKeyboard = useTinggiKeyboard();
  // `draf`: id draf yang dibuka dari daftar draf; tanpa itu form baru.
  const { nomor, mesin, draf } = useLocalSearchParams<{ nomor: string; mesin?: string; draf?: string }>();
  const f = useFormProduksi(nomor, mesin || null, draf);
  const [sheet, setSheet] = useState<Sheet>(null);
  // Langkah yang sudah dicoba dilanjutkan: galatnya baru tampil setelah itu.
  const [diperiksa, setDiperiksa] = useState<number[]>([]);
  // Baris alasan NG yang sedang diisi sebelum ditekan "Tambah".
  const [alasanBaru, setAlasanBaru] = useState('');
  const [qtyBaru, setQtyBaru] = useState('');
  const scrollRef = useRef<ScrollView>(null);

  const jenisCari = sheet ? JENIS_CARI[sheet] : undefined;
  const cari = usePencarian<any>((q) => produksiService.cari(jenisCari!, q), !!jenisCari, jenisCari === 'alasan-ng' ? 0 : 2);

  // Sheet baru ditutup: hasil lama baru dibersihkan `usePencarian` satu render kemudian, jangan dipetakan.
  const itemCari: ItemCari[] = (jenisCari ? (cari.hasil as any[]) : []).map((h) => {
    if (jenisCari === 'karyawan') {
      const k = h as KaryawanCari;
      return { kunci: k.nik, judul: k.nama_lengkap, avatar: k.nama_lengkap, sub: [k.nik, k.leader ? `Leader: ${k.leader}` : null].filter(Boolean).join(' · ') };
    }
    if (jenisCari === 'alasan-ng') return { kunci: String(h), judul: String(h) };
    // Part/material: baris pertama nama, baris kedua nomor (kode). Server lama hanya mengirim `label` "kode - nama".
    const p = h as PartCari;
    const pisah = p.label.indexOf(' - ');
    return {
      kunci: String(p.id),
      judul: p.nama ?? (pisah >= 0 ? p.label.slice(pisah + 3) : p.label),
      sub: p.kode ?? (pisah >= 0 ? p.label.slice(0, pisah) : undefined),
      ikon: 'box',
    };
  });

  // Draf: keluar dengan isian terisi menyimpannya otomatis; dibuka dari daftar draf.
  const selesai = useRef(false);
  const kondisi = useRef({ langkah: f.langkah, kotor: f.kotor, simpanDraf: f.simpanDraf });
  kondisi.current = { langkah: f.langkah, kotor: f.kotor, simpanDraf: f.simpanDraf };
  useEffect(
    () =>
      navigation.addListener('beforeRemove', (e) => {
        if (selesai.current) return;
        // Kembali dari langkah 2+ = ke langkah sebelumnya.
        if (kondisi.current.langkah > 0) {
          e.preventDefault();
          f.setLangkah(kondisi.current.langkah - 1);
          return;
        }
        if (!kondisi.current.kotor) return;
        e.preventDefault();
        kondisi.current.simpanDraf().catch(() => {}).finally(() => {
          selesai.current = true;
          navigation.dispatch(e.data.action);
        });
      }),
    [navigation]
  );

  const pilihDariCari = (kunci: string) => {
    const hasil = cari.hasil as any[];
    if (sheet === 'operator' || sheet === 'leader') {
      const k = hasil.find((h: KaryawanCari) => h.nik === kunci);
      if (!k) return;
      if (sheet === 'operator') f.pilihOperator(k);
      else f.ubah('leader', k.nama_lengkap);
    } else if (sheet === 'part' || sheet === 'material') {
      const p = hasil.find((h: PartCari) => String(h.id) === kunci);
      if (!p) return;
      if (sheet === 'part') f.pilihPart(p);
      else f.ubah('material', p);
    } else if (sheet === 'alasan') {
      setAlasanBaru(kunci);
    }
  };

  const tambahAlasan = () => {
    if (!alasanBaru.trim() || !/^\d+$/.test(qtyBaru.trim()) || Number(qtyBaru) < 1) {
      dialog.alert('Alasan NG', 'Pilih atau ketik alasan NG dan isi qty-nya (angka bulat, minimal 1).');
      return;
    }
    f.tambahAlasanNg(alasanBaru, qtyBaru.trim());
    setAlasanBaru('');
    setQtyBaru('');
  };

  /** Pintasan ke beranda; bila ada isian, minta konfirmasi karena perubahan tidak disimpan (draf harus disimpan manual). */
  const keBeranda = async () => {
    if (f.kotor) {
      const keluar = await dialog.confirm({
        title: 'Kembali ke beranda?',
        message: 'Perubahan yang belum disimpan tidak akan tersimpan. Untuk menyimpannya, pilih "Simpan ke Draft" di Menu Draft.',
        confirmText: 'Ke Beranda',
        cancelText: 'Tetap di sini',
        destructive: true,
      });
      if (!keluar) return;
    }
    selesai.current = true;
    router.dismissTo('/(tabs)');
  };

  const keLangkah = (n: number) => {
    f.setLangkah(n);
    scrollRef.current?.scrollTo({ y: 0, animated: false });
  };

  const lanjut = () => {
    if (Object.keys(f.galatLangkah(f.langkah)).length > 0) {
      setDiperiksa((d) => (d.includes(f.langkah) ? d : [...d, f.langkah]));
      return;
    }
    keLangkah(f.langkah + 1);
  };

  // Menu draf: Simpan ke Draft (isi judul/nama/shift di sheet kedua) dan Buka Daftar Draft. Sheet menu
  // ditutup dulu, sheet berikutnya dibuka setelah animasinya selesai supaya dua sheet tidak bertumpuk.
  const [sheetMenu, setSheetMenu] = useState(false);
  const [sheetSimpan, setSheetSimpan] = useState(false);
  const [menyimpanDraf, setMenyimpanDraf] = useState(false);
  const [jumlahDraf, setJumlahDraf] = useState(0);

  const bukaMenuDraf = () => {
    drafProduksi.daftar(user?.nik).then((d) => setJumlahDraf(d.length));
    setSheetMenu(true);
  };

  const bukaSheetSimpan = () => {
    setSheetMenu(false);
    if (!f.kotor) {
      dialog.alert('Belum Ada Isian', 'Isi dulu sesuatu sebelum menyimpan draf.');
      return;
    }
    setTimeout(() => setSheetSimpan(true), 250);
  };

  const bukaDaftarDraf = () => {
    setSheetMenu(false);
    router.push('/services/produksi/draf' as any);
  };

  const simpanDraf = async () => {
    setMenyimpanDraf(true);
    try {
      await f.simpanDraf();
    } catch {
      dialog.alert('Gagal Menyimpan', 'Draf tidak bisa disimpan di perangkat ini.', 'danger');
      return;
    } finally {
      setMenyimpanDraf(false);
    }
    setSheetSimpan(false);
    selesai.current = true;
    await dialog.alert('Draf Tersimpan', 'Lanjutkan kapan saja lewat Menu Draft di form ini atau daftar draft.', 'success');
    router.back();
  };

  const kirim = async () => {
    const bermasalah = LANGKAH.findIndex((_, i) => Object.keys(f.galatLangkah(i)).length > 0);
    if (bermasalah !== -1) {
      setDiperiksa(LANGKAH.map((_, i) => i));
      keLangkah(bermasalah);
      dialog.alert('Isian Belum Lengkap', `Lengkapi dulu langkah ${bermasalah + 1} (${LANGKAH[bermasalah].judul}).`);
      return;
    }
    const yakin = await dialog.confirm({
      title: 'Simpan Pencapaian Produksi?',
      message: `${master?.dies.alias || master?.dies.asset_name}: OK ${form.jumlahOk}, NG ${form.jumlahNg}, stroke hari ini ${form.strokeHariIni}. Stroke dies akan bertambah dan data tidak bisa diubah dari aplikasi.`,
      confirmText: 'Ya, Simpan',
      cancelText: 'Periksa lagi',
    });
    if (!yakin) return;
    const akumulasi = await f.kirim();
    if (akumulasi !== null) {
      selesai.current = true;
      await dialog.alert('Tersimpan', `Pencapaian Produksi berhasil disimpan. Stroke dies sekarang ${format(akumulasi)}.`, 'success');
      // Pop ke beranda (tab index). `replace` dari sini bisa mendarat di tab scan, tab terakhir yang aktif.
      router.dismissTo('/(tabs)');
    }
  };

  if (f.memuat) {
    return (
      <View style={[gs.screen, { backgroundColor: Colors.white }]}>
        <AppBar judul="Pencapaian Produksi" />
        <SkeletonForm />
      </View>
    );
  }

  if (f.errorMuat || !f.master) {
    return (
      <View style={[gs.screen, gs.centerFill, { backgroundColor: Colors.white }]}>
        <AppBar judul="Pencapaian Produksi" />
        <Text style={gs.emptyTitle}>Gagal memuat formulir</Text>
        <Text style={gs.emptyText}>{f.errorMuat}</Text>
        <Button label="Coba lagi" onPress={f.muatMaster} style={{ marginTop: Spacing.lg }} />
      </View>
    );
  }

  const { form, master, langkah } = f;
  const g = diperiksa.includes(langkah) ? f.galat : {};
  const terakhir = langkah === LANGKAH.length - 1;
  const strokeAwal = Number(master.dies.asset_stroke ?? 0) || 0;
  const subDariMesin = !!master.sub_departemen_mesin && form.subDepartemen === master.sub_departemen_mesin;
  const namaGudang = master.gudang.find((x) => x.kode === form.kodeGudang);

  const kartuAset = (judul: string, a: { alias: string | null; asset_name: string; asset_number: string }) => (
    <>
      <Text style={styles.judulBagian}>{judul}</Text>
      <View style={[styles.kartuAset, { marginBottom: Spacing.lg }]}>
        <Text style={styles.namaAset} numberOfLines={2}>{a.alias || a.asset_name}</Text>
        {a.alias ? <Text style={styles.nomorAset} numberOfLines={1}>{a.asset_name}</Text> : null}
        <Text style={styles.nomorAset}>{a.asset_number}</Text>
      </View>
    </>
  );

  const barisRekap = (label: string, nilai: string) => (
    <View style={styles.itemRekap}>
      <Text style={styles.labelRekap}>{label}</Text>
      <Text style={styles.nilaiRekap}>{nilai}</Text>
    </View>
  );

  const langkah1 = (
    <>
      {master.mesin ? kartuAset('Mesin', master.mesin) : null}
      {kartuAset('Dies', master.dies)}

      <Text style={styles.judulBagian}>Pelaksana</Text>
      <View style={styles.bagian}>
        <FieldPilihan label="Nama Operator" wajib placeholder="Ketik nama atau NIK" nilai={form.operator || null} galat={g.operator} onPress={() => setSheet('operator')} />
        <FieldPilihan label="Shift" wajib nilai={form.shift ? `Shift ${form.shift}` : null} galat={g.shift} onPress={() => setSheet('shift')} />
        <FieldPilihan label="Departemen" nilai={master.departemen} onPress={() => {}} nonaktif />
        <FieldPilihan label="Sub Departemen" wajib nilai={form.subDepartemen || null} galat={g.subDepartemen} onPress={() => setSheet('sub')} />
        {subDariMesin ? <Text style={styles.ketRapat}>Terisi otomatis dari data mesin.</Text> : null}
        <FieldPilihan label="Nama Leader" wajib placeholder="Ketik nama atau NIK" nilai={form.leader || null} galat={g.leader} onPress={() => setSheet('leader')} />
        <Text style={styles.ketRapat}>Terisi otomatis dari pemetaan leader operator. Kalau belum ada, cari dari data karyawan.</Text>
      </View>
    </>
  );

  const langkah2 = (
    <>
      <Text style={styles.judulBagian}>Produksi</Text>
      <View style={styles.bagian}>
        <FieldPilihan label="Part yang Sedang Jalan" wajib placeholder="Ketik kode atau nama part" nilai={form.part?.label ?? null} galat={g.part} onPress={() => setSheet('part')} />
        <FieldPilihan label="Proses Part yang Sedang Jalan" wajib nilai={form.proses || null} galat={g.proses} onPress={() => setSheet('proses')} />
        <Text style={styles.ketRapat}>{f.petunjukProses}</Text>
        <FieldPilihan label="Sub Proses" placeholder="Pilih sub proses (opsional)" nilai={form.subProses || null} onPress={() => setSheet('subProses')} />
        {master.gudang.length > 0 ? (
          <FieldPilihan
            label="Gudang"
            placeholder="Pilih gudang (opsional)"
            nilai={namaGudang ? `${namaGudang.kode} — ${namaGudang.nama}` : null}
            onPress={() => setSheet('gudang')}
          />
        ) : null}
      </View>
    </>
  );

  const langkah3 = (
    <>
      <Text style={styles.judulBagian}>Capaian</Text>
      <View style={styles.bagian}>
        <View style={styles.baris}>
          <View style={gs.flex1}>
            <FieldTeks label="Planning Hari Ini" wajib nilai={form.planning} onUbah={(v) => f.ubah('planning', v)} keyboardType="number-pad" placeholder="0" galat={g.planning} />
          </View>
          <View style={gs.flex1}>
            <FieldTeks label="Cap/Jam" nilai={form.capPerJam} onUbah={(v) => f.ubah('capPerJam', v)} keyboardType="number-pad" placeholder="0" galat={g.capPerJam} />
          </View>
        </View>
        <View style={styles.baris}>
          <View style={gs.flex1}>
            <FieldTeks label="Jumlah OK" wajib nilai={form.jumlahOk} onUbah={(v) => f.ubah('jumlahOk', v)} keyboardType="number-pad" placeholder="0" galat={g.jumlahOk} />
          </View>
          <View style={gs.flex1}>
            <FieldTeks label="Jumlah NG" wajib nilai={form.jumlahNg} onUbah={(v) => f.ubah('jumlahNg', v)} keyboardType="number-pad" placeholder="0" galat={g.jumlahNg} />
          </View>
        </View>
        <View style={styles.ringkasan}>
          <View style={gs.flex1}>
            <Text style={styles.labelRingkas}>Total Produksi</Text>
            <Text style={styles.nilaiRingkas}>{format(f.total)}</Text>
          </View>
          <View style={gs.flex1}>
            <Text style={styles.labelRingkas}>AR (OK − NG)</Text>
            <Text style={styles.nilaiRingkas}>{f.ar ? `${format(f.ar.netto)}%` : '-'}</Text>
          </View>
          <View style={gs.flex1}>
            <Text style={styles.labelRingkas}>AR (OK)</Text>
            <Text style={styles.nilaiRingkas}>{f.ar ? `${format(f.ar.ok)}%` : '-'}</Text>
          </View>
        </View>
        <Text style={styles.ketRapat}>Total = OK + NG. AR = aktual ÷ planning hari ini × 100%, dihitung otomatis.</Text>
      </View>

      <Text style={styles.judulBagian}>Material</Text>
      <View style={styles.bagian}>
        <FieldPilihan label="Supply Material" placeholder="Ketik kode atau nama material" nilai={form.material?.label ?? null} galat={g.material} onPress={() => setSheet('material')} />
        {form.material ? (
          <>
            <FieldTeks label="Qty Supply Material" wajib nilai={form.materialQty} onUbah={(v) => f.ubah('materialQty', v)} keyboardType="decimal-pad" placeholder="0" galat={g.materialQty} />
            <TouchableOpacity onPress={() => { f.ubah('material', null); f.ubah('materialQty', ''); }} style={styles.lepas}>
              <Text style={styles.teksLepas}>Lepas material</Text>
            </TouchableOpacity>
          </>
        ) : null}
      </View>

      <Text style={styles.judulBagian}>Alasan NG</Text>
      <View style={styles.bagian}>
        {form.alasanNg.map((b, i) => (
          <View key={`${b.alasan}-${i}`} style={styles.barisNg}>
            <Text style={[styles.teksNg, gs.flex1]} numberOfLines={2}>{b.alasan}</Text>
            <Text style={styles.qtyNg}>{b.qty}</Text>
            <TouchableOpacity onPress={() => f.hapusAlasanNg(i)} hitSlop={8} accessibilityLabel="Hapus alasan NG">
              <Icon name="close-circle" size={18} color={Colors.textTertiary} />
            </TouchableOpacity>
          </View>
        ))}
        <FieldPilihan label="Alasan NG" placeholder="Pilih atau ketik alasan NG" nilai={alasanBaru || null} onPress={() => setSheet('alasan')} />
        <FieldTeks label="Qty NG" nilai={qtyBaru} onUbah={setQtyBaru} keyboardType="number-pad" placeholder="0" />
        <Button variant="outline" icon="plus" label="Tambah Alasan NG" onPress={tambahAlasan} block />
        {/* Setelah tombol (tanpa jarak bawah), jadi `ketRapat` yang bermargin negatif harus dinetralkan. */}
        <Text style={[styles.ketRapat, { marginTop: Spacing.sm }]}>Alasan baru yang diketik tersimpan dan bisa dipilih lagi lain kali.</Text>
      </View>
    </>
  );

  const langkah4 = (
    <>
      <Text style={styles.judulBagian}>Stroke</Text>
      <View style={styles.bagian}>
        <View style={styles.ringkasan}>
          <View style={gs.flex1}>
            <Text style={styles.labelRingkas}>Akumulasi Saat Ini</Text>
            <Text style={styles.nilaiRingkas}>{format(strokeAwal)}</Text>
          </View>
          <View style={gs.flex1}>
            <Text style={styles.labelRingkas}>Akumulasi + Hari Ini</Text>
            <Text style={styles.nilaiRingkas}>{format(f.akumulasi)}</Text>
          </View>
        </View>
        <FieldTeks label="Stroke (Hari Ini)" wajib nilai={form.strokeHariIni} onUbah={(v) => f.ubah('strokeHariIni', v)} keyboardType="decimal-pad" placeholder="0" galat={g.strokeHariIni} />
        <Text style={styles.ketRapat}>Jumlah stroke yang berjalan hari ini. Akumulasi dies bertambah otomatis setelah disimpan.</Text>
      </View>

      <Text style={styles.judulBagian}>Keterangan</Text>
      <View style={styles.bagian}>
        <FieldTeks label="Keterangan" nilai={form.keterangan} onUbah={(v) => f.ubah('keterangan', v)} multiline placeholder="Catatan tambahan (opsional)" />
      </View>

      <Text style={styles.judulBagian}>Ringkasan</Text>
      <View style={styles.bagian}>
        {barisRekap('Dies', master.dies.alias || master.dies.asset_name)}
        {master.mesin ? barisRekap('Mesin', master.mesin.alias || master.mesin.asset_name) : null}
        {barisRekap('Operator', `${form.operator || '-'} · Shift ${form.shift ?? '-'}`)}
        {barisRekap('Part', form.part?.label ?? '-')}
        {barisRekap('Proses', form.proses || '-')}
        <View style={styles.angkaRekap}>
          {[
            { label: 'OK', nilai: format(Number(form.jumlahOk) || 0) },
            { label: 'NG', nilai: format(Number(form.jumlahNg) || 0) },
            { label: 'Total', nilai: format(f.total) },
            { label: 'AR', nilai: f.ar ? `${format(f.ar.netto)}%` : '-' },
          ].map((a) => (
            <View key={a.label} style={gs.flex1}>
              <Text style={styles.labelRekap}>{a.label}</Text>
              <Text style={styles.angka}>{a.nilai}</Text>
            </View>
          ))}
        </View>
      </View>

      {f.galatServer ? (
        <View style={styles.galatServer} accessibilityRole="alert">
          <Icon name="alert-circle" size={18} color={Colors.danger} />
          <Text style={[gs.bodySm, gs.flex1, { color: Colors.dangerDark }]}>{f.galatServer}</Text>
        </View>
      ) : null}
    </>
  );

  return (
    // Diangkat setinggi keyboard (bukan KeyboardAvoidingView, yang meleset di Android edge-to-edge).
    <View style={[gs.screen, { backgroundColor: Colors.white, paddingBottom: tinggiKeyboard }]}>
      <AppBar judul="Pencapaian Produksi" />

      <View style={styles.langkah}>
        {LANGKAH.map((s, i) => {
          const on = langkah >= i;
          return (
            <View key={s.judul} style={gs.flex1}>
              <View style={[styles.batang, on && styles.batangAktif]} />
              <Text style={[styles.teksLangkah, on && styles.teksLangkahAktif]} numberOfLines={1}>
                {i + 1}. {s.judul}
              </Text>
            </View>
          );
        })}
      </View>

      <ScrollView ref={scrollRef} contentContainerStyle={styles.isi} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        {[langkah1, langkah2, langkah3, langkah4][langkah]}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: (tinggiKeyboard ? 0 : insets.bottom) + Spacing.sm }]}>
        <Button variant="secondary" icon="home" onPress={keBeranda} disabled={f.mengirim} accessibilityLabel="Ke beranda" />
        <Button variant="secondary" icon="layout-grid-circles" onPress={bukaMenuDraf} disabled={f.mengirim} accessibilityLabel="Menu Draft" />
        <Button
          label={terakhir ? 'Simpan' : 'Lanjut'}
          iconRight={terakhir ? 'send' : 'arrow-right'}
          onPress={terakhir ? kirim : lanjut}
          loading={f.mengirim}
          style={gs.flex1}
        />
      </View>

      <SheetMenuDraf visible={sheetMenu} jumlahDraf={jumlahDraf} onSimpan={bukaSheetSimpan} onBukaDaftar={bukaDaftarDraf} onClose={() => setSheetMenu(false)} />
      <SheetSimpanDraf
        visible={sheetSimpan}
        judul={f.metaDraf.judul}
        nama={f.metaDraf.nama}
        shift={f.metaDraf.shift}
        daftarShift={DAFTAR_SHIFT}
        judulBawaan={`Draf ${master.dies.alias || master.dies.asset_name}`}
        menyimpan={menyimpanDraf}
        onUbahJudul={(v) => f.setMetaDraf((m) => ({ ...m, judul: v }))}
        onUbahNama={(v) => f.setMetaDraf((m) => ({ ...m, nama: v }))}
        onPilihShift={(s) => f.setMetaDraf((m) => ({ ...m, shift: m.shift === s ? null : s }))}
        onSimpan={simpanDraf}
        onClose={() => setSheetSimpan(false)}
      />

      <SheetCari
        visible={!!jenisCari && sheet !== null}
        judul={(sheet && TEKS_CARI[sheet]?.judul) || ''}
        placeholder={(sheet && TEKS_CARI[sheet]?.placeholder) || ''}
        q={cari.q}
        onChangeQ={cari.setQ}
        item={itemCari}
        memuat={cari.memuat}
        gagal={cari.gagal}
        minHuruf={jenisCari === 'alasan-ng' ? 0 : 2}
        izinkanBaru={sheet === 'alasan'}
        onPilih={pilihDariCari}
        onClose={() => setSheet(null)}
      />

      <SheetPilihan visible={sheet === 'shift'} judul="Shift" opsi={DAFTAR_SHIFT.map((s) => ({ id: s, label: `Shift ${s}` }))} terpilih={form.shift} onPilih={(id) => f.ubah('shift', id)} onClose={() => setSheet(null)} />
      <SheetPilihan
        visible={sheet === 'sub'}
        judul="Sub Departemen"
        opsi={opsiDari(master.sub_departemen)}
        terpilih={master.sub_departemen.indexOf(form.subDepartemen)}
        onPilih={(id) => f.ubah('subDepartemen', master.sub_departemen[id])}
        onClose={() => setSheet(null)}
      />
      <SheetPilihan
        visible={sheet === 'proses'}
        judul="Proses Part"
        opsi={opsiDari(f.opsiProses)}
        terpilih={f.opsiProses.indexOf(form.proses)}
        onPilih={(id) => f.ubah('proses', f.opsiProses[id])}
        onClose={() => setSheet(null)}
      />
      <SheetPilihan
        visible={sheet === 'subProses'}
        judul="Sub Proses"
        opsi={opsiDari(master.proses)}
        terpilih={master.proses.indexOf(form.subProses)}
        bolehKosong
        onPilih={(id) => f.ubah('subProses', id === undefined || id === null ? '' : master.proses[id] ?? '')}
        onClose={() => setSheet(null)}
      />
      <SheetPilihan
        visible={sheet === 'gudang'}
        judul="Gudang"
        opsi={master.gudang.map((x, id) => ({ id, label: `${x.kode} — ${x.nama}` }))}
        terpilih={master.gudang.findIndex((x) => x.kode === form.kodeGudang)}
        bolehKosong
        onPilih={(id) => f.ubah('kodeGudang', id === undefined || id === null ? '' : master.gudang[id]?.kode ?? '')}
        onClose={() => setSheet(null)}
      />
    </View>
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
  batang: { height: 4, borderRadius: Spacing.radius.full, backgroundColor: slate[200] },
  batangAktif: { backgroundColor: Colors.primary },
  teksLangkah: { marginTop: 6, fontSize: 12, fontFamily: fonts.semibold, color: Colors.textTertiary },
  teksLangkahAktif: { color: Colors.textPrimary },
  isi: { padding: Spacing.lg, paddingBottom: Spacing.xxl },
  judulBagian: {
    fontSize: 12,
    fontFamily: fonts.semibold,
    color: Colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: Spacing.sm,
  },
  bagian: { marginBottom: Spacing.lg },
  baris: { flexDirection: 'row', gap: Spacing.md },
  kartuAset: {
    padding: Spacing.lg,
    borderRadius: Spacing.radius.xl,
    ...Spacing.curve,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
  },
  namaAset: { fontSize: 12, fontFamily: fonts.bold, color: Colors.textPrimary },
  nomorAset: { marginTop: 2, fontSize: 12, fontFamily: fonts.regular, color: Colors.textSecondary },
  // Ringkasan tanpa kartu/garis: label kecil di atas, nilai tebal di bawahnya; angka hasil sebaris.
  itemRekap: { marginBottom: Spacing.md },
  labelRekap: { fontSize: 12, fontFamily: fonts.regular, color: Colors.textTertiary },
  nilaiRekap: { marginTop: 2, fontSize: ukuranIsi, fontFamily: fonts.semibold, color: Colors.textPrimary },
  angkaRekap: { flexDirection: 'row', gap: Spacing.md, marginTop: Spacing.xs },
  angka: { marginTop: 2, fontSize: ukuranIsi, fontFamily: fonts.bold, color: Colors.textPrimary },
  ketRapat: { marginTop: -Spacing.sm, marginBottom: Spacing.md, fontSize: 12, fontFamily: fonts.regular, color: Colors.textTertiary },
  ringkasan: {
    flexDirection: 'row',
    gap: Spacing.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderRadius: Spacing.radius.md,
    ...Spacing.curve,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
  },
  labelRingkas: { fontSize: 12, fontFamily: fonts.regular, color: Colors.textTertiary },
  nilaiRingkas: { marginTop: 2, fontSize: ukuranIsi, fontFamily: fonts.bold, color: Colors.textPrimary },
  lepas: { alignSelf: 'flex-start', marginBottom: Spacing.sm },
  teksLepas: { fontSize: 12, fontFamily: fonts.semibold, color: Colors.danger },
  barisNg: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.sm,
    marginBottom: Spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
  },
  teksNg: { fontSize: ukuranIsi, fontFamily: fonts.regular, color: Colors.textPrimary },
  qtyNg: { fontSize: ukuranIsi, fontFamily: fonts.bold, color: Colors.textPrimary },
  galatServer: {
    flexDirection: 'row',
    gap: Spacing.sm,
    padding: Spacing.md,
    borderRadius: Spacing.radius.md,
    backgroundColor: Colors.serviceRed,
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
});

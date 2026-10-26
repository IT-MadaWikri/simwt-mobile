/**
 * Buat Tiket (tiket IT) — tata letak sama dengan Buat Kaizen: bagian berjudul di
 * atas latar putih, kolom isian rata, galat per field, ubin foto putus-putus, dan
 * footer tetap berisi tombol kirim. Isian mengikuti form web: aset (opsional), jenis → kategori,
 * departemen (+ sub-departemen bila ada), area (opsional), detail, foto (opsional).
 * Plant dan nama pengaju diambil server dari akun login. Logika di `useBuatTiket`.
 */
import React, { useState } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, Image, KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AppBar from '../../../src/components/common/AppBar';
import Button from '../../../src/components/common/Button';
import Icon from '../../../src/components/common/Icon';
import FieldPilihan from '../../../src/components/common/FieldPilihan';
import FieldTeks from '../../../src/components/common/FieldTeks';
import SheetPilihan from '../../../src/components/common/SheetPilihan';
import BottomSheet from '../../../src/components/common/BottomSheet';
import SheetAset from '../../../src/components/tiket/SheetAset';
import EditorFoto from '../../../src/components/kaizen/EditorFoto';
import { SkeletonForm } from '../../../src/components/common/Skeleton';
import { dialog } from '../../../src/components/common/AppDialog';
import Colors, { brand, slate } from '../../../constants/Colors';
import Spacing from '../../../constants/Spacing';
import { fonts, ukuranIsi } from '../../../constants/Typography';
import { gs, inputReset } from '../../../constants/GlobalStyles';
import { useBuatTiket } from '../../../src/hooks/useBuatTiket';
import { useCariAset } from '../../../src/hooks/useCariAset';

type Sheet = 'aset' | 'jenis' | 'kategori' | 'departemen' | 'sub' | 'area' | 'foto' | null;

const MAKS_DETAIL = 5000;

export default function BuatTiketScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  // Dibuka dari hasil pindai QR aset: aset langsung terisi.
  // `jenisNama` ("Mesin"/"Dies") memilih jenis otomatis; dengan aset dari scan, jenisnya terkunci seperti di web.
  const { asetNomor, asetNama, asetAlias, jenisNama } = useLocalSearchParams<{ asetNomor?: string; asetNama?: string; asetAlias?: string; jenisNama?: string }>();
  const t = useBuatTiket(
    asetNomor ? { asset_number: asetNomor, asset_name: asetNama || asetNomor, alias: asetAlias || null, asset_pic: null } : null,
    jenisNama || ''
  );
  const [sheet, setSheet] = useState<Sheet>(null);
  const cariAset = useCariAset(sheet === 'aset');
  // Galat per field baru tampil setelah percobaan kirim pertama.
  const [diperiksa, setDiperiksa] = useState(false);

  const kirim = async () => {
    setDiperiksa(true);
    if (Object.keys(t.galat).length > 0) return;
    const nomor = await t.kirim();
    if (nomor) {
      await dialog.alert('Tiket Terkirim', `Tiket #${nomor} sudah masuk antrean penanganan.`, 'success');
      // Dari hasil pindai QR: kembali ke beranda, bukan ke layar scan.
      if (asetNomor) router.replace('/(tabs)');
      else router.back();
    }
  };

  const ambilFoto = async (sumber: 'kamera' | 'galeri') => {
    setSheet(null);
    try {
      const pesan = await t.ambilFoto(sumber);
      if (pesan) dialog.alert('Izin Ditolak', pesan);
    } catch (e: any) {
      dialog.alert('Foto Gagal', e?.message || 'Foto tidak bisa diproses.', 'danger');
    }
  };

  if (t.memuat) {
    return (
      <View style={[gs.screen, { backgroundColor: Colors.white }]}>
        <AppBar judul="Buat Tiket" />
        <SkeletonForm />
      </View>
    );
  }

  if (t.errorMuat) {
    return (
      <View style={[gs.screen, gs.centerFill, { backgroundColor: Colors.white }]}>
        <AppBar judul="Buat Tiket" />
        <Text style={gs.emptyTitle}>Gagal memuat formulir</Text>
        <Text style={gs.emptyText}>{t.errorMuat}</Text>
        <Button label="Coba lagi" onPress={t.muatMaster} style={{ marginTop: Spacing.lg }} />
      </View>
    );
  }

  const { form } = t;
  const g = diperiksa ? t.galat : {};

  return (
    <KeyboardAvoidingView
      style={[gs.screen, { backgroundColor: Colors.white }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
    >
      <AppBar judul="Buat Tiket" />

      <ScrollView contentContainerStyle={styles.isi} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <Text style={styles.judulBagian}>Aset</Text>
        <View style={styles.bagian}>
          {form.aset ? (
            <View style={styles.kartuAset}>
              <View style={gs.flex1}>
                <Text style={styles.namaAset} numberOfLines={2}>{form.aset.alias || form.aset.asset_name}</Text>
                {form.aset.alias ? <Text style={styles.nomorAset} numberOfLines={1}>{form.aset.asset_name}</Text> : null}
                <Text style={styles.nomorAset}>{form.aset.asset_number}</Text>
              </View>
              <TouchableOpacity onPress={() => t.ubah('aset', null)} hitSlop={8} accessibilityLabel="Lepas aset">
                <Icon name="close-circle" size={18} color={Colors.textTertiary} />
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <FieldPilihan label="Aset" placeholder="Cari aset (opsional)" nilai={null} onPress={() => setSheet('aset')} />
              <Text style={styles.ketAset}>Pilih bila masalahnya terkait aset tertentu.</Text>
            </>
          )}
        </View>

        <Text style={styles.judulBagian}>Masalah</Text>
        <View style={styles.bagian}>
          <FieldPilihan
            label="Jenis Masalah"
            wajib
            nilai={t.labelDari(t.opsiJenis, form.idJenis)}
            galat={g.jenis}
            nonaktif={t.jenisTerkunci}
            onPress={() => setSheet('jenis')}
          />
          <FieldPilihan
            label="Kategori Masalah"
            wajib
            nonaktif={!form.idJenis}
            placeholder={form.idJenis ? 'Pilih kategori masalah' : 'Pilih jenis masalah dulu'}
            nilai={t.labelDari(t.opsiKategori, form.idKategori)}
            galat={g.kategori}
            onPress={() => setSheet('kategori')}
          />
          {t.strokeAktif ? (
            <FieldTeks
              label="Jumlah Stroke"
              nilai={form.stroke}
              onUbah={(v) => t.ubah('stroke', v)}
              keyboardType="decimal-pad"
              placeholder="Pembacaan counter dies saat ini"
              galat={g.stroke}
            />
          ) : null}
        </View>

        <Text style={styles.judulBagian}>Lokasi</Text>
        <View style={styles.bagian}>
          <FieldPilihan
            label="Departemen"
            wajib
            nilai={t.labelDari(t.opsiDepartemen, form.idDepartemen)}
            galat={g.departemen}
            onPress={() => setSheet('departemen')}
          />
          {t.opsiSub.length > 0 ? (
            <FieldPilihan
              label="Sub Departemen"
              wajib
              nilai={t.labelDari(t.opsiSub, form.idSub)}
              galat={g.sub}
              onPress={() => setSheet('sub')}
            />
          ) : null}
          {t.opsiArea.length > 0 ? (
            <FieldPilihan label="Area" nilai={t.labelDari(t.opsiArea, form.idArea)} onPress={() => setSheet('area')} />
          ) : null}
        </View>

        <Text style={styles.judulBagian}>Detail</Text>
        <View style={styles.bagian}>
          <View style={styles.field}>
            <View style={gs.rowBetween}>
              <Text style={styles.label}>
                Detail Masalah<Text style={styles.wajib}> *</Text>
              </Text>
              <Text style={styles.hitung}>{form.detail.length}/{MAKS_DETAIL}</Text>
            </View>
            <TextInput
              style={[styles.input, styles.textArea, g.detail ? styles.inputGalat : null]}
              placeholder="Jelaskan masalah: kapan terjadi, dampaknya, dan langkah yang sudah dicoba…"
              placeholderTextColor={Colors.placeholder}
              value={form.detail}
              onChangeText={(v) => t.ubah('detail', v)}
              multiline
              maxLength={MAKS_DETAIL}
            />
            {g.detail ? <Text style={styles.galat}>{g.detail}</Text> : null}
          </View>
        </View>

        <Text style={styles.judulBagian}>Foto</Text>
        <View style={styles.bagian}>
          {form.foto ? (
            <TouchableOpacity style={styles.ubinFoto} activeOpacity={0.85} onPress={t.bukaEditorFoto}>
              <Image source={{ uri: form.foto.uri }} style={styles.gambar} />
              <TouchableOpacity style={styles.hapusFoto} onPress={t.hapusFoto} hitSlop={8} accessibilityLabel="Hapus foto">
                <Icon name="close" size={14} color={Colors.white} />
              </TouchableOpacity>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={[styles.ubinFoto, styles.ubinTambah]} activeOpacity={0.8} onPress={() => setSheet('foto')}>
              <Icon name="camera-plus-outline" size={22} color={brand[700]} />
              <Text style={styles.teksSumber}>Upload foto</Text>
            </TouchableOpacity>
          )}
          <Text style={styles.ket}>Opsional. Tap foto untuk crop ulang. Foto membantu tim IT memahami masalahnya lebih cepat.</Text>
        </View>

        {t.galatServer ? (
          <View style={styles.galatServer} accessibilityRole="alert">
            <Icon name="alert-circle" size={18} color={Colors.danger} />
            <Text style={[gs.bodySm, gs.flex1, { color: Colors.dangerDark }]}>{t.galatServer}</Text>
          </View>
        ) : null}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + Spacing.sm }]}>
        <Button label="Kirim Tiket" iconRight="send" onPress={kirim} loading={t.mengirim} style={gs.flex1} />
      </View>

      <SheetAset
        visible={sheet === 'aset'}
        q={cariAset.q}
        onChangeQ={cariAset.setQ}
        hasil={cariAset.hasil}
        memuat={cariAset.memuat}
        gagal={cariAset.gagal}
        onPilih={(a) => t.ubah('aset', a)}
        onClose={() => setSheet(null)}
      />

      <EditorFoto
        visible={t.editorTerbuka}
        fotos={t.fotoAtur ? [t.fotoAtur] : []}
        tanpaTag
        onBatal={t.batalFoto}
        onSelesai={t.selesaiFoto}
      />

      <SheetPilihan visible={sheet === 'jenis'} judul="Jenis Masalah" opsi={t.opsiJenis} terpilih={form.idJenis} onPilih={(id) => t.ubah('idJenis', id)} onClose={() => setSheet(null)} />
      <SheetPilihan visible={sheet === 'kategori'} judul="Kategori Masalah" opsi={t.opsiKategori} terpilih={form.idKategori} onPilih={(id) => t.ubah('idKategori', id)} onClose={() => setSheet(null)} />
      <SheetPilihan visible={sheet === 'departemen'} judul="Departemen" opsi={t.opsiDepartemen} terpilih={form.idDepartemen} onPilih={(id) => t.ubah('idDepartemen', id)} onClose={() => setSheet(null)} />
      <SheetPilihan visible={sheet === 'sub'} judul="Sub Departemen" opsi={t.opsiSub} terpilih={form.idSub} onPilih={(id) => t.ubah('idSub', id)} onClose={() => setSheet(null)} />
      <SheetPilihan visible={sheet === 'area'} judul="Area" opsi={t.opsiArea} terpilih={form.idArea} bolehKosong onPilih={(id) => t.ubah('idArea', id ?? null)} onClose={() => setSheet(null)} />

      <BottomSheet visible={sheet === 'foto'} onClose={() => setSheet(null)} title="Tambah Foto">
        <View style={styles.pilihanFoto}>
          <Button variant="outline" icon="camera" label="Ambil dari Kamera" onPress={() => ambilFoto('kamera')} block />
          <Button variant="outline" icon="image" label="Pilih dari Galeri" onPress={() => ambilFoto('galeri')} block />
        </View>
      </BottomSheet>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  isi: { padding: Spacing.lg, paddingBottom: Spacing.xxl },
  judulBagian: {
    fontSize: 12,
    fontFamily: fonts.semibold,
    color: Colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: Spacing.sm,
  },
  // Bagian formulir langsung di atas latar putih layar, tanpa kartu.
  bagian: { marginBottom: Spacing.lg },
  field: { marginBottom: Spacing.md },
  label: { fontSize: ukuranIsi, fontFamily: fonts.medium, color: Colors.textPrimary, marginBottom: 6 },
  wajib: { color: Colors.danger },
  hitung: { fontSize: 12, fontFamily: fonts.regular, color: Colors.textTertiary, marginBottom: 6 },
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
  textArea: { minHeight: 120, textAlignVertical: 'top' },
  inputGalat: { borderColor: Colors.danger },
  galat: { marginTop: 4, fontSize: 12, fontFamily: fonts.regular, color: Colors.danger },
  galatServer: {
    flexDirection: 'row',
    gap: Spacing.sm,
    padding: Spacing.md,
    borderRadius: Spacing.radius.md,
    backgroundColor: Colors.serviceRed,
  },
  ubinFoto: {
    width: 120,
    height: 120,
    borderRadius: Spacing.radius.md,
    ...Spacing.curve,
    overflow: 'hidden',
    backgroundColor: slate[100],
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
  teksSumber: { fontSize: 12, fontFamily: fonts.semibold, color: brand[700] },
  gambar: { width: '100%', height: '100%' },
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
  kartuAset: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.lg,
    borderRadius: Spacing.radius.xl,
    ...Spacing.curve,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
  },
  namaAset: { fontSize: 12, fontFamily: fonts.bold, color: Colors.textPrimary },
  nomorAset: { marginTop: 2, fontSize: 12, fontFamily: fonts.regular, color: Colors.textSecondary },
  ketAset: { fontSize: 12, fontFamily: fonts.regular, color: Colors.textTertiary },
  ket: { marginTop: Spacing.sm, fontSize: 12, fontFamily: fonts.regular, color: Colors.textTertiary },
  footer: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.borderSubtle,
  },
  pilihanFoto: { gap: Spacing.md, paddingHorizontal: Spacing.lg, paddingBottom: Spacing.lg },
});

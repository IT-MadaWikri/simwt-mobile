/**
 * Buat Tiket (tiket IT) — alur sama dengan form web: jenis → kategori masalah,
 * departemen (+ sub-departemen bila ada), area (opsional), detail, foto (opsional).
 * Plant dan nama pengaju diambil server dari akun login. Logika ada di `useBuatTiket`.
 */
import React, { useState } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, Image, KeyboardAvoidingView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AppBar from '../../../src/components/common/AppBar';
import Button from '../../../src/components/common/Button';
import Icon from '../../../src/components/common/Icon';
import FieldPilihan from '../../../src/components/common/FieldPilihan';
import SheetPilihan from '../../../src/components/common/SheetPilihan';
import BottomSheet from '../../../src/components/common/BottomSheet';
import { SkeletonForm } from '../../../src/components/common/Skeleton';
import { dialog } from '../../../src/components/common/AppDialog';
import Colors from '../../../constants/Colors';
import Spacing from '../../../constants/Spacing';
import { fonts } from '../../../constants/Typography';
import { gs, inputReset } from '../../../constants/GlobalStyles';
import { useBuatTiket } from '../../../src/hooks/useBuatTiket';

type Sheet = 'jenis' | 'kategori' | 'departemen' | 'sub' | 'area' | 'foto' | null;

export default function BuatTiketScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const t = useBuatTiket();
  const [sheet, setSheet] = useState<Sheet>(null);
  const [diperiksa, setDiperiksa] = useState(false);

  const kirim = async () => {
    setDiperiksa(true);
    if (t.kekurangan) return;
    const nomor = await t.kirim();
    if (nomor) {
      await dialog.alert('Tiket Terkirim', `Tiket #${nomor} sudah masuk antrean penanganan.`, 'success');
      router.back();
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
      <View style={gs.screen}>
        <AppBar judul="Buat Tiket" />
        <SkeletonForm />
      </View>
    );
  }

  if (t.errorMuat) {
    return (
      <View style={[gs.screen, gs.centerFill]}>
        <AppBar judul="Buat Tiket" />
        <Icon name="alert-circle-outline" size={44} color={Colors.textTertiary} />
        <Text style={gs.emptyTitle}>Gagal memuat formulir</Text>
        <Text style={gs.emptyText}>{t.errorMuat}</Text>
        <Button label="Coba Lagi" onPress={t.muatMaster} style={{ marginTop: Spacing.lg }} />
      </View>
    );
  }

  const { form } = t;
  const tampilkanGalat = diperiksa ? t.kekurangan ?? t.galatServer : t.galatServer;

  return (
    <KeyboardAvoidingView style={gs.screen} behavior="padding">
      <AppBar judul="Buat Tiket" />
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[gs.scrollContent, { paddingBottom: insets.bottom + Spacing.xxl }]}
      >
        <FieldPilihan label="Jenis Masalah" wajib nilai={t.labelDari(t.opsiJenis, form.idJenis)} onPress={() => setSheet('jenis')} />
        <FieldPilihan
          label="Kategori Masalah"
          wajib
          nonaktif={!form.idJenis}
          placeholder={form.idJenis ? 'Pilih kategori masalah' : 'Pilih jenis masalah dulu'}
          nilai={t.labelDari(t.opsiKategori, form.idKategori)}
          onPress={() => setSheet('kategori')}
        />
        <FieldPilihan label="Departemen" wajib nilai={t.labelDari(t.opsiDepartemen, form.idDepartemen)} onPress={() => setSheet('departemen')} />
        {t.opsiSub.length > 0 ? (
          <FieldPilihan label="Sub Departemen" wajib nilai={t.labelDari(t.opsiSub, form.idSub)} onPress={() => setSheet('sub')} />
        ) : null}
        {t.opsiArea.length > 0 ? (
          <FieldPilihan label="Area" nilai={t.labelDari(t.opsiArea, form.idArea)} onPress={() => setSheet('area')} />
        ) : null}

        <Text style={gs.label}>
          Detail Masalah <Text style={gs.textDanger}>*</Text>
        </Text>
        <View style={[gs.fieldWrap, styles.areaTeks]}>
          <TextInput
            style={[gs.fieldInner, styles.isianTeks]}
            placeholder="Jelaskan masalah: kapan terjadi, dampaknya, dan langkah yang sudah dicoba…"
            placeholderTextColor={Colors.placeholder}
            value={form.detail}
            onChangeText={(v) => t.ubah('detail', v)}
            multiline
            textAlignVertical="top"
            maxLength={5000}
          />
        </View>

        <Text style={[gs.label, { marginTop: Spacing.lg }]}>
          Foto Masalah <Text style={gs.caption}>(opsional)</Text>
        </Text>
        {form.foto ? (
          <View style={styles.fotoWadah}>
            <Image source={{ uri: form.foto.uri }} style={styles.foto} resizeMode="cover" />
            <TouchableOpacity style={styles.hapusFoto} onPress={() => t.ubah('foto', null)} accessibilityLabel="Hapus foto">
              <Icon name="close" size={16} color={Colors.white} />
            </TouchableOpacity>
          </View>
        ) : (
          <Button variant="secondary" icon="image" label="Tambah Foto" onPress={() => setSheet('foto')} block />
        )}

        {tampilkanGalat ? (
          <View style={styles.galat} accessibilityRole="alert">
            <Icon name="alert-circle" size={18} color={Colors.danger} />
            <Text style={[gs.bodySm, gs.flex1, { color: Colors.dangerDark }]}>{tampilkanGalat}</Text>
          </View>
        ) : null}

        <Button label="Kirim Tiket" iconRight="send" onPress={kirim} loading={t.mengirim} block style={{ marginTop: Spacing.xl }} />
      </ScrollView>

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
  areaTeks: { alignItems: 'flex-start', minHeight: 120, paddingVertical: Spacing.sm },
  isianTeks: { minHeight: 100, fontFamily: fonts.regular, ...inputReset },
  fotoWadah: { width: 140, height: 140 },
  foto: { width: '100%', height: '100%', borderRadius: Spacing.radius.sm, backgroundColor: Colors.borderSubtle },
  hapusFoto: {
    position: 'absolute',
    top: Spacing.xs,
    right: Spacing.xs,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  galat: {
    flexDirection: 'row',
    gap: Spacing.sm,
    padding: Spacing.md,
    marginTop: Spacing.lg,
    borderRadius: Spacing.radius.md,
    backgroundColor: Colors.serviceRed,
  },
  pilihanFoto: { gap: Spacing.md, paddingHorizontal: Spacing.lg, paddingBottom: Spacing.lg },
});

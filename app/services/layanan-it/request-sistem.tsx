/**
 * Request Pembuatan Sistem (Form-IT-04) — isian & aturannya sama dengan form Layanan IT di web: pemohon
 * terisi otomatis, tujuan approval (plant → departemen → sub), nama aplikasi/website, minimal 3 tujuan dan
 * 3 manfaat, serta deskripsi dengan editor teks kaya (HTML, seperti TinyMCE di web). Setelah terkirim, pengajuan menunggu persetujuan empat tingkat (Kabag →
 * Manager Plant → Tim IT → Manager IT). Lampiran belum didukung. Logika di `useBuatRequestSistem`.
 */
import React, { useRef, useState } from 'react';
import { View, Text, ScrollView, KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { EnrichedTextInputInstance } from 'react-native-enriched-html';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AppBar from '../../../src/components/common/AppBar';
import Button from '../../../src/components/common/Button';
import Icon from '../../../src/components/common/Icon';
import FieldPilihan from '../../../src/components/common/FieldPilihan';
import EditorRichText from '../../../src/components/common/EditorRichText';
import FieldTeks from '../../../src/components/common/FieldTeks';
import SheetPilihan from '../../../src/components/common/SheetPilihan';
import KeadaanKosong from '../../../src/components/common/KeadaanKosong';
import { SkeletonForm } from '../../../src/components/common/Skeleton';
import { dialog } from '../../../src/components/common/AppDialog';
import DaftarButir from '../../../src/components/layananIt/DaftarButir';
import Colors, { brand, slate } from '../../../constants/Colors';
import Spacing from '../../../constants/Spacing';
import { fonts, ukuranIsi } from '../../../constants/Typography';
import { gs } from '../../../constants/GlobalStyles';
import { useBuatRequestSistem } from '../../../src/hooks/useBuatRequestSistem';
import { MIN_BUTIR, rapikanHtmlDeskripsi } from '../../../src/adapters/requestAkun';

type Sheet = 'plant' | 'departemen' | 'sub' | null;

export default function RequestSistemScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const r = useBuatRequestSistem();
  const editorDeskripsi = useRef<EnrichedTextInputInstance | null>(null);
  const [sheet, setSheet] = useState<Sheet>(null);
  // Galat per field baru tampil setelah percobaan kirim pertama.
  const [diperiksa, setDiperiksa] = useState(false);

  const kirim = async () => {
    setDiperiksa(true);
    if (Object.keys(r.galat).length > 0) return;
    // Editor teks kaya tak terkontrol: HTML-nya baru diambil saat kirim.
    const hasil = await r.kirim(rapikanHtmlDeskripsi((await editorDeskripsi.current?.getHTML()) ?? ''));
    if (hasil) {
      await dialog.alert('Request Terkirim', `Nomor dokumen ${hasil.nomorDokumen}. Pengajuan menunggu persetujuan Kepala Bagian.`, 'success');
      router.replace(`/services/layanan-it/sistem/${hasil.id}` as any);
    }
  };

  if (r.memuat) {
    return (
      <View style={[gs.screen, { backgroundColor: Colors.white }]}>
        <AppBar judul="Request Sistem" />
        <SkeletonForm />
      </View>
    );
  }

  if (r.errorMuat || !r.opsi) {
    return (
      <View style={[gs.screen, { backgroundColor: Colors.white }]}>
        <AppBar judul="Request Sistem" />
        <KeadaanKosong pose="mikir" judul="Gagal memuat formulir" teks={r.errorMuat} style={styles.kosong}>
          <Button label="Coba Lagi" onPress={r.muatOpsi} style={{ marginTop: Spacing.lg }} />
        </KeadaanKosong>
      </View>
    );
  }

  if (!r.opsi.pemohon) {
    return (
      <View style={[gs.screen, { backgroundColor: Colors.white }]}>
        <AppBar judul="Request Sistem" />
        <KeadaanKosong pose="mikir" judul="Akun belum terhubung" teks="Akun Anda belum terhubung ke data karyawan aktif. Hubungi Tim IT." style={styles.kosong} />
      </View>
    );
  }

  const { form } = r;
  const g = diperiksa ? r.galat : {};

  return (
    <KeyboardAvoidingView
      style={[gs.screen, { backgroundColor: Colors.white }]}
      // Android edge-to-edge: `adjustResize` tidak lagi mengecilkan jendela, jadi tanpa padding keyboard menutupi isi.
      behavior="padding"
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
    >
      <AppBar judul="Request Sistem" />

      <ScrollView contentContainerStyle={styles.isi} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <Text style={styles.judulBagian}>Pemohon</Text>
        <View style={[styles.bagian, styles.pemohon]}>
          <View style={styles.ikonPemohon}>
            <Icon name="account-outline" size={18} color={brand[700]} />
          </View>
          <View style={gs.flex1}>
            <Text style={styles.namaPemohon}>{r.opsi.pemohon.nama}</Text>
            <Text style={styles.redup}>{r.opsi.pemohon.nik}</Text>
          </View>
        </View>

        <Text style={styles.judulBagian}>Tujuan Approval</Text>
        <View style={styles.bagian}>
          <FieldPilihan label="Plant" wajib nilai={r.opsiPlant.find((o) => o.id === form.idPlant)?.label ?? null} galat={g.plant} onPress={() => setSheet('plant')} />
          <FieldPilihan
            label="Departemen"
            wajib
            nilai={r.opsiDepartemen.find((o) => o.id === form.idDepartemen)?.label ?? null}
            galat={g.departemen}
            onPress={() => setSheet('departemen')}
          />
          {r.opsiSub.length > 0 ? (
            <FieldPilihan label="Sub Departemen" wajib nilai={r.opsiSub.find((o) => o.id === form.subDepartemen)?.label ?? null} galat={g.sub} onPress={() => setSheet('sub')} />
          ) : null}
        </View>

        <Text style={styles.judulBagian}>Aplikasi / Website</Text>
        <View style={styles.bagian}>
          <FieldTeks label="Nama Aplikasi / Website" wajib nilai={form.namaAplikasi} onUbah={(t) => r.ubah('namaAplikasi', t)} galat={g.namaAplikasi} />
          <EditorRichText label="Deskripsi / Penjelasan Alur" editorRef={editorDeskripsi} placeholder="Gambaran singkat alur kerja saat ini atau ekspektasi aplikasi" />
        </View>

        <Text style={styles.judulBagian}>Tujuan</Text>
        <DaftarButir
          judul="Tujuan"
          butir={form.tujuan}
          min={MIN_BUTIR}
          galat={g.tujuan}
          onUbah={(i, t) => r.ubahButir('tujuan', i, t)}
          onTambah={() => r.tambahButir('tujuan')}
          onHapus={(i) => r.hapusButir('tujuan', i)}
        />

        <Text style={[styles.judulBagian, { marginTop: Spacing.lg }]}>Manfaat</Text>
        <DaftarButir
          judul="Manfaat"
          butir={form.manfaat}
          min={MIN_BUTIR}
          galat={g.manfaat}
          onUbah={(i, t) => r.ubahButir('manfaat', i, t)}
          onTambah={() => r.tambahButir('manfaat')}
          onHapus={(i) => r.hapusButir('manfaat', i)}
        />

        {r.galatServer ? (
          <View style={styles.galatServer} accessibilityRole="alert">
            <Icon name="alert-circle" size={18} color={Colors.danger} />
            <Text style={[gs.bodySm, gs.flex1, { color: Colors.dangerDark }]}>{r.galatServer}</Text>
          </View>
        ) : null}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + Spacing.sm }]}>
        <Button label="Kirim Request" iconRight="send" onPress={kirim} loading={r.mengirim} style={gs.flex1} />
      </View>

      <SheetPilihan visible={sheet === 'plant'} judul="Plant" opsi={r.opsiPlant} terpilih={form.idPlant} onPilih={(id) => r.ubah('idPlant', id)} onClose={() => setSheet(null)} />
      <SheetPilihan visible={sheet === 'departemen'} judul="Departemen" opsi={r.opsiDepartemen} terpilih={form.idDepartemen} onPilih={(id) => r.ubah('idDepartemen', id)} onClose={() => setSheet(null)} />
      <SheetPilihan visible={sheet === 'sub'} judul="Sub Departemen" opsi={r.opsiSub} terpilih={form.subDepartemen} onPilih={(id) => r.ubah('subDepartemen', id)} onClose={() => setSheet(null)} />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  isi: { padding: Spacing.lg, paddingBottom: Spacing.xxl },
  kosong: { flex: 1, justifyContent: 'center', paddingHorizontal: Spacing.lg },
  judulBagian: {
    fontSize: 12,
    fontFamily: fonts.semibold,
    color: Colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: Spacing.sm,
  },
  bagian: { marginBottom: Spacing.lg },
  pemohon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.md,
    borderRadius: Spacing.radius.md,
    ...Spacing.curve,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: slate[50],
  },
  ikonPemohon: { width: 36, height: 36, borderRadius: 18, backgroundColor: brand[50], alignItems: 'center', justifyContent: 'center' },
  namaPemohon: { fontFamily: fonts.semibold, fontSize: ukuranIsi, color: Colors.textPrimary },
  redup: { fontFamily: fonts.regular, fontSize: 12, color: Colors.textTertiary },
  galatServer: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.lg,
    padding: Spacing.md,
    borderRadius: Spacing.radius.md,
    ...Spacing.curve,
    backgroundColor: Colors.serviceRed,
  },
  footer: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: slate[100],
  },
});

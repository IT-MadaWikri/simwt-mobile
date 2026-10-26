/**
 * Form Keluar Pabrik (Form-HRD-17) — isian & aturannya sama dengan form di web: pemohon = karyawan pemilik
 * akun (terisi otomatis), kategori pemohon, plant → departemen → sub, tanggal & jam keluar/kembali, jenis
 * keluar, dan alasan. Setelah terkirim, form menunggu persetujuan atasan/HRD. Logika di `useBuatKeluarPabrik`.
 */
import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AppBar from '../../../src/components/common/AppBar';
import Button from '../../../src/components/common/Button';
import Icon from '../../../src/components/common/Icon';
import FieldPilihan from '../../../src/components/common/FieldPilihan';
import FieldTeks from '../../../src/components/common/FieldTeks';
import FieldTanggal from '../../../src/components/common/FieldTanggal';
import FieldJam from '../../../src/components/common/FieldJam';
import SheetPilihan from '../../../src/components/common/SheetPilihan';
import KeadaanKosong from '../../../src/components/common/KeadaanKosong';
import { SkeletonForm } from '../../../src/components/common/Skeleton';
import { dialog } from '../../../src/components/common/AppDialog';
import Colors, { brand, slate } from '../../../constants/Colors';
import Spacing from '../../../constants/Spacing';
import { fonts, ukuranIsi } from '../../../constants/Typography';
import { gs } from '../../../constants/GlobalStyles';
import { useTinggiKeyboard } from '../../../src/hooks/useTinggiKeyboard';
import { useBuatKeluarPabrik } from '../../../src/hooks/useBuatKeluarPabrik';
import { LABEL_JENIS, LABEL_KATEGORI, hariIni } from '../../../src/adapters/keluarPabrik';

type Sheet = 'plant' | 'departemen' | 'sub' | null;

/** Pilihan satu-dari-beberapa berbentuk kartu, sama dengan "Penyerahan Akun" di Request Akun. */
function PilihanKartu<T extends string>({
  daftar,
  nilai,
  onPilih,
}: {
  daftar: { nilai: T; label: string }[];
  nilai: T | null;
  onPilih: (v: T) => void;
}) {
  return (
    <View style={{ gap: Spacing.sm }}>
      {daftar.map((d) => {
        const aktif = nilai === d.nilai;
        return (
          <TouchableOpacity key={d.nilai} style={[styles.kartu, aktif && styles.kartuAktif]} activeOpacity={0.8} onPress={() => onPilih(d.nilai)}>
            <Icon name={aktif ? 'check-circle' : 'radiobox-blank'} size={18} color={aktif ? brand[600] : slate[400]} />
            <Text style={[styles.labelKartu, aktif && { color: brand[700] }]}>{d.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export default function KeluarPabrikScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const tinggiKeyboard = useTinggiKeyboard();
  const r = useBuatKeluarPabrik();
  const [sheet, setSheet] = useState<Sheet>(null);
  // Galat per field baru tampil setelah percobaan kirim pertama.
  const [diperiksa, setDiperiksa] = useState(false);

  const kirim = async () => {
    setDiperiksa(true);
    if (Object.keys(r.galat).length > 0) return;
    const hasil = await r.kirim();
    if (hasil) {
      await dialog.alert('Form Terkirim', `Nomor dokumen ${hasil.nomorDokumen}. Form menunggu persetujuan.`, 'success');
      router.replace(`/services/layanan-hrd/${hasil.id}` as any);
    }
  };

  if (r.memuat) {
    return (
      <View style={[gs.screen, { backgroundColor: Colors.white }]}>
        <AppBar judul="Form Keluar Pabrik" />
        <SkeletonForm />
      </View>
    );
  }

  if (r.errorMuat || !r.opsi) {
    return (
      <View style={[gs.screen, { backgroundColor: Colors.white }]}>
        <AppBar judul="Form Keluar Pabrik" />
        <KeadaanKosong pose="mikir" judul="Gagal memuat formulir" teks={r.errorMuat} style={styles.kosong}>
          <Button label="Coba Lagi" onPress={r.muatOpsi} style={{ marginTop: Spacing.lg }} />
        </KeadaanKosong>
      </View>
    );
  }

  if (!r.opsi.pemohon) {
    return (
      <View style={[gs.screen, { backgroundColor: Colors.white }]}>
        <AppBar judul="Form Keluar Pabrik" />
        <KeadaanKosong
          pose="mikir"
          judul="Akun belum terhubung"
          teks="Akun Anda belum terhubung ke data karyawan aktif. Hubungi HRD."
          style={styles.kosong}
        />
      </View>
    );
  }

  const { form, opsi } = r;
  const g = diperiksa ? r.galat : {};

  return (
    // Diangkat setinggi keyboard (bukan KeyboardAvoidingView, yang meleset di Android edge-to-edge).
    <View style={[gs.screen, { backgroundColor: Colors.white, paddingBottom: tinggiKeyboard }]}>
      <AppBar judul="Form Keluar Pabrik" />

      <ScrollView contentContainerStyle={styles.isi} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <Text style={styles.judulBagian}>Pemohon</Text>
        <View style={[styles.bagian, styles.pemohon]}>
          <View style={styles.ikonPemohon}>
            <Icon name="account-outline" size={18} color={brand[700]} />
          </View>
          <View style={gs.flex1}>
            <Text style={styles.namaPemohon}>{opsi.pemohon?.nama}</Text>
            <Text style={styles.redup}>{opsi.pemohon?.nik}</Text>
          </View>
        </View>

        <Text style={styles.judulBagian}>Kategori Pemohon</Text>
        <View style={styles.bagian}>
          <PilihanKartu
            daftar={(Object.keys(LABEL_KATEGORI) as (keyof typeof LABEL_KATEGORI)[]).map((k) => ({ nilai: k, label: LABEL_KATEGORI[k] }))}
            nilai={form.kategori}
            onPilih={(v) => r.ubah('kategori', v)}
          />
          <Text style={[styles.redup, { marginTop: Spacing.xs }]}>
            {form.kategori === 'kabag'
              ? 'Kabag: cukup disetujui Manager Plant atau HRD.'
              : 'Staff/Magang/PKL: cukup disetujui Leader, Kabag, atau HRD.'}
          </Text>
        </View>

        <Text style={styles.judulBagian}>Unit Kerja</Text>
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
            <FieldPilihan
              label="Sub Departemen"
              wajib
              nilai={r.opsiSub.find((o) => o.id === form.subDepartemen)?.label ?? null}
              galat={g.sub}
              onPress={() => setSheet('sub')}
            />
          ) : null}
        </View>

        <Text style={styles.judulBagian}>Waktu Keluar</Text>
        <View style={styles.bagian}>
          <FieldTanggal label="Tanggal" value={form.tanggal} onChange={(v) => r.ubah('tanggal', v)} min={hariIni()} />
          <View style={styles.barisJam}>
            <View style={gs.flex1}>
              <FieldJam label="Jam Keluar" value={form.jamKeluar} onChange={(v) => r.ubah('jamKeluar', v)} />
            </View>
            <View style={gs.flex1}>
              <FieldJam label="Jam Kembali" value={form.jamKembali} onChange={(v) => r.ubah('jamKembali', v)} />
            </View>
          </View>
          {form.jamKembali ? (
            <TouchableOpacity onPress={() => r.ubah('jamKembali', '')} style={styles.hapusJam}>
              <Text style={styles.tautan}>Tidak kembali ke pabrik</Text>
            </TouchableOpacity>
          ) : (
            <Text style={styles.redup}>Kosongkan jam kembali bila tidak kembali ke pabrik.</Text>
          )}
        </View>

        <Text style={styles.judulBagian}>Keperluan</Text>
        <View style={styles.bagian}>
          <PilihanKartu
            daftar={(Object.keys(LABEL_JENIS) as (keyof typeof LABEL_JENIS)[]).map((k) => ({ nilai: k, label: LABEL_JENIS[k] }))}
            nilai={form.jenis}
            onPilih={(v) => r.ubah('jenis', v)}
          />
          {g.jenis ? <Text style={[styles.galat, { marginTop: Spacing.xs }]}>{g.jenis}</Text> : null}
          <View style={{ marginTop: Spacing.md }}>
            <FieldTeks
              label="Alasan / Tujuan Keluar Pabrik"
              wajib
              nilai={form.alasan}
              onUbah={(t) => r.ubah('alasan', t)}
              galat={g.alasan}
              multiline
              placeholder="Tuliskan tujuan atau alasan spesifik keluar pabrik"
            />
          </View>
        </View>

        {r.galatServer ? (
          <View style={styles.galatServer} accessibilityRole="alert">
            <Icon name="alert-circle" size={18} color={Colors.danger} />
            <Text style={[gs.bodySm, gs.flex1, { color: Colors.dangerDark }]}>{r.galatServer}</Text>
          </View>
        ) : null}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: (tinggiKeyboard ? 0 : insets.bottom) + Spacing.sm }]}>
        <Button label="Ajukan Form" iconRight="send" onPress={kirim} loading={r.mengirim} style={gs.flex1} />
      </View>

      <SheetPilihan visible={sheet === 'plant'} judul="Plant" opsi={r.opsiPlant} terpilih={form.idPlant} onPilih={(id) => r.ubah('idPlant', id)} onClose={() => setSheet(null)} />
      <SheetPilihan visible={sheet === 'departemen'} judul="Departemen" opsi={r.opsiDepartemen} terpilih={form.idDepartemen} onPilih={(id) => r.ubah('idDepartemen', id)} onClose={() => setSheet(null)} />
      <SheetPilihan visible={sheet === 'sub'} judul="Sub Departemen" opsi={r.opsiSub} terpilih={form.subDepartemen} onPilih={(id) => r.ubah('subDepartemen', id)} onClose={() => setSheet(null)} />
    </View>
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
  barisJam: { flexDirection: 'row', gap: Spacing.md },
  hapusJam: { alignSelf: 'flex-start' },
  tautan: { fontFamily: fonts.semibold, fontSize: 12, color: brand[700] },
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
  kartu: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.md,
    borderRadius: Spacing.radius.md,
    ...Spacing.curve,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
  },
  kartuAktif: { borderColor: brand[600], backgroundColor: brand[50] },
  labelKartu: { flex: 1, fontFamily: fonts.semibold, fontSize: ukuranIsi, color: Colors.textPrimary },
  galat: { fontSize: 12, fontFamily: fonts.regular, color: Colors.danger },
  galatServer: {
    flexDirection: 'row',
    gap: Spacing.sm,
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

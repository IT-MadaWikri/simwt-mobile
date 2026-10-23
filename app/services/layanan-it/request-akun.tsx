/**
 * Request Akun (Form-IT-03) — isian & aturannya sama dengan form Layanan IT di web: pemohon = karyawan
 * pemilik akun (terisi otomatis), tujuan approval (plant → departemen → sub), sistem → jenis permintaan,
 * isian kondisional per sistem, keterangan & alasan, lalu metode penyerahan akun. Setelah terkirim,
 * request menunggu persetujuan Kabag. Logika di `useBuatRequestAkun`.
 */
import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AppBar from '../../../src/components/common/AppBar';
import Button from '../../../src/components/common/Button';
import Icon from '../../../src/components/common/Icon';
import FieldPilihan from '../../../src/components/common/FieldPilihan';
import FieldTeks from '../../../src/components/common/FieldTeks';
import SheetPilihan from '../../../src/components/common/SheetPilihan';
import KeadaanKosong from '../../../src/components/common/KeadaanKosong';
import { SkeletonForm } from '../../../src/components/common/Skeleton';
import { dialog } from '../../../src/components/common/AppDialog';
import Colors, { brand, slate } from '../../../constants/Colors';
import Spacing from '../../../constants/Spacing';
import { fonts, ukuranIsi } from '../../../constants/Typography';
import { gs } from '../../../constants/GlobalStyles';
import { useBuatRequestAkun } from '../../../src/hooks/useBuatRequestAkun';
import { pakaiDetailAkses } from '../../../src/adapters/requestAkun';

type Sheet = 'plant' | 'departemen' | 'sub' | 'sistem' | 'jenis' | 'webapps' | null;

export default function RequestAkunScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const r = useBuatRequestAkun();
  const [sheet, setSheet] = useState<Sheet>(null);
  // Galat per field baru tampil setelah percobaan kirim pertama.
  const [diperiksa, setDiperiksa] = useState(false);

  const kirim = async () => {
    setDiperiksa(true);
    if (Object.keys(r.galat).length > 0) return;
    const hasil = await r.kirim();
    if (hasil) {
      await dialog.alert('Request Terkirim', `Nomor dokumen ${hasil.nomorDokumen}. Request menunggu persetujuan Kepala Bagian.`, 'success');
      router.replace(`/services/layanan-it/${hasil.id}` as any);
    }
  };

  if (r.memuat) {
    return (
      <View style={[gs.screen, { backgroundColor: Colors.white }]}>
        <AppBar judul="Request Akun" />
        <SkeletonForm />
      </View>
    );
  }

  if (r.errorMuat || !r.opsi) {
    return (
      <View style={[gs.screen, { backgroundColor: Colors.white }]}>
        <AppBar judul="Request Akun" />
        <KeadaanKosong pose="mikir" judul="Gagal memuat formulir" teks={r.errorMuat} style={styles.kosong}>
          <Button label="Coba Lagi" onPress={r.muatOpsi} style={{ marginTop: Spacing.lg }} />
        </KeadaanKosong>
      </View>
    );
  }

  if (!r.opsi.pemohon) {
    return (
      <View style={[gs.screen, { backgroundColor: Colors.white }]}>
        <AppBar judul="Request Akun" />
        <KeadaanKosong
          pose="mikir"
          judul="Akun belum terhubung"
          teks="Akun Anda belum terhubung ke data karyawan aktif. Hubungi Tim IT."
          style={styles.kosong}
        />
      </View>
    );
  }

  const { form, opsi } = r;
  const g = diperiksa ? r.galat : {};
  const indeks = (daftar: { id: number; label: string }[], nilai: string | null) => daftar.find((o) => o.label === nilai)?.id ?? null;

  return (
    <KeyboardAvoidingView
      style={[gs.screen, { backgroundColor: Colors.white }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
    >
      <AppBar judul="Request Akun" />

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
            <FieldPilihan
              label="Sub Departemen"
              wajib
              nilai={r.opsiSub.find((o) => o.id === form.subDepartemen)?.label ?? null}
              galat={g.sub}
              onPress={() => setSheet('sub')}
            />
          ) : null}
        </View>

        <Text style={styles.judulBagian}>Permintaan</Text>
        <View style={styles.bagian}>
          <FieldPilihan label="Sistem" wajib nilai={form.sistem} galat={g.sistem} onPress={() => setSheet('sistem')} />
          <FieldPilihan
            label="Jenis Permintaan"
            wajib
            nonaktif={!form.sistem}
            placeholder={form.sistem ? 'Pilih jenis permintaan' : 'Pilih sistem dulu'}
            nilai={form.jenis}
            galat={g.jenis}
            onPress={() => setSheet('jenis')}
          />
          {form.sistem === 'WebApps' ? (
            <FieldPilihan label="Aplikasi" wajib nilai={form.webapps} galat={g.webapps} onPress={() => setSheet('webapps')} />
          ) : null}
          {form.sistem === 'WebApps' && form.webapps === 'Lainnya' ? (
            <FieldTeks label="Nama Aplikasi" wajib nilai={form.webappsLainnya} onUbah={(t) => r.ubah('webappsLainnya', t)} galat={g.webappsLainnya} />
          ) : null}
          {form.sistem === 'Lainnya' ? (
            <FieldTeks label="Nama Sistem" wajib nilai={form.namaSistemLainnya} onUbah={(t) => r.ubah('namaSistemLainnya', t)} galat={g.namaSistemLainnya} />
          ) : null}
          {form.sistem === 'Gmail' ? (
            <FieldTeks
              label="Alamat Gmail"
              wajib
              nilai={form.emailDiminta}
              onUbah={(t) => r.ubah('emailDiminta', t)}
              galat={g.emailDiminta}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholder="nama@gmail.com"
            />
          ) : null}
          {form.sistem && form.sistem !== 'Gmail' ? (
            <FieldTeks
              label="Username / ID Akun"
              wajib
              nilai={form.username}
              onUbah={(t) => r.ubah('username', t)}
              galat={g.username}
              autoCapitalize="none"
              placeholder={form.webapps === 'SIMMWT' ? 'Otomatis berawalan mwt-' : 'Username / ID akun'}
            />
          ) : null}
          {pakaiDetailAkses(form.sistem) ? (
            <FieldTeks
              label="Detail Akses"
              nilai={form.detailAkses}
              onUbah={(t) => r.ubah('detailAkses', t)}
              multiline
              placeholder="Folder, modul, atau hak akses yang dibutuhkan"
            />
          ) : null}
          <FieldTeks label="Keterangan" wajib nilai={form.keterangan} onUbah={(t) => r.ubah('keterangan', t)} galat={g.keterangan} multiline />
          <FieldTeks label="Alasan" wajib nilai={form.alasan} onUbah={(t) => r.ubah('alasan', t)} galat={g.alasan} multiline />
        </View>

        <Text style={styles.judulBagian}>Penyerahan Akun</Text>
        <View style={[styles.bagian, { gap: Spacing.sm }]}>
          {opsi.metode.map((m) => {
            const aktif = form.metode === m.nilai;
            return (
              <TouchableOpacity
                key={m.nilai}
                style={[styles.metode, aktif && styles.metodeAktif, !m.tersedia && { opacity: 0.5 }]}
                activeOpacity={0.8}
                disabled={!m.tersedia}
                onPress={() => r.ubah('metode', m.nilai)}
              >
                <Icon name={aktif ? 'check-circle' : 'radiobox-blank'} size={18} color={aktif ? brand[600] : slate[400]} />
                <View style={gs.flex1}>
                  <Text style={[styles.labelMetode, aktif && { color: brand[700] }]}>{m.label}</Text>
                  <Text style={styles.redup}>{m.keterangan}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
          {g.metode ? <Text style={styles.galat}>{g.metode}</Text> : null}
        </View>

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
      <SheetPilihan
        visible={sheet === 'sistem'}
        judul="Sistem"
        opsi={r.opsiSistem}
        terpilih={indeks(r.opsiSistem, form.sistem)}
        onPilih={(id) => r.ubah('sistem', r.opsiSistem[id]?.label ?? null)}
        onClose={() => setSheet(null)}
      />
      <SheetPilihan
        visible={sheet === 'jenis'}
        judul="Jenis Permintaan"
        opsi={r.opsiJenis}
        terpilih={indeks(r.opsiJenis, form.jenis)}
        onPilih={(id) => r.ubah('jenis', r.opsiJenis[id]?.label ?? null)}
        onClose={() => setSheet(null)}
      />
      <SheetPilihan
        visible={sheet === 'webapps'}
        judul="Aplikasi WebApps"
        opsi={r.opsiWebapps}
        terpilih={indeks(r.opsiWebapps, form.webapps)}
        onPilih={(id) => r.ubah('webapps', r.opsiWebapps[id]?.label ?? null)}
        onClose={() => setSheet(null)}
      />
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
  metode: {
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
  metodeAktif: { borderColor: brand[600], backgroundColor: brand[50] },
  labelMetode: { fontFamily: fonts.semibold, fontSize: ukuranIsi, color: Colors.textPrimary },
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

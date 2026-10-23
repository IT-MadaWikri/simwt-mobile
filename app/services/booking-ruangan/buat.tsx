/**
 * Buat Booking Ruangan — isian & aturannya sama dengan form booking mandiri di
 * web (Undangan Rapat): jenis rapat (di ruangan / online / di luar perusahaan),
 * plant → ruangan, departemen, peminjam, kegiatan, waktu, dan peserta. Tanpa
 * approval: begitu terkirim, statusnya langsung Terjadwal. Bentrok jadwal
 * ruangan dicek server. Logika di `useBuatBooking`.
 */
import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AppBar from '../../../src/components/common/AppBar';
import Button from '../../../src/components/common/Button';
import Avatar from '../../../src/components/common/Avatar';
import Icon from '../../../src/components/common/Icon';
import FieldPilihan from '../../../src/components/common/FieldPilihan';
import FieldTanggal from '../../../src/components/common/FieldTanggal';
import FieldJam from '../../../src/components/common/FieldJam';
import FieldTeks from '../../../src/components/common/FieldTeks';
import SheetPilihan from '../../../src/components/common/SheetPilihan';
import SheetKaryawan from '../../../src/components/kaizen/SheetKaryawan';
import { SkeletonForm } from '../../../src/components/common/Skeleton';
import { dialog } from '../../../src/components/common/AppDialog';
import Colors, { brand, slate } from '../../../constants/Colors';
import Spacing from '../../../constants/Spacing';
import { fonts, ukuranIsi } from '../../../constants/Typography';
import { gs } from '../../../constants/GlobalStyles';
import { useBuatBooking } from '../../../src/hooks/useBuatBooking';
import { kunciTanggal } from '../../../src/utils/kalender';
import { JenisRapat } from '../../../src/types/booking';

type Sheet = 'plant' | 'ruangan' | 'departemen' | 'peserta' | null;

const JENIS: { nilai: JenisRapat; label: string }[] = [
  { nilai: 'offline', label: 'Di Ruangan' },
  { nilai: 'online', label: 'Online' },
  { nilai: 'luar', label: 'Di Luar' },
];

export default function BuatBookingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { tanggal } = useLocalSearchParams<{ tanggal?: string }>();
  const b = useBuatBooking(tanggal || kunciTanggal(new Date()));
  const [sheet, setSheet] = useState<Sheet>(null);
  // Galat per field baru tampil setelah percobaan kirim pertama.
  const [diperiksa, setDiperiksa] = useState(false);

  const kirim = async () => {
    setDiperiksa(true);
    if (Object.keys(b.galat).length > 0) return;
    if ((await b.kirim()) !== null) {
      await dialog.alert('Booking Berhasil', 'Jadwal sudah tercatat dan langsung berstatus Terjadwal.', 'success');
      router.back();
    }
  };

  if (b.memuat) {
    return (
      <View style={[gs.screen, { backgroundColor: Colors.white }]}>
        <AppBar judul="Buat Booking" />
        <SkeletonForm />
      </View>
    );
  }

  if (b.errorMuat) {
    return (
      <View style={[gs.screen, gs.centerFill, { backgroundColor: Colors.white }]}>
        <AppBar judul="Buat Booking" />
        <Text style={gs.emptyTitle}>Gagal memuat formulir</Text>
        <Text style={gs.emptyText}>{b.errorMuat}</Text>
        <Button label="Coba lagi" onPress={b.muatMaster} style={{ marginTop: Spacing.lg }} />
      </View>
    );
  }

  const { form } = b;
  const g = diperiksa ? b.galat : {};

  return (
    <KeyboardAvoidingView
      style={[gs.screen, { backgroundColor: Colors.white }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
    >
      <AppBar judul="Buat Booking" />

      <ScrollView contentContainerStyle={styles.isi} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <Text style={styles.judulBagian}>Jenis Rapat</Text>
        <View style={[styles.bagian, styles.jenis]}>
          {JENIS.map((j) => {
            const aktif = form.jenis === j.nilai;
            return (
              <TouchableOpacity
                key={j.nilai}
                style={[styles.chip, aktif && styles.chipAktif]}
                activeOpacity={0.8}
                onPress={() => b.ubah('jenis', j.nilai)}
              >
                <Text style={[styles.teksChip, aktif && styles.teksChipAktif]}>{j.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={styles.judulBagian}>Tempat</Text>
        <View style={styles.bagian}>
          {form.jenis !== 'luar' ? (
            <FieldPilihan
              label="Plant"
              wajib
              nilai={b.labelDari(b.opsiPlant, form.idPlant)}
              galat={g.plant}
              onPress={() => setSheet('plant')}
            />
          ) : null}
          {form.jenis === 'offline' ? (
            <FieldPilihan
              label="Ruangan"
              wajib
              nonaktif={!form.idPlant}
              placeholder={form.idPlant ? 'Pilih ruangan' : 'Pilih plant dulu'}
              nilai={b.labelDari(b.opsiRuangan, form.idRuangan)}
              galat={g.ruangan}
              onPress={() => setSheet('ruangan')}
            />
          ) : null}
          {form.jenis === 'online' ? (
            <FieldTeks
              label="Link Meeting"
              wajib
              nilai={form.linkMeeting}
              onUbah={(t) => b.ubah('linkMeeting', t)}
              galat={g.link}
              keyboardType="url"
              autoCapitalize="none"
              placeholder="https://meet.google.com/…"
            />
          ) : null}
          {form.jenis === 'luar' ? (
            <FieldTeks
              label="Lokasi"
              wajib
              nilai={form.lokasi}
              onUbah={(t) => b.ubah('lokasi', t)}
              galat={g.lokasi}
              placeholder="Tempat rapat di luar perusahaan"
            />
          ) : null}
        </View>

        <Text style={styles.judulBagian}>Kegiatan</Text>
        <View style={styles.bagian}>
          <FieldTeks label="Nama Kegiatan" wajib nilai={form.namaKegiatan} onUbah={(t) => b.ubah('namaKegiatan', t)} galat={g.kegiatan} placeholder="Mis. Rapat evaluasi mingguan" />
          <FieldTeks label="Nama Peminjam" wajib nilai={form.namaPeminjam} onUbah={(t) => b.ubah('namaPeminjam', t)} galat={g.peminjam} autoCapitalize="words" />
          <FieldPilihan
            label="Departemen"
            wajib
            nilai={b.labelDari(b.opsiDepartemen, form.idDepartemen)}
            galat={g.departemen}
            onPress={() => setSheet('departemen')}
          />
        </View>

        <Text style={styles.judulBagian}>Waktu</Text>
        <View style={styles.bagian}>
          <View style={styles.baris}>
            <FieldTanggal label="Tanggal" value={form.tanggal} onChange={(v) => v && b.ubah('tanggal', v)} />
          </View>
          <View style={styles.baris}>
            <FieldJam label="Mulai" value={form.mulai} onChange={(v) => b.ubah('mulai', v)} />
            <FieldJam label="Selesai" value={form.selesai} onChange={(v) => b.ubah('selesai', v)} />
          </View>
          {g.waktu ? <Text style={styles.galat}>{g.waktu}</Text> : null}
        </View>

        <View style={styles.kepalaBagian}>
          <Text style={[styles.judulBagian, { marginBottom: 0 }]}>Peserta</Text>
          <Button variant="outline" icon="plus" accessibilityLabel="Tambah peserta" onPress={() => setSheet('peserta')} />
        </View>
        {form.peserta.length > 0 ? (
          <View style={[styles.bagian, { gap: Spacing.sm }]}>
            {form.peserta.map((nama, i) => (
              <View key={nama} style={styles.kartuPeserta}>
                <Avatar nama={nama} ukuran={28} />
                <Text style={styles.namaPeserta} numberOfLines={1}>{nama}</Text>
                <TouchableOpacity hitSlop={8} onPress={() => b.hapusPeserta(i)} accessibilityLabel={`Hapus peserta ${nama}`}>
                  <Icon name="close-circle" size={18} color={Colors.textTertiary} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        ) : null}

        {b.galatServer ? (
          <View style={styles.galatServer} accessibilityRole="alert">
            <Icon name="alert-circle" size={18} color={Colors.danger} />
            <Text style={[gs.bodySm, gs.flex1, { color: Colors.dangerDark }]}>{b.galatServer}</Text>
          </View>
        ) : null}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + Spacing.sm }]}>
        <Button label="Ajukan Booking" iconRight="send" onPress={kirim} loading={b.mengirim} style={gs.flex1} />
      </View>

      <SheetPilihan visible={sheet === 'plant'} judul="Plant" opsi={b.opsiPlant} terpilih={form.idPlant} onPilih={(id) => b.ubah('idPlant', id)} onClose={() => setSheet(null)} />
      <SheetPilihan visible={sheet === 'ruangan'} judul="Ruangan" opsi={b.opsiRuangan} terpilih={form.idRuangan} onPilih={(id) => b.ubah('idRuangan', id)} onClose={() => setSheet(null)} />
      <SheetPilihan visible={sheet === 'departemen'} judul="Departemen" opsi={b.opsiDepartemen} terpilih={form.idDepartemen} onPilih={(id) => b.ubah('idDepartemen', id)} onClose={() => setSheet(null)} />
      <SheetKaryawan visible={sheet === 'peserta'} judul="Tambah Peserta" onClose={() => setSheet(null)} onPilih={(k) => b.tambahPeserta(k.nama)} />
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
  bagian: { marginBottom: Spacing.lg },
  jenis: { flexDirection: 'row', gap: Spacing.sm },
  chip: {
    flex: 1,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Spacing.radius.full,
    ...Spacing.curve,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
  },
  chipAktif: { backgroundColor: brand[50], borderColor: brand[600] },
  teksChip: { fontFamily: fonts.medium, fontSize: ukuranIsi, color: Colors.textSecondary },
  teksChipAktif: { fontFamily: fonts.bold, color: brand[700] },
  baris: { flexDirection: 'row', gap: Spacing.md, marginBottom: Spacing.md },
  kepalaBagian: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing.sm },
  kartuPeserta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.sm,
    borderRadius: Spacing.radius.md,
    ...Spacing.curve,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: slate[50],
  },
  namaPeserta: { flex: 1, fontFamily: fonts.semibold, fontSize: ukuranIsi, color: Colors.textPrimary },
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

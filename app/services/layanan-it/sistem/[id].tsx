/**
 * Detail Request Pembuatan Sistem milik sendiri, dibuat padat untuk layar HP: kepala (ikon, nama aplikasi,
 * nomor, lencana), isian sebagai baris "label | nilai", daftar tujuan & manfaat bernomor, catatan penolakan /
 * keterangan IT, dan linimasa persetujuan empat tingkat. Sumber: GET /layanan-it/request-sistem/{id}.
 */
import React from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AppBar from '../../../../src/components/common/AppBar';
import Button from '../../../../src/components/common/Button';
import Icon from '../../../../src/components/common/Icon';
import KeadaanKosong from '../../../../src/components/common/KeadaanKosong';
import { SkeletonDetail } from '../../../../src/components/common/Skeleton';
import TeksHtml from '../../../../src/components/common/TeksHtml';
import LencanaStatusRequestAkun from '../../../../src/components/layananIt/LencanaStatusRequestAkun';
import LinimasaTiket from '../../../../src/components/tiket/LinimasaTiket';
import Colors, { brand } from '../../../../constants/Colors';
import Spacing from '../../../../constants/Spacing';
import { fonts } from '../../../../constants/Typography';
import { gs } from '../../../../constants/GlobalStyles';
import { useDetailRequestSistem } from '../../../../src/hooks/useDetailRequestSistem';
import { formatWaktuRequest, langkahRequestSistem } from '../../../../src/adapters/requestAkun';

/** Satu baris isian: label tetap di kiri, nilai di kanan (membungkus bila panjang); null = tidak tampil. */
function Baris({ label, nilai }: { label: string; nilai: string | null }) {
  if (!nilai) return null;
  return (
    <View style={styles.baris}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.nilai}>{nilai}</Text>
    </View>
  );
}

/** Baris isian berisi HTML (deskripsi dari editor teks kaya); null = tidak tampil. */
function BarisHtml({ label, html, lebar }: { label: string; html: string | null; lebar: number }) {
  if (!html) return null;
  return (
    <View style={styles.baris}>
      <Text style={styles.label}>{label}</Text>
      <View style={gs.flex1}>
        <TeksHtml html={html} lebar={lebar} />
      </View>
    </View>
  );
}

/** Daftar bernomor rapat (tujuan, manfaat). */
function Butir({ judul, butir }: { judul: string; butir: string[] }) {
  if (butir.length === 0) return null;
  return (
    <View style={styles.baris}>
      <Text style={styles.label}>{judul}</Text>
      <View style={gs.flex1}>
        {butir.map((b, i) => (
          <Text key={i} style={styles.nilai}>{i + 1}. {b}</Text>
        ))}
      </View>
    </View>
  );
}

export default function DetailRequestSistemScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const d = useDetailRequestSistem(Number(id));

  if (d.memuat) {
    return (
      <View style={[gs.screen, { backgroundColor: Colors.white }]}>
        <AppBar judul="Detail Request" />
        <SkeletonDetail />
      </View>
    );
  }

  if (!d.data) {
    return (
      <View style={[gs.screen, { backgroundColor: Colors.white }]}>
        <AppBar judul="Detail Request" />
        <KeadaanKosong pose="mikir" judul="Gagal memuat" teks={d.error} style={styles.kosong}>
          <Button label="Coba Lagi" onPress={d.cobaLagi} style={{ marginTop: Spacing.lg }} />
        </KeadaanKosong>
      </View>
    );
  }

  const r = d.data;
  const tujuan = [r.departemen, r.plant].filter(Boolean).join(' · ');
  const ditolak = r.status === 'ditolak' && !!r.catatanPenolakan;
  const disetujui = r.status === 'disetujui';

  return (
    <View style={[gs.screen, { backgroundColor: Colors.white }]}>
      <AppBar judul="Detail Request" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.isi, { paddingBottom: insets.bottom + Spacing.xl }]}
        refreshControl={<RefreshControl refreshing={d.menyegarkan} onRefresh={d.segarkan} colors={[Colors.primary]} tintColor={Colors.primary} />}
      >
        <View style={styles.kepala}>
          <View style={styles.ikon}>
            <Icon name="application-outline" size={20} color={brand[700]} />
          </View>
          <View style={gs.flex1}>
            <Text style={styles.judul}>{r.namaAplikasi}</Text>
            <View style={styles.barisLencana}>
              <LencanaStatusRequestAkun status={r.status} label={r.statusLabel} />
            </View>
            <Text style={styles.nomor} selectable>{r.nomorDokumen}</Text>
          </View>
        </View>

        {ditolak || disetujui ? (
          <View style={[styles.catatan, { backgroundColor: ditolak ? Colors.serviceRed : brand[50] }]}>
            <Icon name={ditolak ? 'alert-circle' : 'check-circle'} size={16} color={ditolak ? Colors.danger : brand[600]} />
            <Text style={[styles.teksCatatan, { color: ditolak ? Colors.dangerDark : brand[700] }]}>
              {ditolak ? `Ditolak: ${r.catatanPenolakan}` : 'Disetujui semua tingkat dan masuk antrean pengerjaan Tim IT.'}
            </Text>
          </View>
        ) : null}

        <Text style={styles.judulBagian}>Pengajuan</Text>
        <View>
          <Baris label="Pemohon" nilai={r.namaUser} />
          <Baris label="Tujuan approval" nilai={tujuan || null} />
          <BarisHtml label="Deskripsi" html={r.deskripsi} lebar={width - Spacing.screenPadding * 2 - 88 - Spacing.md} />
          <Butir judul="Tujuan" butir={r.tujuan} />
          <Butir judul="Manfaat" butir={r.manfaat} />
          <Baris label="Keterangan IT" nilai={r.keteranganIt} />
          <Baris label="Diajukan" nilai={formatWaktuRequest(r.diajukanAt)} />
        </View>

        <Text style={[styles.judulBagian, { marginTop: Spacing.lg }]}>Status</Text>
        <LinimasaTiket langkah={langkahRequestSistem(r)} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  isi: { paddingHorizontal: Spacing.screenPadding, paddingTop: Spacing.md },
  kosong: { flex: 1, justifyContent: 'center', paddingHorizontal: Spacing.lg },
  kepala: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.md, marginBottom: Spacing.md },
  ikon: { width: 40, height: 40, borderRadius: 20, backgroundColor: brand[50], alignItems: 'center', justifyContent: 'center' },
  judul: { fontFamily: fonts.bold, fontSize: 14, color: Colors.textPrimary },
  barisLencana: { marginVertical: 2 },
  nomor: { fontFamily: fonts.regular, fontSize: 12, color: Colors.textTertiary },
  catatan: {
    flexDirection: 'row',
    gap: Spacing.sm,
    padding: Spacing.sm,
    marginBottom: Spacing.md,
    borderRadius: Spacing.radius.md,
    ...Spacing.curve,
  },
  teksCatatan: { flex: 1, fontFamily: fonts.regular, fontSize: 12 },
  judulBagian: {
    fontSize: 12,
    fontFamily: fonts.semibold,
    color: Colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: Spacing.xs,
  },
  baris: {
    flexDirection: 'row',
    gap: Spacing.md,
    paddingVertical: 7,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
  },
  label: { width: 88, fontFamily: fonts.regular, fontSize: 12, color: Colors.textTertiary },
  nilai: { flex: 1, fontFamily: fonts.semibold, fontSize: 12, color: Colors.textPrimary },
});

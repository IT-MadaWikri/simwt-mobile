/**
 * Detail Form Keluar Pabrik milik sendiri, dibuat padat untuk layar HP: kepala satu blok (ikon, jenis,
 * lencana status, nomor dokumen), isian sebagai baris "label | nilai" rapat, catatan penolakan / persetujuan,
 * dan linimasa status. Sumber: GET /layanan-hrd/keluar-pabrik/{id}.
 */
import React from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AppBar from '../../../src/components/common/AppBar';
import Button from '../../../src/components/common/Button';
import Icon from '../../../src/components/common/Icon';
import KeadaanKosong from '../../../src/components/common/KeadaanKosong';
import { SkeletonDetail } from '../../../src/components/common/Skeleton';
import QrPassKeluarPabrik from '../../../src/components/layananHrd/QrPassKeluarPabrik';
import LencanaStatusKeluarPabrik from '../../../src/components/layananHrd/LencanaStatusKeluarPabrik';
import LinimasaTiket from '../../../src/components/tiket/LinimasaTiket';
import Colors, { brand } from '../../../constants/Colors';
import Spacing from '../../../constants/Spacing';
import { fonts } from '../../../constants/Typography';
import { gs } from '../../../constants/GlobalStyles';
import { useDetailKeluarPabrik } from '../../../src/hooks/useKeluarPabrik';
import {
  LABEL_JENIS,
  LABEL_KATEGORI,
  formatRentangJam,
  formatTanggalKeluar,
  formatWaktuKeluarPabrik,
  langkahKeluarPabrik,
} from '../../../src/adapters/keluarPabrik';

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

export default function DetailKeluarPabrikScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const d = useDetailKeluarPabrik(Number(id));

  if (d.memuat) {
    return (
      <View style={[gs.screen, { backgroundColor: Colors.white }]}>
        <AppBar judul="Detail Form" />
        <SkeletonDetail />
      </View>
    );
  }

  if (!d.data) {
    return (
      <View style={[gs.screen, { backgroundColor: Colors.white }]}>
        <AppBar judul="Detail Form" />
        <KeadaanKosong pose="mikir" judul="Gagal memuat" teks={d.error} style={styles.kosong}>
          <Button label="Coba Lagi" onPress={d.cobaLagi} style={{ marginTop: Spacing.lg }} />
        </KeadaanKosong>
      </View>
    );
  }

  const f = d.data;
  const unit = [f.departemen, f.plant].filter(Boolean).join(' · ');
  const ditolak = f.status === 'ditolak' && !!f.catatanPenolakan;
  const disetujui = f.status === 'disetujui';

  return (
    <View style={[gs.screen, { backgroundColor: Colors.white }]}>
      <AppBar judul="Detail Form" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.isi, { paddingBottom: insets.bottom + Spacing.xl }]}
        refreshControl={<RefreshControl refreshing={d.menyegarkan} onRefresh={d.segarkan} colors={[Colors.primary]} tintColor={Colors.primary} />}
      >
        <View style={styles.kepala}>
          <View style={styles.ikon}>
            <Icon name="logout" size={20} color={brand[700]} />
          </View>
          <View style={gs.flex1}>
            <Text style={styles.judul}>Keluar Pabrik · {LABEL_JENIS[f.jenisKeluar]}</Text>
            <View style={styles.barisStatus}>
              <LencanaStatusKeluarPabrik status={f.status} label={f.statusLabel} />
            </View>
            <Text style={styles.nomor} selectable>{f.nomorDokumen}</Text>
          </View>
        </View>

        {ditolak || disetujui ? (
          <View style={[styles.catatan, { backgroundColor: ditolak ? Colors.serviceRed : brand[50] }]}>
            <Icon name={ditolak ? 'alert-circle' : 'check-circle'} size={16} color={ditolak ? Colors.danger : brand[600]} />
            <Text style={[styles.teksCatatan, { color: ditolak ? Colors.dangerDark : brand[700] }]}>
              {ditolak
                ? `Ditolak: ${f.catatanPenolakan}`
                : `Disetujui${f.disetujuiOleh ? ` oleh ${f.disetujuiOleh}` : ''}.${f.catatanPersetujuan ? ` ${f.catatanPersetujuan}` : ''}`}
            </Text>
          </View>
        ) : null}

        {f.gerbangUrl ? <QrPassKeluarPabrik url={f.gerbangUrl} /> : null}

        <Text style={styles.judulBagian}>Pengajuan</Text>
        <View>
          <Baris label="Pemohon" nilai={f.namaUser} />
          <Baris label="Kategori" nilai={LABEL_KATEGORI[f.kategori]} />
          <Baris label="Unit kerja" nilai={unit || null} />
          <Baris label="Tanggal" nilai={formatTanggalKeluar(f.tanggalKeluar)} />
          <Baris label="Jam" nilai={formatRentangJam(f.jamKeluar, f.jamKembali)} />
          <Baris label="Alasan" nilai={f.alasan} />
          <Baris label="Keluar aktual" nilai={f.waktuKeluarAktual ? formatWaktuKeluarPabrik(f.waktuKeluarAktual) : null} />
          <Baris label="Kembali aktual" nilai={f.waktuKembaliAktual ? formatWaktuKeluarPabrik(f.waktuKembaliAktual) : null} />
          <Baris label="Diajukan" nilai={formatWaktuKeluarPabrik(f.diajukanAt)} />
        </View>

        <Text style={[styles.judulBagian, { marginTop: Spacing.lg }]}>Status</Text>
        <LinimasaTiket langkah={langkahKeluarPabrik(f)} />
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
  barisStatus: { flexDirection: 'row', alignItems: 'center', marginVertical: 2 },
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

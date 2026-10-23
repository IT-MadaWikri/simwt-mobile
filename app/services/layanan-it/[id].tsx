/**
 * Detail Request Akun milik sendiri, dibuat padat untuk layar HP: kepala satu blok (ikon, jenis & sistem,
 * lencana status, nomor dokumen), isian sebagai baris "label | nilai" rapat tanpa kartu pembungkus, catatan
 * penolakan / penyerahan, dan linimasa status. Sumber: GET /layanan-it/request-akun/{id}.
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
import LencanaStatusRequestAkun from '../../../src/components/layananIt/LencanaStatusRequestAkun';
import LinimasaTiket from '../../../src/components/tiket/LinimasaTiket';
import Colors, { brand } from '../../../constants/Colors';
import Spacing from '../../../constants/Spacing';
import { fonts } from '../../../constants/Typography';
import { gs } from '../../../constants/GlobalStyles';
import { useDetailRequestAkun } from '../../../src/hooks/useDetailRequestAkun';
import { LABEL_METODE, formatWaktuRequest, langkahRequestAkun } from '../../../src/adapters/requestAkun';

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

export default function DetailRequestAkunScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const d = useDetailRequestAkun(Number(id));

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
  const selesai = r.status === 'selesai';
  const ditolak = r.status === 'ditolak' && !!r.catatanPenolakan;

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
            <Icon name="account-cog-outline" size={20} color={brand[700]} />
          </View>
          <View style={gs.flex1}>
            <Text style={styles.judul}>{r.jenisPermintaan}</Text>
            <View style={styles.barisSistem}>
              <Text style={[styles.sistem, styles.flexMenyusut]}>{r.sistem}</Text>
              <LencanaStatusRequestAkun status={r.status} label={r.statusLabel} />
            </View>
            <Text style={styles.nomor} selectable>{r.nomorDokumen}</Text>
          </View>
        </View>

        {ditolak || selesai ? (
          <View style={[styles.catatan, { backgroundColor: ditolak ? Colors.serviceRed : brand[50] }]}>
            <Icon name={ditolak ? 'alert-circle' : 'check-circle'} size={16} color={ditolak ? Colors.danger : brand[600]} />
            <Text style={[styles.teksCatatan, { color: ditolak ? Colors.dangerDark : brand[700] }]}>
              {ditolak
                ? `Ditolak: ${r.catatanPenolakan}`
                : r.metodePenyerahan === 'email'
                  ? 'Selesai. Detail akun dikirim ke email Anda.'
                  : 'Selesai. Akun diserahkan langsung oleh Tim IT.'}
            </Text>
          </View>
        ) : null}

        <Text style={styles.judulBagian}>Permintaan</Text>
        <View>
          <Baris label="Pemohon" nilai={r.namaUser} />
          <Baris label="Tujuan" nilai={tujuan || null} />
          <Baris label="Username" nilai={r.usernameAkun} />
          <Baris label="Gmail" nilai={r.emailDiminta} />
          <Baris label="Detail akses" nilai={r.detailAkses} />
          <Baris label="Keterangan" nilai={r.keterangan} />
          <Baris label="Alasan" nilai={r.alasan} />
          <Baris label="Penyerahan" nilai={r.metodePreferensi ? LABEL_METODE[r.metodePreferensi] ?? r.metodePreferensi : null} />
          <Baris label="Diajukan" nilai={formatWaktuRequest(r.diajukanAt)} />
        </View>

        <Text style={[styles.judulBagian, { marginTop: Spacing.lg }]}>Status</Text>
        <LinimasaTiket langkah={langkahRequestAkun(r)} />
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
  barisSistem: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginVertical: 2 },
  flexMenyusut: { flexShrink: 1 },
  sistem: { fontFamily: fonts.regular, fontSize: 12, color: Colors.textSecondary },
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

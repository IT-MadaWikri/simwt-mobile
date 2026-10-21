/**
 * Detail aset (hasil pindai QR) — seksi selebar layar di atas latar putih, gaya sama
 * dengan detail tiket: galeri foto, identitas, ubin ringkas, spesifikasi, riwayat
 * perbaikan, dan tombol lapor masalah yang menempel di bawah.
 */
import LencanaAngka from '../src/components/common/LencanaAngka';
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from '../src/components/common/Icon';
import Button from '../src/components/common/Button';
import GaleriAset from '../src/components/aset/GaleriAset';
import LencanaStatusTiket from '../src/components/tiket/LencanaStatusTiket';
import { SkeletonDetail } from '../src/components/common/Skeleton';
import Colors, { slate } from '../constants/Colors';
import Spacing from '../constants/Spacing';
import { fonts, ukuranIsi } from '../constants/Typography';
import { gs } from '../constants/GlobalStyles';
import { useAsetScan } from '../src/hooks/useAsetScan';
import { statusAman, tiketAktif } from '../src/adapters/tiket';
import { adaptasiExtraData } from '../src/adapters/aset';
import { urlFoto } from '../src/utils/kaizen';

// Warna ikon sama dengan grid layanan; tint 12% untuk latar ubin/kapsul.
const WARNA = { jingga: '#ff9a2e', biru: '#4a98ff', ungu: '#9a6bff', tosca: '#1fc2a8' };
const tint = (hex: string) => `${hex}1f`;

function BarisInfo({ ikon, label, nilai, garis }: { ikon: string; label: string; nilai?: string | null; garis: boolean }) {
  return (
    <View style={[styles.barisSpek, garis && styles.garis]}>
      <Icon name={ikon} size={16} color={Colors.textTertiary} />
      <Text style={styles.labelSpek} numberOfLines={2}>{label}</Text>
      <Text style={styles.nilaiSpek} numberOfLines={3}>{nilai || '-'}</Text>
    </View>
  );
}

const formatTanggal = (nilai?: string) => {
  if (!nilai) return '-';
  const d = new Date(nilai);
  return isNaN(d.getTime()) ? nilai : d.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
};

export default function ScanResultScreen() {
  const { nomor } = useLocalSearchParams<{ nomor: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const { data, memuat, error: galat, muat } = useAsetScan();
  const loading = !!nomor && memuat;
  const error = nomor ? galat : 'Nomor aset tidak ditemukan.';

  useEffect(() => {
    if (nomor) muat(nomor);
  }, [nomor, muat]);

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.white }}>
        <SkeletonDetail />
      </View>
    );
  }

  if (error || !data) {
    return (
      <View style={[gs.screen, gs.centerFill]}>
        <Icon name="alert-circle-outline" size={48} color={Colors.danger} />
        <Text style={gs.emptyText}>{error}</Text>
        <Button label="Kembali" onPress={() => router.back()} style={{ marginTop: Spacing.lg }} />
      </View>
    );
  }

  const { dataAsset: aset, umurAset } = data;
  const foto = (aset.aset_gambar ?? []).map((g) => g.url ?? urlFoto(g.asset_image_path)).filter((u): u is string => !!u);
  // Terbaru di atas.
  const riwayat = [...(aset.tiket ?? [])].sort((a, b) => (b.tanggal_diajukan ?? '').localeCompare(a.tanggal_diajukan ?? ''));

  const chip = [
    { ikon: 'check-decagram', teks: aset.asset_condition, warna: WARNA.tosca },
    { ikon: 'progress-wrench', teks: aset.asset_use, warna: WARNA.jingga },
    { ikon: 'shape-outline', teks: aset.aset_kategori?.asset_category_name, warna: WARNA.biru },
  ].filter((c) => c.teks);

  const ubin = [
    { ikon: 'account-outline', label: 'Pengguna', nilai: aset.asset_pic, warna: WARNA.tosca },
    { ikon: 'office-building-outline', label: 'Departemen pengguna', nilai: aset.departemen_user?.nama, warna: WARNA.ungu },
    { ikon: 'factory', label: 'Plant', nilai: aset.plant?.nama, warna: WARNA.biru },
    { ikon: 'calendar-clock-outline', label: 'Usia aset', nilai: umurAset, warna: WARNA.jingga },
  ];

  const { spesifikasi: spekTeknis, tambahan } = adaptasiExtraData(aset.extra_data);

  const informasi = [
    { ikon: 'shape-outline', label: 'Merek', nilai: aset.asset_brand },
    { ikon: 'view-dashboard-outline', label: 'Model', nilai: aset.asset_model },
    { ikon: 'barcode', label: 'Nomor seri', nilai: aset.asset_serial_number },
    { ikon: 'office-building-outline', label: 'Dept. pemilik', nilai: aset.departemen?.nama },
    { ikon: 'calendar-blank-outline', label: 'Dibeli', nilai: formatTanggal(aset.asset_purchase_date) },
    { ikon: 'calendar-check-outline', label: 'Ditambahkan', nilai: formatTanggal(aset.created_at) },
    { ikon: 'history', label: 'Diperbarui', nilai: formatTanggal(aset.updated_at) },
  ];

  // Selama masih ada tiket aktif pada aset ini, tombol lapor disembunyikan (masalahnya sudah dilaporkan).
  const adaTiketAktif = riwayat.some((t) => tiketAktif(statusAman(t.status_pengajuan)));

  const laporkan = () =>
    router.push({
      pathname: '/services/tiket/buat',
      params: { asetNomor: aset.asset_number ?? nomor, asetNama: aset.asset_name ?? '', asetAlias: aset.alias ?? '' },
    });

  return (
    <View style={[gs.screen, { backgroundColor: Colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={adaTiketAktif ? { paddingBottom: insets.bottom } : undefined}>
        <GaleriAset foto={foto} />

        {/* Identitas */}
        <View style={[styles.seksi, { marginTop: 0 }]}>
          <Text style={styles.judul}>{aset.alias || aset.asset_name || '-'}</Text>
          {aset.alias && aset.asset_name ? <Text style={styles.sub}>{aset.asset_name}</Text> : null}
          <View style={styles.barisNomor}>
            <Icon name="barcode" size={14} color={Colors.textTertiary} />
            <Text style={styles.sub}>{aset.asset_number || '-'}</Text>
          </View>
          {chip.length > 0 ? (
            <View style={styles.chipBaris}>
              {chip.map((c) => (
                <View key={c.ikon} style={[styles.chip, { backgroundColor: tint(c.warna) }]}>
                  <Icon name={c.ikon} size={13} color={c.warna} />
                  <Text style={[styles.chipTeks, { color: c.warna }]} numberOfLines={1}>{c.teks}</Text>
                </View>
              ))}
            </View>
          ) : null}
        </View>

        {/* Ringkas: empat ubin 2×2 */}
        <View style={styles.seksi}>
          <View style={styles.grid}>
            {ubin.map((u) => (
              <View key={u.label} style={styles.ubin}>
                <View style={[styles.lingkar, { backgroundColor: tint(u.warna) }]}>
                  <Icon name={u.ikon} size={15} color={u.warna} />
                </View>
                <View style={gs.flex1}>
                  <Text style={styles.label} numberOfLines={1}>{u.label}</Text>
                  <Text style={styles.nilai} numberOfLines={2}>{u.nilai || '-'}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.seksi}>
          <Text style={styles.judulSeksi}>Informasi aset</Text>
          {informasi.map((s, i) => (
            <BarisInfo key={s.label} ikon={s.ikon} label={s.label} nilai={s.nilai} garis={i > 0} />
          ))}
        </View>

        {/* Data opsional yang diisi di web (Update Data aset). Seksi hanya muncul bila ada isinya. */}
        {spekTeknis.length > 0 ? (
          <View style={styles.seksi}>
            <Text style={styles.judulSeksi}>Spesifikasi teknis</Text>
            {spekTeknis.map((s, i) => (
              <BarisInfo key={s.label} ikon="cog-outline" label={s.label} nilai={s.nilai} garis={i > 0} />
            ))}
          </View>
        ) : null}

        {tambahan.length > 0 ? (
          <View style={styles.seksi}>
            <Text style={styles.judulSeksi}>Data lainnya</Text>
            {tambahan.map((s, i) => (
              <BarisInfo key={`${s.label}-${i}`} ikon="information-outline" label={s.label} nilai={s.nilai} garis={i > 0} />
            ))}
          </View>
        ) : null}

        {aset.asset_description?.trim() ? (
          <View style={styles.seksi}>
            <Text style={styles.judulSeksi}>Deskripsi</Text>
            <Text style={styles.deskripsi}>{aset.asset_description.trim()}</Text>
          </View>
        ) : null}

        <View style={styles.seksi}>
          <View style={styles.judulBaris}>
            <Text style={[styles.judulSeksi, { marginBottom: 0 }]}>Riwayat perbaikan</Text>
            <LencanaAngka jumlah={riwayat.length} ukuran={20} warna={slate[100]} teks={Colors.textSecondary} />
          </View>
          {riwayat.length === 0 ? (
            <View style={styles.kosong}>
              <Icon name="clipboard-check-outline" size={28} color={slate[300]} />
              <Text style={styles.sub}>Belum ada riwayat perbaikan.</Text>
            </View>
          ) : (
            riwayat.map((t, i) => (
              <TouchableOpacity
                key={t.no_ticket ?? i}
                style={[styles.barisRiwayat, i > 0 && styles.garis]}
                activeOpacity={0.6}
                disabled={!t.no_ticket}
                onPress={() => router.push(`/services/tiket/${t.no_ticket}` as any)}
              >
                <View style={[styles.lingkar, { backgroundColor: tint(WARNA.jingga) }]}>
                  <Icon name="progress-wrench" size={16} color={WARNA.jingga} />
                </View>
                <View style={gs.flex1}>
                  <Text style={styles.teksRiwayat} numberOfLines={2}>{t.judul_masalah || '-'}</Text>
                  <Text style={styles.sub} numberOfLines={1}>
                    {[t.no_ticket && `#${t.no_ticket}`, t.tanggal_diajukan && formatTanggal(t.tanggal_diajukan)].filter(Boolean).join(' · ')}
                  </Text>
                </View>
                <LencanaStatusTiket status={statusAman(t.status_pengajuan)} />
                <Icon name="chevron-right" size={16} color={Colors.textTertiary} />
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>

      {adaTiketAktif ? null : (
        <View style={[styles.footer, { paddingBottom: insets.bottom + Spacing.sm }]}>
          <Button icon="ticket-outline" label="Laporkan Masalah Aset" onPress={laporkan} block />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  seksi: {
    backgroundColor: Colors.white,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    marginTop: Spacing.xs,
  },
  judul: { fontSize: ukuranIsi, fontFamily: fonts.bold, color: Colors.textPrimary },
  sub: { fontSize: 12, fontFamily: fonts.regular, color: Colors.textSecondary, marginTop: 2 },
  barisNomor: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 },
  chipBaris: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs, marginTop: Spacing.sm },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
    borderRadius: Spacing.radius.full,
    maxWidth: '100%',
  },
  chipTeks: { fontSize: 12, fontFamily: fonts.semibold },

  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs },
  ubin: {
    width: '49%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
  },
  lingkar: {
    width: 28,
    height: 28,
    borderRadius: Spacing.radius.sm,
    ...Spacing.curve,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: { fontSize: 12, fontFamily: fonts.regular, color: Colors.textTertiary },
  nilai: { fontSize: 12, fontFamily: fonts.semibold, color: Colors.textPrimary },

  judulSeksi: {
    fontSize: 12,
    fontFamily: fonts.semibold,
    color: Colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  judulBaris: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: 2 },
  barisSpek: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingVertical: 7 },
  garis: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: Colors.border },
  labelSpek: { width: 100, fontSize: 12, fontFamily: fonts.regular, color: Colors.textSecondary },
  nilaiSpek: { flex: 1, textAlign: 'right', fontSize: 12, fontFamily: fonts.semibold, color: Colors.textPrimary },

  deskripsi: { fontSize: ukuranIsi, fontFamily: fonts.regular, color: Colors.textSecondary, lineHeight: 18 },
  barisRiwayat: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingVertical: Spacing.sm },
  teksRiwayat: { fontSize: 12, fontFamily: fonts.semibold, color: Colors.textPrimary },
  kosong: { alignItems: 'center', gap: Spacing.xs, paddingVertical: Spacing.lg },

  footer: {
    backgroundColor: Colors.white,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.borderSubtle,
  },
});

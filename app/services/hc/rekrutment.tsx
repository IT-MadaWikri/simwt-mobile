/**
 * Rekrutmen — ringkasan untuk HR di lapangan.
 *
 * Sumber data: GET /rekrutmen/dashboard di api-simwt (baca saja; seluruh alur
 * kerja HR tetap di web sim-mwt).
 *
 * Ditulis ulang supaya terasa aplikasi native, bukan halaman web yang
 * dibungkus:
 *  - Tidak ada satu pun tombol mati. Versi lama menampilkan 3 pil aksi dan
 *    4 kartu menu yang semuanya tanpa `onPress` — disentuh, diam, persis
 *    perilaku halaman web yang belum di-wire. Aksi yang layarnya belum ada
 *    TIDAK ditampilkan sebagai tombol.
 *  - Pipeline digambar sebagai bilah proporsi, bukan tabel baris-baris tipis
 *    ala <table> web.
 *  - Semua rupa dari kelas global `gs` — kartu, lencana, tipografi Poppins —
 *    sehingga senada dengan layar Stok Opname & beranda.
 */
import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { Stack } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors, { brand } from '../../../constants/Colors';
import Spacing from '../../../constants/Spacing';
import { fonts } from '../../../constants/Typography';
import { gs } from '../../../constants/GlobalStyles';
import LoadingSpinner from '../../../src/components/common/LoadingSpinner';
import {
  rekrutmentService,
  RekrutmentDashboardResponse,
} from '../../../src/services/rekrutmentService';
import { useSetelahTransisi } from '../../../src/utils/useSetelahTransisi';
import TombolKembali from '../../../src/components/common/TombolKembali';

/** Urutan & warna tahap pipeline — tahap akhir diberi warna tegas. */
const WARNA_TAHAP: Record<string, string> = {
  Diterima: brand[600],
  'Tidak Diterima': Colors.danger,
};

export default function RekrutmentScreen() {
  const insets = useSafeAreaInsets();
  const [data, setData] = useState<RekrutmentDashboardResponse | null>(null);
  const [memuat, setMemuat] = useState(true);
  const [menyegarkan, setMenyegarkan] = useState(false);
  const [galat, setGalat] = useState<string | null>(null);

  const muat = useCallback(async () => {
    try {
      setGalat(null);
      setData(await rekrutmentService.getDashboardAdmin());
    } catch (err: any) {
      setGalat(
        err?.response?.data?.message || err?.message || 'Gagal memuat data rekrutmen.'
      );
    } finally {
      setMemuat(false);
      setMenyegarkan(false);
    }
  }, []);

  // Ditunda sampai animasi masuk selesai — lihat useSetelahTransisi.ts.
  useSetelahTransisi(() => {
    muat();
  }, [muat]);

  const layar = (
    <Stack.Screen
      options={{
        headerShown: true,
        headerTitle: 'Rekrutmen',
        headerLeft: () => <TombolKembali />,
        headerStyle: { backgroundColor: Colors.primary },
        headerTintColor: Colors.white,
        headerTitleStyle: { fontFamily: fonts.semibold },
        headerShadowVisible: false,
      }}
    />
  );

  if (memuat) {
    return (
      <>
        {layar}
        <View style={gs.screen}>
          <LoadingSpinner message="Memuat ringkasan rekrutmen..." />
        </View>
      </>
    );
  }

  if (!data) {
    return (
      <>
        {layar}
        <View style={[gs.screen, gs.centerFill]}>
          <MaterialCommunityIcons
            name="alert-circle-outline"
            size={48}
            color={Colors.textTertiary}
          />
          <Text style={gs.emptyTitle}>Gagal memuat</Text>
          <Text style={gs.emptyText}>{galat ?? 'Terjadi kesalahan.'}</Text>
          <TouchableOpacity
            style={[gs.btn, gs.btnPrimary, { marginTop: Spacing.xl }]}
            onPress={() => {
              setMemuat(true);
              muat();
            }}
            activeOpacity={0.85}
          >
            <Text style={[gs.btnText, gs.btnTextOnBrand]}>Coba Lagi</Text>
          </TouchableOpacity>
        </View>
      </>
    );
  }

  const { ringkasan, pipeline, surat_belum_terkirim, jadwal_hari_ini, lowongan_teratas } = data;
  const totalPipeline = pipeline.reduce((jumlah, tahap) => jumlah + tahap.jumlah, 0);

  return (
    <>
      {layar}
      <ScrollView
        style={gs.screen}
        contentContainerStyle={[gs.scrollContent, { paddingBottom: insets.bottom + Spacing.xxl }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={menyegarkan}
            onRefresh={() => {
              setMenyegarkan(true);
              muat();
            }}
            colors={[Colors.primary]}
            tintColor={Colors.primary}
          />
        }
      >
        {/* ── Angka utama: grid 2×2 kartu metrik ─────────────────────── */}
        <View style={[gs.row, gs.gapMd]}>
          <Metrik
            icon="briefcase-outline"
            nilai={ringkasan.lowongan_aktif}
            label="Lowongan Aktif"
          />
          <Metrik
            icon="account-group-outline"
            nilai={ringkasan.pelamar_total}
            label="Total Pelamar"
          />
        </View>
        <View style={[gs.row, gs.gapMd, { marginTop: Spacing.md }]}>
          <Metrik
            icon="calendar-clock-outline"
            nilai={ringkasan.jadwal_hari_ini}
            label="Jadwal Hari Ini"
          />
          <Metrik
            icon="email-alert-outline"
            nilai={ringkasan.surat_belum_terkirim}
            label="Surat Belum Terkirim"
            genting={ringkasan.surat_belum_terkirim > 0}
          />
        </View>

        {/* Rincian surat hanya muncul kalau memang ada yang menunggak. */}
        {ringkasan.surat_belum_terkirim > 0 && (
          <View style={[gs.cardBrand, gs.row, gs.gapSm, { marginTop: Spacing.md }]}>
            <MaterialCommunityIcons name="information-outline" size={18} color={brand[700]} />
            <Text style={[gs.bodySm, gs.flex1, { color: brand[800] }]}>
              Interview {surat_belum_terkirim.interview} surat · PKWT{' '}
              {surat_belum_terkirim.pkwt} surat. Pengiriman dilakukan dari SIMWT web.
            </Text>
          </View>
        )}

        {/* ── Pipeline sebagai bilah proporsi ────────────────────────── */}
        {totalPipeline > 0 && (
          <View style={[gs.card, { marginTop: Spacing.sectionGap }]}>
            <View style={gs.rowBetween}>
              <Text style={gs.title}>Pipeline Lamaran</Text>
              <Text style={gs.caption}>
                {totalPipeline.toLocaleString('id-ID')} lamaran ·{' '}
                {ringkasan.pelamar_30_hari} dalam 30 hari
              </Text>
            </View>

            {/* Bilah gabungan: tiap tahap selebar porsinya. */}
            <View style={styles.bilah}>
              {pipeline.map((tahap) => (
                <View
                  key={tahap.status}
                  style={{
                    flex: tahap.jumlah,
                    backgroundColor: WARNA_TAHAP[tahap.status] ?? brand[300],
                  }}
                />
              ))}
            </View>

            {pipeline.map((tahap) => (
              <View key={tahap.status} style={[gs.rowBetween, { marginTop: Spacing.sm }]}>
                <View style={[gs.row, gs.gapSm]}>
                  <View
                    style={[
                      styles.titik,
                      { backgroundColor: WARNA_TAHAP[tahap.status] ?? brand[300] },
                    ]}
                  />
                  <Text style={gs.bodySm}>{tahap.status}</Text>
                </View>
                <Text style={[gs.bodySm, gs.textSemibold, { color: Colors.textPrimary }]}>
                  {tahap.jumlah.toLocaleString('id-ID')}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* ── Jadwal hari ini ────────────────────────────────────────── */}
        <Text style={[gs.sectionTitle, { marginTop: Spacing.sectionGap }]}>Jadwal Hari Ini</Text>
        {jadwal_hari_ini.length === 0 ? (
          <View style={[gs.card, gs.row, gs.gapMd]}>
            <View style={gs.iconTile}>
              <MaterialCommunityIcons name="calendar-check" size={20} color={brand[600]} />
            </View>
            <Text style={[gs.bodySm, gs.flex1]}>
              Tidak ada jadwal psikotes atau wawancara hari ini.
            </Text>
          </View>
        ) : (
          jadwal_hari_ini.map((jadwal) => (
            <View key={jadwal.id} style={[gs.card, gs.row, gs.gapMd, { marginBottom: Spacing.sm }]}>
              <View style={gs.iconTile}>
                <MaterialCommunityIcons
                  name={jadwal.metode === 'Online' ? 'video-outline' : 'map-marker-outline'}
                  size={20}
                  color={brand[600]}
                />
              </View>
              <View style={gs.flex1}>
                <Text style={gs.title} numberOfLines={1}>
                  {jadwal.judul}
                </Text>
                <Text style={gs.caption}>
                  {jadwal.kategori} · {jadwal.metode}
                </Text>
              </View>
              <View style={[gs.badge, gs.badgeBrand]}>
                <Text style={[gs.badgeText, gs.badgeTextBrand]}>{jadwal.status}</Text>
              </View>
            </View>
          ))
        )}

        {/* ── Lowongan terbanyak pelamar ─────────────────────────────── */}
        {lowongan_teratas.length > 0 && (
          <>
            <Text style={[gs.sectionTitle, { marginTop: Spacing.sectionGap }]}>
              Lowongan Terbanyak Pelamar
            </Text>
            {lowongan_teratas.map((lowongan) => {
              const capai =
                lowongan.kebutuhan > 0
                  ? Math.min(100, Math.round((lowongan.jumlah_pelamar / lowongan.kebutuhan) * 100))
                  : 0;

              return (
                <View key={lowongan.id} style={[gs.card, { marginBottom: Spacing.sm }]}>
                  <View style={gs.rowBetween}>
                    <Text style={[gs.title, gs.flex1]} numberOfLines={1}>
                      {lowongan.judul_lowongan}
                    </Text>
                    <Text style={[gs.bodySm, gs.textSemibold, gs.textBrand]}>
                      {lowongan.jumlah_pelamar}/{lowongan.kebutuhan}
                    </Text>
                  </View>
                  {lowongan.departemen ? (
                    <Text style={gs.caption}>{lowongan.departemen}</Text>
                  ) : null}

                  <View style={[styles.bilah, { marginTop: Spacing.sm }]}>
                    <View style={{ flex: capai, backgroundColor: brand[500] }} />
                    <View style={{ flex: 100 - capai, backgroundColor: 'transparent' }} />
                  </View>
                </View>
              );
            })}
          </>
        )}

        {/* Alur kerja HR memang bukan di aplikasi ini — katakan apa adanya,
            jangan pajang tombol yang tidak menuju ke mana pun. */}
        <Text style={[gs.caption, gs.textCenter, { marginTop: Spacing.xl }]}>
          Kelola lowongan, pelamar, dan jadwal melalui SIMWT versi web.
        </Text>
      </ScrollView>
    </>
  );
}

/** Kartu metrik: ikon di ubin, angka besar, label pendek. */
function Metrik({
  icon,
  nilai,
  label,
  genting = false,
}: {
  icon: string;
  nilai: number;
  label: string;
  genting?: boolean;
}) {
  return (
    <View style={[gs.card, gs.flex1]}>
      <View
        style={[
          gs.iconTile,
          genting && { backgroundColor: Colors.serviceRed },
        ]}
      >
        <MaterialCommunityIcons
          name={icon as any}
          size={20}
          color={genting ? Colors.dangerDark : brand[600]}
        />
      </View>
      <Text style={[gs.metric, { marginTop: Spacing.md }, genting && { color: Colors.dangerDark }]}>
        {nilai.toLocaleString('id-ID')}
      </Text>
      <Text style={gs.caption}>{label}</Text>
    </View>
  );
}

const styles = {
  bilah: {
    flexDirection: 'row' as const,
    height: 8,
    borderRadius: Spacing.radius.full,
    backgroundColor: Colors.borderSubtle,
    overflow: 'hidden' as const,
    marginTop: Spacing.md,
  },
  titik: {
    width: 8,
    height: 8,
    borderRadius: Spacing.radius.full,
  },
};

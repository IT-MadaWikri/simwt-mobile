/**
 * Halaman layanan generik — dipakai semua entri grid beranda yang belum punya
 * layar khususnya sendiri.
 *
 * Sebelumnya halaman ini menawarkan tiga aksi seragam ("Tambah Baru", "Lihat
 * Semua", "Laporan") untuk SEMUA layanan, padahal hampir semuanya tidak
 * menuju ke mana pun: ditekan, tidak terjadi apa-apa, tanpa penjelasan. Yang
 * seperti itu lebih buruk daripada tidak ada tombol sama sekali, karena
 * pengguna mengira aplikasinya rusak.
 *
 * Sekarang tiap aksi wajib menyatakan `route`-nya. Yang belum punya layar
 * ditandai jelas sebagai belum tersedia, ditampilkan redup, dan tidak bisa
 * ditekan.
 */
import React, { useCallback, useRef } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import Icon from '../../src/components/common/Icon';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '../../constants/Colors';
import Spacing from '../../constants/Spacing';
import { gs } from '../../constants/GlobalStyles';
import AppBar from '../../src/components/common/AppBar';
import ServiceIcon from '../../src/components/common/ServiceIcon';
import SectionHeader from '../../src/components/common/SectionHeader';
import BannerMaskot from '../../src/components/common/BannerMaskot';
import BarisAsetTiketAktif from '../../src/components/aset/BarisAsetTiketAktif';
import RingkasanAset from '../../src/components/aset/RingkasanAset';
import KartuRequestAkun from '../../src/components/layananIt/KartuRequestAkun';
import KartuKeluarPabrik from '../../src/components/layananHrd/KartuKeluarPabrik';
import { SkeletonBaris } from '../../src/components/common/Skeleton';
import { useAsetTiketAktif } from '../../src/hooks/useAsetTiketAktif';
import { useRingkasanAset } from '../../src/hooks/useRingkasanAset';
import { useRequestAkunSaya } from '../../src/hooks/useRequestAkunSaya';
import { useKeluarPabrikSaya } from '../../src/hooks/useKeluarPabrik';
import { formatWaktuRequest } from '../../src/adapters/requestAkun';
import { LABEL_JENIS, formatRentangJam, formatTanggalKeluar } from '../../src/adapters/keluarPabrik';
import { SERVICES, ServiceItem } from '../../constants/Services';

/** Layanan yang banner maskot "Semua kebutuhan …"-nya disembunyikan dulu. */
const TANPA_BANNER = ['layanan-it', 'layanan-hrd', 'kegiatan'];

/** Banyaknya histori terbaru yang tampil di bawah grid; selebihnya lewat "Lihat Semua". */
const JUMLAH_HISTORI = 3;

/** Segarkan histori tiap layar kembali fokus (mis. setelah mengajukan), kecuali fokus pertama. */
function useSegarkanSaatFokus(muatUlang: () => Promise<void>) {
  const pertama = useRef(true);
  useFocusEffect(
    useCallback(() => {
      if (pertama.current) {
        pertama.current = false;
        return;
      }
      muatUlang();
    }, [muatUlang])
  );
}

function HistoriLayanan({ judul, rute, memuat, error, kosong, children }: {
  judul: string;
  rute: string;
  memuat: boolean;
  error: string | null;
  kosong: string;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const adaIsi = React.Children.count(children) > 0;
  return (
    <View style={styles.bagian}>
      <SectionHeader title={judul} onAction={() => router.push(rute as any)} />
      {memuat ? (
        <SkeletonBaris jumlah={JUMLAH_HISTORI} style={styles.histori} />
      ) : error ? (
        <Text style={[gs.emptyText, gs.containerX]}>{error}</Text>
      ) : !adaIsi ? (
        <Text style={[gs.emptyText, gs.containerX]}>{kosong}</Text>
      ) : (
        <View style={styles.histori}>{children}</View>
      )}
    </View>
  );
}

function HistoriRequestIt() {
  const router = useRouter();
  const h = useRequestAkunSaya();
  useSegarkanSaatFokus(h.muatUlang);
  return (
    <HistoriLayanan judul="Histori Request" rute="/services/layanan-it/histori" memuat={h.memuat} error={h.error} kosong="Belum ada request yang Anda ajukan.">
      {h.daftar.slice(0, JUMLAH_HISTORI).map((r) => (
        <KartuRequestAkun
          key={r.id}
          jenis={r.jenisPermintaan}
          sistem={r.sistem}
          nomorDokumen={r.nomorDokumen}
          diajukan={formatWaktuRequest(r.diajukanAt)}
          status={r.status}
          statusLabel={r.statusLabel}
          onPress={() => router.push(`/services/layanan-it/${r.id}` as any)}
        />
      ))}
    </HistoriLayanan>
  );
}

function HistoriFormHrd() {
  const router = useRouter();
  const h = useKeluarPabrikSaya();
  useSegarkanSaatFokus(h.muatUlang);
  return (
    <HistoriLayanan judul="Histori Form" rute="/services/layanan-hrd/histori" memuat={h.memuat} error={h.error} kosong="Belum ada form yang Anda ajukan.">
      {h.daftar.slice(0, JUMLAH_HISTORI).map((f) => (
        <KartuKeluarPabrik
          key={f.id}
          jenis={LABEL_JENIS[f.jenisKeluar]}
          waktu={`${formatTanggalKeluar(f.tanggalKeluar)} · ${formatRentangJam(f.jamKeluar, f.jamKembali)}`}
          nomorDokumen={f.nomorDokumen}
          status={f.status}
          statusLabel={f.statusLabel}
          onPress={() => router.push(`/services/layanan-hrd/${f.id}` as any)}
        />
      ))}
    </HistoriLayanan>
  );
}

interface AksiLayanan {
  icon: string;
  label: string;
  subtitle: string;
  /** Ada isinya = layarnya sudah jadi dan bisa dibuka. */
  route?: string;
}

export default function ServiceDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const tiketAktif = useAsetTiketAktif();
  const { muat: muatTiketAktif } = tiketAktif;
  const { ringkasan, muat: muatRingkasan } = useRingkasanAset();
  const untukAset = id === 'database-aset';
  // Segar tiap layar kembali fokus (mis. setelah melapor tiket dari detail aset).
  useFocusEffect(
    useCallback(() => {
      if (untukAset) {
        muatTiketAktif();
        muatRingkasan();
      }
    }, [untukAset, muatTiketAktif, muatRingkasan])
  );

  const service = SERVICES.find((s) => s.id === id);

  if (!service) {
    return (
      <View style={[gs.screen, gs.centerFill]}>
        <Icon
          name="alert-circle-outline"
          size={56}
          color={Colors.textTertiary}
        />
        <Text style={gs.emptyTitle}>Layanan tidak ditemukan</Text>
        <Text style={gs.emptyText}>Menu yang Anda tuju tidak terdaftar.</Text>
      </View>
    );
  }

  const judul = service.name.replace('\n', ' ');
  const aksi = aksiUntuk(service);
  const adaYangAktif = aksi.some((item) => !!item.route);
  const aksiUtama = aksi.find((item) => !!item.route);

  return (
    <>
      <AppBar judul={judul} />

      <ScrollView
        style={[gs.screen, { backgroundColor: Colors.white }]}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: Spacing.lg, paddingBottom: insets.bottom + Spacing.xxl }}
      >
        {!adaYangAktif && (
          <View style={[gs.cardBrand, gs.center, { marginHorizontal: Spacing.lg, marginBottom: Spacing.lg }]}>
            <Icon
              name="rocket-launch-outline"
              size={40}
              color={Colors.primary}
            />
            <Text style={[gs.emptyTitle, { marginTop: Spacing.sm }]}>Segera Hadir</Text>
            <Text style={gs.emptyText}>
              Modul {judul} belum tersedia di aplikasi. Untuk sementara masih
              dikerjakan lewat SIMWT versi web.
            </Text>
          </View>
        )}

        {/* Bentuk yang sama dengan menu Kaizen & Tiket: grid ikon. Aksi tanpa `route` tampil "Soon" dan tidak bisa diketuk. */}
        {untukAset ? (
          <RingkasanAset ringkasan={ringkasan} />
        ) : null}

        <SectionHeader title={`Menu ${judul}`} />
        <View style={styles.grid}>
          {aksi.map((item) => (
            <ServiceIcon
              key={item.label}
              service={{
                id: `${service.id}-${item.label}`,
                name: item.label,
                icon: item.icon,
                backgroundColor: service.backgroundColor,
                iconColor: service.iconColor,
                route: item.route ?? '',
                description: item.subtitle,
                segera: !item.route,
              }}
            />
          ))}
        </View>

        {aksiUtama && !TANPA_BANNER.includes(service.id) ? (
          <BannerMaskot
            style={{ marginTop: Spacing.xl }}
            pose="persilakan"
            judul="Semua kebutuhan"
            sorot={judul}
            teks="Pilih salah satu menu di atas untuk memulai."
            label={aksiUtama.label.replace('\n', ' ')}
            onPress={() => router.push(aksiUtama.route as any)}
          />
        ) : null}

        {service.id === 'layanan-it' ? <HistoriRequestIt /> : null}
        {service.id === 'layanan-hrd' ? <HistoriFormHrd /> : null}

        {untukAset ? (
          <View style={styles.bagian}>
            <SectionHeader title="Aset Sedang Diperbaiki" />
            {tiketAktif.aset === null ? (
              <SkeletonBaris jumlah={3} />
            ) : tiketAktif.error ? (
              <Text style={[gs.emptyText, gs.containerX]}>{tiketAktif.error}</Text>
            ) : tiketAktif.aset.length === 0 ? (
              <Text style={[gs.emptyText, gs.containerX]}>Tidak ada aset yang sedang diperbaiki.</Text>
            ) : (
              tiketAktif.aset.map((a, i) => (
                <View key={a.asset_number}>
                  {i > 0 ? <View style={styles.pemisah} /> : null}
                  <BarisAsetTiketAktif
                    nama={a.alias || a.asset_name}
                    nomor={a.asset_number}
                    judulTiket={a.judul_masalah}
                    status={a.status_pengajuan}
                    jumlahTiket={a.jumlah_tiket}
                    onPress={() => router.push({ pathname: '/scan-result', params: { nomor: a.asset_number } })}
                  />
                </View>
              ))
            )}
          </View>
        ) : null}
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: Spacing.md },
  bagian: { marginTop: Spacing.xl },
  histori: { paddingHorizontal: Spacing.screenPadding },
  pemisah: { height: StyleSheet.hairlineWidth, backgroundColor: Colors.border, marginHorizontal: Spacing.screenPadding },
});

/**
 * Daftar aksi per layanan.
 *
 * Isi `route` HANYA kalau layarnya benar-benar ada — begitu layar baru dibuat,
 * cukup tambahkan rutenya di sini dan tombolnya otomatis hidup.
 */
function aksiUntuk(service: ServiceItem): AksiLayanan[] {
  const perLayanan: Record<string, AksiLayanan[]> = {
    'layanan-hrd': [
      { icon: 'logout', label: 'Form Keluar\nPabrik', subtitle: 'Ajukan izin keluar pabrik (Form-HRD-17)', route: '/services/layanan-hrd/keluar-pabrik' },
    ],
    'database-aset': [
      {
        icon: 'qrcode-scan',
        label: 'Scan QR Aset',
        subtitle: 'Pindai label untuk melihat detail aset',
        route: '/(tabs)/scan',
      },
      {
        icon: 'box',
        label: 'Daftar Aset',
        subtitle: 'Aset di departemen kamu',
        route: '/services/aset/daftar',
      },
      { icon: 'plus-circle-outline', label: 'Tambah Aset', subtitle: 'Registrasi aset baru' },
      { icon: 'magnify', label: 'Cari Aset', subtitle: 'Cari berdasarkan kode atau nama' },
    ],
    kegiatan: [
      { icon: 'door-open', label: 'Booking\nRuangan', subtitle: 'Booking ruangan meeting untuk tanggal & jam tertentu', route: '/services/booking-ruangan' },
    ],
    'layanan-it': [
      { icon: 'account-cog-outline', label: 'Request\nAkun', subtitle: 'Akun baru atau perubahan akses sistem', route: '/services/layanan-it/request-akun' },
      { icon: 'plus-circle-outline', label: 'Request\nSistem', subtitle: 'Pengajuan pembuatan aplikasi baru' },
    ],
  };

  return (
    perLayanan[service.id] ?? [
      {
        icon: 'format-list-bulleted',
        label: `Daftar ${service.name.replace('\n', ' ')}`,
        subtitle: 'Belum tersedia di aplikasi',
      },
    ]
  );
}

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
import React, { useCallback } from 'react';
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
import { SkeletonBaris } from '../../src/components/common/Skeleton';
import { useAsetTiketAktif } from '../../src/hooks/useAsetTiketAktif';
import { SERVICES, ServiceItem } from '../../constants/Services';

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
  const untukAset = id === 'database-aset';
  // Segar tiap layar kembali fokus (mis. setelah melapor tiket dari detail aset).
  useFocusEffect(
    useCallback(() => {
      if (untukAset) muatTiketAktif();
    }, [untukAset, muatTiketAktif])
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

        {aksiUtama ? (
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
      {
        icon: 'account-group',
        label: 'Data Karyawan',
        subtitle: 'Direktori seluruh karyawan',
        route: '/services/hc/data-karyawan',
      },
      {
        icon: 'briefcase-account-outline',
        label: 'Rekrutment',
        subtitle: 'Ringkasan lowongan & pelamar',
        route: '/services/hc/rekrutment',
      },
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
    'control-stock': [
      {
        icon: 'clipboard-list-outline',
        label: 'Stok Opname',
        subtitle: 'Lihat dokumen dan progres perhitungan',
        route: '/services/sto',
      },
      {
        icon: 'barcode-scan',
        label: 'Hitung dengan Scan',
        subtitle: 'Menunggu alur scan disiapkan di server',
      },
    ],
    'skill-assessment': [
      { icon: 'star-circle-outline', label: 'Penilaian Skill', subtitle: 'Hasil & jadwal assessment' },
    ],
    kegiatan: [
      { icon: 'door-open', label: 'Booking\nRuangan', subtitle: 'Booking ruangan meeting untuk tanggal & jam tertentu', route: '/services/booking-ruangan' },
    ],
    'layanan-it': [
      { icon: 'plus-circle-outline', label: 'Buat Request', subtitle: 'Request akun, sistem, atau bantuan IT' },
      { icon: 'history', label: 'Histori Request', subtitle: 'Status request yang Anda ajukan' },
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

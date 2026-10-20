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
import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import Icon from '../../src/components/common/Icon';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '../../constants/Colors';
import Spacing from '../../constants/Spacing';
import { gs } from '../../constants/GlobalStyles';
import AppBar from '../../src/components/common/AppBar';
import ServiceIcon from '../../src/components/common/ServiceIcon';
import SectionHeader from '../../src/components/common/SectionHeader';
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

  return (
    <>
      <AppBar judul={judul} />

      <ScrollView
        style={[gs.screen, { backgroundColor: Colors.white }]}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[gs.scrollContent, { paddingBottom: insets.bottom + Spacing.xxl }]}
      >
        {!adaYangAktif && (
          <View style={[gs.cardBrand, gs.center, { marginTop: Spacing.lg }]}>
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
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: Spacing.md },
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

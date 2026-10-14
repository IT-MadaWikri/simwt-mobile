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
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '../../constants/Colors';
import Spacing from '../../constants/Spacing';
import { fonts } from '../../constants/Typography';
import { gs } from '../../constants/GlobalStyles';
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
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const service = SERVICES.find((s) => s.id === id);

  if (!service) {
    return (
      <View style={[gs.screen, gs.centerFill]}>
        <MaterialCommunityIcons
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
      <Stack.Screen
        options={{
          headerTitle: judul,
          headerStyle: { backgroundColor: Colors.primary },
          headerTintColor: Colors.white,
          headerTitleStyle: { fontFamily: fonts.semibold },
          headerShadowVisible: false,
        }}
      />

      <ScrollView
        style={gs.screen}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[gs.scrollContent, { paddingBottom: insets.bottom + Spacing.xxl }]}
      >
        {/* Kepala layanan */}
        <View style={[gs.card, gs.center, { paddingVertical: Spacing.xxl }]}>
          <View
            style={[
              gs.iconTileLg,
              { backgroundColor: service.backgroundColor, width: 80, height: 80 },
            ]}
          >
            <MaterialCommunityIcons
              name={service.icon as any}
              size={40}
              color={service.iconColor}
            />
          </View>
          <Text style={[gs.h3, gs.textCenter, { marginTop: Spacing.lg }]}>{judul}</Text>
          <Text style={[gs.body, gs.textCenter, { marginTop: Spacing.xs }]}>
            {service.description}
          </Text>
        </View>

        {!adaYangAktif && (
          <View style={[gs.cardBrand, gs.center, { marginTop: Spacing.lg }]}>
            <MaterialCommunityIcons
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

        <Text style={[gs.sectionTitle, { marginTop: Spacing.xl }]}>Aksi Cepat</Text>

        {aksi.map((item) => {
          const aktif = !!item.route;

          return (
            <TouchableOpacity
              key={item.label}
              style={[gs.card, gs.row, gs.gapMd, { marginBottom: Spacing.sm }, !aktif && { opacity: 0.55 }]}
              activeOpacity={aktif ? 0.7 : 1}
              // Tanpa `route`, tombol benar-benar mati — jangan biarkan
              // pengguna menekan sesuatu yang diam saja.
              disabled={!aktif}
              onPress={() => item.route && router.push(item.route as any)}
            >
              <View style={[gs.iconTile, { backgroundColor: service.backgroundColor }]}>
                <MaterialCommunityIcons
                  name={item.icon as any}
                  size={20}
                  color={service.iconColor}
                />
              </View>

              <View style={gs.flex1}>
                <Text style={gs.title}>{item.label}</Text>
                <Text style={gs.caption}>{item.subtitle}</Text>
              </View>

              {aktif ? (
                <MaterialCommunityIcons
                  name="chevron-right"
                  size={22}
                  color={Colors.textTertiary}
                />
              ) : (
                <View style={[gs.badge, gs.badgeMuted]}>
                  <Text style={[gs.badgeText, gs.badgeTextMuted]}>Belum ada</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </>
  );
}

/**
 * Daftar aksi per layanan.
 *
 * Isi `route` HANYA kalau layarnya benar-benar ada — begitu layar baru dibuat,
 * cukup tambahkan rutenya di sini dan tombolnya otomatis hidup.
 */
function aksiUntuk(service: ServiceItem): AksiLayanan[] {
  const perLayanan: Record<string, AksiLayanan[]> = {
    'human-capital': [
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
    'stok-opname': [
      {
        icon: 'clipboard-list-outline',
        label: 'Periode & Lembar',
        subtitle: 'Lihat dokumen dan progres perhitungan',
        route: '/services/sto',
      },
      {
        icon: 'barcode-scan',
        label: 'Hitung dengan Scan',
        subtitle: 'Menunggu alur scan disiapkan di server',
      },
    ],
    'tiket-masalah': [
      {
        icon: 'format-list-bulleted',
        label: 'Tiket Saya',
        subtitle: 'Riwayat & progres tiket yang Anda ajukan',
        route: '/services/tiket',
      },
      {
        icon: 'plus-circle-outline',
        label: 'Buat Tiket Baru',
        subtitle: 'Laporkan masalah baru',
        route: '/services/tiket/buat',
      },
    ],
    audit: [
      { icon: 'plus-circle-outline', label: 'Mulai Audit', subtitle: 'Buat checklist audit baru' },
      { icon: 'history', label: 'Riwayat Audit', subtitle: 'Lihat audit sebelumnya' },
    ],
    berita: [
      {
        icon: 'bell-outline',
        label: 'Notifikasi',
        subtitle: 'Pemberitahuan terbaru untuk Anda',
        route: '/(tabs)/notification',
      },
      { icon: 'newspaper-variant-outline', label: 'Berita', subtitle: 'Pengumuman perusahaan' },
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

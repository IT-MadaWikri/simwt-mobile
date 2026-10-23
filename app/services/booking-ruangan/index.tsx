/**
 * Booking Ruangan Meeting ("Undangan Rapat") — kalender bulanan dengan titik
 * penanda per ruangan, lalu daftar booking pada tanggal yang dipilih. Data dari
 * api-simwt (`/booking-ruangan/*`), aturan sama dengan booking mandiri di web.
 */
import React, { useState } from 'react';
import { View, Text, ScrollView, RefreshControl, Linking, Share, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AppBar from '../../../src/components/common/AppBar';
import Button from '../../../src/components/common/Button';
import { dialog } from '../../../src/components/common/AppDialog';
import KeadaanKosong from '../../../src/components/common/KeadaanKosong';
import { SkeletonBaris } from '../../../src/components/common/Skeleton';
import BarisBooking from '../../../src/components/booking/BarisBooking';
import JalurMinggu from '../../../src/components/booking/JalurMinggu';
import KalenderBulan from '../../../src/components/booking/KalenderBulan';
import TimelineHari from '../../../src/components/booking/TimelineHari';
import SheetBooking from '../../../src/components/booking/SheetBooking';
import Colors, { brand, slate } from '../../../constants/Colors';
import Spacing from '../../../constants/Spacing';
import { fonts } from '../../../constants/Typography';
import { gs } from '../../../constants/GlobalStyles';
import { useKalenderBooking } from '../../../src/hooks/useKalenderBooking';
import { acaraKalenderBooking, kategoriBooking, rentangJam, teksBagikanBooking, warnaRuangan } from '../../../src/adapters/bookingRuangan';
import { NAMA_BULAN, NAMA_HARI, kunciTanggal, sama, tambahHari } from '../../../src/utils/kalender';
import { tambahKeKalenderOs } from '../../../src/utils/kalenderOs';
import { Booking } from '../../../src/types/booking';

export default function BookingRuanganScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const k = useKalenderBooking();
  const [dibuka, setDibuka] = useState<Booking | null>(null);
  const [mode, setMode] = useState<'bulan' | 'hari'>('bulan');

  const hariIni = new Date();
  const judulDaftar = sama(k.terpilih, hariIni) ? 'Booking Hari Ini' : `Booking ${k.terpilih.getDate()} ${NAMA_BULAN[k.terpilih.getMonth()]}`;

  // Keadaan non-data (memuat / galat / kosong) dipakai bersama kedua mode; null = tampilkan data.
  const isiStatus = k.memuat ? (
    <SkeletonBaris jumlah={3} />
  ) : k.error ? (
    <KeadaanKosong pose="mikir" judul="Gagal memuat" teks={k.error} style={styles.kosong}>
      <Button label="Coba Lagi" onPress={k.cobaLagi} style={{ marginTop: Spacing.lg }} />
    </KeadaanKosong>
  ) : k.booking.length === 0 ? (
    <KeadaanKosong pose="persilakan" judul="Belum ada booking" teks="Ruangan meeting masih kosong pada tanggal ini." style={styles.kosong} />
  ) : null;

  const bagikan = (b: Booking) => Share.share({ message: teksBagikanBooking(b) }).catch(() => {});

  const tambahKalender = async (b: Booking) => {
    try {
      if (!(await tambahKeKalenderOs(acaraKalenderBooking(b)))) {
        dialog.alert('Izin Ditolak', 'Izinkan akses kalender di pengaturan aplikasi untuk menambahkan jadwal ini.', 'danger');
      }
    } catch (e: any) {
      dialog.alert('Gagal', e?.message || 'Jadwal belum bisa ditambahkan ke kalender.', 'danger');
    }
  };
  const bukaLink = (url: string) =>
    Linking.openURL(url).catch(() => dialog.alert('Gagal Membuka', 'Link meeting tidak bisa dibuka di perangkat ini.', 'danger'));

  return (
    <View style={[gs.screen, { backgroundColor: Colors.white }]}>
      <AppBar judul="Booking Ruangan" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + Spacing.xxl }}
        refreshControl={<RefreshControl refreshing={k.menyegarkan} onRefresh={k.segarkan} colors={[Colors.primary]} tintColor={Colors.primary} />}
      >
        <View style={styles.atas}>
          <View style={styles.segmen}>
            {(['bulan', 'hari'] as const).map((m) => (
              <TouchableOpacity
                key={m}
                style={[styles.pilihanSegmen, mode === m && styles.pilihanAktif]}
                activeOpacity={0.8}
                onPress={() => setMode(m)}
              >
                <Text style={[styles.teksSegmen, mode === m && styles.teksSegmenAktif]}>{m === 'bulan' ? 'Bulan' : 'Hari'}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <Button
            icon="plus"
            onPress={() => router.push(`/services/booking-ruangan/buat?tanggal=${kunciTanggal(k.terpilih)}` as any)}
            accessibilityLabel="Buat booking"
          />
        </View>

        {mode === 'bulan' ? (
          <>
            <KalenderBulan
              tahun={k.tampil.tahun}
              bulan={k.tampil.bulan}
              terpilih={k.terpilih}
              penanda={k.penanda}
              onPilih={k.pilih}
              onGeser={k.geser}
            />

            <Text style={styles.judulDaftar}>{judulDaftar}</Text>
            <View style={styles.daftar}>
              {isiStatus ??
                k.booking.map((b) => (
                  <BarisBooking
                    key={b.id}
                    jenis={b.jenis}
                    kategori={kategoriBooking(b)}
                    judul={b.namaKegiatan}
                    jam={rentangJam(b)}
                    status={b.status}
                    statusLabel={b.statusLabel}
                    warna={warnaRuangan(b.idRuangan)}
                    onPress={() => setDibuka(b)}
                    onBagikan={() => bagikan(b)}
                  />
                ))}
            </View>
          </>
        ) : (
          <>
            <JalurMinggu
              terpilih={k.terpilih}
              penanda={k.penanda}
              onPilih={k.pilih}
              onGeser={(delta) => k.pilih(tambahHari(k.terpilih, delta * 7))}
            />
            {isiStatus ? (
              <View style={styles.daftar}>{isiStatus}</View>
            ) : (
              <TimelineHari
                tanggal={k.terpilih}
                items={k.booking.map((b) => ({
                  id: b.id,
                  mulai: b.mulai,
                  selesai: b.selesai,
                  judul: b.namaKegiatan,
                  kategori: kategoriBooking(b),
                  jam: rentangJam(b),
                  warna: warnaRuangan(b.idRuangan),
                  jenis: b.jenis,
                }))}
                onPilih={(id) => setDibuka(k.booking.find((b) => b.id === id) ?? null)}
              />
            )}
          </>
        )}
      </ScrollView>

      <SheetBooking
        visible={!!dibuka}
        onClose={() => setDibuka(null)}
        judul={dibuka?.namaKegiatan ?? ''}
        jenis={dibuka?.jenis ?? 'offline'}
        jenisLabel={dibuka?.jenisLabel ?? ''}
        warna={warnaRuangan(dibuka?.idRuangan ?? null)}
        status={dibuka?.status ?? 0}
        statusLabel={dibuka?.statusLabel ?? ''}
        tanggal={dibuka ? `${NAMA_HARI[dibuka.mulai.getDay()]}, ${dibuka.mulai.getDate()} ${NAMA_BULAN[dibuka.mulai.getMonth()]} ${dibuka.mulai.getFullYear()}` : ''}
        jam={dibuka ? rentangJam(dibuka) : ''}
        tempat={dibuka && dibuka.tempat !== '-' ? [dibuka.tempat, dibuka.jenis === 'offline' ? dibuka.plant : null].filter(Boolean).join(' · ') : null}
        peminjam={dibuka?.namaPeminjam ?? ''}
        departemen={dibuka?.departemen ?? null}
        peserta={dibuka?.peserta ?? []}
        onBukaLink={dibuka?.linkMeeting ? () => bukaLink(dibuka.linkMeeting as string) : undefined}
        onTambahKalender={() => dibuka && tambahKalender(dibuka)}
        onBagikan={() => dibuka && bagikan(dibuka)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  atas: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.screenPadding,
    paddingTop: Spacing.md,
  },
  segmen: { flexDirection: 'row', padding: 3, borderRadius: Spacing.radius.full, backgroundColor: slate[100] },
  pilihanSegmen: { paddingHorizontal: Spacing.lg, height: 34, justifyContent: 'center', borderRadius: Spacing.radius.full },
  pilihanAktif: { backgroundColor: Colors.white },
  teksSegmen: { fontFamily: fonts.medium, fontSize: 12, color: Colors.textSecondary },
  teksSegmenAktif: { fontFamily: fonts.bold, color: brand[700] },
  judulDaftar: {
    fontFamily: fonts.bold,
    fontSize: 16,
    color: Colors.textPrimary,
    paddingHorizontal: Spacing.screenPadding,
    paddingTop: Spacing.md,
  },
  daftar: { paddingHorizontal: Spacing.screenPadding },
  kosong: { paddingTop: Spacing.lg },
});

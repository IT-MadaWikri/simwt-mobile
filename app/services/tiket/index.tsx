/**
 * Menu Tiket Masalah — layar pertama tumpukan Tiket, dibuka dari ikon Tiket di
 * beranda. Isinya dua menu (Tiket Saya, Buat Tiket) dan tiga tiket terbaru.
 */
import React, { useCallback, useRef } from 'react';
import { View, Text, ScrollView, RefreshControl, StyleSheet } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AppBar from '../../../src/components/common/AppBar';
import ServiceIcon from '../../../src/components/common/ServiceIcon';
import SectionHeader from '../../../src/components/common/SectionHeader';
import BannerMaskot from '../../../src/components/common/BannerMaskot';
import BannerAksi from '../../../src/components/common/BannerAksi';
import { SkeletonBaris } from '../../../src/components/common/Skeleton';
import KartuTiket from '../../../src/components/tiket/KartuTiket';
import Colors from '../../../constants/Colors';
import Spacing from '../../../constants/Spacing';
import { gs } from '../../../constants/GlobalStyles';
import { ServiceItem } from '../../../constants/Services';
import { useTiketSaya } from '../../../src/hooks/useTiketSaya';

const WARNA = { backgroundColor: Colors.serviceRed, iconColor: '#ff6a5c' };

const MENU: ServiceItem[] = [
  {
    id: 'tiket-saya',
    name: 'Tiket\nSaya',
    icon: 'ticket-confirmation-outline',
    route: '/services/tiket/saya',
    description: 'Riwayat dan progres tiket yang kamu ajukan',
    ...WARNA,
  },
  {
    id: 'tiket-buat',
    name: 'Buat\nTiket',
    icon: 'plus',
    route: '/services/tiket/buat',
    description: 'Laporkan masalah baru',
    ...WARNA,
  },
];

export default function MenuTiketScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { tiket, memuat, menyegarkan, error, muatUlang, segarkan } = useTiketSaya({ perHalaman: 3 });

  // Segar tiap kembali ke menu (mis. setelah membuat tiket); muat pertama ditangani hook.
  const pertamaFokus = useRef(true);
  useFocusEffect(
    useCallback(() => {
      if (pertamaFokus.current) {
        pertamaFokus.current = false;
        return;
      }
      muatUlang();
    }, [muatUlang])
  );

  const terbaru = tiket.slice(0, 3);

  return (
    <>
      <AppBar judul="Tiket Masalah" />
      <ScrollView
        style={[gs.screen, { backgroundColor: Colors.white }]}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: Spacing.lg, paddingBottom: insets.bottom + Spacing.xxl }}
        refreshControl={
          <RefreshControl refreshing={menyegarkan} onRefresh={segarkan} colors={[Colors.primary]} tintColor={Colors.primary} />
        }
      >
        <SectionHeader title="Menu Tiket" />
        <View style={styles.grid}>
          {MENU.map((m) => (
            <ServiceIcon key={m.id} service={m} />
          ))}
        </View>

        <BannerMaskot
          pose="mikir"
          warna="krem"
          judul="Ada kendala di"
          sorot="pekerjaanmu?"
          teks="Laporkan lewat tiket, tim terkait akan menindaklanjuti."
          label="Buat Tiket"
          onPress={() => router.push('/services/tiket/buat' as any)}
        />
        <BannerAksi
          tokoh="putra"
          judul="Scan QR aset"
          teks="Lihat riwayat perbaikan langsung dari label aset."
          onPress={() => router.push('/(tabs)/scan' as any)}
        />

        <View style={styles.bagian}>
          <SectionHeader title="Tiket Terbaru" actionText="Lihat Semua" onAction={() => router.push('/services/tiket/saya')} />
          {memuat ? (
            <SkeletonBaris jumlah={3} />
          ) : error ? (
            <Text style={[gs.emptyText, gs.containerX]}>{error}</Text>
          ) : terbaru.length === 0 ? (
            <Text style={[gs.emptyText, gs.containerX]}>Belum ada tiket. Laporkan masalah pertamamu.</Text>
          ) : (
            terbaru.map((t, i) => (
              <View key={t.id}>
                {i > 0 ? <View style={styles.pemisah} /> : null}
                <KartuTiket
                  noTiket={t.no_ticket}
                  judul={t.judul_masalah}
                  status={t.status_pengajuan}
                  jenis={t.jenis}
                  plant={t.plant}
                  tanggalDiajukan={t.tanggal_diajukan}
                  tanggalSelesai={t.tanggal_selesai}
                  onPress={() => router.push(`/services/tiket/${t.no_ticket}` as any)}
                />
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: Spacing.md },
  bagian: { marginTop: Spacing.xl },
  pemisah: { height: StyleSheet.hairlineWidth, backgroundColor: Colors.border, marginHorizontal: Spacing.screenPadding },
});

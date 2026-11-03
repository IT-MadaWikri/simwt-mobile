/**
 * Menu Pengukuran QC — tampil setelah splash modul (`index`), yang dibuka dari ikon Pengukuran QC di beranda.
 * Isinya grid menu: Daftar Part (mulai mengukur), Draf (dengan lencana jumlah), dan Terkirim.
 */
import React, { useCallback } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AppBar from '../../../src/components/common/AppBar';
import SectionHeader from '../../../src/components/common/SectionHeader';
import ServiceIcon from '../../../src/components/common/ServiceIcon';
import Colors from '../../../constants/Colors';
import Spacing from '../../../constants/Spacing';
import { gs } from '../../../constants/GlobalStyles';
import { ServiceItem } from '../../../constants/Services';
import { useDrafPengukuran } from '../../../src/hooks/useDrafPengukuran';

const WARNA = { backgroundColor: Colors.servicePurple, iconColor: '#9a6bff' };

export default function MenuPengukuranScreen() {
  const insets = useSafeAreaInsets();
  const { jumlah: jumlahDraf, muat: muatDraf } = useDrafPengukuran();

  // Jumlah draf bisa berubah di layar lain (simpan, hapus, kirim), jadi dimuat tiap kembali ke menu.
  useFocusEffect(useCallback(() => muatDraf(), [muatDraf]));

  const menu: ServiceItem[] = [
    {
      id: 'pengukuran-part',
      name: 'Daftar\nPart',
      icon: 'cog-outline',
      route: '/services/pengukuran/part',
      description: 'Pilih part dan proses untuk mulai mengukur',
      ...WARNA,
    },
    {
      id: 'pengukuran-draf',
      name: 'Draf',
      icon: 'content-save-outline',
      route: '/services/pengukuran/draf',
      description: 'Lanjutkan pengukuran yang belum selesai',
      lencana: jumlahDraf,
      ...WARNA,
    },
    {
      id: 'pengukuran-terkirim',
      name: 'Terkirim',
      icon: 'send',
      route: '/services/pengukuran/terkirim',
      description: 'Riwayat pengukuran yang sudah dikirim',
      ...WARNA,
    },
  ];

  return (
    <>
      <AppBar judul="Pengukuran QC" />
      <ScrollView
        style={[gs.screen, { backgroundColor: Colors.white }]}
        showsVerticalScrollIndicator={false}
        // Tanpa banner di atasnya (tidak seperti menu Tiket), judul perlu jarak sendiri dari app bar.
        contentContainerStyle={{ paddingTop: Spacing.xl, paddingBottom: insets.bottom + Spacing.xxl }}
      >
        <SectionHeader title="Menu Pengukuran" />
        <View style={styles.grid}>
          {menu.map((m) => (
            <ServiceIcon key={m.id} service={m} />
          ))}
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: Spacing.md, paddingTop: Spacing.sm },
});

/**
 * Home Screen — SIMWT Mobile
 * Gojek-style home with header (sapaan + search), service grid, news, and stats
 */
import React, { useCallback, useRef, useState } from 'react';
import { ScrollView, Share, StyleSheet, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import Colors from '../../constants/Colors';
import Spacing from '../../constants/Spacing';
import HomeHeader from '../../src/components/home/HomeHeader';
import ServiceGrid from '../../src/components/home/ServiceGrid';
import NewsCarousel from '../../src/components/home/NewsCarousel';
import BirthdayBanner from '../../src/components/home/BirthdayBanner';
import { dialog } from '../../src/components/common/AppDialog';
import { teksBagikanBerita } from '../../src/adapters/berita';
import { useDaftarBerita } from '../../src/hooks/useDaftarBerita';

export default function HomeScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();
  const berita = useDaftarBerita({ perHalaman: 5 });

  // Suka/jumlah bisa berubah di layar lain; muat ulang (tanpa skeleton) saat beranda kembali fokus.
  const sudahFokus = useRef(false);
  const { muatUlang } = berita;
  useFocusEffect(
    useCallback(() => {
      if (sudahFokus.current) muatUlang();
      sudahFokus.current = true;
    }, [muatUlang])
  );

  const ubahSuka = async (id: number) => {
    if (!(await berita.ubahSuka(id))) dialog.alert('Gagal', 'Suka tidak tersimpan. Periksa koneksi lalu coba lagi.', 'danger');
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <HomeHeader searchQuery={searchQuery} onChangeSearch={setSearchQuery} />

        <BirthdayBanner />

        <ServiceGrid searchQuery={searchQuery} />

        <NewsCarousel
          berita={berita.berita}
          memuat={berita.memuat}
          error={berita.error}
          onCobaLagi={berita.cobaLagi}
          onLihatSemua={() => router.push('/services/berita' as any)}
          onBuka={(id) => router.push(`/services/berita/${id}` as any)}
          onSuka={ubahSuka}
          onBagikan={(b) => Share.share({ message: teksBagikanBerita(b) }).catch(() => {})}
        />

        <View style={{ height: 20 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: Spacing.xxxl,
  },
});

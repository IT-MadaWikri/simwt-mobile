/**
 * Home Screen — SIMWT Mobile
 * Gojek-style home with header (sapaan + search), service grid, news, and stats
 */
import React, { useCallback, useRef, useState } from 'react';
import { Animated, Share, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '../../constants/Colors';
import Spacing from '../../constants/Spacing';
import HomeHeader from '../../src/components/home/HomeHeader';
import BarAtasBeranda from '../../src/components/home/BarAtasBeranda';
import ServiceGrid from '../../src/components/home/ServiceGrid';
import NewsCarousel from '../../src/components/home/NewsCarousel';
import BirthdayBanner from '../../src/components/home/BirthdayBanner';
import BannerMaskot from '../../src/components/common/BannerMaskot';
import { dialog } from '../../src/components/common/AppDialog';
import { teksBagikanBerita } from '../../src/adapters/berita';
import { useDaftarBerita } from '../../src/hooks/useDaftarBerita';
import { useBelumDibaca } from '../../src/hooks/useBelumDibaca';

export default function HomeScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  // Posisi gulir untuk efek paralaks header (dijalankan di thread native).
  const scrollY = useRef(new Animated.Value(0)).current;
  const insets = useSafeAreaInsets();
  const belumDibaca = useBelumDibaca();

  // Header bergerak setengah kecepatan gulir, jadi baris atasnya (logo, lonceng,
  // avatar) hilang dari layar saat gulir = 2 × (tepi bawah baris itu).
  const ambang = 2 * (insets.top + Spacing.md + 36);
  const [barTampil, setBarTampil] = useState(false);
  const barTampilRef = useRef(false);
  // Bar putih turun dari atas saat ambang terlewati, naik lagi saat kembali.
  const turun = useRef(new Animated.Value(0)).current;
  const tinggiBar = insets.top + Spacing.sm * 2 + 36;

  const saatGulir = (y: number) => {
    const perlu = y > ambang;
    if (perlu === barTampilRef.current) return;
    barTampilRef.current = perlu;
    setBarTampil(perlu);
    Animated.timing(turun, { toValue: perlu ? 1 : 0, duration: 220, useNativeDriver: true }).start();
  };
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
      <Animated.ScrollView
        style={styles.scrollView}
        scrollEventThrottle={16}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
          useNativeDriver: true,
          listener: (e: any) => saatGulir(e.nativeEvent.contentOffset.y),
        })}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <HomeHeader searchQuery={searchQuery} onChangeSearch={setSearchQuery} scrollY={scrollY} belumDibaca={belumDibaca} />

        {/* Isi di bawah header menggulir normal dan opak, sehingga menutupi header yang bergerak lebih lambat. */}
        <View style={styles.isi}>
          {/* Tepi atas memudar dari transparan ke putih, supaya header yang tertutup tidak terpotong tegas. */}
          <LinearGradient colors={['rgba(255,255,255,0)', Colors.white]} pointerEvents="none" style={styles.pudarAtas} />
        <BirthdayBanner />

        <ServiceGrid searchQuery={searchQuery} />

        <BannerMaskot
          pose="ide"
          judul="Satu ide kecil,"
          sorot="dampak besar"
          teks="Ajukan Kaizen dan kumpulkan poin dari setiap perbaikan."
          label="Buat Kaizen"
          onPress={() => router.push('/kaizen/buat' as any)}
        />

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
        </View>
      </Animated.ScrollView>

      {/* Bar putih yang turun setelah header tergulir lewat. */}
      <Animated.View
        pointerEvents={barTampil ? 'auto' : 'none'}
        style={[
          styles.barLengket,
          {
            paddingTop: insets.top + Spacing.sm,
            transform: [{ translateY: turun.interpolate({ inputRange: [0, 1], outputRange: [-(tinggiBar + 4), 0] }) }],
          },
        ]}
      >
        <BarAtasBeranda belumDibaca={belumDibaca} />
      </Animated.View>
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
  isi: {
    backgroundColor: Colors.white,
    zIndex: 1,
  },
  pudarAtas: {
    position: 'absolute',
    top: -48,
    left: 0,
    right: 0,
    height: 48,
  },
  barLengket: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 2,
    paddingHorizontal: Spacing.screenPadding,
    paddingBottom: Spacing.sm,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderSubtle,
  },
  scrollContent: {
    paddingBottom: Spacing.xxxl,
  },
});

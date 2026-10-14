/**
 * Pemindai QR aset — tata letak mengikuti pemindai QRIS Gojek.
 *
 * Bagian yang membuatnya terasa seperti pemindai bawaan, bukan halaman biasa:
 *   - kamera memenuhi layar, semua kendali mengambang di atasnya
 *   - jendela pindai berbentuk kotak terang di tengah, sisanya digelapkan
 *   - garis pemindai bergerak naik-turun sebagai tanda kamera hidup
 *   - tombol kembali bulat di pojok kiri atas, di dalam safe area
 *   - tombol senter untuk gudang yang gelap
 */
import React, { useEffect, useRef, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Animated,
  Easing,
  Dimensions,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors, { brand } from '../../constants/Colors';
import Spacing from '../../constants/Spacing';
import Typography, { fonts } from '../../constants/Typography';
import { gs } from '../../constants/GlobalStyles';
import LoadingSpinner from '../../src/components/common/LoadingSpinner';

const { width } = Dimensions.get('window');
/** Jendela pindai: persegi, sekitar 70% lebar layar — sepadan dengan Gojek. */
const KOTAK = Math.min(280, Math.round(width * 0.7));

export default function ScanScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [senter, setSenter] = useState(false);
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // Garis pemindai naik-turun di dalam kotak.
  const garis = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animasi = Animated.loop(
      Animated.sequence([
        Animated.timing(garis, {
          toValue: 1,
          duration: 1800,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(garis, {
          toValue: 0,
          duration: 1800,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    );
    animasi.start();
    return () => animasi.stop();
  }, [garis]);

  const geserGaris = garis.interpolate({
    inputRange: [0, 1],
    outputRange: [0, KOTAK - 2],
  });

  /** Tombol bulat mengambang — dipakai tombol kembali & senter. */
  const TombolBulat = ({
    icon,
    onPress,
    aktif = false,
    label,
  }: {
    icon: string;
    onPress: () => void;
    aktif?: boolean;
    label: string;
  }) => (
    <TouchableOpacity
      style={[styles.tombolBulat, aktif && { backgroundColor: brand[600] }]}
      onPress={onPress}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <MaterialCommunityIcons name={icon as any} size={22} color={Colors.white} />
    </TouchableOpacity>
  );

  if (!permission) {
    return (
      <View style={[styles.layarPenuh, { backgroundColor: Colors.black }]}>
        <LoadingSpinner message="Menyiapkan kamera..." />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={[gs.screen, gs.centerFill]}>
        <View style={[gs.iconTileLg, { width: 72, height: 72 }]}>
          <MaterialCommunityIcons name="camera-off-outline" size={34} color={brand[600]} />
        </View>
        <Text style={[gs.emptyTitle, { marginTop: Spacing.lg }]}>Izin Kamera Diperlukan</Text>
        <Text style={gs.emptyText}>
          Aplikasi butuh akses kamera untuk memindai QR pada label aset.
        </Text>
        <TouchableOpacity
          style={[gs.btn, gs.btnPrimary, { marginTop: Spacing.xl }]}
          onPress={requestPermission}
          activeOpacity={0.85}
        >
          <Text style={[gs.btnText, gs.btnTextOnBrand]}>Izinkan Kamera</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleBarcodeScanned = ({ data }: { type: string; data: string }) => {
    if (scanned) return;
    setScanned(true);

    let nomorAset = data;

    // QR lama berisi URL penuh, mis. http://host/aset/012500320002/scan —
    // yang dibutuhkan halaman hasil hanya nomornya.
    if (data.includes('/aset/')) {
      const bagian = data.split('/');
      const indeks = bagian.indexOf('aset');
      if (indeks !== -1 && bagian.length > indeks + 1) {
        nomorAset = bagian[indeks + 1];
      }
    }

    router.push({ pathname: '/scan-result', params: { nomor: nomorAset } });

    // Aktifkan lagi setelah beberapa detik supaya pengguna yang menekan
    // "kembali" bisa langsung memindai lagi tanpa membuka ulang layar.
    setTimeout(() => setScanned(false), 3000);
  };

  return (
    <View style={styles.layarPenuh}>
      <CameraView
        style={StyleSheet.absoluteFill}
        facing="back"
        enableTorch={senter}
        onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
      />

      {/* Selubung gelap dengan lubang di tengah. Disusun dari empat panel
          (atas, kiri, kanan, bawah) karena React Native tidak punya cara
          melubangi satu View seperti `mask` di CSS. */}
      <View style={StyleSheet.absoluteFill}>
        <View style={styles.selubung} />

        <View style={{ flexDirection: 'row', height: KOTAK }}>
          <View style={styles.selubung} />

          <View style={{ width: KOTAK, height: KOTAK }}>
            <View style={[styles.sudut, styles.sudutKiriAtas]} />
            <View style={[styles.sudut, styles.sudutKananAtas]} />
            <View style={[styles.sudut, styles.sudutKiriBawah]} />
            <View style={[styles.sudut, styles.sudutKananBawah]} />

            <Animated.View
              style={[styles.garisPindai, { transform: [{ translateY: geserGaris }] }]}
            />
          </View>

          <View style={styles.selubung} />
        </View>

        <View style={[styles.selubung, { alignItems: 'center', paddingTop: Spacing.xxl }]}>
          <Text style={styles.petunjuk}>Arahkan kamera ke QR Code aset</Text>
          <Text style={styles.petunjukKecil}>
            Pastikan seluruh kode berada di dalam kotak
          </Text>

          <View style={{ marginTop: Spacing.xxl }}>
            <TombolBulat
              icon={senter ? 'flashlight' : 'flashlight-off'}
              onPress={() => setSenter((nyala) => !nyala)}
              aktif={senter}
              label={senter ? 'Matikan senter' : 'Nyalakan senter'}
            />
          </View>
        </View>
      </View>

      {/* Bilah atas mengambang: tombol kembali + judul. Memakai inset supaya
          tidak tertutup poni/status bar. */}
      <View style={[styles.bilahAtas, { paddingTop: insets.top + Spacing.sm }]}>
        <TombolBulat icon="arrow-left" onPress={() => router.back()} label="Kembali" />
        <Text style={styles.judul}>Pindai QR Aset</Text>
        {/* Penyeimbang agar judul benar-benar di tengah. */}
        <View style={{ width: 40 }} />
      </View>
    </View>
  );
}

const WARNA_SELUBUNG = 'rgba(4, 61, 35, 0.72)';
const PANJANG_SUDUT = 34;
const TEBAL_SUDUT = 4;

const styles = StyleSheet.create({
  layarPenuh: {
    flex: 1,
    backgroundColor: Colors.black,
  },
  selubung: {
    flex: 1,
    backgroundColor: WARNA_SELUBUNG,
  },

  bilahAtas: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.sm,
  },
  judul: {
    fontFamily: fonts.semibold,
    fontSize: Typography.sizes.lg,
    color: Colors.white,
  },
  tombolBulat: {
    width: 40,
    height: 40,
    borderRadius: Spacing.radius.full,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  sudut: {
    position: 'absolute',
    width: PANJANG_SUDUT,
    height: PANJANG_SUDUT,
    borderColor: brand[400],
  },
  sudutKiriAtas: {
    top: 0,
    left: 0,
    borderTopWidth: TEBAL_SUDUT,
    borderLeftWidth: TEBAL_SUDUT,
    borderTopLeftRadius: Spacing.radius.lg,
  },
  sudutKananAtas: {
    top: 0,
    right: 0,
    borderTopWidth: TEBAL_SUDUT,
    borderRightWidth: TEBAL_SUDUT,
    borderTopRightRadius: Spacing.radius.lg,
  },
  sudutKiriBawah: {
    bottom: 0,
    left: 0,
    borderBottomWidth: TEBAL_SUDUT,
    borderLeftWidth: TEBAL_SUDUT,
    borderBottomLeftRadius: Spacing.radius.lg,
  },
  sudutKananBawah: {
    bottom: 0,
    right: 0,
    borderBottomWidth: TEBAL_SUDUT,
    borderRightWidth: TEBAL_SUDUT,
    borderBottomRightRadius: Spacing.radius.lg,
  },
  garisPindai: {
    position: 'absolute',
    left: TEBAL_SUDUT,
    right: TEBAL_SUDUT,
    height: 2,
    backgroundColor: brand[400],
    shadowColor: brand[400],
    shadowOpacity: 0.9,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 0 },
  },

  petunjuk: {
    fontFamily: fonts.semibold,
    fontSize: Typography.sizes.lg,
    color: Colors.white,
    textAlign: 'center',
  },
  petunjukKecil: {
    marginTop: Spacing.xs,
    fontFamily: fonts.regular,
    fontSize: Typography.sizes.sm,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
  },
});

/**
 * Layar Masuk — SIMWT Mobile.
 *
 * ── Kenapa ditulis ulang (11 Agustus 2026) ───────────────────────────────
 * Versi sebelumnya membangun dekorasinya dari `Dimensions.get('window')` yang
 * dibaca SEKALI saat modul dimuat, lalu dipakai untuk menghitung lingkaran
 * raksasa pembentuk efek gelombang (`width * 1.5`, `borderRadius: width*0.75`,
 * `left: -width*0.25`) dan tinggi header (`height * 0.35`).
 *
 * Dua masalahnya:
 *  1. Angka itu tidak pernah dihitung ulang saat ukuran berubah (rotasi
 *     perangkat, atau jendela peramban di mode web).
 *  2. Di web, `window` adalah jendela PERAMBAN — bukan kolom tempat aplikasi
 *     dirender. Gelombangnya jadi dihitung untuk lebar yang salah, dan
 *     ilustrasi yang diposisikan `absolute` terpotong `overflow: hidden`.
 *
 * Sekarang: `useWindowDimensions()` (hook, ikut berubah), dan lengkungan
 * header memakai `borderBottomRadius` biasa — tidak ada lagi geometri yang
 * harus ditebak. Kartu formulir sengaja naik menimpa header supaya
 * peralihannya tetap terasa berlapis tanpa trik lingkaran.
 *
 * Sekaligus: komponen `CustomAlert` bawaan layar ini DIHAPUS. Isinya
 * menduplikasi `AppDialog` yang sudah dipakai seluruh aplikasi — satu rupa
 * dialog untuk semua layar, dan satu tempat saja untuk memperbaikinya.
 */
import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
  Animated,
  useWindowDimensions,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import Icon from '../src/components/common/Icon';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors, { slate } from '../constants/Colors';
import Spacing from '../constants/Spacing';
import Typography, { fonts } from '../constants/Typography';
import { gs, inputReset } from '../constants/GlobalStyles';
import { useAuth } from '../src/contexts/AuthContext';
import { biometric } from '../src/utils/biometric';
import { dialog } from '../src/components/common/AppDialog';
import Button from '../src/components/common/Button';

const LOGO = require('../assets/images/logo-loader.png');

export default function LoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [lihatSandi, setLihatSandi] = useState(false);
  const [mengirim, setMengirim] = useState(false);
  const [biometrikSiap, setBiometrikSiap] = useState(false);
  const [namaBiometrik, setNamaBiometrik] = useState('Sidik Jari');

  const { login, clearError } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();

  // Header mengambil sepertiga tinggi yang tersedia, dengan batas atas-bawah
  // supaya tetap masuk akal di layar kecil maupun jendela peramban tinggi.
  const tinggiHeader = Math.min(340, Math.max(250, height * 0.38));

  const masuk = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    cekBiometrik();
    Animated.timing(masuk, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  const cekBiometrik = async () => {
    setBiometrikSiap(await biometric.siapDipakai());
    setNamaBiometrik(await biometric.namaJenis());
  };

  const handleLogin = async () => {
    let namaAkhir = username.trim();

    if (!namaAkhir) {
      dialog.alert('Username Kosong', 'Silakan masukkan username Anda terlebih dahulu.', 'danger');
      return;
    }
    if (!password.trim()) {
      dialog.alert('Password Kosong', 'Silakan masukkan password Anda terlebih dahulu.', 'danger');
      return;
    }

    // Awalan `mwt-` ditambahkan otomatis, kecuali akun superadmin.
    if (namaAkhir.toLowerCase() !== 'superadmin' && !namaAkhir.toLowerCase().startsWith('mwt-')) {
      namaAkhir = `mwt-${namaAkhir}`;
    }

    setMengirim(true);
    clearError();

    try {
      await login(namaAkhir, password);
      await tawarkanBiometrik(namaAkhir, password);
      router.replace('/(tabs)');
    } catch (err: any) {
      dialog.alert(
        'Masuk Gagal',
        err?.message || 'Username atau password salah. Silakan coba lagi.',
        'danger'
      );
    } finally {
      setMengirim(false);
    }
  };

  /** Tawarkan masuk cepat — hanya di sini kata sandi ada di tangan. */
  const tawarkanBiometrik = async (namaPengguna: string, sandi: string) => {
    if (!(await biometric.didukung()) || (await biometric.siapDipakai())) return;

    const jenis = await biometric.namaJenis();
    const setuju = await dialog.confirm({
      title: `Aktifkan Masuk dengan ${jenis}?`,
      message: `Lain kali cukup memindai ${jenis.toLowerCase()} tanpa mengetik kata sandi. Bisa dimatikan kapan saja lewat halaman Profil.`,
      confirmText: 'Aktifkan',
      cancelText: 'Nanti Saja',
    });
    if (!setuju) return;

    try {
      await biometric.nyalakan({ username: namaPengguna, password: sandi });
    } catch {
      dialog.alert('Gagal Mengaktifkan', 'Kredensial tidak bisa disimpan di perangkat ini.', 'danger');
    }
  };

  const masukBiometrik = async () => {
    if (!biometrikSiap) {
      const didukung = await biometric.didukung();
      dialog.alert(
        `Masuk dengan ${namaBiometrik} Belum Aktif`,
        didukung
          ? `Masuk sekali dengan kata sandi, lalu pilih "Aktifkan" saat ditawarkan.`
          : 'Perangkat ini tidak mendukung biometrik, atau belum ada sidik jari/wajah yang terdaftar.'
      );
      return;
    }

    try {
      const kredensial = await biometric.verifikasiDanAmbil();
      if (!kredensial) return; // dibatalkan — tidak perlu diributkan

      setMengirim(true);
      clearError();
      await login(kredensial.username, kredensial.password);
      router.replace('/(tabs)');
    } catch (err: any) {
      // Kata sandi tersimpan sudah basi — buang supaya pengguna tidak
      // terjebak memindai jari berulang kali yang selalu ditolak.
      await biometric.matikan();
      setBiometrikSiap(false);
      dialog.alert(
        'Masuk Cepat Dinonaktifkan',
        err?.message || 'Kata sandi tersimpan sudah tidak berlaku. Masuk dengan kata sandi, lalu aktifkan kembali.',
        'danger'
      );
    } finally {
      setMengirim(false);
    }
  };

  const geser = masuk.interpolate({ inputRange: [0, 1], outputRange: [24, 0] });

  /** Lingkaran sepusat di latar header — ukuran & kepekatan sebagai argumen. */
  const lingkaran = (ukuran: number, opacity: number) => ({
    width: ukuran,
    height: ukuran,
    borderRadius: ukuran / 2,
    marginLeft: -ukuran / 2,
    marginTop: -ukuran / 2,
    opacity,
  });

  return (
    <KeyboardAvoidingView
      style={styles.layar}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar style="light" />

      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + Spacing.xl, flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* ── Kepala brand ───────────────────────────────────────────────
            Komposisi terpusat: lencana logo, nama produk, nama perusahaan.
            Semua dekorasi diukur relatif terhadap tinggi header itu sendiri,
            jadi tidak ada geometri yang perlu ditebak dari ukuran jendela. */}
        <View
          style={[
            styles.kepala,
            { height: tinggiHeader, paddingTop: insets.top + Spacing.lg, backgroundColor: Colors.primary },
          ]}
        >
          {/* Tiga lingkaran sepusat di belakang logo — memberi kedalaman
              tanpa aset gambar tambahan. */}
          <View style={[styles.cincin, lingkaran(tinggiHeader * 1.5, 0.05)]} />
          <View style={[styles.cincin, lingkaran(tinggiHeader * 1.1, 0.07)]} />
          <View style={[styles.cincin, lingkaran(tinggiHeader * 0.78, 0.09)]} />

          <View style={gs.center}>
            <View style={styles.lencanaLogo}>
              <Image source={LOGO} style={styles.logo} resizeMode="contain" />
            </View>

            <Text style={styles.merek}>SIMWT</Text>
            <Text style={styles.merekSub}>MOBILE</Text>

            <View style={styles.garisMerek} />

            <Text style={styles.perusahaan}>PT Mada Wikri Tunggal</Text>
          </View>
        </View>

        {/* ── Kartu formulir ─────────────────────────────────────────────
            Naik menimpa header agar peralihannya terasa berlapis. */}
        <Animated.View
          style={[styles.kartu, { opacity: masuk, transform: [{ translateY: geser }] }]}
        >
          <Text style={gs.h2}>Selamat Datang</Text>
          <Text style={[gs.bodySm, { marginTop: 2, marginBottom: Spacing.xl }]}>
            Masuk untuk melanjutkan ke akun Anda
          </Text>

          {/* Username — awalan mwt- ditampilkan sebagai bagian kolom supaya
              pengguna tahu apa yang otomatis ditambahkan. */}
          <Text style={gs.label}>Username</Text>
          <View style={[gs.fieldWrap, styles.kolom]}>
            <Icon name="account-outline" size={19} color={Colors.textTertiary} />
            <Text style={styles.awalan}>mwt-</Text>
            <View style={styles.pemisahKolom} />
            <TextInput
              style={[gs.fieldInner, styles.isian]}
              placeholder="username"
              placeholderTextColor={Colors.placeholder}
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="next"
            />
          </View>

          <Text style={[gs.label, { marginTop: Spacing.lg }]}>Password</Text>
          <View style={[gs.fieldWrap, styles.kolom]}>
            <Icon name="lock-outline" size={19} color={Colors.textTertiary} />
            <TextInput
              style={[gs.fieldInner, styles.isian]}
              placeholder="Masukkan kata sandi"
              placeholderTextColor={Colors.placeholder}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!lihatSandi}
              autoCapitalize="none"
              returnKeyType="done"
              onSubmitEditing={handleLogin}
            />
            <TouchableOpacity
              onPress={() => setLihatSandi((tampil) => !tampil)}
              accessibilityLabel={lihatSandi ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
              hitSlop={8}
            >
              <Icon
                name={lihatSandi ? 'eye-off-outline' : 'eye-outline'}
                size={20}
                color={Colors.textTertiary}
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.lupa} activeOpacity={0.7}>
            <Text style={[gs.bodySm, gs.textSemibold, gs.textBrand]}>Lupa Password?</Text>
          </TouchableOpacity>

          <Button label="Masuk" iconRight="arrow-right" onPress={handleLogin} loading={mengirim} block />

          {biometrikSiap && (
            <>
              <View style={[gs.row, gs.gapMd, { marginVertical: Spacing.lg }]}>
                <View style={styles.garis} />
                <Text style={gs.caption}>atau</Text>
                <View style={styles.garis} />
              </View>

              <Button
                variant="outline"
                icon="fingerprint"
                label={`Masuk dengan ${namaBiometrik}`}
                onPress={masukBiometrik}
                block
              />
            </>
          )}
        </Animated.View>

        <View style={[gs.center, styles.kaki]}>
          <Text style={gs.caption}>SIMWT Mobile v1.0.0</Text>
          <Text style={gs.caption}>© 2026 PT Mada Wikri Tunggal</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  layar: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  kepala: {
    paddingHorizontal: Spacing.xxl,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomLeftRadius: Spacing.radius.xxl + 12,
    borderBottomRightRadius: Spacing.radius.xxl + 12,
    overflow: 'hidden',
  },
  // Semua cincin bertitik pusat sama (50%/50%), digeser balik separuh
  // ukurannya lewat margin negatif — lihat helper `lingkaran()`.
  cincin: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    backgroundColor: Colors.white,
  },
  lencanaLogo: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  logo: {
    width: 44,
    height: 44,
    tintColor: Colors.white,
  },
  merek: {
    fontFamily: fonts.extrabold,
    fontSize: 12,
    color: Colors.white,
    letterSpacing: 2,
    lineHeight: 18,
  },
  merekSub: {
    fontFamily: fonts.semibold,
    fontSize: Typography.sizes.sm,
    color: 'rgba(255,255,255,0.9)',
    letterSpacing: 7,
    // Diberi indent kiri sebesar jarak antarhurufnya sendiri: letterSpacing
    // menambahkan ruang SESUDAH huruf terakhir juga, sehingga tanpa ini
    // teksnya tampak bergeser ke kiri terhadap "SIMWT" di atasnya.
    marginLeft: 7,
    marginTop: 2,
  },
  garisMerek: {
    width: 40,
    height: 3,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.5)',
    marginTop: Spacing.md,
  },
  perusahaan: {
    fontFamily: fonts.regular,
    fontSize: Typography.sizes.sm,
    color: 'rgba(255,255,255,0.75)',
    marginTop: Spacing.md,
  },

  kartu: {
    marginHorizontal: Spacing.screenPadding,
    // Naik menimpa header — inilah yang menggantikan trik gelombang.
    marginTop: -Spacing.xxxl,
    backgroundColor: Colors.card,
    borderRadius: Spacing.radius.xxl,
    padding: Spacing.xl + Spacing.xs,
  },
  kolom: {
    backgroundColor: slate[50],
    paddingVertical: 2,
  },
  awalan: {
    fontFamily: fonts.semibold,
    fontSize: Typography.sizes.md,
    color: Colors.textSecondary,
  },
  pemisahKolom: {
    width: 1,
    height: 22,
    backgroundColor: Colors.border,
  },
  isian: {
    paddingVertical: Spacing.md,
    ...inputReset,
  },
  lupa: {
    alignSelf: 'flex-end',
    marginTop: Spacing.md,
    marginBottom: Spacing.lg,
    padding: Spacing.xs,
  },
  garis: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.borderSubtle,
  },

  kaki: {
    marginTop: Spacing.xxl,
    gap: 2,
  },
});

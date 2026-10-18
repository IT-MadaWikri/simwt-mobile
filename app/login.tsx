/**
 * Layar Masuk — SIMWT Mobile.
 *
 * Satu kolom bersih: maskot, logo, lalu username + password saja
 * (tanpa masuk lewat pihak ketiga). Tombol biometrik hanya muncul bila sudah
 * diaktifkan. Dialog memakai `AppDialog` bersama.
 */
import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  ScrollView,
  Image,
  Animated,
  useWindowDimensions,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from '../src/components/common/Icon';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors, { palet } from '../constants/Colors';
import Spacing from '../constants/Spacing';
import Typography, { fonts } from '../constants/Typography';
import { gs, inputReset } from '../constants/GlobalStyles';
import { useAuth } from '../src/contexts/AuthContext';
import { biometric } from '../src/utils/biometric';
import { dialog } from '../src/components/common/AppDialog';
import Button from '../src/components/common/Button';

const MASKOT = require('../assets/images/maskot-login.png');
const RASIO_MASKOT = 213 / 340;
const LOGO = require('../assets/images/logo-simwt-mobile.png');
const RASIO_LOGO = 1382 / 143;
const LEBAR_LOGO = 130;

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

  // Maskot menyesuaikan tinggi layar, dengan batas supaya tetap pas di layar kecil.
  const tinggiMaskot = Math.min(230, Math.max(150, height * 0.26));

  // Gradasi berhenti di bawah logo, ke mana pun blok konten bergeser karena dipusatkan:
  // batas = posisi blok + posisi & tinggi kepala di dalamnya.
  const [yBlok, setYBlok] = useState(0);
  const [batasKepala, setBatasKepala] = useState(0);
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

  return (
    <KeyboardAvoidingView
      style={styles.layar}
      // Android edge-to-edge: `adjustResize` tidak lagi mengecilkan jendela, jadi
      // keyboard menutupi ScrollView dan konten bawah tak bisa digulir.
      behavior="padding"
    >
      <StatusBar style="dark" />

      <ScrollView
        contentContainerStyle={[
          styles.isiGulir,
          { paddingTop: insets.top + Spacing.lg, paddingBottom: insets.bottom + Spacing.xl },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Gradasi mint ke putih dari puncak layar sampai bawah logo. */}
        <LinearGradient
          colors={[palet.mint, Colors.white]}
          style={[styles.gradasi, { height: yBlok + batasKepala }]}
        />

        <View onLayout={(e) => setYBlok(e.nativeEvent.layout.y)}>
        <View
          style={styles.kepala}
          onLayout={(e) => setBatasKepala(e.nativeEvent.layout.y + e.nativeEvent.layout.height)}
        >
          <View style={styles.panggung}>
            <View style={[styles.sorot, { width: tinggiMaskot * 0.95, height: tinggiMaskot * 0.95 }]} />
            <Image
              source={MASKOT}
              style={{ width: tinggiMaskot * RASIO_MASKOT, height: tinggiMaskot }}
              resizeMode="contain"
            />
          </View>
          <Image source={LOGO} style={styles.logo} resizeMode="contain" />
        </View>

        <Animated.View style={[styles.form, { opacity: masuk, transform: [{ translateY: geser }] }]}>
          <Text style={[gs.bodySm, styles.subjudul]}>
            PT Mada Wikri Tunggal
          </Text>

          {/* Username — awalan mwt- ditampilkan sebagai bagian kolom supaya
              pengguna tahu apa yang otomatis ditambahkan. */}
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

          <View style={[gs.fieldWrap, styles.kolom, { marginTop: Spacing.md }]}>
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

          <TouchableOpacity style={styles.lupa} activeOpacity={0.7} onPress={() => router.push('/lupa-password')}>
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
        </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  layar: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  isiGulir: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  gradasi: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  kepala: {
    paddingHorizontal: Spacing.screenPadding + Spacing.xs,
    paddingBottom: Spacing.lg,
  },
  form: {
    paddingHorizontal: Spacing.screenPadding + Spacing.xs,
  },

  logo: {
    alignSelf: 'center',
    width: LEBAR_LOGO,
    height: LEBAR_LOGO / RASIO_LOGO,
  },
  panggung: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginBottom: Spacing.lg,
  },
  // Lingkaran lembut di belakang maskot — kedalaman tanpa aset tambahan.
  sorot: {
    position: 'absolute',
    bottom: 0,
    borderRadius: 999,
    backgroundColor: Colors.white,
    opacity: 0.7,
  },

  subjudul: {
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },

  kolom: {
    borderRadius: Spacing.radius.full,
    paddingVertical: 2,
    paddingHorizontal: Spacing.xl,
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
    alignSelf: 'center',
    marginVertical: Spacing.md,
    padding: Spacing.xs,
  },
  garis: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.borderSubtle,
  },

  kaki: {
    marginTop: Spacing.xxl,
  },
});

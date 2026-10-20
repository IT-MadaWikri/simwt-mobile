/**
 * Lupa Password — alur sama dengan web: masukkan username/NIK, tautan penggantian
 * dikirim ke email akun, lalu sandi baru diisi di halaman web dari tautan itu.
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  ScrollView,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from '../src/components/common/Icon';
import Button from '../src/components/common/Button';
import TombolKembali from '../src/components/common/TombolKembali';
import Colors, { gradasiPalet } from '../constants/Colors';
import Spacing from '../constants/Spacing';
import { gs, inputReset } from '../constants/GlobalStyles';
import { useLupaPassword } from '../src/hooks/useLupaPassword';

export default function LupaPasswordScreen() {
  const [identitas, setIdentitas] = useState('');
  const { mengirim, error, pesan, kirim } = useLupaPassword();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <LinearGradient colors={[...gradasiPalet, Colors.white]} locations={[0, 0.12, 0.24, 0.36, 0.6]} style={gs.flex1}>
      <KeyboardAvoidingView style={gs.flex1} behavior="padding">
        <StatusBar style="dark" />
        <View style={[styles.atas, { paddingTop: insets.top + Spacing.md }]}>
          <TombolKembali warna={Colors.primaryDarker} cadangan="/login" />
        </View>

        <ScrollView
          contentContainerStyle={[styles.isi, { paddingBottom: insets.bottom + Spacing.xl }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={[gs.h2, styles.judul]}>Lupa password?</Text>
          <Text style={[gs.bodySm, styles.sub]}>
            Masukkan username atau NIK Anda. Tautan penggantian kata sandi dikirim ke alamat email yang terdaftar
            pada akun itu.
          </Text>

          {pesan ? (
            <View style={[styles.kotak, { backgroundColor: Colors.primaryLight }]} accessibilityRole="alert">
              <Icon name="email-outline" size={18} color={Colors.primaryDark} />
              <Text style={[gs.bodySm, gs.flex1, { color: Colors.primaryDark }]}>{pesan}</Text>
            </View>
          ) : null}

          {error ? (
            <View style={[styles.kotak, { backgroundColor: Colors.serviceRed }]} accessibilityRole="alert">
              <Icon name="alert-circle" size={18} color={Colors.danger} />
              <Text style={[gs.bodySm, gs.flex1, { color: Colors.dangerDark }]}>{error}</Text>
            </View>
          ) : null}

          <View style={[gs.fieldWrap, styles.kolom]}>
            <Icon name="account-outline" size={19} color={Colors.textTertiary} />
            <TextInput
              style={[gs.fieldInner, styles.isian]}
              placeholder="Username atau NIK"
              placeholderTextColor={Colors.placeholder}
              value={identitas}
              onChangeText={setIdentitas}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="send"
              onSubmitEditing={() => kirim(identitas)}
            />
          </View>

          <Button
            label="Kirim tautan reset"
            iconRight="arrow-right"
            onPress={() => kirim(identitas)}
            loading={mengirim}
            block
          />

          <Text style={[gs.caption, styles.catatan]}>
            Akun tanpa alamat email terdaftar hanya bisa direset oleh admin IT.
          </Text>

          <TouchableOpacity style={styles.kembali} activeOpacity={0.7} onPress={() => router.replace('/login')}>
            <Text style={[gs.bodySm, gs.textSemibold, gs.textBrand]}>Kembali ke halaman masuk</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  atas: {
    paddingHorizontal: Spacing.screenPadding,
  },
  isi: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing.screenPadding + Spacing.xs,
  },
  judul: {
    color: Colors.primaryDarker,
    textAlign: 'center',
  },
  sub: {
    textAlign: 'center',
    marginTop: Spacing.xs,
    marginBottom: Spacing.xl,
  },
  kotak: {
    flexDirection: 'row',
    gap: Spacing.sm,
    padding: Spacing.md,
    borderRadius: Spacing.radius.md,
    ...Spacing.curve,
    marginBottom: Spacing.lg,
  },
  kolom: {
    borderRadius: Spacing.radius.full,
    paddingVertical: 2,
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.lg,
  },
  isian: {
    paddingVertical: Spacing.md,
    ...inputReset,
  },
  catatan: {
    textAlign: 'center',
    marginTop: Spacing.lg,
  },
  kembali: {
    alignSelf: 'center',
    marginTop: Spacing.md,
    padding: Spacing.xs,
  },
});

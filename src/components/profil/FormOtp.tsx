/**
 * FormOtp — isian OTP 6 digit angka + "Kirim ulang" dengan hitung mundur.
 * Presentasional: kode, galat, dan jeda dikelola pemanggil (`useUbahAkunAman`).
 */
import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Colors, { brand, slate } from '../../../constants/Colors';
import Spacing from '../../../constants/Spacing';
import { fonts, ukuranIsi } from '../../../constants/Typography';

const PANJANG = 6;

interface FormOtpProps {
  /** Email tujuan OTP, ditampilkan di penjelasan. */
  tujuan: string;
  kode: string;
  onUbahKode: (kode: string) => void;
  galat?: string | null;
  /** Detik tersisa sebelum boleh kirim ulang; 0 = boleh. */
  sisaDetik: number;
  memuat?: boolean;
  onKirimUlang: () => void;
}

export default function FormOtp({ tujuan, kode, onUbahKode, galat, sisaDetik, memuat = false, onKirimUlang }: FormOtpProps) {
  const [fokus, setFokus] = useState(false);
  const bisaKirimUlang = sisaDetik <= 0 && !memuat;
  return (
    <View>
      <Text style={styles.ket}>
        Kami mengirim kode 6 digit ke <Text style={styles.tebal}>{tujuan}</Text>. Masukkan kode tersebut untuk melanjutkan.
      </Text>
      <Text style={styles.label}>
        Kode OTP<Text style={styles.wajib}> *</Text>
      </Text>
      {/* ponytail: satu TextInput transparan di atas 6 kotak → paste, isi otomatis SMS, dan backspace jalan bawaan. */}
      <View style={styles.baris}>
        {Array.from({ length: PANJANG }, (_, i) => (
          <View
            key={i}
            style={[styles.kotak, galat ? styles.kotakGalat : fokus && i === Math.min(kode.length, PANJANG - 1) && styles.kotakAktif]}
          >
            <Text style={styles.digit}>{kode[i] ?? ''}</Text>
          </View>
        ))}
        <TextInput
          style={styles.inputTersembunyi}
          value={kode}
          onChangeText={(t) => onUbahKode(t.replace(/\D/g, '').slice(0, PANJANG))}
          keyboardType="number-pad"
          maxLength={PANJANG}
          textContentType="oneTimeCode"
          autoComplete="sms-otp"
          caretHidden
          onFocus={() => setFokus(true)}
          onBlur={() => setFokus(false)}
        />
      </View>
      {galat ? <Text style={styles.galat}>{galat}</Text> : null}
      <TouchableOpacity onPress={onKirimUlang} disabled={!bisaKirimUlang} hitSlop={8} style={styles.ulang}>
        <Text style={[styles.teksUlang, !bisaKirimUlang && styles.mati]}>
          {sisaDetik > 0 ? `Kirim ulang kode dalam ${sisaDetik} detik` : 'Kirim ulang kode'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  ket: { fontSize: ukuranIsi, fontFamily: fonts.regular, color: Colors.textSecondary, marginBottom: Spacing.lg },
  tebal: { fontFamily: fonts.semibold, color: Colors.textPrimary },
  label: { fontSize: ukuranIsi, fontFamily: fonts.medium, color: Colors.textPrimary, marginBottom: 6 },
  wajib: { color: Colors.danger },
  baris: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.md },
  kotak: {
    flex: 1,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Spacing.radius.md,
    ...Spacing.curve,
    backgroundColor: slate[50],
  },
  kotakAktif: { borderColor: brand[700] },
  kotakGalat: { borderColor: Colors.danger },
  digit: { fontSize: 20, fontFamily: fonts.semibold, color: Colors.textPrimary },
  inputTersembunyi: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: 0.015, color: 'transparent' },
  galat: { marginTop: -Spacing.sm, marginBottom: Spacing.md, fontSize: ukuranIsi, fontFamily: fonts.regular, color: Colors.danger },
  ulang: { alignSelf: 'flex-start' },
  teksUlang: { fontSize: ukuranIsi, fontFamily: fonts.medium, color: brand[700] },
  mati: { color: Colors.textTertiary },
});

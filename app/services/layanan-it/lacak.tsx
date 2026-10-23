/**
 * Lacak Request — cek status Request Akun lewat nomor dokumen (sama dengan "Lacak" di portal Layanan IT web).
 * Hasilnya ringkasan dengan NIK tersamar; bila milik sendiri, tombol membuka detail lengkap.
 */
import React from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import AppBar from '../../../src/components/common/AppBar';
import Button from '../../../src/components/common/Button';
import FieldTeks from '../../../src/components/common/FieldTeks';
import LencanaStatusRequestAkun from '../../../src/components/layananIt/LencanaStatusRequestAkun';
import Colors, { slate } from '../../../constants/Colors';
import Spacing from '../../../constants/Spacing';
import { fonts } from '../../../constants/Typography';
import { gs } from '../../../constants/GlobalStyles';
import { useLacakRequestAkun } from '../../../src/hooks/useLacakRequestAkun';
import { LABEL_METODE, formatWaktuRequest } from '../../../src/adapters/requestAkun';

function Baris({ label, nilai }: { label: string; nilai: string | null }) {
  if (!nilai) return null;
  return (
    <View style={styles.baris}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.nilai}>{nilai}</Text>
    </View>
  );
}

export default function LacakRequestScreen() {
  const router = useRouter();
  const l = useLacakRequestAkun();
  const h = l.hasil;

  return (
    <KeyboardAvoidingView style={[gs.screen, { backgroundColor: Colors.white }]} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <AppBar judul="Lacak Request" />
      <ScrollView contentContainerStyle={styles.isi} keyboardShouldPersistTaps="handled">
        <FieldTeks
          label="Nomor Dokumen"
          wajib
          nilai={l.nomor}
          onUbah={l.setNomor}
          galat={l.error ?? undefined}
          autoCapitalize="characters"
          placeholder="001/MWT-IT/P1/F-PPPA/10/2026"
        />
        <Button label="Lacak" icon="magnify" onPress={l.lacak} loading={l.mencari} block />

        {h ? (
          <View style={styles.hasil}>
            <LencanaStatusRequestAkun status={h.status} label={h.statusLabel} />
            <Text style={styles.judul}>{h.jenisPermintaan}</Text>
            <Baris label="Sistem" nilai={h.sistem} />
            <Baris label="Pemohon" nilai={`${h.namaUser} (${h.nikTersamar})`} />
            <Baris label="Tujuan approval" nilai={[h.departemen, h.plant].filter(Boolean).join(' · ') || null} />
            <Baris label="Diajukan" nilai={formatWaktuRequest(h.diajukanAt)} />
            <Baris label="Alasan penolakan" nilai={h.catatanPenolakan} />
            {h.status === 'selesai' ? (
              <Baris
                label="Selesai"
                nilai={`${formatWaktuRequest(h.selesaiAt)}${h.metodePenyerahan ? ` · ${LABEL_METODE[h.metodePenyerahan] ?? h.metodePenyerahan}` : ''}`}
              />
            ) : null}
            {h.milikSaya ? (
              <Button
                variant="outline"
                label="Lihat Detail"
                iconRight="chevron-right"
                onPress={() => router.push(`/services/layanan-it/${h.id}` as any)}
                block
                style={{ marginTop: Spacing.sm }}
              />
            ) : null}
          </View>
        ) : null}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  isi: { padding: Spacing.lg },
  hasil: {
    gap: Spacing.md,
    marginTop: Spacing.lg,
    padding: Spacing.md,
    borderRadius: Spacing.radius.xl,
    ...Spacing.curve,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: slate[50],
  },
  judul: { fontFamily: fonts.bold, fontSize: 14, color: Colors.textPrimary },
  baris: { gap: 2 },
  label: { fontFamily: fonts.regular, fontSize: 12, color: Colors.textTertiary },
  nilai: { fontFamily: fonts.semibold, fontSize: 12, color: Colors.textPrimary },
});

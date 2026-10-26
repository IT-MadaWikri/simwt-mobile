/**
 * Sheet Simpan ke Draft — isi judul draf, nama, dan shift (nama & shift terisi otomatis dari data
 * karyawan yang login, tetap bisa diubah). Presentasional.
 */
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import BottomSheet from '../common/BottomSheet';
import Button from '../common/Button';
import FieldTeks from '../common/FieldTeks';
import Colors, { brand, slate } from '../../../constants/Colors';
import Spacing from '../../../constants/Spacing';
import { fonts, ukuranIsi } from '../../../constants/Typography';

interface SheetSimpanDrafProps {
  visible: boolean;
  judul: string;
  nama: string;
  shift: number | null;
  daftarShift: number[];
  /** Judul bawaan bila dikosongkan. */
  judulBawaan: string;
  menyimpan: boolean;
  onUbahJudul: (v: string) => void;
  onUbahNama: (v: string) => void;
  onPilihShift: (shift: number) => void;
  onSimpan: () => void;
  onClose: () => void;
}

export default function SheetSimpanDraf({
  visible,
  judul,
  nama,
  shift,
  daftarShift,
  judulBawaan,
  menyimpan,
  onUbahJudul,
  onUbahNama,
  onPilihShift,
  onSimpan,
  onClose,
}: SheetSimpanDrafProps) {
  return (
    <BottomSheet visible={visible} onClose={onClose} title="Simpan ke Draft" penuh>
      <View style={styles.isi}>
        <FieldTeks label="Judul Draft" nilai={judul} onUbah={onUbahJudul} placeholder={judulBawaan} />
        <FieldTeks label="Nama Anda" nilai={nama} onUbah={onUbahNama} placeholder="Nama pembuat draft" autoCapitalize="words" />

        <Text style={styles.label}>Shift<Text style={styles.opsional}> (opsional)</Text></Text>
        <View style={styles.baris}>
          {daftarShift.map((s) => {
            const aktif = s === shift;
            return (
              <TouchableOpacity
                key={s}
                style={[styles.pil, aktif && styles.pilAktif]}
                activeOpacity={0.7}
                onPress={() => onPilihShift(s)}
                accessibilityRole="button"
                accessibilityState={{ selected: aktif }}
              >
                <Text style={[styles.teksPil, aktif && styles.teksPilAktif]}>Shift {s}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Button icon="content-save-outline" label="Simpan draft" onPress={onSimpan} loading={menyimpan} block />
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  isi: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.lg },
  label: { fontSize: ukuranIsi, fontFamily: fonts.medium, color: Colors.textPrimary, marginBottom: 6 },
  opsional: { fontFamily: fonts.regular, color: Colors.textTertiary },
  baris: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.lg },
  pil: {
    flex: 1,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Spacing.radius.full,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: slate[50],
  },
  pilAktif: { borderColor: brand[600], backgroundColor: brand[50] },
  teksPil: { fontSize: ukuranIsi, fontFamily: fonts.regular, color: Colors.textSecondary },
  teksPilAktif: { fontFamily: fonts.bold, color: brand[700] },
});

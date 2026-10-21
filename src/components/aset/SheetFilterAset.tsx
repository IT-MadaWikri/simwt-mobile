/**
 * Sheet Filter Daftar Aset (kategori) — pola sama dengan Filter Tiket: pilihan disimpan di
 * draf sendiri dan baru berlaku saat "Terapkan filter" ditekan. Presentasional.
 */
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import BottomSheet from '../common/BottomSheet';
import Button from '../common/Button';
import Colors from '../../../constants/Colors';
import Spacing from '../../../constants/Spacing';
import { fonts, ukuranIsi } from '../../../constants/Typography';
import { gs } from '../../../constants/GlobalStyles';
import { KategoriAset } from '../../types/aset';

interface SheetFilterAsetProps {
  visible: boolean;
  /** Id kategori yang sedang menyaring; null = semua. */
  aktif: number | null;
  opsi: KategoriAset[];
  onTerapkan: (kategoriId: number | null) => void;
  onClose: () => void;
}

export default function SheetFilterAset({ visible, aktif, opsi, onTerapkan, onClose }: SheetFilterAsetProps) {
  const [draf, setDraf] = useState<number | null>(aktif);

  // Setiap dibuka mulai dari filter yang sedang aktif.
  useEffect(() => {
    if (visible) setDraf(aktif);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const semua = opsi.reduce((n, k) => n + k.jumlah, 0);
  const pilihan = [{ id: null, label: `Semua · ${semua}` }, ...opsi.map((k) => ({ id: k.id, label: `${k.nama} · ${k.jumlah}` }))];

  return (
    <BottomSheet visible={visible} onClose={onClose} title="Filter">
      <View style={{ paddingHorizontal: Spacing.lg }}>
        <Text style={styles.judulSeksi}>Kategori</Text>
        <View style={styles.chips}>
          {pilihan.map((p) => {
            const on = p.id === draf;
            return (
              <TouchableOpacity
                key={p.id ?? 'semua'}
                style={[styles.chip, on && styles.chipAktif]}
                onPress={() => setDraf(p.id)}
                activeOpacity={0.8}
              >
                <Text style={[styles.chipText, on && styles.chipTextAktif]}>{p.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <View style={[gs.row, { gap: Spacing.sm, paddingHorizontal: Spacing.lg, paddingTop: Spacing.md }]}>
        <Button
          variant="outline"
          icon="restore"
          label="Reset"
          onPress={() => {
            setDraf(null);
            onTerapkan(null);
          }}
        />
        <Button icon="check" label="Terapkan filter" onPress={() => onTerapkan(draf)} style={gs.flex1} />
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  judulSeksi: {
    marginTop: Spacing.sm,
    fontSize: ukuranIsi,
    fontFamily: fonts.semibold,
    color: Colors.textPrimary,
  },
  chips: { flexDirection: 'row', flexWrap: 'wrap', paddingTop: 6, paddingBottom: Spacing.sm, gap: 6 },
  chip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
  },
  chipAktif: { backgroundColor: Colors.textPrimary, borderColor: Colors.textPrimary },
  chipText: { fontSize: ukuranIsi, fontFamily: fonts.medium, color: Colors.textSecondary },
  chipTextAktif: { color: Colors.white, fontFamily: fonts.semibold },
});

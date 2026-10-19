/**
 * Sheet Filter Tiket Saya (status + rentang tanggal diajukan) — pola sama dengan
 * Filter Kaizen. Pilihan disimpan di draf sendiri dan baru berlaku saat
 * "Terapkan filter" ditekan. Presentasional.
 */
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import BottomSheet from '../common/BottomSheet';
import Button from '../common/Button';
import FieldTanggal from '../common/FieldTanggal';
import Colors from '../../../constants/Colors';
import Spacing from '../../../constants/Spacing';
import { fonts, ukuranIsi } from '../../../constants/Typography';
import { gs } from '../../../constants/GlobalStyles';
import { ModeFilter } from '../../hooks/useTiketSaya';
import { StatusTiket } from '../../types/tiket';

export interface NilaiFilterTiket {
  status: StatusTiket | '';
  dari: string;
  sampai: string;
}

const FILTER_AWAL: NilaiFilterTiket = { status: '', dari: '', sampai: '' };

const STATUS: { label: string; value: StatusTiket | '' }[] = [
  { label: 'Semua', value: '' },
  { label: 'Menunggu', value: 'PENDING' },
  { label: 'Diproses', value: 'PROSES' },
  { label: 'Konfirmasi', value: 'RESOLVED' },
  { label: 'Selesai', value: 'OK' },
];

interface SheetFilterTiketProps {
  visible: boolean;
  aktif: NilaiFilterTiket;
  /** Jumlah tiket per status ('' = semua), untuk label chip. */
  jumlah: Record<string, number>;
  /** Mode yang sedang memuat (tombolnya berspinner, tombol lain mati); null = tidak memuat. */
  memuat: null | ModeFilter;
  onTerapkan: (n: NilaiFilterTiket, mode: ModeFilter) => void;
  onClose: () => void;
}

export default function SheetFilterTiket({ visible, aktif, jumlah, memuat, onTerapkan, onClose }: SheetFilterTiketProps) {
  const [draf, setDraf] = useState<NilaiFilterTiket>(aktif);

  // Setiap dibuka mulai dari filter yang sedang aktif.
  useEffect(() => {
    if (visible) setDraf(aktif);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const ubah = <K extends keyof NilaiFilterTiket>(k: K, v: NilaiFilterTiket[K]) => setDraf((d) => ({ ...d, [k]: v }));

  return (
    <BottomSheet visible={visible} onClose={onClose} title="Filter">
      <View style={{ paddingHorizontal: Spacing.lg }}>
        <Text style={styles.judulSeksi}>Status</Text>
        <View style={styles.chips}>
          {STATUS.map((s) => {
            const on = s.value === draf.status;
            return (
              <TouchableOpacity
                key={s.label}
                style={[styles.chip, on && styles.chipAktif]}
                onPress={() => ubah('status', s.value)}
                activeOpacity={0.8}
              >
                <Text style={[styles.chipText, on && styles.chipTextAktif]}>
                  {s.label} · {jumlah[s.value] ?? 0}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={styles.judulSeksi}>Tanggal diajukan</Text>
        <View style={[gs.row, { gap: Spacing.sm, alignItems: 'flex-start' }]}>
          <FieldTanggal label="Dari" value={draf.dari} max={draf.sampai || undefined} onChange={(v) => ubah('dari', v)} />
          <FieldTanggal label="Sampai" value={draf.sampai} min={draf.dari || undefined} onChange={(v) => ubah('sampai', v)} />
        </View>
      </View>

      <View style={[gs.row, { gap: Spacing.sm, paddingHorizontal: Spacing.lg, paddingTop: Spacing.md }]}>
        <Button
          variant="outline"
          icon="restore"
          label="Reset"
          loading={memuat === 'reset'}
          disabled={memuat === 'terapkan'}
          onPress={() => {
            setDraf(FILTER_AWAL);
            onTerapkan(FILTER_AWAL, 'reset');
          }}
        />
        <Button
          icon="check"
          label="Terapkan filter"
          loading={memuat === 'terapkan'}
          disabled={memuat === 'reset'}
          onPress={() => onTerapkan(draf, 'terapkan')}
          style={gs.flex1}
        />
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

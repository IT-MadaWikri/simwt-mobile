/**
 * Sheet Filter riwayat terkirim (judgment + rentang tanggal). Pilihan disimpan di draf sendiri dan baru
 * berlaku saat "Terapkan filter" ditekan. Presentasional.
 */
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import BottomSheet from '../common/BottomSheet';
import Button from '../common/Button';
import FieldTanggal from '../common/FieldTanggal';
import ChipPilihan from './ChipPilihan';
import Colors from '../../../constants/Colors';
import Spacing from '../../../constants/Spacing';
import { fonts, fontsJudul, ukuranIsi } from '../../../constants/Typography';
import { gs } from '../../../constants/GlobalStyles';
import { ModeFilter, NilaiFilterTerkirim } from '../../hooks/useDaftarTerkirim';
import { FilterTerkirim } from '../../types/pengukuran';

const FILTER_AWAL: NilaiFilterTerkirim = { judgment: '', tanggalMulai: '', tanggalSelesai: '' };

const JUDGMENT: { label: string; value: FilterTerkirim['judgment'] }[] = [
  { label: 'Semua', value: '' },
  { label: 'OK', value: 'OK' },
  { label: 'NG', value: 'NG' },
  { label: 'Pending', value: 'Pending' },
];

interface SheetFilterTerkirimProps {
  visible: boolean;
  aktif: NilaiFilterTerkirim;
  /** Mode yang sedang memuat (tombolnya berspinner, tombol lain mati); null = tidak memuat. */
  memuat: null | ModeFilter;
  onTerapkan: (n: NilaiFilterTerkirim, mode: ModeFilter) => void;
  onClose: () => void;
}

export default function SheetFilterTerkirim({ visible, aktif, memuat, onTerapkan, onClose }: SheetFilterTerkirimProps) {
  const [draf, setDraf] = useState<NilaiFilterTerkirim>(aktif);

  // Setiap dibuka mulai dari filter yang sedang aktif.
  useEffect(() => {
    if (visible) setDraf(aktif);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const ubah = <K extends keyof NilaiFilterTerkirim>(k: K, v: NilaiFilterTerkirim[K]) => setDraf((d) => ({ ...d, [k]: v }));

  return (
    <BottomSheet visible={visible} onClose={onClose} title="Filter">
      <View style={{ paddingHorizontal: Spacing.lg }}>
        <Text style={styles.judulSeksi}>Judgment</Text>
        <View style={styles.chips}>
          {JUDGMENT.map((j) => (
            <ChipPilihan key={j.label} label={j.label} aktif={j.value === draf.judgment} onPress={() => ubah('judgment', j.value)} />
          ))}
        </View>

        <Text style={styles.judulSeksi}>Tanggal pengukuran</Text>
        <View style={[gs.row, { gap: Spacing.sm, alignItems: 'flex-start' }]}>
          <FieldTanggal label="Dari" value={draf.tanggalMulai} max={draf.tanggalSelesai || undefined} onChange={(v) => ubah('tanggalMulai', v)} />
          <FieldTanggal label="Sampai" value={draf.tanggalSelesai} min={draf.tanggalMulai || undefined} onChange={(v) => ubah('tanggalSelesai', v)} />
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
  judulSeksi: { marginTop: Spacing.sm, fontSize: ukuranIsi, fontFamily: fontsJudul.semibold, color: Colors.textPrimary },
  chips: { flexDirection: 'row', flexWrap: 'wrap', paddingTop: 6, paddingBottom: Spacing.sm, gap: 6 },
});

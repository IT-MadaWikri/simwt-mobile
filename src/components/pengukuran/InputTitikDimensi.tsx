/** Satu titik ukur dimensi: alat, target, dan isian per sampel (angka, teks, atau pilihan radio). Presentasional. */
import React from 'react';
import { Platform, StyleSheet, Text, TextInput, View } from 'react-native';
import ChipPilihan from './ChipPilihan';
import Colors, { brand, slate } from '../../../constants/Colors';
import Spacing from '../../../constants/Spacing';
import { fonts, ukuranIsi } from '../../../constants/Typography';
import { inputReset } from '../../../constants/GlobalStyles';
import { adalahTitikCritical, ambilKonfigurasiTitik, jumlahSampelPerTitik, parseAngka } from '../../utils/pengukuran';
import { StandarPengukuran } from '../../types/pengukuran';

const KEYBOARD_ANGKA = Platform.OS === 'ios' ? 'numbers-and-punctuation' : 'numeric';

const dua = (angka: number) => (Number.isNaN(angka) ? null : angka.toFixed(2));

interface InputTitikDimensiProps {
  titik: StandarPengukuran;
  nilaiPerSampel: string[];
  /** Alat terpilih; null = alat pertama titik ini. */
  toolId: number | string | null;
  invalidSamples?: boolean[];
  outOfRangeSamples?: boolean[];
  onUbahNilai: (index: number, nilai: string) => void;
  onUbahTool: (toolId: number | string) => void;
}

export default function InputTitikDimensi({
  titik,
  nilaiPerSampel,
  toolId,
  invalidSamples = [],
  outOfRangeSamples = [],
  onUbahNilai,
  onUbahTool,
}: InputTitikDimensiProps) {
  const { toolAktif, konfigurasi } = ambilKonfigurasiTitik(titik, toolId);
  const { tipeInput, standarMin, standarMax, targetString, opsiRadio } = konfigurasi;
  const radio = tipeInput === 'radio';
  const angka = tipeInput === 'number';
  const adaRange = !Number.isNaN(standarMin) && !Number.isNaN(standarMax);

  return (
    <View style={styles.kartu}>
      <View style={styles.judulBaris}>
        <View style={styles.drawing}>
          <Text style={styles.drawingTeks}>{titik.nomor_drawing || '-'}</Text>
        </View>
        <Text style={styles.nama}>{titik.nama_point}</Text>
        {adalahTitikCritical(titik) ? <Text style={styles.critical}>Critical</Text> : null}
      </View>
      <Text style={styles.sub}>{toolAktif?.nama || '-'} · {tipeInput || '-'}</Text>
      {radio || targetString ? (
        <Text style={styles.sub}>{targetString || 'Target tool belum diatur'}</Text>
      ) : null}

      {titik.tools.length > 1 ? (
        <View style={styles.chips}>
          {titik.tools.map((tool) => (
            <ChipPilihan key={String(tool.id)} label={tool.nama} aktif={tool.id === toolAktif?.id} onPress={() => onUbahTool(tool.id)} />
          ))}
        </View>
      ) : null}

      <View style={styles.sampel}>
        {Array.from({ length: jumlahSampelPerTitik(titik) }, (_, index) => {
          const nilai = nilaiPerSampel[index] || '';
          const angkaNilai = parseAngka(nilai);
          const kurang = angka && !!nilai.trim() && !Number.isNaN(angkaNilai) && !Number.isNaN(standarMin) && angkaNilai < standarMin;
          const lebih = angka && !!nilai.trim() && !Number.isNaN(angkaNilai) && !Number.isNaN(standarMax) && angkaNilai > standarMax;
          const salah = !!invalidSamples[index] || kurang || lebih;

          return (
            <View key={index} style={radio ? styles.sampelLebar : styles.sampelKotak}>
              <Text style={styles.label}>S{index + 1}</Text>
              {radio ? (
                <View style={styles.chips}>
                  {opsiRadio.map((opsi) => (
                    <ChipPilihan key={opsi} label={opsi} aktif={nilai === opsi} onPress={() => onUbahNilai(index, opsi)} />
                  ))}
                </View>
              ) : (
                <TextInput
                  style={[styles.input, salah && styles.inputSalah]}
                  value={nilai}
                  onChangeText={(teks) => onUbahNilai(index, teks)}
                  keyboardType={angka ? KEYBOARD_ANGKA : undefined}
                  placeholder={angka ? '0.00' : tipeInput === 'text' ? 'Teks' : '-'}
                  placeholderTextColor={Colors.placeholder}
                />
              )}
              {kurang ? <Text style={styles.galat}>Kurang dari min</Text> : null}
              {lebih ? <Text style={styles.galat}>Lebih dari max</Text> : null}
            </View>
          );
        })}
      </View>

      {angka && invalidSamples.some(Boolean) ? <Text style={styles.galat}>Format angka wajib 0.00 (contoh: 1.25)</Text> : null}
      {angka && outOfRangeSamples.some(Boolean) ? <Text style={styles.galat}>Ada nilai di luar range standar.</Text> : null}

      <Text style={styles.standar}>
        Standar: {radio ? opsiRadio.join(' / ') || 'none' : adaRange ? `${dua(standarMin)} - ${dua(standarMax)}` : 'none'}{' '}
        {titik.simbol_target || ''}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  kartu: {
    gap: 4,
    marginBottom: Spacing.md,
    padding: Spacing.md,
    borderRadius: Spacing.radius.md,
    ...Spacing.curve,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
  },
  judulBaris: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: Spacing.sm },
  drawing: { minWidth: 28, height: 28, paddingHorizontal: 6, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: brand[50] },
  drawingTeks: { fontFamily: fonts.bold, fontSize: ukuranIsi, color: brand[700] },
  nama: { flexShrink: 1, fontFamily: fonts.bold, fontSize: ukuranIsi, color: Colors.textPrimary },
  critical: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 1,
    borderRadius: Spacing.radius.full,
    overflow: 'hidden',
    backgroundColor: Colors.serviceRed,
    fontFamily: fonts.bold,
    fontSize: 12,
    color: Colors.dangerDark,
  },
  sub: { fontFamily: fonts.regular, fontSize: ukuranIsi, color: Colors.textSecondary },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, paddingVertical: 4 },
  sampel: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginTop: Spacing.sm },
  sampelKotak: { width: '30%', flexGrow: 1 },
  sampelLebar: { width: '100%' },
  label: { marginBottom: 4, fontFamily: fonts.regular, fontSize: 12, color: Colors.textTertiary },
  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Spacing.radius.md,
    ...Spacing.curve,
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    fontSize: ukuranIsi,
    fontFamily: fonts.regular,
    color: Colors.textPrimary,
    backgroundColor: slate[50],
    ...inputReset,
  },
  inputSalah: { borderColor: Colors.danger },
  galat: { marginTop: 2, fontFamily: fonts.regular, fontSize: 12, color: Colors.danger },
  standar: { marginTop: Spacing.sm, fontFamily: fonts.regular, fontSize: 12, color: brand[600] },
});

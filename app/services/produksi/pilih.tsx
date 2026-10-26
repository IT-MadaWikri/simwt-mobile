/**
 * Pilih pasangan Pencapaian Produksi — setara halaman "pilih dies" / "pilih mesin" di web.
 * Dari scan MESIN: pilih dies yang terpasang; dari scan DIES: pilih mesin tempat dies terpasang.
 * Tujuannya selalu form stroke milik DIES, dengan nomor mesin sebagai parameter.
 */
import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AppBar from '../../../src/components/common/AppBar';
import Button from '../../../src/components/common/Button';
import FieldPilihan from '../../../src/components/common/FieldPilihan';
import SheetCari from '../../../src/components/common/SheetCari';
import Colors from '../../../constants/Colors';
import Spacing from '../../../constants/Spacing';
import { fonts } from '../../../constants/Typography';
import { gs } from '../../../constants/GlobalStyles';
import { usePencarian } from '../../../src/hooks/usePencarian';
import { produksiService } from '../../../src/services/produksiService';
import { AsetPasangan } from '../../../src/types/produksi';

export default function PilihPasanganScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  // `sebagai`: jenis aset yang dipindai (mesin → pilih dies, dies → pilih mesin).
  const { nomor, nama, sebagai } = useLocalSearchParams<{ nomor: string; nama?: string; sebagai: 'mesin' | 'dies' }>();
  const pilihDies = sebagai === 'mesin';
  const jenisCari = pilihDies ? 'dies' : 'mesin';

  const [buka, setBuka] = useState(false);
  const [pilihan, setPilihan] = useState<AsetPasangan | null>(null);
  const cari = usePencarian<AsetPasangan>((q) => produksiService.cari<AsetPasangan>(jenisCari, q), buka);

  const lanjut = () => {
    if (!pilihan) return;
    router.push({
      pathname: '/services/produksi/stroke',
      params: pilihDies ? { nomor: pilihan.value, mesin: nomor } : { nomor, mesin: pilihan.value },
    });
  };

  return (
    <View style={[gs.screen, { backgroundColor: Colors.white }]}>
      <AppBar judul="Pencapaian Produksi" />

      <View style={styles.isi}>
        <Text style={styles.judulBagian}>{pilihDies ? 'Mesin' : 'Dies'}</Text>
        <View style={styles.kartu}>
          <Text style={styles.nama} numberOfLines={2}>{nama || nomor}</Text>
          <Text style={styles.nomor}>{nomor}</Text>
        </View>

        <FieldPilihan
          label={pilihDies ? 'Dies yang terpasang di mesin ini' : 'Mesin tempat dies ini terpasang'}
          wajib
          placeholder={pilihDies ? 'Ketik nomor atau nama dies' : 'Ketik nomor atau nama mesin'}
          nilai={pilihan?.text ?? null}
          onPress={() => setBuka(true)}
        />
        <Text style={styles.ket}>Cari dengan minimal 2 huruf nomor aset, nama, atau alias {jenisCari}.</Text>
      </View>

      <View style={[styles.footer, { paddingBottom: insets.bottom + Spacing.sm }]}>
        <Button label="Lanjut" iconRight="arrow-right" onPress={lanjut} disabled={!pilihan} style={gs.flex1} />
      </View>

      <SheetCari
        visible={buka}
        judul={pilihDies ? 'Pilih Dies' : 'Pilih Mesin'}
        placeholder="Ketik nomor, nama, atau alias"
        q={cari.q}
        onChangeQ={cari.setQ}
        item={cari.hasil.map((a) => ({ kunci: a.value, judul: a.text, sub: a.sub, ikon: 'box' }))}
        memuat={cari.memuat}
        gagal={cari.gagal}
        onPilih={(kunci) => setPilihan(cari.hasil.find((a) => a.value === kunci) ?? null)}
        onClose={() => setBuka(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  isi: { flex: 1, padding: Spacing.lg },
  judulBagian: {
    fontSize: 12,
    fontFamily: fonts.semibold,
    color: Colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: Spacing.sm,
  },
  kartu: {
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    borderRadius: Spacing.radius.xl,
    ...Spacing.curve,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
  },
  nama: { fontSize: 12, fontFamily: fonts.bold, color: Colors.textPrimary },
  nomor: { marginTop: 2, fontSize: 12, fontFamily: fonts.regular, color: Colors.textSecondary },
  ket: { fontSize: 12, fontFamily: fonts.regular, color: Colors.textTertiary },
  footer: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.borderSubtle,
  },
});

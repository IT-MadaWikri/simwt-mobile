/**
 * Satu bagian sheet filter yang memilih banyak item lewat pencarian jarak jauh: chip terpilih (bisa
 * dihapus), kolom cari, lalu chip hasil. Presentasional; pencariannya dijalankan pemanggil.
 */
import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TextInput, View } from 'react-native';
import ChipPilihan from './ChipPilihan';
import Icon from '../common/Icon';
import Colors from '../../../constants/Colors';
import Spacing from '../../../constants/Spacing';
import { fonts, ukuranIsi } from '../../../constants/Typography';
import { gs, inputReset } from '../../../constants/GlobalStyles';

export interface ItemPilihan {
  kunci: string;
  label: string;
}

interface BagianCariPilihanProps {
  judul: string;
  placeholder: string;
  terpilih: ItemPilihan[];
  hasil: ItemPilihan[];
  kata: string;
  /** Minimal huruf sebelum pencarian jalan. */
  minHuruf: number;
  memuat: boolean;
  gagal: boolean;
  onKata: (kata: string) => void;
  onPilih: (kunci: string) => void;
  onHapus: (kunci: string) => void;
}

export default function BagianCariPilihan({
  judul,
  placeholder,
  terpilih,
  hasil,
  kata,
  minHuruf,
  memuat,
  gagal,
  onKata,
  onPilih,
  onHapus,
}: BagianCariPilihanProps) {
  const cukup = kata.trim().length >= minHuruf;
  const belumDipilih = hasil.filter((h) => !terpilih.some((t) => t.kunci === h.kunci));

  return (
    <View style={styles.bagian}>
      <Text style={styles.judul}>{judul}</Text>

      {terpilih.length ? (
        <View style={styles.chips}>
          {terpilih.map((t) => (
            <ChipPilihan key={t.kunci} label={t.label} onHapus={() => onHapus(t.kunci)} />
          ))}
        </View>
      ) : null}

      <View style={[gs.searchBar, styles.kotakCari]}>
        <Icon name="magnify" size={16} color={Colors.textTertiary} />
        <TextInput
          style={styles.cari}
          placeholder={placeholder}
          placeholderTextColor={Colors.placeholder}
          value={kata}
          onChangeText={onKata}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {memuat ? <ActivityIndicator size="small" color={Colors.primary} /> : null}
      </View>

      {!cukup ? (
        <Text style={styles.info}>Ketik minimal {minHuruf} huruf untuk mencari.</Text>
      ) : gagal ? (
        <Text style={styles.info}>Pencarian gagal. Periksa koneksi lalu coba lagi.</Text>
      ) : !memuat && hasil.length === 0 ? (
        <Text style={styles.info}>Tidak ditemukan.</Text>
      ) : (
        <View style={styles.chips}>
          {belumDipilih.map((h) => (
            <ChipPilihan key={h.kunci} label={h.label} onPress={() => onPilih(h.kunci)} />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  bagian: { marginBottom: Spacing.lg },
  judul: { marginTop: Spacing.sm, fontSize: ukuranIsi, fontFamily: fonts.semibold, color: Colors.textPrimary },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, paddingTop: 6, paddingBottom: Spacing.sm },
  kotakCari: { height: 36, paddingVertical: 0, paddingHorizontal: Spacing.md, gap: 6, marginTop: 6 },
  cari: { flex: 1, paddingVertical: 0, fontSize: ukuranIsi, fontFamily: fonts.regular, color: Colors.textPrimary, ...inputReset },
  info: { marginTop: Spacing.sm, fontSize: ukuranIsi, fontFamily: fonts.regular, color: Colors.textTertiary },
});

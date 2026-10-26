/**
 * SheetCari — bottom sheet pilih dari hasil pencarian jarak jauh. Kolom cari berbentuk pil dan menempel
 * di atas daftar (tidak ikut menggulir); tiap baris berisi lingkaran (avatar atau ikon), judul tebal, dan
 * keterangan di bawahnya. Presentasional: pencarian dijalankan pemanggil (mis. lewat `usePencarian`) dan
 * hasilnya datang sebagai `item`.
 *
 * `izinkanBaru` menambah baris "Pakai “…”" di atas hasil, untuk isian yang boleh diketik bebas.
 */
import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import BottomSheet from './BottomSheet';
import Avatar from './Avatar';
import Icon from './Icon';
import Colors, { brand, slate } from '../../../constants/Colors';
import Spacing from '../../../constants/Spacing';
import { fonts, ukuranIsi } from '../../../constants/Typography';
import { gs, inputReset } from '../../../constants/GlobalStyles';

export interface ItemCari {
  kunci: string;
  judul: string;
  sub?: string;
  /** Nama untuk avatar inisial di kiri baris (mis. karyawan). */
  avatar?: string;
  /** Nama ikon di lingkaran kiri bila tanpa `avatar`; tanpa keduanya tidak ada lingkaran. */
  ikon?: string;
}

interface SheetCariProps {
  visible: boolean;
  judul: string;
  placeholder: string;
  q: string;
  onChangeQ: (v: string) => void;
  item: ItemCari[];
  memuat: boolean;
  gagal: boolean;
  /** Minimal huruf sebelum pencarian jalan; 0 = daftar langsung tampil. */
  minHuruf?: number;
  izinkanBaru?: boolean;
  onPilih: (kunci: string) => void;
  onClose: () => void;
}

const UKURAN_LINGKAR = 40;

export default function SheetCari({
  visible,
  judul,
  placeholder,
  q,
  onChangeQ,
  item,
  memuat,
  gagal,
  minHuruf = 2,
  izinkanBaru = false,
  onPilih,
  onClose,
}: SheetCariProps) {
  const kata = q.trim();
  const pilih = (kunci: string) => {
    onPilih(kunci);
    onClose();
  };
  const barisBaru = izinkanBaru && kata && !item.some((i) => i.kunci.toLowerCase() === kata.toLowerCase());

  const kolomCari = (
    <View style={styles.kolomCari}>
      <View style={styles.kotakCari}>
        <Icon name="magnify" size={20} color={Colors.textTertiary} />
        <TextInput
          style={styles.cari}
          placeholder={placeholder}
          placeholderTextColor={Colors.placeholder}
          value={q}
          onChangeText={onChangeQ}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="search"
        />
        {memuat ? <ActivityIndicator size="small" color={Colors.primary} /> : null}
      </View>
    </View>
  );

  return (
    <BottomSheet visible={visible} onClose={onClose} title={judul} penuh kepalaTetap={kolomCari}>
      <View style={styles.isi}>
        {barisBaru ? (
          <TouchableOpacity style={styles.baris} activeOpacity={0.6} onPress={() => pilih(kata)}>
            <View style={styles.lingkar}>
              <Icon name="plus" size={18} color={brand[700]} />
            </View>
            <View style={[gs.flex1, styles.teksBaris]}>
              <Text style={[styles.nama, { color: brand[700] }]} numberOfLines={2}>Pakai “{kata}”</Text>
            </View>
          </TouchableOpacity>
        ) : null}

        {gagal ? (
          <Text style={styles.info}>Pencarian gagal. Periksa koneksi lalu coba lagi.</Text>
        ) : kata.length < minHuruf ? (
          <Text style={styles.info}>Ketik minimal {minHuruf} huruf untuk mencari.</Text>
        ) : !memuat && item.length === 0 && !barisBaru ? (
          <Text style={styles.info}>Data tidak ditemukan.</Text>
        ) : (
          item.map((i) => (
            <TouchableOpacity key={i.kunci} style={styles.baris} activeOpacity={0.6} onPress={() => pilih(i.kunci)}>
              {i.avatar ? (
                <Avatar nama={i.avatar} ukuran={UKURAN_LINGKAR} />
              ) : i.ikon ? (
                <View style={styles.lingkar}>
                  <Icon name={i.ikon} size={18} color={brand[700]} />
                </View>
              ) : null}
              <View style={[gs.flex1, styles.teksBaris]}>
                <Text style={styles.nama} numberOfLines={2}>{i.judul}</Text>
                {i.sub ? <Text style={styles.sub} numberOfLines={1}>{i.sub}</Text> : null}
              </View>
            </TouchableOpacity>
          ))
        )}
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  kolomCari: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.md },
  kotakCari: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    height: 44,
    paddingHorizontal: Spacing.lg,
    borderRadius: Spacing.radius.full,
    backgroundColor: slate[100],
  },
  cari: {
    flex: 1,
    paddingVertical: 0,
    fontSize: ukuranIsi,
    fontFamily: fonts.regular,
    color: Colors.textPrimary,
    ...inputReset,
  },
  isi: { paddingHorizontal: Spacing.lg },
  info: { fontFamily: fonts.regular, fontSize: 12, color: Colors.textTertiary, paddingVertical: Spacing.lg, textAlign: 'center' },
  baris: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  lingkar: {
    width: UKURAN_LINGKAR,
    height: UKURAN_LINGKAR,
    borderRadius: UKURAN_LINGKAR / 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: brand[50],
  },
  // Garis pemisah ada di kolom teks, jadi dimulai tepat di bawah teks pertama.
  teksBaris: {
    paddingVertical: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: slate[200],
  },
  nama: { fontFamily: fonts.semibold, fontSize: ukuranIsi, color: Colors.textPrimary },
  sub: { marginTop: 2, fontFamily: fonts.regular, fontSize: 12, color: Colors.textSecondary },
});

/**
 * Bottom sheet cari aset (nama, alias, PIC, atau nomor) untuk Buat Tiket.
 * Presentasional: pencarian dijalankan pemanggil lewat `useCariAset`.
 */
import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import BottomSheet from '../common/BottomSheet';
import Icon from '../common/Icon';
import Colors, { slate } from '../../../constants/Colors';
import Spacing from '../../../constants/Spacing';
import { fonts, ukuranIsi } from '../../../constants/Typography';
import { gs, inputReset } from '../../../constants/GlobalStyles';
import { AsetRingkas } from '../../types/tiket';

interface SheetAsetProps {
  visible: boolean;
  q: string;
  onChangeQ: (v: string) => void;
  hasil: AsetRingkas[];
  memuat: boolean;
  gagal: boolean;
  onPilih: (aset: AsetRingkas) => void;
  onClose: () => void;
}

export default function SheetAset({ visible, q, onChangeQ, hasil, memuat, gagal, onPilih, onClose }: SheetAsetProps) {
  const kata = q.trim();
  return (
    <BottomSheet visible={visible} onClose={onClose} title="Pilih Aset" penuh>
      <View style={styles.isi}>
        <View style={[gs.searchBar, styles.kotakCari]}>
          <Icon name="magnify" size={16} color={Colors.textTertiary} />
          <TextInput
            style={styles.cari}
            placeholder="Cari nama, alias, PIC, atau nomor aset"
            placeholderTextColor={Colors.placeholder}
            value={q}
            onChangeText={onChangeQ}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="search"
          />
          {memuat ? <ActivityIndicator size="small" color={Colors.primary} /> : null}
        </View>

        {gagal ? (
          <Text style={styles.info}>Pencarian gagal. Periksa koneksi lalu coba lagi.</Text>
        ) : kata.length < 2 ? (
          <Text style={styles.info}>Ketik minimal 2 huruf untuk mencari aset.</Text>
        ) : !memuat && hasil.length === 0 ? (
          <Text style={styles.info}>Aset tidak ditemukan.</Text>
        ) : (
          hasil.map((a) => (
            <TouchableOpacity
              key={a.asset_number}
              style={styles.baris}
              activeOpacity={0.6}
              onPress={() => {
                onPilih(a);
                onClose();
              }}
            >
              <View style={gs.flex1}>
                <Text style={styles.nama} numberOfLines={2}>{a.asset_name}</Text>
                <Text style={styles.sub} numberOfLines={1}>
                  {[a.asset_number, a.alias, a.asset_pic].filter(Boolean).join(' · ')}
                </Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  isi: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.lg },
  kotakCari: { height: 36, paddingVertical: 0, paddingHorizontal: Spacing.md, gap: 6, marginBottom: Spacing.sm },
  cari: {
    flex: 1,
    paddingVertical: 0,
    fontSize: ukuranIsi,
    fontFamily: fonts.regular,
    color: Colors.textPrimary,
    ...inputReset,
  },
  info: { fontFamily: fonts.regular, fontSize: 12, color: Colors.textTertiary, paddingVertical: Spacing.lg, textAlign: 'center' },
  baris: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: slate[200],
  },
  nama: { fontFamily: fonts.semibold, fontSize: 12, color: Colors.textPrimary },
  sub: { fontFamily: fonts.regular, fontSize: 12, color: Colors.textSecondary },
});

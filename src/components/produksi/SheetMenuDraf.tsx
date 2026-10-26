/**
 * Sheet menu draf Pencapaian Produksi — dua ubin gradien seperti "Menu Kaizen": Simpan ke Draft dan
 * Buka Daftar Draft (dengan jumlah draf). Presentasional; sheet ditutup pemanggil sebelum aksi jalan.
 */
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import BottomSheet from '../common/BottomSheet';
import Icon from '../common/Icon';
import LencanaAngka from '../common/LencanaAngka';
import Colors from '../../../constants/Colors';
import Spacing from '../../../constants/Spacing';
import { fonts, ukuranIsi } from '../../../constants/Typography';
import { gs } from '../../../constants/GlobalStyles';

interface SheetMenuDrafProps {
  visible: boolean;
  jumlahDraf: number;
  onSimpan: () => void;
  onBukaDaftar: () => void;
  onClose: () => void;
}

export default function SheetMenuDraf({ visible, jumlahDraf, onSimpan, onBukaDaftar, onClose }: SheetMenuDrafProps) {
  const menu = [
    { ikon: 'content-save-outline', label: 'Simpan ke Draft', warna: ['#60a5fa', '#3b82f6'] as const, aksi: onSimpan },
    { ikon: 'file-document', label: 'Buka Daftar Draft', warna: ['#fb923c', '#f97316'] as const, jumlah: jumlahDraf, aksi: onBukaDaftar },
  ];

  return (
    <BottomSheet visible={visible} onClose={onClose} title="Menu Draft">
      <View style={styles.grid}>
        {menu.map((m) => (
          <TouchableOpacity key={m.label} style={styles.ubin} activeOpacity={0.85} onPress={m.aksi}>
            <LinearGradient colors={m.warna} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.isiUbin}>
              <View style={styles.lingkarIkon}>
                <Icon name={m.ikon} size={18} color={Colors.white} strokeWidth={1.8} />
              </View>
              <Text style={[styles.labelUbin, gs.flex1]}>{m.label}</Text>
              {'jumlah' in m ? (
                <LencanaAngka jumlah={m.jumlah ?? 0} ukuran={24} warna={Colors.white} teks={Colors.textPrimary} style={styles.jumlah} />
              ) : null}
            </LinearGradient>
          </TouchableOpacity>
        ))}
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  grid: { rowGap: Spacing.sm, paddingHorizontal: Spacing.lg, paddingTop: Spacing.sm, paddingBottom: Spacing.md },
  ubin: { width: '100%', height: 52, borderRadius: Spacing.radius.full, ...Spacing.curve, overflow: 'hidden' },
  isiUbin: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingHorizontal: Spacing.sm },
  lingkarIkon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.22)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  labelUbin: { fontSize: ukuranIsi, fontFamily: fonts.bold, color: Colors.white, textAlign: 'left' },
  jumlah: { marginRight: Spacing.xs },
});

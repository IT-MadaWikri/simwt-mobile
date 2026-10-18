/**
 * SheetPilihan — bottom sheet daftar pilihan tunggal. Mengetuk baris memilih
 * dan menutup sheet. Presentasional: daftar & pilihan datang dari pemanggil.
 */
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import BottomSheet from './BottomSheet';
import Icon from './Icon';
import Colors, { brand } from '../../../constants/Colors';
import Spacing from '../../../constants/Spacing';
import { fonts } from '../../../constants/Typography';

interface Opsi {
  id: number;
  label: string;
}

interface SheetPilihanProps {
  visible: boolean;
  judul: string;
  opsi: Opsi[];
  terpilih: number | null;
  onPilih: (id: number) => void;
  onClose: () => void;
  /** Tampilkan baris "Tidak ada" untuk mengosongkan pilihan (field opsional). */
  bolehKosong?: boolean;
}

export default function SheetPilihan({
  visible,
  judul,
  opsi,
  terpilih,
  onPilih,
  onClose,
  bolehKosong = false,
}: SheetPilihanProps) {
  const baris = (id: number | null, label: string) => {
    const aktif = id === terpilih;
    return (
      <TouchableOpacity
        key={id ?? 'kosong'}
        style={styles.baris}
        activeOpacity={0.6}
        onPress={() => {
          onPilih(id as number);
          onClose();
        }}
      >
        <Text style={[styles.label, aktif && styles.labelAktif]} numberOfLines={2}>{label}</Text>
        {aktif ? <Icon name="check" size={18} color={brand[600]} /> : null}
      </TouchableOpacity>
    );
  };

  return (
    <BottomSheet visible={visible} onClose={onClose} title={judul}>
      <View>
        {bolehKosong ? baris(null, 'Tidak ada') : null}
        {opsi.map((o) => baris(o.id, o.label))}
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  baris: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
  },
  label: { flex: 1, fontFamily: fonts.regular, fontSize: 12, color: Colors.textPrimary },
  labelAktif: { fontFamily: fonts.semibold, color: brand[700] },
});

/**
 * Daftar isian bernomor yang bisa ditambah/dihapus (tujuan, manfaat) di form Request Pembuatan Sistem.
 * Minimal `min` butir selalu tampil (tanpa tombol hapus); selebihnya bisa dihapus. Presentasional.
 */
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import FieldTeks from '../common/FieldTeks';
import Icon from '../common/Icon';
import Colors from '../../../constants/Colors';
import Spacing from '../../../constants/Spacing';
import { fonts, ukuranIsi } from '../../../constants/Typography';
import { gs } from '../../../constants/GlobalStyles';

interface DaftarButirProps {
  /** Mis. "Tujuan". Tiap butir berlabel "{judul} 1", "{judul} 2", … */
  judul: string;
  butir: string[];
  min: number;
  galat?: string;
  onUbah: (indeks: number, teks: string) => void;
  onTambah: () => void;
  onHapus: (indeks: number) => void;
}

export default function DaftarButir({ judul, butir, min, galat, onUbah, onTambah, onHapus }: DaftarButirProps) {
  return (
    <View style={styles.wadah}>
      {butir.map((teks, i) => (
        <View key={i} style={styles.baris}>
          <View style={gs.flex1}>
            <FieldTeks label={`${judul} ${i + 1}`} wajib={i < min} nilai={teks} onUbah={(t) => onUbah(i, t)} placeholder={judul} />
          </View>
          {i >= min ? (
            <TouchableOpacity style={styles.hapus} hitSlop={8} onPress={() => onHapus(i)} accessibilityLabel={`Hapus ${judul.toLowerCase()} ${i + 1}`}>
              <Icon name="close-circle" size={20} color={Colors.textTertiary} />
            </TouchableOpacity>
          ) : null}
        </View>
      ))}
      {galat ? <Text style={styles.galat}>{galat}</Text> : null}
      <TouchableOpacity style={styles.tambah} activeOpacity={0.7} onPress={onTambah}>
        <Icon name="plus" size={16} color={Colors.primary} />
        <Text style={styles.teksTambah}>Tambah {judul.toLowerCase()}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wadah: { marginBottom: Spacing.sm },
  baris: { flexDirection: 'row', alignItems: 'flex-end', gap: Spacing.sm },
  hapus: { height: 40, marginBottom: Spacing.md, justifyContent: 'center' },
  galat: { marginBottom: Spacing.sm, fontSize: 12, fontFamily: fonts.regular, color: Colors.danger },
  tambah: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', paddingVertical: Spacing.xs },
  teksTambah: { fontSize: ukuranIsi, fontFamily: fonts.semibold, color: Colors.primary },
});

/**
 * Satu baris histori Form Keluar Pabrik: jenis keluar tebal, tanggal & jam, nomor dokumen, lencana status
 * di kanan atas. Presentasional.
 */
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Icon from '../common/Icon';
import LencanaStatusKeluarPabrik from './LencanaStatusKeluarPabrik';
import Colors, { brand } from '../../../constants/Colors';
import Spacing from '../../../constants/Spacing';
import { fonts } from '../../../constants/Typography';
import { StatusKeluarPabrik } from '../../types/layananHrd';

interface KartuKeluarPabrikProps {
  /** Mis. "Dinas Kantor". */
  jenis: string;
  /** Mis. "23 Okt 2026 · 09.00 – 12.00". */
  waktu: string;
  nomorDokumen: string;
  status: StatusKeluarPabrik;
  statusLabel: string;
  onPress: () => void;
}

export default function KartuKeluarPabrik({ jenis, waktu, nomorDokumen, status, statusLabel, onPress }: KartuKeluarPabrikProps) {
  return (
    <TouchableOpacity style={styles.baris} activeOpacity={0.7} onPress={onPress}>
      <View style={styles.ikon}>
        <Icon name="logout" size={18} color={brand[700]} />
      </View>
      <View style={styles.isi}>
        <View style={styles.atas}>
          <Text style={styles.judul} numberOfLines={1}>{jenis}</Text>
          <LencanaStatusKeluarPabrik status={status} label={statusLabel} />
        </View>
        <Text style={styles.teks} numberOfLines={1}>{waktu}</Text>
        <Text style={styles.redup} numberOfLines={1}>{nomorDokumen}</Text>
      </View>
      <Icon name="chevron-right" size={18} color={Colors.textTertiary} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  baris: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
  },
  ikon: { width: 36, height: 36, borderRadius: 18, backgroundColor: brand[50], alignItems: 'center', justifyContent: 'center' },
  isi: { flex: 1, gap: 2 },
  atas: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  judul: { flex: 1, fontFamily: fonts.bold, fontSize: 12, color: Colors.textPrimary },
  teks: { fontFamily: fonts.regular, fontSize: 12, color: Colors.textSecondary },
  redup: { fontFamily: fonts.regular, fontSize: 12, color: Colors.textTertiary },
});

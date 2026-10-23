/**
 * Satu baris histori Request Pembuatan Sistem: nama aplikasi tebal, nomor dokumen dan tanggal pengajuan,
 * lencana status di kanan atas. Presentasional.
 */
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Icon from '../common/Icon';
import LencanaStatusRequestAkun from './LencanaStatusRequestAkun';
import Colors, { brand } from '../../../constants/Colors';
import Spacing from '../../../constants/Spacing';
import { fonts } from '../../../constants/Typography';

interface KartuRequestSistemProps {
  namaAplikasi: string;
  nomorDokumen: string;
  /** Mis. "23 Okt 2026, 09.54". */
  diajukan: string;
  status: string;
  statusLabel: string;
  onPress: () => void;
}

export default function KartuRequestSistem({ namaAplikasi, nomorDokumen, diajukan, status, statusLabel, onPress }: KartuRequestSistemProps) {
  return (
    <TouchableOpacity style={styles.baris} activeOpacity={0.7} onPress={onPress}>
      <View style={styles.ikon}>
        <Icon name="application-outline" size={18} color={brand[700]} />
      </View>
      <View style={styles.isi}>
        <View style={styles.atas}>
          <Text style={styles.judul} numberOfLines={1}>{namaAplikasi}</Text>
          <LencanaStatusRequestAkun status={status} label={statusLabel} />
        </View>
        <Text style={styles.redup} numberOfLines={1}>{nomorDokumen} · {diajukan}</Text>
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
  redup: { fontFamily: fonts.regular, fontSize: 12, color: Colors.textTertiary },
});

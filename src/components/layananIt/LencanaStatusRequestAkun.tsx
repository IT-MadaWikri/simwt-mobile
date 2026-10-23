/** Lencana status Request Akun dan Request Pembuatan Sistem (menunggu tahap tertentu, selesai/disetujui, ditolak) — presentasional. */
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Colors, { brand } from '../../../constants/Colors';
import Spacing from '../../../constants/Spacing';
import { fonts } from '../../../constants/Typography';

const WARNA: Record<string, { bg: string; fg: string }> = {
  pending_kabag: { bg: '#fffbeb', fg: '#b45309' },
  pending_manager_plant: { bg: '#f0f9ff', fg: '#0369a1' },
  pending_it: { bg: '#eff6ff', fg: '#1d4ed8' },
  pending_manager_it: { bg: '#faf5ff', fg: '#7e22ce' },
  selesai: { bg: brand[50], fg: brand[700] },
  disetujui: { bg: brand[50], fg: brand[700] },
  ditolak: { bg: '#fef2f2', fg: Colors.dangerDark },
};

export default function LencanaStatusRequestAkun({ status, label }: { status: string; label: string }) {
  const { bg, fg } = WARNA[status] ?? WARNA.pending_kabag;
  return (
    <View style={[styles.lencana, { backgroundColor: bg }]}>
      <Text style={[styles.teks, { color: fg }]} numberOfLines={1}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  lencana: { alignSelf: 'flex-start', paddingHorizontal: Spacing.sm, paddingVertical: 2, borderRadius: Spacing.radius.full, ...Spacing.curve },
  teks: { fontFamily: fonts.semibold, fontSize: 11 },
});

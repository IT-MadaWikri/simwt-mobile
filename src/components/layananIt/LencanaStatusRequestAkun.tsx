/** Lencana status Request Akun (menunggu Kabag / Tim IT, selesai, ditolak) — presentasional. */
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Colors, { brand } from '../../../constants/Colors';
import Spacing from '../../../constants/Spacing';
import { fonts } from '../../../constants/Typography';
import { StatusRequestAkun } from '../../types/layananIt';

const WARNA: Record<StatusRequestAkun, { bg: string; fg: string }> = {
  pending_kabag: { bg: '#fffbeb', fg: '#b45309' },
  pending_it: { bg: '#eff6ff', fg: '#1d4ed8' },
  selesai: { bg: brand[50], fg: brand[700] },
  ditolak: { bg: '#fef2f2', fg: Colors.dangerDark },
};

export default function LencanaStatusRequestAkun({ status, label }: { status: StatusRequestAkun; label: string }) {
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

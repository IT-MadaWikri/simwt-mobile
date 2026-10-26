/** Lencana status Form Keluar Pabrik (menunggu, disetujui, ditolak) — presentasional. */
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Colors, { brand } from '../../../constants/Colors';
import Spacing from '../../../constants/Spacing';
import { fonts } from '../../../constants/Typography';
import { StatusKeluarPabrik } from '../../types/layananHrd';

const WARNA: Record<StatusKeluarPabrik, { bg: string; fg: string }> = {
  menunggu: { bg: '#fffbeb', fg: '#b45309' },
  disetujui: { bg: brand[50], fg: brand[700] },
  ditolak: { bg: '#fef2f2', fg: Colors.dangerDark },
};

export default function LencanaStatusKeluarPabrik({ status, label }: { status: StatusKeluarPabrik; label: string }) {
  const { bg, fg } = WARNA[status] ?? WARNA.menunggu;
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

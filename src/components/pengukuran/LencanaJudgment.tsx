/** Lencana pil OK / NG / Pending untuk hasil pengukuran. */
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Icon from '../common/Icon';
import Colors, { brand } from '../../../constants/Colors';
import Spacing from '../../../constants/Spacing';
import { fonts } from '../../../constants/Typography';
import { Judgement } from '../../types/pengukuran';

const WARNA = {
  OK: { label: 'OK', ikon: 'check-circle', bg: brand[50], fg: brand[700] },
  NG: { label: 'NG', ikon: 'close-circle', bg: Colors.serviceRed, fg: Colors.dangerDark },
  Pending: { label: 'Pending', ikon: 'clock-outline', bg: Colors.serviceAmber, fg: Colors.warning },
};

export default function LencanaJudgment({ judgment }: { judgment: Judgement | null }) {
  const w = WARNA[judgment ?? 'Pending'];
  return (
    <View style={[styles.lencana, { backgroundColor: w.bg }]}>
      <Icon name={w.ikon} size={12} color={w.fg} />
      <Text style={[styles.teks, { color: w.fg }]}>{w.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  lencana: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.md,
    paddingVertical: 2,
    borderRadius: Spacing.radius.full,
    ...Spacing.curve,
  },
  teks: { fontFamily: fonts.bold, fontSize: 12 },
});

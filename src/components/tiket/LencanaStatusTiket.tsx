/** Lencana status tiket (PENDING / PROSES / OK) — presentasional. */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from '../common/Icon';
import { brand, slate } from '../../../constants/Colors';
import Spacing from '../../../constants/Spacing';
import { fonts } from '../../../constants/Typography';
import { STATUS_TIKET } from '../../adapters/tiket';
import { StatusTiket } from '../../types/tiket';

export const WARNA_STATUS_TIKET: Record<StatusTiket, { bg: string; fg: string }> = {
  PENDING: { bg: '#fffbeb', fg: '#b45309' },
  PROSES: { bg: brand[50], fg: brand[700] },
  OK: { bg: slate[100], fg: slate[600] },
};

interface LencanaStatusTiketProps {
  status: StatusTiket;
  /** Tampilkan keterangan panjang ("Sedang diproses") alih-alih label singkat. */
  panjang?: boolean;
}

export default function LencanaStatusTiket({ status, panjang = false }: LencanaStatusTiketProps) {
  const meta = STATUS_TIKET[status];
  const { bg, fg } = WARNA_STATUS_TIKET[status];
  return (
    <View style={[styles.lencana, { backgroundColor: bg }]}>
      <Icon name={meta.ikon as any} size={12} color={fg} />
      <Text style={[styles.teks, { color: fg }]}>{panjang ? meta.keterangan : meta.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  lencana: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: Spacing.radius.full,
  },
  teks: {
    fontFamily: fonts.semibold,
    fontSize: 10,
  },
});

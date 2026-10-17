/**
 * RekapBulan — 12 bulan Hutang Kaizen, satu ikon per bulan (tanpa kotak).
 *
 *   ada          → centang hijau     kosong      → silang merah
 *   berjalan     → cincin hijau      belum-mulai / belum-wajib → cincin abu
 *
 * Dipakai di menu Kaizen dan di Kaizen Saya supaya rupanya selalu sama.
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from '../common/Icon';
import Colors from '../../../constants/Colors';
import Spacing from '../../../constants/Spacing';
import { fonts } from '../../../constants/Typography';
import { BULAN } from '../../utils/kaizen';

type Keadaan = 'ada' | 'kosong' | 'berjalan' | 'belum-mulai' | 'belum-wajib';

/** Diameter ikon status per bulan. */
const IKON = 20;

export default function RekapBulan({ keadaan }: { keadaan: Keadaan[] }) {
  return (
    <View style={styles.baris}>
      {keadaan.map((k, i) => (
        <View key={i} style={styles.kolom}>
          {k === 'ada' ? (
            <Icon name="check-circle" size={IKON} color={Colors.primary} />
          ) : k === 'kosong' ? (
            <Icon name="close-circle" size={IKON} color={Colors.danger} />
          ) : (
            <View style={[styles.cincin, k === 'berjalan' && styles.cincinBerjalan]} />
          )}
          <Text style={styles.bulan}>{BULAN[i][0]}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  baris: {
    flexDirection: 'row',
    gap: 4,
    marginTop: Spacing.sm,
  },
  kolom: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  cincin: {
    width: IKON,
    height: IKON,
    borderRadius: IKON / 2,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cincinBerjalan: {
    borderColor: Colors.primary,
    borderWidth: 1.5,
  },
  bulan: {
    fontSize: 12,
    fontFamily: fonts.medium,
    color: Colors.textTertiary,
  },
});

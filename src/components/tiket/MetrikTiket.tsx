/**
 * Metrik waktu penanganan tiket: grid 2 kolom berisi kartu persegi putih (Total Downtime,
 * Waktu Tunggu, Waktu Proses, Total Perbaikan). Tahap yang masih berjalan menampilkan jam
 * berjalan (HH:MM:SS) dan titik hijau berdenyut di pojok kartu.
 */
import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import Icon from '../common/Icon';
import Colors, { brand } from '../../../constants/Colors';
import Spacing from '../../../constants/Spacing';
import { fonts } from '../../../constants/Typography';
import { formatDurasi } from '../../adapters/tiket';
import { formatJam, useJamBerjalan } from '../../hooks/useJamBerjalan';
import { MetrikTiket as Metrik } from '../../types/tiket';

/** Titik hijau berdenyut = tahap sedang berjalan. */
function TitikBerjalan() {
  const redup = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(redup, { toValue: 0.25, duration: 700, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(redup, { toValue: 1, duration: 700, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, [redup]);
  return (
    <View accessibilityLabel="Sedang berjalan" style={styles.cincin}>
      <Animated.View style={[styles.titik, { opacity: redup }]} />
    </View>
  );
}

function KartuMetrik({ metrik }: { metrik: Metrik }) {
  const jam = useJamBerjalan(metrik.berjalanSejak);
  const berjalan = jam !== null;
  const nilai = berjalan ? formatJam(jam) : metrik.detik !== null ? formatDurasi(metrik.detik) : '-';

  return (
    <View style={styles.kartu}>
      <View style={styles.atas}>
        <Text style={styles.label} numberOfLines={2}>{metrik.label}</Text>
        {berjalan ? (
          <TitikBerjalan />
        ) : (
          <Icon name="clock-outline" size={18} color={metrik.detik !== null ? brand[600] : Colors.textTertiary} />
        )}
      </View>
      <View>
        <Text
          style={[styles.nilai, berjalan && { color: brand[700] }, nilai === '-' && { color: Colors.textTertiary }]}
          numberOfLines={1}
          adjustsFontSizeToFit
        >
          {nilai}
        </Text>
        <Text style={styles.ket} numberOfLines={2}>{metrik.keterangan}</Text>
      </View>
    </View>
  );
}

export default function MetrikTiket({ metrik }: { metrik: Metrik[] }) {
  return (
    <View style={styles.grid}>
      {metrik.map((m) => (
        <KartuMetrik key={m.id} metrik={m} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: Spacing.md },
  kartu: {
    width: '48%',
    aspectRatio: 1,
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
    borderRadius: Spacing.radius.xl,
    ...Spacing.curve,
    padding: Spacing.md,
    backgroundColor: Colors.white,
  },
  atas: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: Spacing.sm },
  label: { flex: 1, fontFamily: fonts.regular, fontSize: 12, color: Colors.textSecondary },
  nilai: { fontFamily: fonts.bold, fontSize: 20, color: Colors.textPrimary },
  ket: { fontFamily: fonts.regular, fontSize: 12, color: Colors.textTertiary, marginTop: 2 },
  cincin: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: brand[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  titik: { width: 8, height: 8, borderRadius: 4, backgroundColor: brand[500] },
});

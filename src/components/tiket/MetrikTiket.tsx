/**
 * Metrik waktu penanganan tiket: grid 2 kolom berisi kartu persegi panjang putih (Total Downtime,
 * Waktu Tunggu, Waktu Proses, Total Perbaikan). Tahap yang masih berjalan menampilkan jam
 * berjalan (HH:MM:SS) dan titik hijau berdenyut di pojok kartu.
 * Keterangan tiap metrik ada di BottomSheet yang dibuka dari ikon info.
 */
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import BottomSheet from '../common/BottomSheet';
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

function KartuMetrik({ metrik, onInfo }: { metrik: Metrik; onInfo: () => void }) {
  const jam = useJamBerjalan(metrik.berjalanSejak);
  const berjalan = jam !== null;
  const nilai = berjalan ? formatJam(jam) : metrik.detik !== null ? formatDurasi(metrik.detik) : '-';

  return (
    <View style={styles.kartu}>
      <View style={styles.baris}>
        <Text style={styles.label} numberOfLines={1}>{metrik.label}</Text>
        <TouchableOpacity onPress={onInfo} hitSlop={10} accessibilityLabel={`Info ${metrik.label}`}>
          <Icon name="information-outline" size={16} color={Colors.textTertiary} />
        </TouchableOpacity>
      </View>
      <View style={styles.baris}>
        <Text
          style={[styles.nilai, berjalan && { color: brand[700] }, nilai === '-' && { color: Colors.textTertiary }]}
          numberOfLines={1}
        >
          {nilai}
        </Text>
        {berjalan ? (
          <TitikBerjalan />
        ) : (
          <Icon name="clock-outline" size={16} color={metrik.detik !== null ? brand[600] : Colors.textTertiary} />
        )}
      </View>
    </View>
  );
}

export default function MetrikTiket({ metrik }: { metrik: Metrik[] }) {
  const [info, setInfo] = useState<Metrik | null>(null);
  return (
    <>
      <View style={styles.grid}>
        {metrik.map((m) => (
          <KartuMetrik key={m.id} metrik={m} onInfo={() => setInfo(m)} />
        ))}
      </View>
      <BottomSheet visible={info !== null} onClose={() => setInfo(null)} title={info?.label}>
        <Text style={styles.ket}>{info?.keterangan}</Text>
      </BottomSheet>
    </>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: Spacing.md },
  kartu: {
    width: '48%',
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
    borderRadius: Spacing.radius.xl,
    ...Spacing.curve,
    padding: Spacing.md,
    backgroundColor: Colors.white,
  },
  baris: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: Spacing.sm },
  label: { flex: 1, fontFamily: fonts.regular, fontSize: 12, color: Colors.textSecondary },
  nilai: { fontFamily: fonts.bold, fontSize: 12, color: Colors.textPrimary },
  ket: { fontFamily: fonts.regular, fontSize: 12, color: Colors.textSecondary, paddingHorizontal: Spacing.screenPadding },
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

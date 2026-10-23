/**
 * KalenderBulan — kalender sebulan: judul bulan + panah geser, baris nama hari,
 * lalu grid tanggal. Tanggal terpilih berupa lingkaran gelap, hari ini diberi
 * warna brand, dan `penanda` memberi titik berwarna di bawah tanggal. Grid bisa digeser ke kiri/kanan
 * dengan jari untuk pindah bulan (sama dengan panah).
 * Presentasional: pilihan & bulan yang tampil dipegang pemanggil.
 */
import { memo, useEffect, useMemo, useRef } from 'react';
import { StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import Icon from '../common/Icon';
import Colors, { brand } from '../../../constants/Colors';
import Spacing from '../../../constants/Spacing';
import { fonts } from '../../../constants/Typography';
import { NAMA_BULAN, NAMA_HARI, SINGKATAN_HARI, kunciTanggal, sama, selBulan } from '../../utils/kalender';

interface KalenderBulanProps {
  tahun: number;
  /** 0–11. */
  bulan: number;
  terpilih: Date;
  /** Warna titik per tanggal, kuncinya `YYYY-MM-DD` (lihat `kunciTanggal`). */
  penanda?: Record<string, string[]>;
  onPilih: (tanggal: Date) => void;
  /** -1 = bulan lalu, +1 = bulan depan. */
  onGeser: (delta: number) => void;
}

function KalenderBulan({ tahun, bulan, terpilih, penanda = {}, onPilih, onGeser }: KalenderBulanProps) {
  const hariIni = new Date();
  const sel = selBulan(tahun, bulan);
  const { width: lebar } = useWindowDimensions();

  // Geser mendatar di thread UI (Reanimated): grid ikut jari; lepas melewati ambang → meluncur keluar dan
  // `onGeser` dipanggil. Bulan baru masuk dari sisi seberang lewat efek di bawah, setelah isinya benar-benar
  // dirender, supaya geseran lewat panah pun ikut beranimasi dan tidak ada kilasan bulan lama.
  const x = useSharedValue(0);
  const pan = useMemo(
    () =>
      Gesture.Pan()
        .activeOffsetX([-12, 12])
        .failOffsetY([-12, 12])
        .onUpdate((e) => {
          x.value = e.translationX * 0.5;
        })
        .onEnd((e) => {
          if (Math.abs(e.translationX) < 60 && Math.abs(e.velocityX) < 500) {
            x.value = withSpring(0);
            return;
          }
          const arah = e.translationX > 0 ? -1 : 1; // geser ke kanan = bulan lalu
          x.value = withTiming(-arah * lebar, { duration: 120 }, (selesai) => {
            if (selesai) runOnJS(onGeser)(arah);
          });
        }),
    [x, lebar, onGeser]
  );
  const gayaGrid = useAnimatedStyle(() => ({ transform: [{ translateX: x.value }] }));

  const indeksBulan = tahun * 12 + bulan;
  const sebelumnya = useRef(indeksBulan);
  useEffect(() => {
    const arah = Math.sign(indeksBulan - sebelumnya.current);
    sebelumnya.current = indeksBulan;
    if (arah === 0) return;
    x.value = arah * lebar;
    x.value = withTiming(0, { duration: 160 });
  }, [indeksBulan, lebar, x]);

  return (
    <View>
      <View style={styles.kepala}>
        <View style={styles.flex1}>
          {/* Judul besar: pengecualian dari aturan 12px, seperti sapaan di beranda. */}
          <Text style={styles.judul}>{NAMA_BULAN[bulan]} {tahun}</Text>
          <Text style={styles.sub}>
            {NAMA_HARI[terpilih.getDay()]}, {terpilih.getDate()} {NAMA_BULAN[terpilih.getMonth()]} {terpilih.getFullYear()}
          </Text>
        </View>
        <TouchableOpacity style={styles.panah} hitSlop={8} onPress={() => onGeser(-1)} accessibilityLabel="Bulan sebelumnya">
          <Icon name="chevron-left" size={20} color={Colors.ink} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.panah} hitSlop={8} onPress={() => onGeser(1)} accessibilityLabel="Bulan berikutnya">
          <Icon name="chevron-right" size={20} color={Colors.ink} />
        </TouchableOpacity>
      </View>

      <GestureDetector gesture={pan}>
        <Animated.View style={gayaGrid}>
          <View style={styles.baris}>
            {SINGKATAN_HARI.map((h) => (
              <Text key={h} style={styles.namaHari}>{h}</Text>
            ))}
          </View>

          <View style={styles.grid}>
            {sel.map((tgl, i) => {
              if (!tgl) return <View key={i} style={styles.sel} />;
              const dipilih = sama(tgl, terpilih);
              const titik = penanda[kunciTanggal(tgl)] ?? [];
              return (
                <TouchableOpacity key={i} style={styles.sel} activeOpacity={0.7} onPress={() => onPilih(tgl)}>
                  <View style={[styles.bulat, dipilih && styles.bulatDipilih]}>
                    <Text
                      style={[
                        styles.angka,
                        sama(tgl, hariIni) && !dipilih && styles.angkaHariIni,
                        dipilih && styles.angkaDipilih,
                      ]}
                    >
                      {tgl.getDate()}
                    </Text>
                  </View>
                  <View style={styles.titikBaris}>
                    {titik.slice(0, 3).map((warna, k) => (
                      <View key={k} style={[styles.titik, { backgroundColor: warna }]} />
                    ))}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

// Props dari layar stabil (state / useCallback), jadi kalender tidak ikut dirender ulang saat sheet detail dibuka.
export default memo(KalenderBulan);

const styles = StyleSheet.create({
  flex1: { flex: 1 },
  kepala: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingHorizontal: Spacing.screenPadding,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  judul: { fontFamily: fonts.bold, fontSize: 18, color: Colors.textPrimary },
  sub: { fontFamily: fonts.regular, fontSize: 12, color: Colors.textTertiary },
  panah: {
    width: 32,
    height: 32,
    borderRadius: Spacing.radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  baris: { flexDirection: 'row', paddingHorizontal: Spacing.sm, marginBottom: Spacing.xs },
  namaHari: {
    width: `${100 / 7}%`,
    textAlign: 'center',
    fontFamily: fonts.regular,
    fontSize: 12,
    color: Colors.textTertiary,
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: Spacing.sm, paddingBottom: Spacing.md },
  sel: { width: `${100 / 7}%`, height: 50, alignItems: 'center', justifyContent: 'center' },
  bulat: { width: 34, height: 34, borderRadius: 17, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  bulatDipilih: { backgroundColor: Colors.ink },
  angka: { fontFamily: fonts.medium, fontSize: 12, color: Colors.textPrimary },
  angkaHariIni: { fontFamily: fonts.bold, color: brand[600] },
  angkaDipilih: { fontFamily: fonts.bold, color: Colors.white },
  titikBaris: { height: 6, flexDirection: 'row', gap: 2, marginTop: 1 },
  titik: { width: 4, height: 4, borderRadius: 2 },
});

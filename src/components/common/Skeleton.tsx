/**
 * Skeleton — placeholder berdenyut untuk muat awal, pengganti spinner.
 *
 * `Skeleton` adalah balok dasarnya; preset di bawah meniru bentuk layar:
 *  - `SkeletonDaftar`  → daftar kartu (Kaizen, tiket, notifikasi, karyawan, …)
 *  - `SkeletonDetail`  → halaman detail (kartu ringkasan + beberapa seksi)
 *  - `SkeletonDasbor`  → ringkasan berisi petak angka + daftar
 *  - `SkeletonForm`    → formulir (label + field)
 * Tarik-untuk-segarkan & muat-berikutnya tetap memakai indikator bawaan.
 */
import React, { useEffect, useRef } from 'react';
import { Animated, DimensionValue, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import Colors, { slate } from '../../../constants/Colors';
import Spacing from '../../../constants/Spacing';

type Props = { w?: DimensionValue; h?: number; r?: number; style?: StyleProp<ViewStyle> };

export function Skeleton({ w = '100%', h = 12, r = Spacing.radius.full, style }: Props) {
  const denyut = useRef(new Animated.Value(0.5)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(denyut, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(denyut, { toValue: 0.5, duration: 700, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [denyut]);
  return (
    <Animated.View
      style={[{ width: w, height: h, borderRadius: r, backgroundColor: slate[200], opacity: denyut }, Spacing.curve, style]}
    />
  );
}

function Kartu({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.kartu, style]}>{children}</View>;
}

/** Satu kartu daftar: ikon/avatar, dua baris teks, baris tag. */
function KartuDaftar({ avatar }: { avatar: 'bulat' | 'kotak' }) {
  return (
    <Kartu>
      <View style={styles.baris}>
        <Skeleton w={42} h={42} r={avatar === 'bulat' ? 21 : Spacing.radius.sm} />
        <View style={styles.isi}>
          <Skeleton w="75%" h={12} />
          <Skeleton w="45%" h={10} />
        </View>
      </View>
      <View style={[styles.baris, { marginTop: Spacing.md }]}>
        <Skeleton w={70} h={16} />
        <Skeleton w={56} h={16} />
      </View>
    </Kartu>
  );
}

export function SkeletonDaftar({ jumlah = 6, avatar = 'kotak', style }: { jumlah?: number; avatar?: 'bulat' | 'kotak'; style?: StyleProp<ViewStyle> }) {
  return (
    <View style={[styles.wadah, style]}>
      {Array.from({ length: jumlah }, (_, i) => <KartuDaftar key={i} avatar={avatar} />)}
    </View>
  );
}

function SeksiBaris({ baris = 3 }: { baris?: number }) {
  return (
    <Kartu>
      <Skeleton w="40%" h={12} style={{ marginBottom: Spacing.md }} />
      {Array.from({ length: baris }, (_, i) => (
        <Skeleton key={i} w={i === baris - 1 ? '60%' : '100%'} h={10} style={{ marginBottom: Spacing.sm }} />
      ))}
    </Kartu>
  );
}

export function SkeletonDetail({ avatar = 'kotak' }: { avatar?: 'bulat' | 'kotak' }) {
  return (
    <View style={styles.wadah}>
      <Kartu>
        <View style={styles.baris}>
          <Skeleton w={avatar === 'bulat' ? 64 : 46} h={avatar === 'bulat' ? 64 : 46} r={avatar === 'bulat' ? 32 : Spacing.radius.sm} />
          <View style={styles.isi}>
            <Skeleton w="80%" h={14} />
            <Skeleton w="50%" h={10} />
          </View>
        </View>
        <View style={[styles.baris, { marginTop: Spacing.md }]}>
          <Skeleton w={80} h={18} />
          <Skeleton w={64} h={18} />
        </View>
      </Kartu>
      <View style={styles.baris}>
        <Skeleton w="48%" h={64} r={Spacing.radius.md} />
        <Skeleton w="48%" h={64} r={Spacing.radius.md} />
      </View>
      <SeksiBaris baris={4} />
      <SeksiBaris baris={3} />
    </View>
  );
}

export function SkeletonDasbor() {
  return (
    <View style={styles.wadah}>
      <View style={styles.grid}>
        {Array.from({ length: 4 }, (_, i) => (
          <Kartu key={i} style={styles.petak}>
            <Skeleton w={28} h={28} r={Spacing.radius.sm} />
            <Skeleton w="60%" h={18} style={{ marginTop: Spacing.md }} />
            <Skeleton w="80%" h={10} style={{ marginTop: Spacing.sm }} />
          </Kartu>
        ))}
      </View>
      <KartuDaftar avatar="kotak" />
      <KartuDaftar avatar="kotak" />
      <KartuDaftar avatar="kotak" />
    </View>
  );
}

export function SkeletonForm({ field = 5 }: { field?: number }) {
  return (
    <View style={styles.wadah}>
      <Kartu>
        {Array.from({ length: field }, (_, i) => (
          <View key={i} style={{ marginBottom: Spacing.md }}>
            <Skeleton w="30%" h={10} style={{ marginBottom: Spacing.sm }} />
            <Skeleton h={44} r={Spacing.radius.lg} />
          </View>
        ))}
      </Kartu>
      <Skeleton h={44} />
    </View>
  );
}

const styles = StyleSheet.create({
  wadah: { padding: Spacing.lg, gap: Spacing.md },
  kartu: {
    backgroundColor: Colors.white,
    borderRadius: Spacing.radius.xl,
    ...Spacing.curve,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
    padding: Spacing.md,
  },
  baris: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, justifyContent: 'flex-start' },
  isi: { flex: 1, gap: 6 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: Spacing.md },
  petak: { width: '48.5%' },
});

export default Skeleton;

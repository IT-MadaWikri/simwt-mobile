/**
 * RincianKartuManfaat — rincian satu manfaat Kaizen sebagai kelompok kartu berisi baris
 * "label kiri — isi kanan" (gaya rincian transaksi): Penghematan | Sebelum, Sesudah | Lokasi, Pelaksana.
 * Dipakai di sheet rincian Detail Kaizen. Presentasional murni.
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Avatar from '../common/Avatar';
import Colors, { slate } from '../../../constants/Colors';
import Spacing from '../../../constants/Spacing';
import { fonts, ukuranIsi } from '../../../constants/Typography';
import type { ItemManfaat } from './SliderManfaat';

type Baris = { label: string; isi: React.ReactNode };

function Kelompok({ baris }: { baris: Baris[] }) {
  if (baris.length === 0) return null;
  return (
    <View style={styles.kelompok}>
      {baris.map((b) => (
        <View key={b.label} style={styles.baris}>
          <Text style={styles.label}>{b.label}</Text>
          <View style={styles.kolomIsi}>{b.isi}</View>
        </View>
      ))}
    </View>
  );
}

export default function RincianKartuManfaat({
  item: m,
}: {
  item: Pick<ItemManfaat, 'warna' | 'hemat' | 'sebelum' | 'sesudah' | 'area' | 'pic'>;
}) {
  const teks = (t?: string | null) => <Text style={styles.isi}>{t || '-'}</Text>;
  const lokasi: Baris[] = [
    ...(m.area ? [{ label: 'Lokasi', isi: teks(m.area) }] : []),
    ...(m.pic
      ? [{
          label: 'Pelaksana',
          isi: (
            <View style={styles.pic}>
              <Avatar nama={m.pic} ukuran={18} />
              <Text style={[styles.isi, { flexShrink: 1 }]}>{m.pic}</Text>
            </View>
          ),
        }]
      : []),
  ];

  return (
    <View style={styles.wadah}>
      <Kelompok
        baris={[{ label: 'Penghematan', isi: <Text style={[styles.isi, styles.hemat, { color: m.warna }]}>{m.hemat || '—'}</Text> }]}
      />
      <Kelompok baris={[{ label: 'Sebelum', isi: teks(m.sebelum) }, { label: 'Sesudah', isi: teks(m.sesudah) }]} />
      <Kelompok baris={lokasi} />
    </View>
  );
}

const styles = StyleSheet.create({
  wadah: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
  },
  kelompok: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
    borderRadius: Spacing.radius.xl,
    ...Spacing.curve,
    backgroundColor: slate[50],
  },
  // Judul tebal di atas, isinya di baris bawahnya.
  baris: {
    gap: 2,
  },
  label: {
    fontSize: ukuranIsi,
    fontFamily: fonts.bold,
    color: Colors.textPrimary,
  },
  kolomIsi: {
    alignItems: 'flex-start',
  },
  isi: {
    fontSize: ukuranIsi,
    fontFamily: fonts.regular,
    color: Colors.textSecondary,
  },
  hemat: {
    fontFamily: fonts.bold,
  },
  pic: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
});

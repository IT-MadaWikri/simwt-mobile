/**
 * NewsCarousel — blok "Berita Terbaru" di beranda: daftar vertikal beberapa berita teratas.
 * Data datang dari layar (hook `useDaftarBerita`); komponen ini hanya menampilkan.
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Colors from '../../../constants/Colors';
import Spacing from '../../../constants/Spacing';
import { fonts } from '../../../constants/Typography';
import { Berita } from '../../types/berita';
import BarisBerita from '../berita/BarisBerita';
import Button from '../common/Button';
import SectionHeader from '../common/SectionHeader';
import { SkeletonDaftar } from '../common/Skeleton';

interface NewsCarouselProps {
  berita: Berita[];
  memuat: boolean;
  error: string | null;
  onCobaLagi: () => void;
  onLihatSemua: () => void;
  onBuka: (id: number) => void;
  onSuka: (id: number) => void;
  onBagikan: (berita: Berita) => void;
}

export default function NewsCarousel({
  berita,
  memuat,
  error,
  onCobaLagi,
  onLihatSemua,
  onBuka,
  onSuka,
  onBagikan,
}: NewsCarouselProps) {
  return (
    <View style={styles.section}>
      <SectionHeader title="Berita Terbaru" onAction={onLihatSemua} />

      <View style={styles.daftar}>
        {memuat ? (
          <SkeletonDaftar jumlah={3} />
        ) : error && berita.length === 0 ? (
          <View style={styles.kosong}>
            <Text style={styles.teksKosong}>{error}</Text>
            <Button label="Coba lagi" variant="outline" onPress={onCobaLagi} />
          </View>
        ) : berita.length === 0 ? (
          <View style={styles.kosong}>
            <Text style={styles.teksKosong}>Belum ada berita.</Text>
          </View>
        ) : (
          berita.map((b) => (
            <BarisBerita
              key={b.id}
              berita={b}
              onPress={() => onBuka(b.id)}
              onSuka={() => onSuka(b.id)}
              onBagikan={() => onBagikan(b)}
            />
          ))
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: Spacing.lg,
  },
  daftar: {
    paddingHorizontal: Spacing.screenPadding,
  },
  kosong: {
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.xl,
  },
  teksKosong: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});

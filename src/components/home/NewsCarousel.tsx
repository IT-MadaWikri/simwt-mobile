/**
 * NewsCarousel — banner berita/promo yang digeser mendatar.
 *
 * Kartunya memakai gradien brand (bukan warna rata seperti sebelumnya) agar
 * senada dengan tombol utama dan layar muat di karir-mwt.
 */
import React from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import Colors, { brand } from '../../../constants/Colors';
import Spacing from '../../../constants/Spacing';
import { fonts } from '../../../constants/Typography';
import { gs } from '../../../constants/GlobalStyles';
import SectionHeader from '../common/SectionHeader';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH * 0.75;

interface NewsItem {
  id: number;
  title: string;
  excerpt: string;
  colors: readonly [string, string];
  icon: string;
}

const MOCK_NEWS: NewsItem[] = [
  {
    id: 1,
    title: 'Selamat Datang di SIMWT',
    excerpt: 'Akses semua layanan MWT Part dalam satu aplikasi',
    colors: [brand[700], brand[500]],
    icon: '🚀',
  },
  {
    id: 2,
    title: 'Update Sistem Audit',
    excerpt: 'Fitur audit baru telah tersedia untuk semua departemen',
    colors: [brand[800], brand[600]],
    icon: '📋',
  },
  {
    id: 3,
    title: 'Program Kaizen',
    excerpt: 'Kirimkan ide improvement Anda melalui menu Kaizen',
    colors: [brand[600], brand[400]],
    icon: '💡',
  },
];

export default function NewsCarousel() {
  return (
    <View style={styles.section}>
      <SectionHeader title="Berita Terbaru" onAction={() => {}} />

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        decelerationRate="fast"
        snapToInterval={CARD_WIDTH + Spacing.md}
      >
        {MOCK_NEWS.map((news) => (
          <View key={news.id} style={[styles.card, { backgroundColor: news.colors[0] }]}>
            <Text style={styles.cardIcon}>{news.icon}</Text>
            <Text style={styles.cardTitle}>{news.title}</Text>
            <Text style={styles.cardExcerpt}>{news.excerpt}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: Spacing.lg,
  },
  scrollContent: {
    paddingHorizontal: Spacing.screenPadding,
    gap: Spacing.md,
  },
  card: {
    width: CARD_WIDTH,
    borderRadius: Spacing.radius.xl,
    padding: Spacing.xl,
    minHeight: 130,
    justifyContent: 'flex-end',
  },
  cardIcon: {
    fontSize: 28,
    marginBottom: Spacing.sm,
  },
  cardTitle: {
    fontFamily: fonts.bold,
    fontSize: 16,
    color: Colors.white,
    marginBottom: 2,
  },
  cardExcerpt: {
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 18,
    color: 'rgba(255,255,255,0.85)',
  },
});

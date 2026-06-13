/**
 * NewsCarousel — Horizontal scrolling news/promo banners
 */
import React from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import Colors from '../../../constants/Colors';
import Spacing from '../../../constants/Spacing';
import SectionHeader from '../common/SectionHeader';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH * 0.75;

interface NewsItem {
  id: number;
  title: string;
  excerpt: string;
  color: string;
  icon: string;
}

const MOCK_NEWS: NewsItem[] = [
  {
    id: 1,
    title: '🎉 Selamat Datang di SIMWT',
    excerpt: 'Akses semua layanan MWT Part dalam satu aplikasi',
    color: '#00880F',
    icon: '🚀',
  },
  {
    id: 2,
    title: '📋 Update Sistem Audit',
    excerpt: 'Fitur audit baru telah tersedia untuk semua departemen',
    color: '#1565C0',
    icon: '📋',
  },
  {
    id: 3,
    title: '💡 Program Kaizen',
    excerpt: 'Kirimkan ide improvement Anda melalui menu Kaizen',
    color: '#E65100',
    icon: '💡',
  },
];

export default function NewsCarousel() {
  return (
    <View style={styles.container}>
      <SectionHeader title="Berita Terbaru" onAction={() => {}} />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        decelerationRate="fast"
        snapToInterval={CARD_WIDTH + Spacing.md}
      >
        {MOCK_NEWS.map((news) => (
          <View
            key={news.id}
            style={[styles.card, { backgroundColor: news.color }]}
          >
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
  container: {
    marginBottom: Spacing.sectionGap,
  },
  scrollContent: {
    paddingHorizontal: Spacing.screenPadding,
    gap: Spacing.md,
  },
  card: {
    width: CARD_WIDTH,
    borderRadius: Spacing.radius.lg,
    padding: Spacing.xl,
    minHeight: 130,
    justifyContent: 'flex-end',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  cardIcon: {
    fontSize: 28,
    marginBottom: Spacing.sm,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.white,
    marginBottom: 4,
  },
  cardExcerpt: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.85)',
    lineHeight: 18,
  },
});

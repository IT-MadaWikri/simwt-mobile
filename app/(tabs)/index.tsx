/**
 * Home Screen — SIMWT Mobile
 * Gojek-style home with header (sapaan + search), service grid, news, and stats
 */
import React, { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import Colors from '../../constants/Colors';
import Spacing from '../../constants/Spacing';
import HomeHeader from '../../src/components/home/HomeHeader';
import ServiceGrid from '../../src/components/home/ServiceGrid';
import NewsCarousel from '../../src/components/home/NewsCarousel';
import BirthdayBanner from '../../src/components/home/BirthdayBanner';

export default function HomeScreen() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <HomeHeader searchQuery={searchQuery} onChangeSearch={setSearchQuery} />

        <BirthdayBanner />

        <ServiceGrid searchQuery={searchQuery} />

        <NewsCarousel />

        <View style={{ height: 20 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: Spacing.xxxl,
  },
});

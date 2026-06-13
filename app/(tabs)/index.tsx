/**
 * Home Screen — SIMWT Mobile
 * Gojek-style home with search, welcome card, service grid, news, and stats
 */
import React, { useState } from 'react';
import { ScrollView, StyleSheet, View, Image, TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Colors from '../../constants/Colors';
import Spacing from '../../constants/Spacing';
import SearchBar from '../../src/components/common/SearchBar';
import WelcomeCard from '../../src/components/home/WelcomeCard';
import ServiceGrid from '../../src/components/home/ServiceGrid';
import NewsCarousel from '../../src/components/home/NewsCarousel';
import BirthdayBanner from '../../src/components/home/BirthdayBanner';
import QuickStats from '../../src/components/home/QuickStats';
import { useAuth } from '../../src/contexts/AuthContext';

export default function HomeScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section (Search + Profile) */}
        <View style={styles.headerContainer}>
          <View style={styles.searchWrapper}>
            <SearchBar 
              placeholder="Cari layanan..." 
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          <TouchableOpacity 
            style={styles.avatarWrapper} 
            activeOpacity={0.8}
            onPress={() => router.push('/(tabs)/profile')}
          >
            {user?.avatar ? (
              <Image source={{ uri: user.avatar }} style={styles.avatarImage} />
            ) : (
              <View style={styles.avatarFallback}>
                <MaterialCommunityIcons
                  name="account"
                  size={24}
                  color={Colors.white}
                />
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Birthday Banner (moved to right below search) */}
        <BirthdayBanner />

        {/* Welcome Card */}
        <WelcomeCard />

        {/* ServiceGrid with Search */}
        <ServiceGrid searchQuery={searchQuery} />

        {/* Quick Stats */}
        <QuickStats />

        {/* News Carousel */}
        <NewsCarousel />

        {/* Bottom spacing */}
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
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xxxl,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.screenPadding,
    marginBottom: Spacing.xl,
    gap: Spacing.md,
  },
  searchWrapper: {
    flex: 1,
  },
  avatarWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.white,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 22,
  },
  avatarFallback: {
    width: '100%',
    height: '100%',
    borderRadius: 22,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

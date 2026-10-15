/**
 * HomeHeader — bagian atas beranda: avatar + sapaan, tombol notifikasi,
 * lalu search bar.
 */
import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from '../common/Icon';
import Avatar from '../common/Avatar';
import SearchBar from '../common/SearchBar';
import Colors, { palet } from '../../../constants/Colors';
import Spacing from '../../../constants/Spacing';
import Typography, { fonts } from '../../../constants/Typography';
import { useAuth } from '../../contexts/AuthContext';
import { notifikasiService } from '../../services/notifikasiService';

interface HomeHeaderProps {
  searchQuery: string;
  onChangeSearch: (text: string) => void;
}

export default function HomeHeader({ searchQuery, onChangeSearch }: HomeHeaderProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [belumDibaca, setBelumDibaca] = useState(0);

  // Dihitung ulang tiap kembali ke beranda (mis. setelah membaca notifikasi).
  useFocusEffect(
    useCallback(() => {
      notifikasiService.jumlahBelumDibaca().then(setBelumDibaca).catch(() => {});
    }, [])
  );
  const insets = useSafeAreaInsets();
  const nama = user?.nama_lengkap || user?.name || user?.username || 'Pengguna';

  return (
    <LinearGradient
      colors={[palet.mint, Colors.white]}
      style={[styles.container, { paddingTop: insets.top + Spacing.md }]}
    >
      <View style={styles.row}>
        <TouchableOpacity activeOpacity={0.8} onPress={() => router.push('/(tabs)/profile')}>
          <Avatar nama={nama} foto={user?.avatar} ukuran={48} />
        </TouchableOpacity>

        <View style={styles.greeting}>
          <Text style={styles.title} numberOfLines={1}>
            {getGreeting()}, {nama.split(' ')[0]}
          </Text>
          <Text style={styles.subtitle} numberOfLines={1}>
            Temukan layanan yang kamu butuhkan
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.circle, styles.bell]}
          activeOpacity={0.8}
          onPress={() => router.push('/(tabs)/notification')}
        >
          <Icon name="bell-outline" size={22} color={Colors.ink} />
          {belumDibaca > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{belumDibaca > 99 ? '99+' : belumDibaca}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.row}>
        <View style={styles.search}>
          <SearchBar
            placeholder="Cari layanan..."
            value={searchQuery}
            onChangeText={onChangeSearch}
            style={styles.searchBar}
            inputStyle={styles.text}
          />
        </View>
      </View>
    </LinearGradient>
  );
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Selamat pagi';
  if (hour < 15) return 'Selamat siang';
  if (hour < 18) return 'Selamat sore';
  return 'Selamat malam';
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.screenPadding,
    paddingBottom: Spacing.lg,
    gap: Spacing.lg,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  greeting: {
    flex: 1,
  },
  // Tinggi disamakan dengan tombol bulat di sebelahnya (48).
  searchBar: {
    height: 48,
    paddingVertical: 0,
  },
  text: {
    fontSize: Typography.sizes.sm,
    paddingVertical: 0,
  },
  title: {
    fontFamily: fonts.bold,
    fontSize: Typography.sizes.sm,
    color: Colors.textPrimary,
  },
  subtitle: {
    fontFamily: fonts.regular,
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
  },
  circle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bell: {
    backgroundColor: Colors.white,
  },
  badge: {
    position: 'absolute',
    top: 4,
    right: 4,
    minWidth: 18,
    height: 18,
    paddingHorizontal: 4,
    borderRadius: 9,
    backgroundColor: Colors.danger,
    borderWidth: 1.5,
    borderColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: Colors.white,
    fontSize: 10,
    fontFamily: fonts.bold,
    lineHeight: 12,
  },
  search: {
    flex: 1,
  },
});

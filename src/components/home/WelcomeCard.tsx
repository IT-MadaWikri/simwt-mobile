/**
 * WelcomeCard — Gojek-style white card replacing the GoPay card
 */
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Colors from '../../../constants/Colors';
import Spacing from '../../../constants/Spacing';
import { useAuth } from '../../contexts/AuthContext';

export default function WelcomeCard() {
  const { user } = useAuth();
  const router = useRouter();
  const greeting = getGreeting();

  return (
    <View style={styles.container}>
      {/* Left side: Info */}
      <View style={styles.leftSection}>
        <View style={styles.iconContainer}>
          <MaterialCommunityIcons name="wallet" size={20} color={Colors.white} />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.greetingText}>{greeting},</Text>
          <Text style={styles.nameText} numberOfLines={1}>
            {user?.nama_lengkap || user?.name || user?.username || 'User'}
          </Text>
        </View>
      </View>

      {/* Right side: Quick Actions */}
      <View style={styles.rightSection}>
        <TouchableOpacity 
          style={styles.actionItem}
          onPress={() => router.push('/(tabs)/activity')}
        >
          <View style={styles.actionIconBg}>
            <MaterialCommunityIcons name="arrow-up-circle" size={24} color={Colors.primary} />
          </View>
          <Text style={styles.actionText}>Aktivitas</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.actionItem}
          onPress={() => router.push('/(tabs)/notification')}
        >
          <View style={styles.actionIconBg}>
            <MaterialCommunityIcons name="bell-circle" size={24} color={Colors.primary} />
          </View>
          <Text style={styles.actionText}>Notif</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.actionItem}
          onPress={() => router.push('/(tabs)/profile')}
        >
          <View style={styles.actionIconBg}>
            <MaterialCommunityIcons name="dots-horizontal-circle" size={24} color={Colors.primary} />
          </View>
          <Text style={styles.actionText}>Lainnya</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Selamat Pagi';
  if (hour < 15) return 'Selamat Siang';
  if (hour < 18) return 'Selamat Sore';
  return 'Selamat Malam';
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: Spacing.radius.lg,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginHorizontal: Spacing.screenPadding,
    marginBottom: Spacing.sectionGap,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  greetingText: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  nameText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  actionItem: {
    alignItems: 'center',
  },
  actionIconBg: {
    marginBottom: 4,
  },
  actionText: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
});

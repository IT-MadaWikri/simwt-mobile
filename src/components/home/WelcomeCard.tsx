/**
 * WelcomeCard — kartu sapaan + pintasan cepat di beranda.
 */
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Colors from '../../../constants/Colors';
import Spacing from '../../../constants/Spacing';
import { gs } from '../../../constants/GlobalStyles';
import { useAuth } from '../../contexts/AuthContext';

const ACTIONS = [
  { icon: 'clipboard-check-outline', label: 'Approval', route: '/(tabs)/activity' },
  { icon: 'bell-outline', label: 'Notif', route: '/(tabs)/notification' },
  { icon: 'dots-horizontal', label: 'Lainnya', route: '/(tabs)/profile' },
] as const;

export default function WelcomeCard() {
  const { user } = useAuth();
  const router = useRouter();

  return (
    <View style={[gs.card, gs.rowBetween, styles.container]}>
      <View style={[gs.row, gs.flex1, gs.gapMd]}>
        <View style={gs.iconTile}>
          <MaterialCommunityIcons name="account" size={22} color={Colors.primary} />
        </View>
        <View style={gs.flex1}>
          <Text style={gs.caption}>{getGreeting()},</Text>
          <Text style={[gs.title, styles.name]} numberOfLines={1}>
            {user?.nama_lengkap || user?.name || user?.username || 'Pengguna'}
          </Text>
        </View>
      </View>

      <View style={[gs.row, gs.gapLg]}>
        {ACTIONS.map((action) => (
          <TouchableOpacity
            key={action.label}
            style={gs.center}
            activeOpacity={0.7}
            onPress={() => router.push(action.route as any)}
          >
            <MaterialCommunityIcons name={action.icon} size={22} color={Colors.primary} />
            <Text style={[gs.caption, styles.actionText]}>{action.label}</Text>
          </TouchableOpacity>
        ))}
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
    marginHorizontal: Spacing.screenPadding,
    marginBottom: Spacing.sectionGap,
  },
  name: {
    fontSize: 15,
  },
  actionText: {
    marginTop: Spacing.xs,
  },
});

/**
 * Tab Layout — Bottom tab navigation (Gojek-style)
 * 5 tabs: Home, Aktivitas, Scan (Camera), Notifikasi, Profil
 */
import React, { useEffect, useRef } from 'react';
import { Tabs, useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { View, StyleSheet, Platform, Animated, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '../../constants/Colors';
import Spacing, { Shadows } from '../../constants/Spacing';
import Typography, { fonts } from '../../constants/Typography';

// Lightweight Gojek-style Tab Icon Animation
function AnimatedTabIcon({ name, focused, color }: { name: string, focused: boolean, color: any }) {
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (focused) {
      Animated.sequence([
        Animated.timing(scale, {
          toValue: 0.85,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.spring(scale, {
          toValue: 1.15,
          friction: 4,
          tension: 100,
          useNativeDriver: true,
        }),
        Animated.spring(scale, {
          toValue: 1,
          friction: 4,
          tension: 100,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.timing(scale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }).start();
    }
  }, [focused, scale]);

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <MaterialCommunityIcons name={name as any} size={26} color={color} />
    </Animated.View>
  );
}

// Tombol scan besar di tengah tab bar — pola khas Gojek yang dipertahankan.
const CustomScanButton = ({ onPress }: any) => (
  <TouchableOpacity style={styles.scanButton} onPress={onPress} activeOpacity={0.85}>
    <View style={styles.scanButtonInner}>
      <MaterialCommunityIcons name="qrcode-scan" size={24} color={Colors.white} />
    </View>
  </TouchableOpacity>
);

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  // Handle open camera manually for now
  const handleScanPress = () => {
    // Navigate to a dedicated scan screen or simply alert for now
    // We will create a dummy scan screen or use an existing one
    console.log('Open camera scanner');
    // Jika belum ada layar scanner, Anda bisa buat app/(tabs)/scan.tsx nantinya
  };

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textTertiary,
        tabBarStyle: {
          backgroundColor: Colors.white,
          borderTopWidth: 1,
          borderTopColor: Colors.borderSubtle,
          // Padding bawah mengikuti safe area agar tidak tertutup navigasi Android.
          height: Platform.OS === 'ios' ? 88 : 65 + insets.bottom,
          paddingBottom: Platform.OS === 'ios' ? 28 : insets.bottom + 8,
          paddingTop: 6,
          ...Shadows.raised,
        },
        tabBarLabelStyle: styles.tabLabel,
        tabBarItemStyle: styles.tabItem,
        headerShown: true,
        headerStyle: styles.header,
        headerTitleStyle: styles.headerTitle,
        headerShadowVisible: false,
        animation: 'fade',
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          headerTitle: 'SIMWT Mobile',
          headerTitleStyle: {
            fontFamily: fonts.extrabold,
            fontSize: 20,
            color: Colors.primary,
            letterSpacing: 0.5,
          },
          tabBarIcon: ({ color, focused }) => (
            <AnimatedTabIcon name={focused ? 'home' : 'home-outline'} focused={focused} color={color} />
          ),
        }}
      />
      
      <Tabs.Screen
        name="activity"
        options={{
          // Tab ini sekarang Approval Center — semua yang menunggu keputusan
          // pengguna (Kaizen, Tiket) dikumpulkan di satu layar.
          title: 'Approval',
          headerTitle: 'Approval Center',
          tabBarIcon: ({ color, focused }) => (
            <AnimatedTabIcon
              name={focused ? 'clipboard-check' : 'clipboard-check-outline'}
              focused={focused}
              color={color}
            />
          ),
        }}
      />

      {/* Tautan untuk Tombol Tengah (Scan) - Kita gunakan screen palsu atau yang sudah ada */}
      <Tabs.Screen
        name="scan"
        options={{
          title: '', // Tanpa teks di bawah tombol scan
          // Kamera memenuhi layar dan punya bilah atas mengambang sendiri
          // (tombol kembali + judul) — header bawaan akan menimpanya.
          headerShown: false,
          tabBarIcon: () => null,
          tabBarButton: (props) => (
            <CustomScanButton {...props} onPress={() => {
              // Jika ingin sekadar memanggil API/Kamera tanpa pindah tab, pakai fungsi di sini
              // Karena user ingin membuka kamera, kita akan siapkan router.push('/camera') di masa depan.
              // Untuk saat ini kita arahkan ke screen scan yang akan kita buat
              router.push('/(tabs)/scan');
            }} />
          ),
        }}
      />

      <Tabs.Screen
        name="notification"
        options={{
          title: 'Notifikasi',
          headerTitle: 'Notifikasi',
          tabBarIcon: ({ color, focused }) => (
            <AnimatedTabIcon name={focused ? 'bell' : 'bell-outline'} focused={focused} color={color} />
          ),
          tabBarBadge: 2,
          tabBarBadgeStyle: styles.badge,
        }}
      />

      {/* Chat menggantikan tab Mita — Mita sekarang kontak AI di dalamnya
          (ala Meta AI di WhatsApp). Tab bar disembunyikan karena ruang chat
          punya bilah tulis sendiri di dasar layar. */}
      <Tabs.Screen
        name="chat"
        options={{
          title: 'Chat',
          headerShown: false,
          tabBarStyle: { display: 'none' },
          tabBarIcon: ({ color, focused }) => (
            <AnimatedTabIcon
              name={focused ? 'chat' : 'chat-outline'}
              focused={focused}
              color={color}
            />
          ),
        }}
      />

      {/* Sembunyikan tab Kaizen dari menu bawah, dan sembunyikan bottom bar saat masuk Kaizen */}
      <Tabs.Screen
        name="kaizen"
        options={{
          href: null,
          headerShown: false,
          tabBarStyle: { display: 'none' },
        }}
      />
      <Tabs.Screen
        name="edit-profile"
        options={{
          href: null,
          title: 'Edit Pengguna',
          headerShown: true, // Akan menampilkan header default dengan back button
          headerTitleStyle: {
            fontFamily: fonts.semibold,
            fontSize: 16,
            color: Colors.textPrimary,
          },
          tabBarStyle: { display: 'none' },
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          href: null,
          headerShown: false,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabLabel: {
    fontFamily: fonts.medium,
    fontSize: Typography.sizes.xs,
  },
  tabItem: {
    paddingTop: 2,
  },
  header: {
    backgroundColor: Colors.white,
    elevation: 0,
    shadowOpacity: 0,
  },
  headerTitle: {
    fontFamily: fonts.bold,
    fontSize: Typography.sizes.xl,
    color: Colors.textPrimary,
  },
  badge: {
    backgroundColor: Colors.danger,
    fontFamily: fonts.bold,
    fontSize: 10,
    minWidth: 18,
    height: 18,
    borderRadius: Spacing.radius.full,
  },
  scanButton: {
    top: -20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanButtonInner: {
    width: 60,
    height: 60,
    borderRadius: Spacing.radius.full,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: Colors.white,
    ...Shadows.brand,
  },
});

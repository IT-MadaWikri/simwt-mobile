/**
 * Tab Layout — Bottom tab navigation (Gojek-style)
 * 5 tabs: Home, Aktivitas, Scan (Camera), Notifikasi, Profil
 */
import React, { useEffect, useRef } from 'react';
import { Tabs, useRouter, useSegments } from 'expo-router';
import Icon from '../../src/components/common/Icon';
import { View, StyleSheet, Platform, Animated, TouchableOpacity, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '../../constants/Colors';
import Spacing from '../../constants/Spacing';
import Typography, { fonts } from '../../constants/Typography';
import { gayaAppBar, opsiAppBar } from '../../src/components/common/AppBar';
import TombolKembali from '../../src/components/common/TombolKembali';

// Ikon tab: tebal saat aktif. Animasinya ada di BouncePress (saat di-tap).
function AnimatedTabIcon({ name, focused, color }: { name: string, focused: boolean, color: any }) {
  return <Icon name={name} size={26} color={color} strokeWidth={focused ? 2.5 : 1.75} />;
}

// Efek bounce saat di-tap: sama persis dengan grid layanan (ServiceIcon).
// Tanpa ripple Android.
function BouncePress({ children, style, onPress, onLongPress, testID, ...rest }: any) {
  const scale = useRef(new Animated.Value(1)).current;
  const tekan = () =>
    Animated.spring(scale, { toValue: 0.85, speed: 40, bounciness: 0, useNativeDriver: true }).start();
  const lepas = () =>
    Animated.spring(scale, { toValue: 1, speed: 14, bounciness: 18, useNativeDriver: true }).start();

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      onPressIn={tekan}
      onPressOut={lepas}
      testID={testID}
      role={rest.role}
      aria-label={rest['aria-label']}
      aria-selected={rest['aria-selected']}
      style={style}
    >
      <Animated.View style={[styles.bounce, { transform: [{ scale }] }]}>{children}</Animated.View>
    </Pressable>
  );
}

// Tombol scan besar di tengah tab bar — pola khas Gojek yang dipertahankan.
const CustomScanButton = ({ onPress }: any) => (
  <BouncePress style={styles.scanButton} onPress={onPress}>
    <View style={styles.scanButtonInner}>
      <Icon name="qrcode-scan" size={24} color={Colors.white} />
    </View>
  </BouncePress>
);

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  // Tab bar tetap tampil di daftar chat; hanya disembunyikan di ruang chat dan
  // layar "baru" (segmen ke-3 ada), karena keduanya punya bilah tulis sendiri.
  const segments = useSegments() as string[];
  const dalamRuangChat = segments[1] === 'chat' && segments.length > 2;

  // Handle open camera manually for now
  const handleScanPress = () => {
    // Navigate to a dedicated scan screen or simply alert for now
    // We will create a dummy scan screen or use an existing one
    console.log('Open camera scanner');
    // Jika belum ada layar scanner, Anda bisa buat app/(tabs)/scan.tsx nantinya
  };

  return (
    <Tabs
      // Kembali ke tab yang terakhir dibuka (mis. Menu Kaizen), bukan selalu ke beranda.
      backBehavior="history"
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
        },
        tabBarButton: (props) => <BouncePress {...props} />,
        tabBarLabelStyle: styles.tabLabel,
        tabBarItemStyle: styles.tabItem,
        ...gayaAppBar,
        // Pindah tab menggeser mendatar, sama gayanya dengan transisi halaman lain.
        animation: 'shift',
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          headerShown: false,
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
          // Dibuka dari menu Kaizen juga, jadi perlu jalan kembali.
          headerLeft: () => <TombolKembali />,
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


      {/* Chat menggantikan tab Mita — Mita sekarang kontak AI di dalamnya
          (ala Meta AI di WhatsApp). Tab bar disembunyikan karena ruang chat
          punya bilah tulis sendiri di dasar layar. */}
      <Tabs.Screen
        name="chat"
        options={{
          title: 'Chat',
          headerShown: false,
          // Jangan beri `tabBarStyle: undefined` — itu menimpa gaya dari screenOptions
          // (tinggi/padding) sehingga tab bar chat beda ukuran dari tab lain.
          ...(dalamRuangChat && { tabBarStyle: { display: 'none' as const } }),
          tabBarIcon: ({ color, focused }) => (
            <AnimatedTabIcon
              name={focused ? 'chat' : 'chat-outline'}
              focused={focused}
              color={color}
            />
          ),
        }}
      />

      {/* Pengaturan di paling kanan. */}
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Pengaturan',
          headerShown: false,
          tabBarIcon: ({ color, focused }) => (
            <AnimatedTabIcon name={focused ? 'cog' : 'cog-outline'} focused={focused} color={color} />
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
          tabBarStyle: { display: 'none' },
        }}
      />
      {/* Notifikasi bukan tab lagi — dibuka dari ikon lonceng di beranda. */}
      <Tabs.Screen
        name="notification"
        options={{
          ...opsiAppBar,
          href: null,
          title: 'Notifikasi',
          tabBarStyle: { display: 'none' },
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  bounce: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabLabel: {
    fontFamily: fonts.medium,
    fontSize: Typography.sizes.xs,
  },
  tabItem: {
    paddingTop: 2,
  },
  badge: {
    backgroundColor: Colors.danger,
    fontFamily: fonts.bold,
    fontSize: 12,
    minWidth: 18,
    height: 18,
    borderRadius: Spacing.radius.full,
  },
  scanButton: {
    top: -6,
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
  },
});

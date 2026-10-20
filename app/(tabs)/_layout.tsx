/**
 * Tab Layout — Bottom tab navigation (Gojek-style)
 * 5 tabs: Home, Aktivitas, Scan (Camera), Notifikasi, Profil
 */
import React, { useEffect, useRef } from 'react';
import { Tabs, useSegments } from 'expo-router';
import Icon from '../../src/components/common/Icon';
import { View, Text, StyleSheet, Animated, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors, { palet } from '../../constants/Colors';
import { fonts } from '../../constants/Typography';
import { gayaAppBar, opsiAppBar } from '../../src/components/common/AppBar';
import TombolKembali from '../../src/components/common/TombolKembali';

// Ikon tab: tebal saat aktif. Animasinya ada di BouncePress (saat di-tap).
function AnimatedTabIcon({ name, focused, color }: { name: string, focused: boolean, color: any }) {
  return <Icon name={name} size={22} color={color} strokeWidth={focused ? 2.5 : 1.75} />;
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

// Tombol scan berupa lingkaran mint, sejajar dengan tab lain.
const CustomScanButton = ({ onPress }: any) => (
  <BouncePress style={styles.scanButton} onPress={onPress}>
    <View style={styles.scanButtonInner}>
      <Icon name="qrcode-scan" size={24} color={Colors.ink} />
    </View>
  </BouncePress>
);

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  // Tab bar tetap tampil di daftar chat; hanya disembunyikan di ruang chat dan
  // layar "baru" (segmen ke-3 ada), karena keduanya punya bilah tulis sendiri.
  const segments = useSegments() as string[];
  const dalamRuangChat = segments[1] === 'chat' && segments.length > 2;

  return (
    <Tabs
      // Kembali ke tab yang terakhir dibuka (mis. Menu Kaizen), bukan selalu ke beranda.
      backBehavior="history"
      screenOptions={{
        // Ikon & teks aktif: teal #31AAA9.
        tabBarActiveTintColor: '#31AAA9',
        tabBarInactiveTintColor: Colors.textTertiary,
        tabBarStyle: {
          backgroundColor: Colors.white,
          borderTopWidth: 1,
          borderTopColor: Colors.borderSubtle,
          // Safe area ditambah di bawah area tab agar tidak tertutup navigasi sistem.
          height: 60 + insets.bottom,
          paddingBottom: insets.bottom + 6,
          paddingTop: 8,
        },
        // Label tebal saat aktif, reguler saat tidak.
        tabBarLabel: ({ focused, color, children }) => (
          <Text style={[styles.tabLabel, { color, fontFamily: focused ? fonts.bold : fonts.regular }]}>
            {children}
          </Text>
        ),
        tabBarButton: (props) => <BouncePress {...props} />,
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

      <Tabs.Screen
        name="scan"
        options={{
          title: '', // Tanpa teks di bawah tombol scan
          // Kamera memenuhi layar dan punya bilah atas mengambang sendiri
          // (tombol kembali + judul) — header bawaan akan menimpanya.
          headerShown: false,
          tabBarIcon: () => null,
          tabBarButton: (props) => <CustomScanButton {...props} />,
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
          title: 'Setelan',
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
    fontSize: 12,
  },
  scanButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanButtonInner: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: palet.mint,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabItem: {
    padding: 0,
  },
});

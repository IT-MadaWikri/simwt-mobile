/**
 * Root Layout — Auth guard + navigation structure
 * Wraps the entire app with AuthProvider and handles routing
 */
// Harus paling awal: mengunci teks dari skala font sistem (lihat berkasnya).
import '../src/utils/kunciSkalaFont';
import { useFonts } from 'expo-font';
import {
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
  Poppins_800ExtraBold,
} from '@expo-google-fonts/poppins';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import Colors from '../constants/Colors';
import { fonts, judulAppBar } from '../constants/Typography';
import LoadingSpinner from '../src/components/common/LoadingSpinner';
import { DialogHost } from '../src/components/common/AppDialog';
import { opsiAppBar } from '../src/components/common/AppBar';
import { useAlertJaringan } from '../src/hooks/useAlertJaringan';
import { AuthProvider, useAuth } from '../src/contexts/AuthContext';

// Keep splash screen visible while loading
SplashScreen.preventAutoHideAsync();

/**
 * `enableFreeze` SENGAJA TIDAK DINYALAKAN.
 *
 * Sempat diaktifkan untuk memuluskan perpindahan (layar di belakang tumpukan
 * berhenti di-render). Tetapi react-native-screens membekukan subtree lewat
 * Suspense — dan subtree yang dibekukan berhenti me-render SEPENUHNYA,
 * termasuk animasi di dalamnya. Akibatnya spinner pada layar yang sedang
 * bertransisi berhenti mendadak di tengah putaran.
 *
 * Perpindahan yang sedikit lebih berat jauh lebih baik daripada indikator
 * memuat yang membeku, karena pemuat yang mati membuat aplikasi tampak
 * hang padahal datanya sedang diambil.
 *
 * enableFreeze(true);  ← jangan diaktifkan kembali tanpa menguji ulang
 *                        spinner saat berpindah halaman.
 */

function RootLayoutNav() {
  // Alert global bila request timeout / jaringan bermasalah (dilaporkan services/api.ts).
  useAlertJaringan();
  const { isAuthenticated, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(tabs)';
    const inServiceGroup = segments[0] === 'services';

    if (!isAuthenticated && (inAuthGroup || inServiceGroup)) {
      // Not logged in but on protected route — redirect to login
      router.replace('/login');
    } else if (isAuthenticated && segments[0] === 'login') {
      // Logged in but on login screen — redirect to home
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, isLoading, segments]);

  if (isLoading) {
    return <LoadingSpinner fullScreen message="Memuat..." />;
  }

  return (
    // Akar gestur: dibutuhkan react-native-gesture-handler (mis. baris notifikasi yang bisa digeser).
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style="auto" />
      <Stack
        screenOptions={{
          headerShown: false,
          // Transisi halus ala Gojek: dorongan mendatar dengan parallax.
          //
          // Sengaja `ios_from_right`, BUKAN `slide_from_right`. Keduanya hanya
          // berlaku di Android — bedanya `slide_from_right` menggeser layar
          // lama dan baru dengan kecepatan sama (terasa kaku), sedangkan
          // `ios_from_right` memakai kurva dan parallax gaya iOS. Di iOS
          // keduanya sama-sama jatuh ke transisi default, yang memang sudah
          // berbentuk dorongan ini — jadi hasilnya konsisten di dua platform.
          animation: 'ios_from_right',
          animationDuration: 260,
          // Geser dari tepi untuk kembali (iOS).
          gestureEnabled: true,
        }}
      >
        {/* Semua halaman memakai transisi geser (default di atas), termasuk login & beranda. */}
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="services/[id]"
          options={opsiAppBar}
        />
        <Stack.Screen
          name="scan-result"
          options={{ ...opsiAppBar, title: 'Detail Aset' }}
        />
        <Stack.Screen
          name="modal"
          options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
        />
      </Stack>

      {/* Dipasang sekali di sini supaya `dialog.alert()` / `dialog.confirm()`
          bisa dipanggil dari layar mana pun. Lihat AppDialog.tsx. */}
      <DialogHost />
    </GestureHandlerRootView>
  );
}




export default function RootLayout() {
  // Nama key di sini menjadi nama `fontFamily` yang dipakai di style —
  // harus sama persis dengan nilai di `constants/Typography.ts`.
  const [loaded, error] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
    Poppins_800ExtraBold,
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      // Small delay for splash screen effect
      setTimeout(() => {
        SplashScreen.hideAsync();
      }, 1500);
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}

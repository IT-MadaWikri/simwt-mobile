/**
 * Root Layout — Auth guard + navigation structure
 * Wraps the entire app with AuthProvider and handles routing
 */
import { useFonts } from 'expo-font';
import { 
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  Inter_800ExtraBold 
} from '@expo-google-fonts/inter';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import Colors from '../constants/Colors';
import LoadingSpinner from '../src/components/common/LoadingSpinner';
import { AuthProvider, useAuth } from '../src/contexts/AuthContext';

// Keep splash screen visible while loading
SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
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
    <>
      <StatusBar style="auto" />
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="services/[id]"
          options={{
            headerShown: true,
            headerStyle: { backgroundColor: Colors.primary },
            headerTintColor: Colors.white,
            headerBackTitle: 'Kembali',
            animation: 'slide_from_right',
          }}
        />
        <Stack.Screen 
          name="scan-result" 
          options={{ 
            presentation: 'modal',
            headerShown: true,
            title: 'Detail Aset',
            headerStyle: { backgroundColor: Colors.primary },
            headerTintColor: Colors.white,
            headerTitleStyle: { fontWeight: '700' },
          }} 
        />
        <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
      </Stack>
    </>
  );
}




export default function RootLayout() {
  const [loaded, error] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Inter_800ExtraBold,
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

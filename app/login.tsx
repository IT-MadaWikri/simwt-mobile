/**
 * Login Screen — SIMWT Mobile
 * Premium green-themed login with fingerprint auth & custom alert
 */
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Modal,
  Animated,
  Dimensions,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as LocalAuthentication from 'expo-local-authentication';
import Colors from '../constants/Colors';
import Spacing from '../constants/Spacing';
import { useAuth } from '../src/contexts/AuthContext';

const { width, height } = Dimensions.get('window');

// ─── Custom Alert Component ───────────────────────────────────
interface CustomAlertProps {
  visible: boolean;
  type: 'error' | 'success' | 'info';
  title: string;
  message: string;
  onClose: () => void;
}

function CustomAlert({ visible, type, title, message, onClose }: CustomAlertProps) {
  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 80,
          friction: 8,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      scaleAnim.setValue(0.5);
      opacityAnim.setValue(0);
    }
  }, [visible]);

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(scaleAnim, { toValue: 0.5, duration: 150, useNativeDriver: true }),
      Animated.timing(opacityAnim, { toValue: 0, duration: 150, useNativeDriver: true }),
    ]).start(() => onClose());
  };

  const config = {
    error: { icon: 'alert-circle' as const, color: '#EF4123', bg: '#FFF5F5', borderColor: '#FFE0E0', btnColor: '#EF4123' },
    success: { icon: 'check-circle' as const, color: '#00AA13', bg: '#F0FFF4', borderColor: '#C6F6D5', btnColor: '#00AA13' },
    info: { icon: 'information' as const, color: '#2196F3', bg: '#EBF8FF', borderColor: '#BEE3F8', btnColor: '#2196F3' },
  }[type];

  if (!visible) return null;

  return (
    <Modal transparent visible={visible} animationType="none">
      <Animated.View style={[alertStyles.overlay, { opacity: opacityAnim }]}>
        <Animated.View style={[alertStyles.container, { transform: [{ scale: scaleAnim }] }]}>
          {/* Alert Icon Circle */}
          <View style={[alertStyles.iconCircle, { backgroundColor: config.bg, borderColor: config.borderColor }]}>  
            <MaterialCommunityIcons name={config.icon} size={40} color={config.color} />
          </View>

          <Text style={alertStyles.title}>{title}</Text>
          <Text style={alertStyles.message}>{message}</Text>

          <TouchableOpacity
            style={[alertStyles.button, { backgroundColor: config.btnColor }]}
            onPress={handleClose}
            activeOpacity={0.85}
          >
            <Text style={alertStyles.buttonText}>OK, Mengerti</Text>
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

// ─── Main Login Screen ─────────────────────────────────────────
export default function LoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isBiometricAvailable, setIsBiometricAvailable] = useState(false);
  const { login, error, clearError } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // Custom Alert State
  const [alertConfig, setAlertConfig] = useState({
    visible: false,
    type: 'error' as 'error' | 'success' | 'info',
    title: '',
    message: '',
  });

  // Animations
  const shieldBounce = useRef(new Animated.Value(0)).current;
  const formSlide = useRef(new Animated.Value(50)).current;
  const formOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Check biometric availability
    checkBiometricAvailability();

    // Entrance animations
    Animated.loop(
      Animated.sequence([
        Animated.timing(shieldBounce, { toValue: -8, duration: 1500, useNativeDriver: true }),
        Animated.timing(shieldBounce, { toValue: 0, duration: 1500, useNativeDriver: true }),
      ])
    ).start();

    Animated.parallel([
      Animated.timing(formSlide, { toValue: 0, duration: 600, useNativeDriver: true }),
      Animated.timing(formOpacity, { toValue: 1, duration: 600, useNativeDriver: true }),
    ]).start();
  }, []);

  const checkBiometricAvailability = async () => {
    const compatible = await LocalAuthentication.hasHardwareAsync();
    const enrolled = await LocalAuthentication.isEnrolledAsync();
    setIsBiometricAvailable(compatible && enrolled);
  };

  const showAlert = (type: 'error' | 'success' | 'info', title: string, message: string) => {
    setAlertConfig({ visible: true, type, title, message });
  };

  const handleLogin = async () => {
    let finalUsername = username.trim();
    if (!finalUsername) {
      showAlert('error', 'Username Kosong', 'Silakan masukkan username Anda terlebih dahulu.');
      return;
    }

    // Automatically add mwt- prefix if not superadmin and doesn't already have it
    if (
      finalUsername.toLowerCase() !== 'superadmin' &&
      !finalUsername.toLowerCase().startsWith('mwt-')
    ) {
      finalUsername = `mwt-${finalUsername}`;
    }

    if (!password.trim()) {
      showAlert('error', 'Password Kosong', 'Silakan masukkan password Anda terlebih dahulu.');
      return;
    }

    setIsSubmitting(true);
    clearError();

    try {
      await login(finalUsername, password);
      router.replace('/(tabs)');
    } catch (err: any) {
      showAlert('error', 'Login Gagal', err.message || 'Username atau password salah. Silakan coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBiometricLogin = async () => {
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Verifikasi identitas Anda',
        cancelLabel: 'Batal',
        disableDeviceFallback: false,
        fallbackLabel: 'Gunakan Password',
      });

      if (result.success) {
        // For biometric login, we need saved credentials
        // For now, show info that credentials need to be saved first
        showAlert(
          'info',
          'Fingerprint Terverifikasi',
          'Login dengan fingerprint membutuhkan login manual terlebih dahulu. Silakan login dengan username & password.'
        );
      } else if (result.error === 'user_cancel') {
        // User cancelled, do nothing
      } else {
        showAlert('error', 'Verifikasi Gagal', 'Sidik jari tidak dikenali. Silakan coba lagi.');
      }
    } catch (err) {
      showAlert('error', 'Error', 'Terjadi kesalahan pada sistem biometrik.');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar style="light" />

      {/* Custom Alert */}
      <CustomAlert
        visible={alertConfig.visible}
        type={alertConfig.type}
        title={alertConfig.title}
        message={alertConfig.message}
        onClose={() => setAlertConfig(prev => ({ ...prev, visible: false }))}
      />

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 40 }]}
        keyboardShouldPersistTaps="handled"
        bounces={false}
      >
        {/* ═══ Green Gradient Header ═══ */}
        <LinearGradient
          colors={['#00AA13', '#007A0D', '#005A08']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.header, { paddingTop: insets.top + 30 }]}
        >
          {/* Decorative circles */}
          <View style={styles.decorCircle1} />
          <View style={styles.decorCircle2} />
          <View style={styles.decorCircle3} />

          {/* Brand Text — Left aligned */}
          <View style={styles.brandContainer}>
            <Text style={styles.brandName}>SIMWT</Text>
            <Text style={styles.brandSub}>Mobile</Text>
            <Text style={styles.companyName}>PT Mada Wikri Tunggal</Text>
          </View>

          {/* Floating Background Icons */}
          <View style={[styles.floatingIcon, { top: insets.top + 50, right: 20, transform: [{ rotate: '15deg' }] }]}>
            <MaterialCommunityIcons name="account" size={24} color="#00AA13" />
          </View>
          <View style={[styles.floatingIcon, { top: insets.top + 130, right: 40, transform: [{ rotate: '-10deg' }] }]}>
            <MaterialCommunityIcons name="lock" size={24} color="#00AA13" />
          </View>
          <View style={[styles.floatingIcon, { top: insets.top + 100, right: 120, transform: [{ rotate: '-20deg' }] }]}>
            <MaterialCommunityIcons name="chart-bar" size={24} color="#00AA13" />
          </View>

          {/* Floating Shield Icon (Centered now) */}
          <View style={styles.shieldWrapper}>
            <Animated.View style={[styles.shieldContainer, { transform: [{ translateY: shieldBounce }] }]}>
              <View style={styles.shieldBase}>
                <View style={styles.shieldOuter}>
                  <View style={styles.shieldInner}>
                    <MaterialCommunityIcons name="shield-check" size={60} color="#00AA13" />
                  </View>
                </View>
                {/* Glow ring */}
                <View style={styles.shieldGlow} />
              </View>
              {/* Podium shadow/base */}
              <View style={styles.podiumBase} />
              <View style={styles.podiumShadow} />
            </Animated.View>
          </View>

          {/* CSS Wave Effect */}
          <View style={styles.waveContainer}>
            <View style={styles.waveLeft} />
            <View style={styles.waveRight} />
          </View>
        </LinearGradient>

        {/* ═══ White Card Form ═══ */}
        <View style={styles.formWrapper}>
          <Animated.View
            style={[
              styles.formContainer,
              { transform: [{ translateY: formSlide }], opacity: formOpacity },
            ]}
          >
            {/* Greeting */}
            <View style={styles.greetingRow}>
              <Text style={styles.formTitle}>Selamat Datang!</Text>
              <Text style={{ fontSize: 24 }}>👋</Text>
            </View>
            <Text style={styles.formSubtitle}>Masuk untuk melanjutkan ke akun Anda</Text>

            {/* Username Input */}
            <View style={styles.inputContainer}>
              <View style={styles.prefixBox}>
                <MaterialCommunityIcons name="account-outline" size={18} color="#9E9E9E" />
                <Text style={styles.prefixText}>mwt-</Text>
              </View>
              <View style={styles.prefixDivider} />
              <TextInput
                style={styles.input}
                placeholder="Username"
                placeholderTextColor="#C4C4C4"
                value={username}
                onChangeText={(text) => {
                  setUsername(text);
                  clearError();
                }}
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="next"
              />
            </View>

            {/* Password Input */}
            <View style={styles.inputContainer}>
              <View style={styles.inputIconBox}>
                <MaterialCommunityIcons name="lock-outline" size={18} color="#9E9E9E" />
              </View>
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor="#C4C4C4"
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  clearError();
                }}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                returnKeyType="done"
                onSubmitEditing={handleLogin}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeButton}
              >
                <MaterialCommunityIcons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color="#9E9E9E"
                />
              </TouchableOpacity>
            </View>

            {/* Login Button */}
            <TouchableOpacity
              style={[styles.loginButton, isSubmitting && styles.loginButtonDisabled]}
              onPress={handleLogin}
              disabled={isSubmitting}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={isSubmitting ? ['#8BC34A', '#8BC34A'] : ['#00CC16', '#00AA13']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.loginGradient}
              >
                {isSubmitting ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <>
                    <Text style={styles.loginButtonText}>Masuk</Text>
                    <View style={styles.arrowCircle}>
                      <MaterialCommunityIcons name="arrow-right" size={18} color="#00AA13" />
                    </View>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>atau</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Fingerprint Button */}
            <TouchableOpacity
              style={styles.fingerprintButton}
              onPress={handleBiometricLogin}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons name="fingerprint" size={24} color="#00AA13" style={{ marginRight: 12 }} />
              <Text style={styles.fingerprintText}>Masuk dengan Fingerprint</Text>
              <MaterialCommunityIcons name="chevron-right" size={20} color="#00AA13" />
            </TouchableOpacity>

            {/* Forgot Password */}
            <TouchableOpacity style={styles.forgotButton} activeOpacity={0.7}>
              <Text style={styles.forgotText}>Lupa Password?</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>SIMWT Mobile v1.0.0</Text>
          <Text style={styles.footerText}>© 2026 PT Mada Wikri Tunggal</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ─── Alert Styles ─────────────────────────────────────────────
const alertStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  container: {
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 28,
    alignItems: 'center',
    width: '100%',
    maxWidth: 320,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 12,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 2,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1C1C1C',
    marginBottom: 8,
    textAlign: 'center',
  },
  message: {
    fontSize: 14,
    color: '#6B6B6B',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  button: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 50,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '700',
  },
});

// ─── Main Styles ──────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F6F8',
  },
  scrollContent: {
    flexGrow: 1,
  },

  // ═══ Header ═══
  header: {
    paddingBottom: 80,
    paddingHorizontal: 24,
    position: 'relative',
    overflow: 'hidden',
    minHeight: height * 0.35,
  },
  decorCircle1: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(255,255,255,0.06)',
    top: -100,
    right: -100,
  },
  decorCircle2: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.04)',
    top: 100,
    left: -80,
  },
  decorCircle3: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(255,255,255,0.05)',
    bottom: 50,
    right: 80,
  },
  brandContainer: {
    marginTop: 20,
    marginBottom: 40,
    zIndex: 10,
  },
  brandName: {
    fontSize: 32,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 2,
  },
  brandSub: {
    fontSize: 18,
    fontWeight: '400',
    color: 'rgba(255,255,255,0.85)',
    letterSpacing: 4,
    marginTop: -4,
    fontStyle: 'italic',
  },
  companyName: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 8,
    fontWeight: '500',
  },
  shieldWrapper: {
    position: 'absolute',
    right: -20,
    bottom: 80,
    width: 240,
    height: 240,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 5,
  },
  shieldContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  shieldBase: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  shieldOuter: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  shieldInner: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  shieldGlow: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  podiumBase: {
    width: 140,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    marginTop: 10,
    zIndex: 1,
  },
  podiumShadow: {
    width: 180,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.1)',
    marginTop: -10,
    zIndex: 0,
  },
  floatingIcon: {
    position: 'absolute',
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
    zIndex: 10,
  },
  waveContainer: {
    position: 'absolute',
    bottom: -2, // to prevent 1px gap
    left: 0,
    right: 0,
    height: 80,
    overflow: 'hidden',
  },
  waveLeft: {
    position: 'absolute',
    width: width * 1.5,
    height: 200,
    backgroundColor: '#FFFFFF',
    borderRadius: width * 0.75,
    bottom: -150,
    left: -width * 0.25,
  },
  waveRight: {
    position: 'absolute',
    width: width,
    height: 150,
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderRadius: width * 0.5,
    bottom: -110,
    right: -width * 0.2,
    transform: [{ rotate: '15deg' }],
  },

  // ═══ Form ═══
  formWrapper: {
    marginTop: 0, // removed negative margin because of wave
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  formContainer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
    paddingTop: 10,
    paddingBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 6,
  },
  greetingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  formTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#1C1C1C',
    letterSpacing: -0.5,
  },
  formSubtitle: {
    fontSize: 14,
    color: '#9E9E9E',
    marginBottom: 28,
    lineHeight: 20,
  },

  // ═══ Inputs ═══
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7F8FA',
    borderRadius: 16,
    marginBottom: 14,
    borderWidth: 1.5,
    borderColor: '#EEEEEE',
    height: 54,
    overflow: 'hidden',
  },
  prefixBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    gap: 6,
  },
  prefixDivider: {
    width: 1,
    height: 28,
    backgroundColor: '#E0E0E0',
  },
  prefixText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#9E9E9E',
  },
  inputIconBox: {
    paddingLeft: 16,
    paddingRight: 4,
  },
  input: {
    flex: 1,
    height: 54,
    fontSize: 15,
    color: '#1C1C1C',
    paddingHorizontal: 12,
  },
  eyeButton: {
    padding: 14,
  },

  // ═══ Login Button ═══
  loginButton: {
    marginTop: 8,
    borderRadius: 50,
    overflow: 'hidden',
    shadowColor: '#00AA13',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  loginButtonDisabled: {
    opacity: 0.7,
    shadowOpacity: 0,
  },
  loginGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    paddingHorizontal: 24,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    flex: 1,
    textAlign: 'center',
    marginLeft: 32, // offset for the arrow circle
  },
  arrowCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // ═══ Divider ═══
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#EEEEEE',
  },
  dividerText: {
    marginHorizontal: 16,
    color: '#BDBDBD',
    fontSize: 13,
    fontWeight: '600',
  },

  // ═══ Fingerprint Button ═══
  fingerprintButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: '#00AA13',
  },
  fingerprintText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#00AA13',
    textAlign: 'center',
  },

  // ═══ Forgot ═══
  forgotButton: {
    alignItems: 'center',
    marginTop: 22,
    paddingVertical: 8,
  },
  forgotText: {
    color: '#00AA13',
    fontSize: 14,
    fontWeight: '700',
    textDecorationLine: 'underline',
    textDecorationColor: '#00AA1340',
  },

  // ═══ Footer ═══
  footer: {
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    paddingBottom: 20,
    paddingTop: 10,
  },
  footerText: {
    fontSize: 12,
    color: '#BDBDBD',
    lineHeight: 20,
    fontWeight: '500',
  },
});
